const fs = require("node:fs");
const path = require("node:path");

const sourceDir = path.join(__dirname, "..", "src", "render", "templates");
const targetDir = path.join(__dirname, "..", "dist", "render", "templates");

copyDirectory(sourceDir, targetDir);

function copyDirectory(source, target) {
  if (!fs.existsSync(source)) {
    throw new Error(`Template source directory not found: ${source}`);
  }

  fs.mkdirSync(target, { recursive: true });

  for (const entry of fs.readdirSync(source, { withFileTypes: true })) {
    const sourcePath = path.join(source, entry.name);
    const targetPath = path.join(target, entry.name);

    if (entry.isDirectory()) {
      copyDirectory(sourcePath, targetPath);
      continue;
    }

    fs.copyFileSync(sourcePath, targetPath);
  }
}
