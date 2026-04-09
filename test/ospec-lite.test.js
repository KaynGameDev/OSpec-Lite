const test = require("node:test");
const assert = require("node:assert/strict");
const fs = require("node:fs/promises");
const os = require("node:os");
const path = require("node:path");
const { spawnSync } = require("node:child_process");

const { FileRepo } = require("../dist/fs/file-repo.js");
const { ScanService } = require("../dist/init/ospec-lite-scan-service.js");
const { MarkdownRenderer } = require("../dist/render/ospec-lite-markdown-renderer.js");
const { AgentEntryService } = require("../dist/agents/ospec-lite-agent-entry-service.js");
const { CodexAdapter } = require("../dist/agents/ospec-lite-codex-adapter.js");
const { ClaudeCodeAdapter } = require("../dist/agents/ospec-lite-claude-code-adapter.js");
const { IndexService } = require("../dist/init/ospec-lite-index-service.js");
const { InitService } = require("../dist/init/ospec-lite-init-service.js");
const { StatusService } = require("../dist/status/ospec-lite-status-service.js");
const { ChangeService } = require("../dist/change/ospec-lite-change-service.js");
const { ProfileLoader } = require("../dist/profile/ospec-lite-profile-loader.js");
const {
  AGENTS_MANAGED_END,
  AGENTS_MANAGED_START,
  CLAUDE_MANAGED_END,
  CLAUDE_MANAGED_START,
  INIT_MARKERS
} = require("../dist/core/ospec-lite-schema.js");
const {
  InvalidChangeSlugError,
  OSpecLiteError
} = require("../dist/core/ospec-lite-errors.js");

const CLI_PATH = path.resolve(__dirname, "../dist/cli/index.js");

test("init bootstraps the repository knowledge layer", async (t) => {
  const rootDir = await createTempRepo(t, "ospec-lite-init-");
  await seedRepo(rootDir);

  const { repo, initService, statusService } = createServices();
  const result = await initService.init(rootDir, { documentLanguage: "zh-CN" });

  assert.equal(result.state, "initialized");

  for (const marker of INIT_MARKERS) {
    const markerPath = path.join(rootDir, marker);
    assert.equal(await repo.exists(markerPath), true, `missing init marker: ${marker}`);
  }

  const config = await repo.readJson(path.join(rootDir, ".oslite", "config.json"));
  assert.equal(config.documentLanguage, "zh-CN");
  assert.deepEqual(config.agentTargets, ["codex", "claude-code"]);

  const agents = await repo.readText(path.join(rootDir, "AGENTS.md"));
  const claude = await repo.readText(path.join(rootDir, "CLAUDE.md"));
  const overview = await repo.readText(path.join(rootDir, "docs", "project", "overview.md"));

  assert.match(overview, /Project Overview/);
  assert.ok(agents.includes(AGENTS_MANAGED_START));
  assert.ok(claude.includes(CLAUDE_MANAGED_START));
  assert.ok(claude.includes("@AGENTS.md"));

  const status = await statusService.getStatus(rootDir);
  assert.equal(status.state, "initialized");
  assert.equal(status.activeChanges.length, 0);
  assert.equal(status.archivedChanges.length, 0);
});

test("cli init is one-shot and preserves human edits on rerun", async (t) => {
  const rootDir = await createTempRepo(t, "ospec-lite-rerun-");
  await seedRepo(rootDir);

  const first = runCli(["init", rootDir]);
  assert.equal(first.status, 0, first.stderr);
  assert.match(first.stdout, /repository initialized/i);

  const overviewPath = path.join(rootDir, "docs", "project", "overview.md");
  const customOverview = "# Custom Overview\n\nThis file was edited by a human.\n";
  await fs.writeFile(overviewPath, customOverview, "utf8");

  const second = runCli(["init", rootDir]);
  assert.equal(second.status, 0, second.stderr);
  assert.match(second.stdout, /already initialized/i);
  assert.match(second.stdout, /Agent targets: codex, claude-code/);
  assert.match(second.stdout, /Agent entry files:/);
  assert.match(second.stdout, /- codex: AGENTS\.md/);
  assert.match(second.stdout, /- claude-code: CLAUDE\.md/);
  assert.match(second.stdout, /Project docs: docs\/project/);
  assert.match(second.stdout, /Changes root: changes/);

  const after = await fs.readFile(overviewPath, "utf8");
  assert.equal(after, customOverview);
});

test("cli init fails clearly when initialization is incomplete", async (t) => {
  const rootDir = await createTempRepo(t, "ospec-lite-incomplete-");
  await fs.mkdir(path.join(rootDir, ".oslite"), { recursive: true });
  await fs.writeFile(
    path.join(rootDir, ".oslite", "config.json"),
    "{}\n",
    "utf8"
  );

  const result = runCli(["init", rootDir]);
  assert.equal(result.status, 1);
  assert.match(result.stderr, /initialization incomplete/i);
  assert.match(result.stderr, /\.oslite\/index\.json/i);
});

test("cli prints help when no command is provided", () => {
  const result = runCli([]);

  assert.equal(result.status, 0, result.stderr);
  assert.match(result.stdout, /^oslite <command>/m);
  assert.match(result.stdout, /oslite status \[path]/);
  assert.match(result.stdout, /oslite docs verify \[path]/);
  assert.match(result.stdout, /--profile <profile-id>/);
  assert.equal(result.stderr, "");
});

test("cli init accepts document language flags before the path", async (t) => {
  const rootDir = await createTempRepo(t, "ospec-lite-flag-order-");
  await seedRepo(rootDir);

  const result = runCli(["init", "--document-language", "zh-CN", rootDir]);
  assert.equal(result.status, 0, result.stderr);
  assert.match(result.stdout, /repository initialized/i);

  const config = await fs.readFile(
    path.join(rootDir, ".oslite", "config.json"),
    "utf8"
  );
  assert.match(config, /"documentLanguage": "zh-CN"/);
});

test("cli init rejects unsupported document language values", async (t) => {
  const rootDir = await createTempRepo(t, "ospec-lite-invalid-language-");
  await seedRepo(rootDir);

  const result = runCli(["init", "--document-language", "fr-FR", rootDir]);
  assert.equal(result.status, 1);
  assert.match(result.stderr, /unsupported document language: fr-FR/i);
});

test("cli change rejects unsupported actions", () => {
  const result = runCli(["change", "explode"]);

  assert.equal(result.status, 1);
  assert.match(result.stderr, /unsupported change action: explode/i);
});

test("cli status reports uninitialized repositories", async (t) => {
  const rootDir = await createTempRepo(t, "ospec-lite-status-uninitialized-");
  await seedRepo(rootDir);

  const result = runCli(["status", rootDir]);
  assert.equal(result.status, 0, result.stderr);
  assert.match(result.stdout, /OSpec Lite Status/);
  assert.match(result.stdout, /Initialized: no/);
  assert.match(result.stdout, /State: uninitialized/);
  assert.match(result.stdout, /Active changes: 0/);
  assert.match(result.stdout, /Archived changes: 0/);
  assert.doesNotMatch(result.stdout, /Agent targets:/);
});

test("cli status reports incomplete repositories without crashing", async (t) => {
  const rootDir = await createTempRepo(t, "ospec-lite-status-incomplete-");
  await fs.mkdir(path.join(rootDir, ".oslite"), { recursive: true });
  await fs.writeFile(path.join(rootDir, ".oslite", "config.json"), "{}\n", "utf8");

  const result = runCli(["status", rootDir]);
  assert.equal(result.status, 0, result.stderr);
  assert.match(result.stdout, /Initialized: no/);
  assert.match(result.stdout, /State: incomplete/);
  assert.match(result.stdout, /Config: incomplete or invalid/);
  assert.match(result.stdout, /Missing markers:/);
  assert.match(result.stdout, /\.oslite\/index\.json/);
});

test("cli status reports initialized repositories with config details", async (t) => {
  const rootDir = await createTempRepo(t, "ospec-lite-status-initialized-");
  await seedRepo(rootDir);

  const { initService, changeService } = createServices();
  await initService.init(rootDir, { documentLanguage: "en-US" });
  await changeService.newChange(rootDir, "status-check");

  const result = runCli(["status", rootDir]);
  assert.equal(result.status, 0, result.stderr);
  assert.match(result.stdout, /Initialized: yes/);
  assert.match(result.stdout, /State: initialized/);
  assert.match(result.stdout, /Agent targets: codex, claude-code/);
  assert.match(result.stdout, /Project docs: docs\/project/);
  assert.match(result.stdout, /Changes root: changes/);
  assert.match(result.stdout, /Active changes: 1/);
  assert.match(result.stdout, /Archived changes: 0/);
});

test("change workflow advances from draft through archive", async (t) => {
  const rootDir = await createTempRepo(t, "ospec-lite-change-");
  await seedRepo(rootDir);

  const { repo, initService, statusService, changeService } = createServices();
  await initService.init(rootDir, { documentLanguage: "en-US" });

  const changeDir = await changeService.newChange(rootDir, "add-tests");
  const request = await repo.readText(path.join(changeDir, "request.md"));
  const plan = await repo.readText(path.join(changeDir, "plan.md"));
  const apply = await repo.readText(path.join(changeDir, "apply.md"));
  const verify = await repo.readText(path.join(changeDir, "verify.md"));
  let record = await repo.readJson(path.join(changeDir, "change.json"));

  assert.match(request, /^# Request/m);
  assert.match(plan, /^# Plan/m);
  assert.match(apply, /^# Apply/m);
  assert.match(verify, /^# Verify/m);
  assert.match(request, /Change: `add-tests`/);
  assert.match(plan, /Change: `add-tests`/);
  assert.match(apply, /Change: `add-tests`/);
  assert.match(verify, /Change: `add-tests`/);
  assert.equal(record.status, "draft");

  await changeService.markApplied(changeDir);
  record = await repo.readJson(path.join(changeDir, "change.json"));
  assert.equal(record.status, "applied");

  await changeService.markVerified(changeDir);
  record = await repo.readJson(path.join(changeDir, "change.json"));
  assert.equal(record.status, "verified");

  const archivePath = await changeService.archive(changeDir);
  assert.equal(await repo.exists(changeDir), false);
  assert.equal(await repo.exists(archivePath), true);

  const archivedRecord = await repo.readJson(path.join(archivePath, "change.json"));
  assert.equal(archivedRecord.status, "archived");

  const status = await statusService.getStatus(rootDir);
  assert.equal(status.activeChanges.length, 0);
  assert.deepEqual(status.archivedChanges, ["add-tests"]);
});

test("init captures common repo signals from lowercase working directories", async (t) => {
  const rootDir = await createTempRepo(t, "ospec-lite-signals-");
  await seedRepo(rootDir);
  await fs.mkdir(path.join(rootDir, "test"), { recursive: true });
  await fs.mkdir(path.join(rootDir, "scripts"), { recursive: true });
  await fs.mkdir(path.join(rootDir, "assets"), { recursive: true });

  const { repo, initService } = createServices();
  await initService.init(rootDir, { documentLanguage: "en-US" });

  const index = await repo.readJson(path.join(rootDir, ".oslite", "index.json"));
  assert.equal(index.signals.hasSrcDir, true);
  assert.equal(index.signals.hasTestsDir, true);
  assert.equal(index.signals.hasScriptDir, true);
  assert.equal(index.signals.hasAssetsDir, true);
});

test("init patches existing AGENTS.md and CLAUDE.md without removing human content", async (t) => {
  const rootDir = await createTempRepo(t, "ospec-lite-agent-patch-");
  await seedRepo(rootDir);

  const originalAgents = [
    "# Team Notes",
    "",
    "Keep this introduction.",
    "",
    "## Local Guidance",
    "",
    "- Human-authored AGENTS note.",
    ""
  ].join("\n");
  const originalClaude = [
    "# Claude Notes",
    "",
    "Keep this preface.",
    "",
    "## Local Memory",
    "",
    "- Human-authored CLAUDE note.",
    ""
  ].join("\n");

  await fs.writeFile(path.join(rootDir, "AGENTS.md"), originalAgents, "utf8");
  await fs.writeFile(path.join(rootDir, "CLAUDE.md"), originalClaude, "utf8");

  const { initService } = createServices();
  await initService.init(rootDir, { documentLanguage: "en-US" });

  const agents = await fs.readFile(path.join(rootDir, "AGENTS.md"), "utf8");
  const claude = await fs.readFile(path.join(rootDir, "CLAUDE.md"), "utf8");

  assert.match(agents, /Keep this introduction\./);
  assert.match(claude, /Keep this preface\./);
  assert.equal(countOccurrences(agents, AGENTS_MANAGED_START), 1);
  assert.equal(countOccurrences(claude, CLAUDE_MANAGED_START), 1);
  assert.match(agents, /## OSpec Lite/);
  assert.match(claude, /@AGENTS\.md/);
});

test("agent entry patching replaces managed sections instead of duplicating them", async (t) => {
  const rootDir = await createTempRepo(t, "ospec-lite-managed-update-");
  await seedRepo(rootDir);

  const repo = new FileRepo();
  const agentEntries = new AgentEntryService(repo);
  const codexAdapter = new CodexAdapter();
  const claudeAdapter = new ClaudeCodeAdapter();

  await fs.writeFile(
    path.join(rootDir, "AGENTS.md"),
    [
      "# Team Notes",
      "",
      "Intro stays.",
      "",
      AGENTS_MANAGED_START,
      "Old AGENTS managed content",
      AGENTS_MANAGED_END,
      "",
      "Tail stays.",
      ""
    ].join("\n"),
    "utf8"
  );
  await fs.writeFile(
    path.join(rootDir, "CLAUDE.md"),
    [
      "# Claude Notes",
      "",
      "Prelude stays.",
      "",
      CLAUDE_MANAGED_START,
      "Old CLAUDE managed content",
      CLAUDE_MANAGED_END,
      "",
      "Footer stays.",
      ""
    ].join("\n"),
    "utf8"
  );

  const codexSection = codexAdapter.buildSection({
    projectName: "Managed Update Repo",
    summary: "Updated summary for AGENTS.",
    docsRoot: "docs/project",
    agentDocsRoot: "docs/agents",
    rules: ["Use the managed AGENTS block."],
    importantFiles: ["AGENTS.md", "docs/project/overview.md"]
  });
  const claudeSection = claudeAdapter.buildSection({
    projectName: "Managed Update Repo",
    summary: "Updated summary for CLAUDE.",
    docsRoot: "docs/project",
    agentDocsRoot: "docs/agents",
    rules: ["Use the managed CLAUDE block."],
    importantFiles: ["CLAUDE.md", "docs/project/overview.md"]
  });

  assert.match(codexSection.content, /^# Agent Guide/m);
  assert.match(codexSection.content, new RegExp(escapeRegex(AGENTS_MANAGED_START)));
  assert.match(codexSection.content, /Updated summary for AGENTS\./);
  assert.match(codexSection.content, /### High-Risk Areas/);
  assert.match(codexSection.content, /Use the managed AGENTS block\./);
  assert.match(codexSection.content, /- `AGENTS\.md`/);
  assert.match(codexSection.content, /- `docs\/project\/overview\.md`/);

  assert.match(claudeSection.content, /^# Claude Code Project Memory/m);
  assert.match(claudeSection.content, new RegExp(escapeRegex(CLAUDE_MANAGED_START)));
  assert.match(claudeSection.content, /## Shared Instructions Import/);
  assert.match(claudeSection.content, /@AGENTS\.md/);
  assert.match(claudeSection.content, /Updated summary for CLAUDE\./);
  assert.match(claudeSection.content, /Use @docs\/agents\/quickstart\.md for quick orientation\./);

  await agentEntries.ensureManagedSection(
    rootDir,
    codexAdapter,
    codexSection.content,
    codexSection.managedStart,
    codexSection.managedEnd
  );
  await agentEntries.ensureManagedSection(
    rootDir,
    claudeAdapter,
    claudeSection.content,
    claudeSection.managedStart,
    claudeSection.managedEnd
  );

  const agents = await fs.readFile(path.join(rootDir, "AGENTS.md"), "utf8");
  const claude = await fs.readFile(path.join(rootDir, "CLAUDE.md"), "utf8");

  assert.equal(countOccurrences(agents, AGENTS_MANAGED_START), 1);
  assert.equal(countOccurrences(claude, CLAUDE_MANAGED_START), 1);
  assert.doesNotMatch(agents, /Old AGENTS managed content/);
  assert.doesNotMatch(claude, /Old CLAUDE managed content/);
  assert.match(agents, /Intro stays\./);
  assert.match(agents, /Tail stays\./);
  assert.match(claude, /Prelude stays\./);
  assert.match(claude, /Footer stays\./);
  assert.match(agents, /Updated summary for AGENTS\./);
  assert.match(claude, /Updated summary for CLAUDE\./);
});

test("newChange rejects invalid change slugs", async (t) => {
  const rootDir = await createTempRepo(t, "ospec-lite-invalid-slug-");
  await seedRepo(rootDir);

  const { initService, changeService } = createServices();
  await initService.init(rootDir, { documentLanguage: "en-US" });

  await assert.rejects(
    () => changeService.newChange(rootDir, "Invalid_Slug"),
    (error) => {
      assert.ok(error instanceof InvalidChangeSlugError);
      assert.match(error.message, /invalid change slug/i);
      return true;
    }
  );
});

test("newChange rejects duplicate slugs", async (t) => {
  const rootDir = await createTempRepo(t, "ospec-lite-duplicate-slug-");
  await seedRepo(rootDir);

  const { initService, changeService } = createServices();
  await initService.init(rootDir, { documentLanguage: "en-US" });

  await changeService.newChange(rootDir, "duplicate-change");

  await assert.rejects(
    () => changeService.newChange(rootDir, "duplicate-change"),
    (error) => {
      assert.ok(error instanceof OSpecLiteError);
      assert.match(error.message, /change already exists/i);
      return true;
    }
  );
});

test("markVerified rejects a draft change", async (t) => {
  const rootDir = await createTempRepo(t, "ospec-lite-invalid-verify-");
  await seedRepo(rootDir);

  const { repo, initService, changeService } = createServices();
  await initService.init(rootDir, { documentLanguage: "en-US" });

  const changeDir = await changeService.newChange(rootDir, "invalid-verify");

  await assert.rejects(
    () => changeService.markVerified(changeDir),
    (error) => {
      assert.ok(error instanceof OSpecLiteError);
      assert.match(error.message, /cannot move change from draft to verified/i);
      return true;
    }
  );

  const record = await repo.readJson(path.join(changeDir, "change.json"));
  assert.equal(record.status, "draft");
});

test("archive rejects changes that are not verified", async (t) => {
  const rootDir = await createTempRepo(t, "ospec-lite-invalid-archive-");
  await seedRepo(rootDir);

  const { repo, initService, changeService } = createServices();
  await initService.init(rootDir, { documentLanguage: "en-US" });

  const changeDir = await changeService.newChange(rootDir, "invalid-archive");

  await assert.rejects(
    () => changeService.archive(changeDir),
    (error) => {
      assert.ok(error instanceof OSpecLiteError);
      assert.match(error.message, /only verified changes can be archived/i);
      return true;
    }
  );

  const record = await repo.readJson(path.join(changeDir, "change.json"));
  assert.equal(record.status, "draft");
  assert.equal(await repo.exists(changeDir), true);
});

function createServices() {
  const repo = new FileRepo();
  const scanService = new ScanService(repo);
  const renderer = new MarkdownRenderer();
  const agentEntries = new AgentEntryService(repo);
  const indexService = new IndexService();
  const profileLoader = new ProfileLoader(repo);
  const initService = new InitService(
    repo,
    scanService,
    renderer,
    agentEntries,
    indexService,
    profileLoader
  );
  const statusService = new StatusService(repo);
  const changeService = new ChangeService(repo, statusService);

  return {
    repo,
    initService,
    statusService,
    changeService
  };
}

async function createTempRepo(t, prefix) {
  const rootDir = await fs.mkdtemp(path.join(os.tmpdir(), prefix));
  t.after(async () => {
    await fs.rm(rootDir, { recursive: true, force: true });
  });
  return rootDir;
}

async function seedRepo(rootDir) {
  await fs.writeFile(
    path.join(rootDir, "README.md"),
    "# OSpec Lite Test Repo\n",
    "utf8"
  );
  await fs.mkdir(path.join(rootDir, "src"), { recursive: true });
  await fs.writeFile(
    path.join(rootDir, "src", "main.ts"),
    [
      "import { start } from './bootstrap';",
      "",
      "start();",
      ""
    ].join("\n"),
    "utf8"
  );
  await fs.writeFile(
    path.join(rootDir, "src", "bootstrap.ts"),
    [
      "export function start() {",
      "  return 'started';",
      "}",
      ""
    ].join("\n"),
    "utf8"
  );
}

function runCli(args) {
  return spawnSync(process.execPath, [CLI_PATH, ...args], {
    encoding: "utf8"
  });
}

function countOccurrences(content, token) {
  return content.split(token).length - 1;
}

function escapeRegex(value) {
  return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}
