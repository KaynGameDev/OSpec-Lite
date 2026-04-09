import {
  AGENTS_MANAGED_END,
  AGENTS_MANAGED_START
} from "../core/ospec-lite-schema";
import { AgentTemplateService } from "./ospec-lite-agent-template-service";
import { AgentAdapter } from "./ospec-lite-agent-target-types";

export class CodexAdapter implements AgentAdapter {
  public readonly target = "codex" as const;
  public readonly fileName = "AGENTS.md";
  private readonly templates = new AgentTemplateService();

  buildSection(input: {
    projectName: string;
    summary: string;
    docsRoot: string;
    agentDocsRoot: string;
    rules: string[];
    importantFiles: string[];
  }) {
    const hardRules = input.rules.map((rule) => `- ${rule}`).join("\n");
    const highRiskAreas = input.importantFiles
      .slice(0, 5)
      .map((filePath) => `- \`${filePath}\``)
      .join("\n");
    const content = this.templates.renderTemplate("agents.md", {
      managedStart: AGENTS_MANAGED_START,
      managedEnd: AGENTS_MANAGED_END,
      projectName: input.projectName,
      summary: input.summary,
      docsRoot: input.docsRoot,
      agentDocsRoot: input.agentDocsRoot,
      hardRules,
      highRiskAreas: highRiskAreas || "- Review the project docs first."
    });

    return {
      title: "AGENTS",
      content,
      managedStart: AGENTS_MANAGED_START,
      managedEnd: AGENTS_MANAGED_END
    };
  }
}
