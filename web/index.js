import { rm, mkdir, cp, readFile, writeFile } from "node:fs/promises";
import { execSync } from "node:child_process";
import { existsSync } from "node:fs";
import path from "node:path";
import { createWriteStream } from "node:fs";
import { ZipArchive } from "archiver";

const root = process.cwd();
const p = (...a) => path.join(root, ...a);

// 0. delete ./website
await rm(p("website"), { recursive: true, force: true });

// 1. build front + copy dist
execSync("npm run build", { cwd: p("front"), stdio: "inherit" });
await mkdir(p("website", "front", "dist"), { recursive: true });
await cp(p("front", "dist"), p("website", "front", "dist"), {
  recursive: true,
});

// 2. copy back-node (filtered)
await cp(p("back-node"), p("website", "back-node"), {
  recursive: true,
  filter: (src) => {
    const name = path.basename(src);
    if (name === "node_modules" || name === ".gitignore") return false;
    if (name === "package-lock.json") return false;
    if (name.startsWith(".env")) return false;
    return true;
  },
});

// 3. remove "scripts" from package.json
const pkgPath = p("website", "back-node", "package.json");
const pkg = JSON.parse(await readFile(pkgPath, "utf8"));
delete pkg.scripts;
if (pkg.dependencies) delete pkg.dependencies.dotenv;
if (pkg.devDependencies) delete pkg.devDependencies.dotenv;
await writeFile(pkgPath, JSON.stringify(pkg, null, 2));

// 4. remove dotenv import from db.js
const dbPath = p("website", "back-node", "db.js");
if (existsSync(dbPath)) {
  let db = await readFile(dbPath, "utf8");
  db = db.replace(/^\s*import\s+['"]dotenv\/config['"];?\s*$/m, "");
  await writeFile(dbPath, db);
}

// 5. rewrite app.listen in index.js
const idxPath = p("website", "back-node", "index.js");
if (existsSync(idxPath)) {
  let idx = await readFile(idxPath, "utf8");
  idx = idx.replace(
    /app\.listen\(3000,\s*\(\)\s*=>\s*console\.log\(["']http:\/\/localhost:3000["']\)\);/,
    "const PORT = process.env.PORT || 3000;\napp.listen(PORT, () => console.log(`Server running on port ${PORT}`));",
  );
  await writeFile(idxPath, idx);
}

// 6. zip website folder → website/website.zip
const tmpZip = p("website.zip");
await new Promise((resolve, reject) => {
  const out = createWriteStream(tmpZip);
  const zip = new ZipArchive({ zlib: { level: 9 } });
  out.on("close", resolve);
  zip.on("error", reject);
  zip.pipe(out);
  zip.directory(p("website"), false);
  zip.finalize();
});
await cp(tmpZip, p("website", "website.zip"));
await rm(tmpZip, { force: true });

console.log("Done → website.zip");
