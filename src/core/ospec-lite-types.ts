export type DocumentLanguage = "en-US" | "zh-CN";

export type AgentTarget = "codex" | "claude-code";

export type InitState = "uninitialized" | "initialized" | "incomplete";

export type ChangeStatus = "draft" | "active" | "applied" | "verified" | "archived";

export type ProfileAssetMode =
  | "write-if-missing"
  | "managed-codex-section"
  | "managed-claude-section";

export interface OSpecLiteConfig {
  version: 1;
  documentLanguage: DocumentLanguage;
  initializedAt: string;
  agentTargets: AgentTarget[];
  agentEntryFiles: Record<AgentTarget, string>;
  projectDocsRoot: string;
  agentDocsRoot: string;
  changeRoot: string;
  archiveLayout: "date-slug";
  profileId?: string;
  authoringPackRoot?: string;
}

export interface RuleItem {
  id: string;
  text: string;
  source: "default" | "harvested";
}

export interface DirectoryMapItem {
  path: string;
  kind: "directory" | "file";
  role: string;
}

export interface EntryPointItem {
  path: string;
  score: number;
  reasons: string[];
}

export interface RepositoryScanResult {
  projectName: string;
  rootDir: string;
  directoryMap: DirectoryMapItem[];
  entrypoints: EntryPointItem[];
  rules: RuleItem[];
  importantFiles: string[];
  glossarySeeds: string[];
  signals: Record<string, boolean>;
}

export interface OSpecLiteIndex {
  version: 1;
  generatedAt: string;
  project: {
    name: string;
    documentLanguage: DocumentLanguage;
  };
  agentTargets: AgentTarget[];
  roots: {
    repoRoot: ".";
    changeRoot: string;
  };
  directoryMap: DirectoryMapItem[];
  entrypoints: EntryPointItem[];
  rules: RuleItem[];
  importantFiles: string[];
  glossarySeeds: string[];
  signals: Record<string, boolean>;
}

export interface InitResult {
  state: InitState;
  configPath: string;
  indexPath: string;
  missingMarkers: string[];
}

export interface ChangeRecord {
  version: 1;
  slug: string;
  status: ChangeStatus;
  createdAt: string;
  updatedAt: string;
  source: {
    type: "manual";
    id: string;
  };
  affects: string[];
  owner: string;
  notes: string;
}

export interface StatusReport {
  state: InitState;
  missingMarkers: string[];
  config: OSpecLiteConfig | null;
  activeChanges: string[];
  archivedChanges: string[];
}

export interface OSpecLiteProfileAsset {
  source: string;
  target: string;
  mode?: ProfileAssetMode;
}

export interface OSpecLiteProfile {
  version: 1;
  id: string;
  displayName: string;
  description: string;
  documentLanguage: DocumentLanguage;
  authoringPackRoot: string;
  outputs: string[];
  assets: OSpecLiteProfileAsset[];
  requiredRepoPaths?: string[];
}

export interface LoadedOSpecLiteProfile extends OSpecLiteProfile {
  rootDir: string;
  profileJsonPath: string;
}

export interface ProfileTemplateValues {
  projectName: string;
  summary: string;
  docsRoot: string;
  agentDocsRoot: string;
  authoringPackRoot: string;
  profileId: string;
  managedStart: string;
  managedEnd: string;
}

export interface DocChecklistSectionRule {
  heading: string;
  requiredSnippets?: string[];
  requiredPatterns?: string[];
  forbiddenPatterns?: string[];
}

export interface DocChecklistFile {
  path: string;
  requiredHeadings?: string[];
  requiredSnippets?: string[];
  requiredPatterns?: string[];
  forbiddenPatterns?: string[];
  evidenceSections?: string[];
  sectionRules?: DocChecklistSectionRule[];
  skipPlaceholderCheck?: boolean;
}

export interface DocTaskChecklist {
  version: 1;
  profileId: string;
  placeholderPatterns: string[];
  forbiddenPatterns: string[];
  requiredEvidenceLabels: string[];
  allowedStatuses: string[];
  files: DocChecklistFile[];
}

export interface DocVerificationIssue {
  file: string;
  message: string;
}

export interface DocVerificationReport {
  profileId: string;
  checklistPath: string;
  checkedFiles: string[];
  issues: DocVerificationIssue[];
}
