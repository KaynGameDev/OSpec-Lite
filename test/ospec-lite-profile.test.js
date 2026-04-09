const test = require("node:test");
const assert = require("node:assert/strict");
const fs = require("node:fs/promises");
const os = require("node:os");
const path = require("node:path");
const { spawnSync } = require("node:child_process");

const CLI_PATH = path.resolve(__dirname, "../dist/cli/index.js");
const PROFILE_ROOT = path.resolve(__dirname, "..", "profiles", "unity-tolua-game");

test("profile init generates the new authoring pack and records the active profile", async (t) => {
  const rootDir = await createTempRepo(t, "ospec-lite-profile-init-");
  await seedUnityToLuaRepo(rootDir);

  const initResult = runCli(["init", "--profile", "unity-tolua-game", rootDir]);
  assert.equal(initResult.status, 0, initResult.stderr);
  assert.match(initResult.stdout, /repository initialized/i);
  assert.match(initResult.stdout, /Profile: unity-tolua-game/);

  const config = JSON.parse(
    await fs.readFile(path.join(rootDir, ".oslite", "config.json"), "utf8")
  );
  assert.equal(config.documentLanguage, "zh-CN");
  assert.equal(config.profileId, "unity-tolua-game");
  assert.equal(config.authoringPackRoot, "docs/agents/authoring");

  for (const relativePath of [
    "docs/agents/authoring/doc-contract.md",
    "docs/agents/authoring/project-brief.md",
    "docs/agents/authoring/repo-reading-checklist.md",
    "docs/agents/authoring/evidence-map.md",
    "docs/agents/authoring/fill-project-docs.md",
    "docs/agents/authoring/doc-task-checklist.json"
  ]) {
    await assert.doesNotReject(() => fs.access(path.join(rootDir, relativePath)));
  }

  const statusResult = runCli(["status", rootDir]);
  assert.equal(statusResult.status, 0, statusResult.stderr);
  assert.match(statusResult.stdout, /Profile: unity-tolua-game/);
  assert.match(statusResult.stdout, /Authoring pack: docs\/agents\/authoring/);
});

test("profile init fails clearly when the required MJGame entry is missing", async (t) => {
  const rootDir = await createTempRepo(t, "ospec-lite-profile-precondition-");
  await seedUnityToLuaRepo(rootDir, { includeMainEntry: false });

  const initResult = runCli(["init", "--profile", "unity-tolua-game", rootDir]);
  assert.equal(initResult.status, 1);
  assert.match(initResult.stderr, /Profile unity-tolua-game requires these repo paths/i);
  assert.match(initResult.stderr, /Script\/MJGame\.lua/);
});

test("profile assets preserve literal Chinese guidance", async () => {
  const agents = await fs.readFile(
    path.join(PROFILE_ROOT, "templates", "AGENTS.md"),
    "utf8"
  );
  const contract = await fs.readFile(
    path.join(PROFILE_ROOT, "authoring-pack", "doc-contract.md"),
    "utf8"
  );
  const checklist = await fs.readFile(
    path.join(PROFILE_ROOT, "authoring-pack", "repo-reading-checklist.md"),
    "utf8"
  );

  assert.match(agents, /先完成 `\{\{authoringPackRoot}}\/evidence-map\.md`/);
  assert.match(contract, /文档编写合同/);
  assert.match(checklist, /Script\/MJGame\.lua/);
});

test("docs verify fails on generated profile docs until evidence and final docs are filled", async (t) => {
  const rootDir = await createTempRepo(t, "ospec-lite-profile-placeholders-");
  await seedUnityToLuaRepo(rootDir);

  const initResult = runCli(["init", "--profile", "unity-tolua-game", rootDir]);
  assert.equal(initResult.status, 0, initResult.stderr);

  const verifyResult = runCli(["docs", "verify", rootDir]);
  assert.equal(verifyResult.status, 1);
  assert.match(verifyResult.stderr, /docs verification failed/i);
  assert.match(verifyResult.stderr, /待补充/);
});

test("docs verify fails when project brief is missing", async (t) => {
  const rootDir = await createTempRepo(t, "ospec-lite-profile-brief-missing-");
  await seedUnityToLuaRepo(rootDir);

  runCli(["init", "--profile", "unity-tolua-game", rootDir]);
  await makeProfileDocsCompliant(rootDir);
  await fs.rm(path.join(rootDir, "docs", "agents", "authoring", "project-brief.md"));

  const verifyResult = runCli(["docs", "verify", rootDir]);
  assert.equal(verifyResult.status, 1);
  assert.match(verifyResult.stderr, /Missing authoring pack file: docs\/agents\/authoring\/project-brief\.md/);
});

test("docs verify fails when evidence map is missing", async (t) => {
  const rootDir = await createTempRepo(t, "ospec-lite-profile-evidence-missing-");
  await seedUnityToLuaRepo(rootDir);

  runCli(["init", "--profile", "unity-tolua-game", rootDir]);
  await makeProfileDocsCompliant(rootDir);
  await fs.rm(path.join(rootDir, "docs", "agents", "authoring", "evidence-map.md"));

  const verifyResult = runCli(["docs", "verify", rootDir]);
  assert.equal(verifyResult.status, 1);
  assert.match(verifyResult.stderr, /Missing authoring pack file: docs\/agents\/authoring\/evidence-map\.md/);
});

test("docs verify fails when evidence map sections are incomplete", async (t) => {
  const rootDir = await createTempRepo(t, "ospec-lite-profile-evidence-sections-");
  await seedUnityToLuaRepo(rootDir);

  runCli(["init", "--profile", "unity-tolua-game", rootDir]);
  await makeProfileDocsCompliant(rootDir);
  await rewriteFile(rootDir, "docs/agents/authoring/evidence-map.md", (content) =>
    content.replace("## 网络入口", "## 网络")
  );

  const verifyResult = runCli(["docs", "verify", rootDir]);
  assert.equal(verifyResult.status, 1);
  assert.match(verifyResult.stderr, /Missing required heading: ## 网络入口/);
});

test("docs verify fails when final docs miss headings or evidence labels", async (t) => {
  const rootDir = await createTempRepo(t, "ospec-lite-profile-final-docs-");
  await seedUnityToLuaRepo(rootDir);

  runCli(["init", "--profile", "unity-tolua-game", rootDir]);
  await makeProfileDocsCompliant(rootDir);
  await rewriteFile(rootDir, "docs/project/overview.md", (content) =>
    content.replace("## 主流程", "## 流程")
  );
  await rewriteFile(rootDir, "docs/project/entrypoints.md", (content) =>
    content.replace("证据文件：", "相关文件：")
  );

  const verifyResult = runCli(["docs", "verify", rootDir]);
  assert.equal(verifyResult.status, 1);
  assert.match(verifyResult.stderr, /Missing required heading: ## 主流程/);
  assert.match(verifyResult.stderr, /missing label 证据文件/i);
});

test("docs verify reports missing evidence paths clearly", async (t) => {
  const rootDir = await createTempRepo(t, "ospec-lite-profile-missing-path-");
  await seedUnityToLuaRepo(rootDir);

  runCli(["init", "--profile", "unity-tolua-game", rootDir]);
  await makeProfileDocsCompliant(rootDir);
  await rewriteFile(rootDir, "docs/project/architecture.md", (content) =>
    content.replace(
      "证据文件：\n- `Script/MJGame.lua`",
      "证据文件：\n- `Script/DoesNotExist.lua`"
    )
  );

  const verifyResult = runCli(["docs", "verify", rootDir]);
  assert.equal(verifyResult.status, 1);
  assert.match(
    verifyResult.stderr,
    /references missing evidence path: Script\/DoesNotExist\.lua/
  );
});

test("docs verify blocks forbidden Editor scope expansion", async (t) => {
  const rootDir = await createTempRepo(t, "ospec-lite-profile-editor-scope-");
  await seedUnityToLuaRepo(rootDir);

  runCli(["init", "--profile", "unity-tolua-game", rootDir]);
  await makeProfileDocsCompliant(rootDir);
  await rewriteFile(rootDir, "docs/project/overview.md", (content) =>
    `${content}\n\n## Editor\n- 这里不应该展开 Editor。\n`
  );

  const verifyResult = runCli(["docs", "verify", rootDir]);
  assert.equal(verifyResult.status, 1);
  assert.match(verifyResult.stderr, /Contains content forbidden by the active profile/);
});

test("docs verify fails when startup entry does not reference Script/MJGame.lua", async (t) => {
  const rootDir = await createTempRepo(t, "ospec-lite-profile-mjgame-rule-");
  await seedUnityToLuaRepo(rootDir);

  runCli(["init", "--profile", "unity-tolua-game", rootDir]);
  await makeProfileDocsCompliant(rootDir);
  await rewriteFile(rootDir, "docs/project/entrypoints.md", (content) =>
    content.replaceAll("`Script/MJGame.lua`", "`Script/OtherEntry.lua`")
  );

  const verifyResult = runCli(["docs", "verify", rootDir]);
  assert.equal(verifyResult.status, 1);
  assert.match(
    verifyResult.stderr,
    /Section 启动入口 is missing required snippet: Script\/MJGame\.lua/
  );
});

test("docs verify passes on a compliant unity-tolua fixture", async (t) => {
  const rootDir = await createTempRepo(t, "ospec-lite-profile-verify-pass-");
  await seedUnityToLuaRepo(rootDir);

  const initResult = runCli(["init", "--profile", "unity-tolua-game", rootDir]);
  assert.equal(initResult.status, 0, initResult.stderr);
  await makeProfileDocsCompliant(rootDir);

  const verifyResult = runCli(["docs", "verify", rootDir]);
  assert.equal(verifyResult.status, 0, verifyResult.stderr);
  assert.match(verifyResult.stdout, /docs verification passed/i);
  assert.match(verifyResult.stdout, /Profile: unity-tolua-game/);
  assert.match(verifyResult.stdout, /docs\/project\/entrypoints\.md/);
});

async function createTempRepo(t, prefix) {
  const rootDir = await fs.mkdtemp(path.join(os.tmpdir(), prefix));
  t.after(async () => {
    await fs.rm(rootDir, { recursive: true, force: true });
  });
  return rootDir;
}

async function seedUnityToLuaRepo(rootDir, options = {}) {
  const includeMainEntry = options.includeMainEntry !== false;
  const files = {
    "README.md": "# Unity ToLua Repo\n"
  };

  if (includeMainEntry) {
    files["Script/MJGame.lua"] = "return {}\n";
  }

  const directories = [
    "Script",
    "Script/BY_View",
    "Script/BY_Model",
    "Script/BY_Ctrl",
    "Script/BY_Network",
    "Script/BY_ResourceMgr",
    "Script/BY_Config",
    "Script/BY_Effect",
    "Script/BY_Fish",
    "Script/Framework_Bundle",
    "_Resources",
    "Doc",
    "Editor"
  ];

  for (const relativeDir of directories) {
    await fs.mkdir(path.join(rootDir, relativeDir), { recursive: true });
  }

  for (const [relativePath, content] of Object.entries(files)) {
    const absolutePath = path.join(rootDir, relativePath);
    await fs.mkdir(path.dirname(absolutePath), { recursive: true });
    await fs.writeFile(absolutePath, content, "utf8");
  }
}

async function makeProfileDocsCompliant(rootDir) {
  const docPaths = [
    "docs/project/overview.md",
    "docs/project/architecture.md",
    "docs/project/repo-map.md",
    "docs/project/entrypoints.md",
    "docs/project/glossary.md",
    "docs/project/coding-rules.md",
    "docs/agents/quickstart.md",
    "docs/agents/change-playbook.md",
    "docs/agents/authoring/evidence-map.md"
  ];

  for (const relativePath of docPaths) {
    await rewriteFile(rootDir, relativePath, (content) =>
      content.replaceAll("待补充", "已补全")
    );
  }
}

async function rewriteFile(rootDir, relativePath, transform) {
  const absolutePath = path.join(rootDir, relativePath);
  const original = await fs.readFile(absolutePath, "utf8");
  await fs.writeFile(absolutePath, transform(original), "utf8");
}

function runCli(args) {
  return spawnSync(process.execPath, [CLI_PATH, ...args], {
    encoding: "utf8"
  });
}
