const fs = require("fs");
const path = require("path");
const { execSync } = require("child_process");

const rootDir = path.resolve(__dirname, "..");
const studentId = "67160191";
const folderName = `project-phase3-${studentId}`;
const targetDir = path.join(rootDir, folderName);
const zipPath = path.join(rootDir, `${folderName}.zip`);

console.log(`[Packer] Preparing folder: ${folderName}...`);

// Remove existing staging folder if present
if (fs.existsSync(targetDir)) {
  fs.rmSync(targetDir, { recursive: true, force: true });
}
fs.mkdirSync(targetDir, { recursive: true });

function copyRecursive(src, dest) {
  const stat = fs.statSync(src);
  if (stat.isDirectory()) {
    if (!fs.existsSync(dest)) fs.mkdirSync(dest, { recursive: true });
    for (const file of fs.readdirSync(src)) {
      copyRecursive(path.join(src, file), path.join(dest, file));
    }
  } else {
    fs.copyFileSync(src, dest);
  }
}

// Items to copy according to instructor specification
const itemsToCopy = [
  "src",
  "frontend",
  "postman_collection.json",
  "openapi.yaml",
  "openapi.json",
  "coverage-report.md",
  "failure-scenario-results.md",
  "requirement.md",
  "erd.png",
  "schema.sql",
  "seed.sql",
  "db.js",
  "index.js",
  "services",
  "package.json",
  "README.md",
  "tests",
  "test-resilience.js",
  "defense-qa.md",
  "wk-03.md",
  ".env.example",
];

for (const item of itemsToCopy) {
  const srcPath = path.join(rootDir, item);
  const destPath = path.join(targetDir, item);
  if (fs.existsSync(srcPath)) {
    copyRecursive(srcPath, destPath);
    console.log(`  ✓ Copied: ${item}`);
  } else {
    console.warn(`  ⚠️ Warning: item not found: ${item}`);
  }
}

// Remove old zip if present
if (fs.existsSync(zipPath)) {
  fs.unlinkSync(zipPath);
  console.log(`  ✓ Removed old zip file`);
}

// Compress to zip via tar or PowerShell
console.log(`[Packer] Compressing to ${folderName}.zip...`);
try {
  execSync(`tar -a -cf "${zipPath}" "${folderName}"`, { cwd: rootDir, stdio: "inherit" });
} catch (e) {
  const psCommand = `powershell -NoProfile -Command "Compress-Archive -Path '${targetDir}' -DestinationPath '${zipPath}' -Force"`;
  execSync(psCommand, { stdio: "inherit" });
}

const zipStat = fs.statSync(zipPath);
console.log(`\n===============================================================`);
console.log(`🎉 SUCCESS: Generated ${folderName}.zip`);
console.log(`📦 Size: ${(zipStat.size / 1024).toFixed(2)} KB`);
console.log(`📂 Location: ${zipPath}`);
console.log(`===============================================================\n`);
