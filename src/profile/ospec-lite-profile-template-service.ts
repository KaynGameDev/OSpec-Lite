import * as fs from "node:fs";
import * as path from "node:path";

export class ProfileTemplateService {
  private readonly templateCache = new Map<string, string>();

  renderTemplate(
    rootDir: string,
    relativePath: string,
    values: Record<string, string> | object
  ): string {
    const template = this.loadTemplate(rootDir, relativePath);
    const dictionary = values as Record<string, string>;
    return template.replace(/\{\{\s*([a-zA-Z0-9_-]+)\s*\}\}/g, (_match, key: string) => {
      return dictionary[key] ?? "";
    });
  }

  private loadTemplate(rootDir: string, relativePath: string): string {
    const cacheKey = `${rootDir}::${relativePath}`;
    const cached = this.templateCache.get(cacheKey);
    if (cached) {
      return cached;
    }

    const templatePath = path.join(rootDir, relativePath);
    const template = fs.readFileSync(templatePath, "utf8");
    this.templateCache.set(cacheKey, template);
    return template;
  }
}
