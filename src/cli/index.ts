#!/usr/bin/env node

import * as path from "node:path";
import { createInterface } from "node:readline/promises";
import { FileRepo } from "../fs/file-repo";
import { ScanService } from "../init/ospec-lite-scan-service";
import { MarkdownRenderer } from "../render/ospec-lite-markdown-renderer";
import { AgentEntryService } from "../agents/ospec-lite-agent-entry-service";
import { IndexService } from "../init/ospec-lite-index-service";
import { InitService } from "../init/ospec-lite-init-service";
import { StatusService } from "../status/ospec-lite-status-service";
import { ChangeService } from "../change/ospec-lite-change-service";
import {
  BootstrapAgent,
  DocumentLanguage,
  HostAgent
} from "../core/ospec-lite-types";
import {
  DocVerificationError,
  InitIncompleteError,
  OSpecLiteError,
  ProfileInitAnswersRequiredError
} from "../core/ospec-lite-errors";
import { ProfileLoader } from "../profile/ospec-lite-profile-loader";
import { DocVerifierService } from "../docs/ospec-lite-doc-verifier-service";

const UNITY_TOLUA_PROFILE_ID = "unity-tolua-game";

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
const docVerifier = new DocVerifierService(repo);

async function main(): Promise<void> {
  const args = process.argv.slice(2);
  const [command, ...rest] = args;

  switch (command) {
    case "init":
      await handleInit(rest);
      return;
    case "status":
      await handleStatus(rest);
      return;
    case "change":
      await handleChange(rest);
      return;
    case "docs":
      await handleDocs(rest);
      return;
    default:
      printHelp();
  }
}

async function handleInit(args: string[]): Promise<void> {
  const { pathArg, documentLanguage, profileId, projectName, bootstrapAgent } =
    parseInitArgs(args);
  const targetDir = path.resolve(pathArg);
  const before = await initService.getInitState(targetDir);

  if (before.state === "initialized") {
    const status = await statusService.getStatus(targetDir);
    console.log("OSpec Lite: repository already initialized");
    console.log(`Path: ${targetDir}`);
    console.log(`Config: ${path.relative(targetDir, before.configPath).replace(/\\/g, "/")}`);
    if (isCompleteStatusConfig(status.config)) {
      if (status.config.projectName) {
        console.log(`Project: ${status.config.projectName}`);
      }
      if (status.config.profileId) {
        console.log(`Profile: ${status.config.profileId}`);
      }
      if (status.config.bootstrapAgent) {
        console.log(`Bootstrap agent: ${status.config.bootstrapAgent}`);
      }
      console.log(`Agent targets: ${status.config.agentTargets.join(", ")}`);
      console.log("Agent entry files:");
      for (const [target, fileName] of Object.entries(status.config.agentEntryFiles)) {
        console.log(`- ${target}: ${fileName}`);
      }
      printAgentWrappers(status.config.agentWrapperFiles);
      console.log(`Project docs: ${status.config.projectDocsRoot}`);
      if (status.config.authoringPackRoot) {
        console.log(`Authoring pack: ${status.config.authoringPackRoot}`);
      }
      console.log(`Changes root: ${status.config.changeRoot}`);
    }
    return;
  }

  if (before.state === "incomplete") {
    throw new InitIncompleteError(before.missingMarkers);
  }

  const resolvedAnswers = await resolveProfileInitAnswers(targetDir, {
    profileId,
    projectName,
    bootstrapAgent
  });
  const result = await initService.init(targetDir, {
    documentLanguage,
    profileId,
    projectName: resolvedAnswers.projectName,
    bootstrapAgent: resolvedAnswers.bootstrapAgent,
    hostAgent: detectHostAgent()
  });
  console.log("OSpec Lite: repository initialized");
  console.log(`Path: ${targetDir}`);
  console.log(`Config: ${path.relative(targetDir, result.configPath).replace(/\\/g, "/")}`);
  console.log(`Index: ${path.relative(targetDir, result.indexPath).replace(/\\/g, "/")}`);
  if (result.config?.projectName) {
    console.log(`Project: ${result.config.projectName}`);
  }
  if (result.config?.profileId) {
    console.log(`Profile: ${result.config.profileId}`);
  }
  if (result.config?.bootstrapAgent) {
    console.log(`Bootstrap agent: ${result.config.bootstrapAgent}`);
  }
  if (result.bootstrapPlan) {
    if (result.bootstrapPlan.shouldBootstrapNow) {
      console.log("Bootstrapping now...");
      if (result.bootstrapPlan.wrapperPath) {
        console.log(`Bootstrap wrapper: ${result.bootstrapPlan.wrapperPath}`);
      }
      if (result.bootstrapPlan.nextStep) {
        console.log(`Bootstrap command: ${result.bootstrapPlan.nextStep}`);
      }
    } else if (result.bootstrapPlan.nextStep) {
      console.log("Next step:");
      console.log(result.bootstrapPlan.nextStep);
      if (result.bootstrapPlan.wrapperPath) {
        console.log(`Wrapper: ${result.bootstrapPlan.wrapperPath}`);
      }
    }
  }
}

async function handleStatus(args: string[]): Promise<void> {
  const targetDir = path.resolve(args[0] ?? ".");
  const status = await statusService.getStatus(targetDir);

  console.log("OSpec Lite Status");
  console.log(`Initialized: ${status.state === "initialized" ? "yes" : "no"}`);
  console.log(`State: ${status.state}`);

  if (isCompleteStatusConfig(status.config)) {
    if (status.config.projectName) {
      console.log(`Project: ${status.config.projectName}`);
    }
    if (status.config.profileId) {
      console.log(`Profile: ${status.config.profileId}`);
    }
    if (status.config.bootstrapAgent) {
      console.log(`Bootstrap agent: ${status.config.bootstrapAgent}`);
    }
    console.log(`Agent targets: ${status.config.agentTargets.join(", ")}`);
    console.log("Agent entry files:");
    for (const [target, fileName] of Object.entries(status.config.agentEntryFiles)) {
      console.log(`- ${target}: ${fileName}`);
    }
    printAgentWrappers(status.config.agentWrapperFiles);
    console.log(`Project docs: ${status.config.projectDocsRoot}`);
    if (status.config.authoringPackRoot) {
      console.log(`Authoring pack: ${status.config.authoringPackRoot}`);
    }
    console.log(`Changes root: ${status.config.changeRoot}`);
  } else if (status.config) {
    console.log("Config: incomplete or invalid");
  }

  console.log(`Active changes: ${status.activeChanges.length}`);
  console.log(`Archived changes: ${status.archivedChanges.length}`);

  if (status.missingMarkers.length > 0) {
    console.log("Missing markers:");
    for (const marker of status.missingMarkers) {
      console.log(`- ${marker}`);
    }
  }
}

async function handleChange(args: string[]): Promise<void> {
  const [action, ...rest] = args;
  switch (action) {
    case "new": {
      const slug = rest[0];
      if (!slug) {
        throw new OSpecLiteError("Missing change slug.");
      }
      const targetDir = path.resolve(rest[1] ?? ".");
      const changeDir = await changeService.newChange(targetDir, slug);
      console.log(`Created change: ${changeDir}`);
      return;
    }
    case "apply": {
      const changePath = path.resolve(rest[0] ?? ".");
      await changeService.markApplied(changePath);
      console.log(`Marked applied: ${changePath}`);
      return;
    }
    case "verify": {
      const changePath = path.resolve(rest[0] ?? ".");
      await changeService.markVerified(changePath);
      console.log(`Marked verified: ${changePath}`);
      return;
    }
    case "archive": {
      const changePath = path.resolve(rest[0] ?? ".");
      const archivePath = await changeService.archive(changePath);
      console.log(`Archived change to: ${archivePath}`);
      return;
    }
    default:
      throw new OSpecLiteError(`Unsupported change action: ${action ?? "(missing)"}`);
  }
}

async function handleDocs(args: string[]): Promise<void> {
  const [action, ...rest] = args;
  switch (action) {
    case "verify": {
      const targetDir = path.resolve(rest[0] ?? ".");
      const report = await docVerifier.verify(targetDir);
      console.log("OSpec Lite docs verification passed");
      console.log(`Profile: ${report.profileId}`);
      console.log(`Checklist: ${report.checklistPath}`);
      console.log("Checked files:");
      for (const filePath of report.checkedFiles) {
        console.log(`- ${filePath}`);
      }
      return;
    }
    default:
      throw new OSpecLiteError(`Unsupported docs action: ${action ?? "(missing)"}`);
  }
}

function parseInitArgs(args: string[]): {
  pathArg: string;
  documentLanguage?: DocumentLanguage;
  profileId?: string;
  projectName?: string;
  bootstrapAgent?: BootstrapAgent;
} {
  let pathArg: string | undefined;
  let documentLanguage: DocumentLanguage | undefined;
  let profileId: string | undefined;
  let projectName: string | undefined;
  let bootstrapAgent: BootstrapAgent | undefined;

  for (let index = 0; index < args.length; index += 1) {
    const arg = args[index];

    if (arg === "--document-language") {
      const value = args[index + 1];
      if (!value || value.startsWith("--")) {
        throw new OSpecLiteError("Missing value for --document-language.");
      }
      documentLanguage = parseDocumentLanguage(value);
      index += 1;
      continue;
    }

    if (arg.startsWith("--document-language=")) {
      documentLanguage = parseDocumentLanguage(
        arg.slice("--document-language=".length)
      );
      continue;
    }

    if (arg === "--profile") {
      const value = args[index + 1];
      if (!value || value.startsWith("--")) {
        throw new OSpecLiteError("Missing value for --profile.");
      }
      profileId = value;
      index += 1;
      continue;
    }

    if (arg.startsWith("--profile=")) {
      profileId = arg.slice("--profile=".length);
      continue;
    }

    if (arg === "--project-name") {
      const value = args[index + 1];
      if (!value || value.startsWith("--")) {
        throw new OSpecLiteError("Missing value for --project-name.");
      }
      projectName = value.trim();
      index += 1;
      continue;
    }

    if (arg.startsWith("--project-name=")) {
      projectName = arg.slice("--project-name=".length).trim();
      continue;
    }

    if (arg === "--bootstrap-agent") {
      const value = args[index + 1];
      if (!value || value.startsWith("--")) {
        throw new OSpecLiteError("Missing value for --bootstrap-agent.");
      }
      bootstrapAgent = parseBootstrapAgent(value);
      index += 1;
      continue;
    }

    if (arg.startsWith("--bootstrap-agent=")) {
      bootstrapAgent = parseBootstrapAgent(arg.slice("--bootstrap-agent=".length));
      continue;
    }

    if (arg.startsWith("--")) {
      throw new OSpecLiteError(`Unsupported option: ${arg}`);
    }

    if (pathArg) {
      throw new OSpecLiteError(`Unexpected argument: ${arg}`);
    }

    pathArg = arg;
  }

  return {
    pathArg: pathArg ?? ".",
    documentLanguage,
    profileId,
    projectName,
    bootstrapAgent
  };
}

function parseDocumentLanguage(value: string): DocumentLanguage {
  if (value === "en-US" || value === "zh-CN") {
    return value;
  }
  throw new OSpecLiteError(`Unsupported document language: ${value}`);
}

function parseBootstrapAgent(value: string): BootstrapAgent {
  if (value === "codex" || value === "claude-code" || value === "none") {
    return value;
  }
  throw new OSpecLiteError(`Unsupported bootstrap agent: ${value}`);
}

function isCompleteStatusConfig(
  value: unknown
): value is {
  agentTargets: string[];
  agentEntryFiles: Record<string, string>;
  projectDocsRoot: string;
  changeRoot: string;
  profileId?: string;
  authoringPackRoot?: string;
  agentWrapperFiles?: Record<string, string[]>;
  projectName?: string;
  bootstrapAgent?: string;
} {
  if (!value || typeof value !== "object") {
    return false;
  }

  const candidate = value as {
    agentTargets?: unknown;
    agentEntryFiles?: unknown;
    projectDocsRoot?: unknown;
    changeRoot?: unknown;
    profileId?: unknown;
    authoringPackRoot?: unknown;
    agentWrapperFiles?: unknown;
    projectName?: unknown;
    bootstrapAgent?: unknown;
  };

  return (
    Array.isArray(candidate.agentTargets) &&
    candidate.agentTargets.every((item) => typeof item === "string") &&
    !!candidate.agentEntryFiles &&
    typeof candidate.agentEntryFiles === "object" &&
    Object.values(candidate.agentEntryFiles).every((item) => typeof item === "string") &&
    typeof candidate.projectDocsRoot === "string" &&
    typeof candidate.changeRoot === "string" &&
    (candidate.profileId === undefined || typeof candidate.profileId === "string") &&
    (candidate.projectName === undefined || typeof candidate.projectName === "string") &&
    (candidate.bootstrapAgent === undefined ||
      candidate.bootstrapAgent === "codex" ||
      candidate.bootstrapAgent === "claude-code" ||
      candidate.bootstrapAgent === "none") &&
    (candidate.authoringPackRoot === undefined ||
      typeof candidate.authoringPackRoot === "string") &&
    (candidate.agentWrapperFiles === undefined ||
      isStringArrayRecord(candidate.agentWrapperFiles))
  );
}

function isStringArrayRecord(value: unknown): value is Record<string, string[]> {
  if (!value || typeof value !== "object") {
    return false;
  }

  return Object.values(value).every(
    (item) => Array.isArray(item) && item.every((entry) => typeof entry === "string")
  );
}

function printAgentWrappers(
  wrappers: Record<string, string[]> | undefined
): void {
  if (!wrappers || Object.keys(wrappers).length === 0) {
    return;
  }

  console.log("Agent wrappers:");
  for (const [target, files] of Object.entries(wrappers)) {
    for (const filePath of files) {
      console.log(`- ${target}: ${filePath}`);
    }
  }
}

function printHelp(): void {
  console.log(`oslite <command>

Commands:
  oslite init [path] [--document-language en-US|zh-CN] [--profile <profile-id>] [--project-name <name>] [--bootstrap-agent codex|claude-code|none]
  oslite status [path]
  oslite docs verify [path]
  oslite change new <slug> [path]
  oslite change apply <change-path>
  oslite change verify <change-path>
  oslite change archive <change-path>`);
}

main().catch((error: unknown) => {
  if (error instanceof InitIncompleteError) {
    console.error("OSpec Lite: initialization incomplete");
    for (const marker of error.missingMarkers) {
      console.error(`- ${marker}`);
    }
    process.exitCode = 1;
    return;
  }

  if (error instanceof ProfileInitAnswersRequiredError) {
    console.error(error.message);
    process.exitCode = 1;
    return;
  }

  if (error instanceof DocVerificationError) {
    console.error("OSpec Lite docs verification failed");
    console.error(`Profile: ${error.profileId}`);
    console.error(`Checklist: ${error.checklistPath}`);
    for (const issue of error.issues) {
      console.error(`- ${issue.file}: ${issue.message}`);
    }
    process.exitCode = 1;
    return;
  }

  if (error instanceof Error) {
    console.error(error.message);
  } else {
    console.error(String(error));
  }
  process.exitCode = 1;
});

async function resolveProfileInitAnswers(
  targetDir: string,
  values: {
    profileId?: string;
    projectName?: string;
    bootstrapAgent?: BootstrapAgent;
  }
): Promise<{
  projectName?: string;
  bootstrapAgent?: BootstrapAgent;
}> {
  if (values.profileId !== UNITY_TOLUA_PROFILE_ID) {
    if (values.projectName || values.bootstrapAgent) {
      throw new OSpecLiteError(
        "--project-name and --bootstrap-agent are only supported with --profile unity-tolua-game."
      );
    }
    return {};
  }

  const missingFields: string[] = [];
  if (!values.projectName) {
    missingFields.push("projectName");
  }
  if (!values.bootstrapAgent) {
    missingFields.push("bootstrapAgent");
  }

  if (missingFields.length === 0) {
    return values;
  }

  if (!isInteractiveInitAllowed()) {
    throw new ProfileInitAnswersRequiredError(values.profileId, missingFields);
  }

  const defaults = {
    projectName: path.basename(targetDir),
    bootstrapAgent: "none" as BootstrapAgent
  };
  const prompter = await createInitPrompter();

  try {
    const projectName =
      values.projectName ??
      (await prompter.ask("Project name", defaults.projectName));
    const bootstrapAnswer =
      values.bootstrapAgent ??
      (await prompter.ask(
        "Bootstrap agent (codex/claude-code/none)",
        defaults.bootstrapAgent
      ).then((answer) => parseBootstrapAgent(answer)));

    return {
      projectName,
      bootstrapAgent: bootstrapAnswer
    };
  } finally {
    prompter.close();
  }
}

function isInteractiveInitAllowed(): boolean {
  return (
    process.env.OSLITE_FORCE_INTERACTIVE === "1" ||
    (process.stdin.isTTY === true && process.stdout.isTTY === true)
  );
}

function detectHostAgent(): HostAgent {
  const value = process.env.OSLITE_HOST_AGENT;
  if (value === "codex" || value === "claude-code") {
    return value;
  }
  return "unknown";
}

interface InitPrompter {
  ask(label: string, defaultValue: string): Promise<string>;
  close(): void;
}

async function createInitPrompter(): Promise<InitPrompter> {
  if (process.stdin.isTTY === true && process.stdout.isTTY === true) {
    const rl = createInterface({
      input: process.stdin,
      output: process.stdout
    });

    return {
      ask: async (label: string, defaultValue: string) => {
        const answer = (await rl.question(`${label} [${defaultValue}]: `)).trim();
        return answer.length > 0 ? answer : defaultValue;
      },
      close: () => rl.close()
    };
  }

  const answers = await readPromptAnswersFromStdin();
  let cursor = 0;

  return {
    ask: async (label: string, defaultValue: string) => {
      process.stdout.write(`${label} [${defaultValue}]: `);
      const answer = (answers[cursor] ?? "").trim();
      cursor += 1;
      return answer.length > 0 ? answer : defaultValue;
    },
    close: () => undefined
  };
}

async function readPromptAnswersFromStdin(): Promise<string[]> {
  process.stdin.setEncoding("utf8");
  let content = "";

  for await (const chunk of process.stdin) {
    content += chunk;
  }

  return content
    .split(/\r?\n/)
    .filter((line, index, items) => !(index === items.length - 1 && line.length === 0));
}
