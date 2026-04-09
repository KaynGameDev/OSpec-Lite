import * as path from "node:path";
import {
  AGENTS_FILE,
  AGENTS_MANAGED_END,
  AGENTS_MANAGED_START,
  AUTHORING_PACK_FILES,
  CLAUDE_FILE,
  CLAUDE_MANAGED_END,
  CLAUDE_MANAGED_START,
  DEFAULT_DOCUMENT_LANGUAGE,
  INIT_MARKERS,
  OSPEC_LITE_DIR
} from "../core/ospec-lite-schema";
import {
  DocumentLanguage,
  InitResult,
  InitState,
  LoadedOSpecLiteProfile,
  OSpecLiteConfig,
  RepositoryScanResult
} from "../core/ospec-lite-types";
import { FileRepo } from "../fs/file-repo";
import { AgentEntryService } from "../agents/ospec-lite-agent-entry-service";
import { CodexAdapter } from "../agents/ospec-lite-codex-adapter";
import { ClaudeCodeAdapter } from "../agents/ospec-lite-claude-code-adapter";
import { ScanService } from "./ospec-lite-scan-service";
import { MarkdownRenderer } from "../render/ospec-lite-markdown-renderer";
import { IndexService } from "./ospec-lite-index-service";
import { ProfileLoader } from "../profile/ospec-lite-profile-loader";
import { ProfilePreconditionError } from "../core/ospec-lite-errors";

export class InitService {
  constructor(
    private readonly repo: FileRepo,
    private readonly scanner: ScanService,
    private readonly renderer: MarkdownRenderer,
    private readonly agentEntries: AgentEntryService,
    private readonly indexService: IndexService,
    private readonly profiles: ProfileLoader
  ) {}

  async getInitState(rootDir: string): Promise<InitResult> {
    const configPath = path.join(rootDir, OSPEC_LITE_DIR, "config.json");
    const indexPath = path.join(rootDir, OSPEC_LITE_DIR, "index.json");
    const hasBootstrapArtifacts =
      (await this.repo.exists(configPath)) || (await this.repo.exists(indexPath));
    const config =
      hasBootstrapArtifacts && (await this.repo.exists(configPath))
        ? await this.tryReadConfig(configPath)
        : null;

    const missingMarkers: string[] = [];
    for (const marker of this.getExpectedMarkers(config?.authoringPackRoot)) {
      if (!(await this.repo.exists(path.join(rootDir, marker)))) {
        missingMarkers.push(marker);
      }
    }

    const state: InitState =
      !hasBootstrapArtifacts
        ? "uninitialized"
        : missingMarkers.length === 0
          ? "initialized"
          : "incomplete";

    return {
      state,
      configPath,
      indexPath,
      missingMarkers
    };
  }

  async init(
    rootDir: string,
    documentLanguage?: DocumentLanguage,
    profileId?: string
  ): Promise<InitResult> {
    const initState = await this.getInitState(rootDir);
    if (initState.state !== "uninitialized") {
      return initState;
    }

    const profile = profileId ? await this.profiles.loadProfile(profileId) : null;
    if (profile) {
      await this.ensureProfileRequirements(rootDir, profile);
    }
    const language =
      documentLanguage ?? profile?.documentLanguage ?? DEFAULT_DOCUMENT_LANGUAGE;
    const config = this.createConfig(language, profile);
    const scan = await this.scanner.scan(rootDir);
    const summary = this.buildSummary(scan);

    await this.repo.ensureDir(path.join(rootDir, OSPEC_LITE_DIR));
    await this.repo.ensureDir(path.join(rootDir, "docs", "project"));
    await this.repo.ensureDir(path.join(rootDir, "docs", "agents"));
    await this.repo.ensureDir(path.join(rootDir, "changes", "active"));
    await this.repo.ensureDir(path.join(rootDir, "changes", "archived"));
    if (config.authoringPackRoot) {
      await this.repo.ensureDir(path.join(rootDir, config.authoringPackRoot));
    }

    await this.repo.writeJson(path.join(rootDir, OSPEC_LITE_DIR, "config.json"), config);
    await this.repo.writeJson(
      path.join(rootDir, OSPEC_LITE_DIR, "index.json"),
      this.indexService.buildIndex(scan, config)
    );

    if (profile) {
      await this.applyProfileAssets(rootDir, profile, {
        projectName: scan.projectName,
        summary,
        docsRoot: config.projectDocsRoot,
        agentDocsRoot: config.agentDocsRoot,
        authoringPackRoot: config.authoringPackRoot ?? "",
        profileId: profile.id,
        managedStart: "",
        managedEnd: ""
      });
    } else {
      await this.writeGenericKnowledgeLayer(rootDir, scan, config, summary);
    }

    return this.getInitState(rootDir);
  }

  private createConfig(
    documentLanguage: DocumentLanguage,
    profile: LoadedOSpecLiteProfile | null
  ): OSpecLiteConfig {
    return {
      version: 1,
      documentLanguage,
      initializedAt: new Date().toISOString(),
      agentTargets: ["codex", "claude-code"],
      agentEntryFiles: {
        codex: AGENTS_FILE,
        "claude-code": CLAUDE_FILE
      },
      projectDocsRoot: "docs/project",
      agentDocsRoot: "docs/agents",
      changeRoot: "changes",
      archiveLayout: "date-slug",
      profileId: profile?.id,
      authoringPackRoot: profile?.authoringPackRoot
    };
  }

  private buildSummary(scan: {
    signals: Record<string, boolean>;
    directoryMap: { path: string; kind: string }[];
  }): string {
    const workingAreas = scan.directoryMap
      .filter((item) => item.kind === "directory")
      .slice(0, 3)
      .map((item) => item.path);

    const summaryParts: string[] = ["A repository initialized for agent-guided development."];
    if (scan.signals.hasPackageJson) {
      summaryParts.push("It includes a Node or JavaScript toolchain signal.");
    }
    if (workingAreas.length > 0) {
      summaryParts.push(`Main working areas include ${workingAreas.join(", ")}.`);
    }
    return summaryParts.join(" ");
  }

  private async tryReadConfig(configPath: string): Promise<OSpecLiteConfig | null> {
    try {
      return await this.repo.readJson<OSpecLiteConfig>(configPath);
    } catch {
      return null;
    }
  }

  private getExpectedMarkers(authoringPackRoot?: string): string[] {
    if (!authoringPackRoot) {
      return [...INIT_MARKERS];
    }

    return [
      ...INIT_MARKERS,
      ...AUTHORING_PACK_FILES.map((fileName) =>
        path.join(authoringPackRoot, fileName).replace(/\\/g, "/")
      )
    ];
  }

  private async writeGenericKnowledgeLayer(
    rootDir: string,
    scan: RepositoryScanResult,
    config: OSpecLiteConfig,
    summary: string
  ): Promise<void> {
    await this.repo.writeTextIfMissing(
      path.join(rootDir, "docs", "project", "overview.md"),
      this.renderer.renderOverview(scan, config)
    );
    await this.repo.writeTextIfMissing(
      path.join(rootDir, "docs", "project", "architecture.md"),
      this.renderer.renderArchitecture(scan)
    );
    await this.repo.writeTextIfMissing(
      path.join(rootDir, "docs", "project", "repo-map.md"),
      this.renderer.renderRepoMap(scan)
    );
    await this.repo.writeTextIfMissing(
      path.join(rootDir, "docs", "project", "coding-rules.md"),
      this.renderer.renderCodingRules(scan)
    );
    await this.repo.writeTextIfMissing(
      path.join(rootDir, "docs", "project", "glossary.md"),
      this.renderer.renderGlossary(scan)
    );
    await this.repo.writeTextIfMissing(
      path.join(rootDir, "docs", "project", "entrypoints.md"),
      this.renderer.renderEntrypoints(scan)
    );
    await this.repo.writeTextIfMissing(
      path.join(rootDir, "docs", "agents", "quickstart.md"),
      this.renderer.renderQuickstart(scan, config)
    );
    await this.repo.writeTextIfMissing(
      path.join(rootDir, "docs", "agents", "change-playbook.md"),
      this.renderer.renderChangePlaybook()
    );

    const codexAdapter = new CodexAdapter();
    const codexSection = codexAdapter.buildSection({
      projectName: scan.projectName,
      summary,
      docsRoot: "docs/project",
      agentDocsRoot: "docs/agents",
      rules: scan.rules.map((rule) => rule.text),
      importantFiles: scan.importantFiles
    });
    await this.agentEntries.ensureManagedSection(
      rootDir,
      codexAdapter,
      codexSection.content,
      codexSection.managedStart,
      codexSection.managedEnd
    );

    const claudeAdapter = new ClaudeCodeAdapter();
    const claudeSection = claudeAdapter.buildSection({
      projectName: scan.projectName,
      summary,
      docsRoot: "docs/project",
      agentDocsRoot: "docs/agents",
      rules: scan.rules.map((rule) => rule.text),
      importantFiles: scan.importantFiles
    });
    await this.agentEntries.ensureManagedSection(
      rootDir,
      claudeAdapter,
      claudeSection.content,
      claudeSection.managedStart,
      claudeSection.managedEnd
    );
  }

  private async applyProfileAssets(
    rootDir: string,
    profile: LoadedOSpecLiteProfile,
    values: {
      projectName: string;
      summary: string;
      docsRoot: string;
      agentDocsRoot: string;
      authoringPackRoot: string;
      profileId: string;
      managedStart: string;
      managedEnd: string;
    }
  ): Promise<void> {
    for (const asset of profile.assets) {
      switch (asset.mode) {
        case "managed-codex-section": {
          const content = this.profiles.renderAsset(profile, asset, {
            ...values,
            managedStart: AGENTS_MANAGED_START,
            managedEnd: AGENTS_MANAGED_END
          });
          const adapter = new CodexAdapter();
          await this.agentEntries.ensureManagedSection(
            rootDir,
            adapter,
            content,
            AGENTS_MANAGED_START,
            AGENTS_MANAGED_END
          );
          break;
        }
        case "managed-claude-section": {
          const content = this.profiles.renderAsset(profile, asset, {
            ...values,
            managedStart: CLAUDE_MANAGED_START,
            managedEnd: CLAUDE_MANAGED_END
          });
          const adapter = new ClaudeCodeAdapter();
          await this.agentEntries.ensureManagedSection(
            rootDir,
            adapter,
            content,
            CLAUDE_MANAGED_START,
            CLAUDE_MANAGED_END
          );
          break;
        }
        default: {
          const content = this.profiles.renderAsset(profile, asset, values);
          await this.repo.writeTextIfMissing(path.join(rootDir, asset.target), content);
          break;
        }
      }
    }
  }

  private async ensureProfileRequirements(
    rootDir: string,
    profile: LoadedOSpecLiteProfile
  ): Promise<void> {
    const missingPaths: string[] = [];
    for (const relativePath of profile.requiredRepoPaths ?? []) {
      if (!(await this.repo.exists(path.join(rootDir, relativePath)))) {
        missingPaths.push(relativePath);
      }
    }

    if (missingPaths.length > 0) {
      throw new ProfilePreconditionError(profile.id, missingPaths);
    }
  }
}
