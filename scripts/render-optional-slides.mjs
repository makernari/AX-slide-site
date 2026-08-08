import { execFileSync } from "node:child_process";
import fs from "node:fs";
import path from "node:path";

const ROOT = path.resolve(import.meta.dirname, "..");
const EDGE = "C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe";
const requestedModule = process.argv.find((arg) => arg.startsWith("--module="))?.split("=")[1] ?? null;
const sampleMode = process.argv.includes("--samples");
const sourceRoots = [
  ...(sampleMode
    ? [path.join(ROOT, "docs", "design", "samples", "optional-refresh")]
    : [
        path.join(ROOT, "assets", "slide-sources", "optional"),
        path.join(ROOT, "assets", "slide-sources", "revisions"),
      ]),
];

if (requestedModule && !/^M0[5-9]$/.test(requestedModule)) {
  throw new Error(`Invalid module: ${requestedModule}`);
}
if (!fs.existsSync(EDGE)) throw new Error(`Edge not found: ${EDGE}`);

function listSvgFiles(directory) {
  if (!fs.existsSync(directory)) return [];
  const files = [];
  for (const entry of fs.readdirSync(directory, { withFileTypes: true })) {
    const target = path.join(directory, entry.name);
    if (entry.isDirectory()) files.push(...listSvgFiles(target));
    else if (entry.isFile() && entry.name.toLowerCase().endsWith(".svg")) files.push(target);
  }
  return files;
}

function inspectPng(filePath) {
  const buffer = fs.readFileSync(filePath).subarray(0, 24);
  const signature = Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]);
  if (buffer.length < 24 || !buffer.subarray(0, 8).equals(signature)) return null;
  return { width: buffer.readUInt32BE(16), height: buffer.readUInt32BE(20) };
}

const files = sourceRoots.flatMap(listSvgFiles).filter((filePath) => sampleMode || !requestedModule || filePath.includes(`${path.sep}${requestedModule}${path.sep}`));
if (!files.length) throw new Error("No slide sources found");

const profileName = `.tmp-optional-render-${requestedModule ?? "all"}-${process.pid}`;
const profileDir = path.resolve(ROOT, profileName);
if (!profileDir.startsWith(`${ROOT}${path.sep}`)) throw new Error(`Unsafe profile path: ${profileDir}`);
fs.mkdirSync(profileDir, { recursive: true });

let rendered = 0;
for (const sourcePath of files.sort()) {
  if (sampleMode) {
    const targetPath = sourcePath.replace(/\.svg$/i, ".png");
    const fileUrl = `file:///${sourcePath.replaceAll("\\", "/")}`;
    execFileSync(EDGE, [
      "--headless",
      "--disable-gpu",
      "--hide-scrollbars",
      "--force-device-scale-factor=1",
      "--window-size=2048,1152",
      `--user-data-dir=${profileDir}`,
      `--screenshot=${targetPath}`,
      fileUrl,
    ], { stdio: "ignore", timeout: 30000 });
    const info = inspectPng(targetPath);
    if (!info || info.width !== 2048 || info.height !== 1152) {
      throw new Error(`Invalid sample PNG ${targetPath}: ${JSON.stringify(info)}`);
    }
    rendered += 1;
    console.log(`rendered=${rendered}/${files.length}`);
    continue;
  }
  const parts = sourcePath.split(path.sep);
  const module = parts.find((part) => /^M0[5-9]$/.test(part));
  const course = parts.at(-2);
  if (!module || !["common", "backoffice", "marketing"].includes(course)) {
    throw new Error(`Cannot route source: ${sourcePath}`);
  }
  const targetDir = path.join(ROOT, "assets", "slides", module, course);
  fs.mkdirSync(targetDir, { recursive: true });
  const targetPath = path.join(targetDir, `${path.basename(sourcePath, ".svg")}.png`);
  const fileUrl = `file:///${sourcePath.replaceAll("\\", "/")}`;
  execFileSync(EDGE, [
    "--headless",
    "--disable-gpu",
    "--hide-scrollbars",
    "--force-device-scale-factor=1",
    "--window-size=2048,1152",
    `--user-data-dir=${profileDir}`,
    `--screenshot=${targetPath}`,
    fileUrl,
  ], { stdio: "ignore", timeout: 30000 });
  const info = inspectPng(targetPath);
  if (!info || info.width !== 2048 || info.height !== 1152) {
    throw new Error(`Invalid PNG ${targetPath}: ${JSON.stringify(info)}`);
  }
  rendered += 1;
  if (rendered % 10 === 0 || rendered === files.length) console.log(`rendered=${rendered}/${files.length}`);
}

console.log(`optional_slide_render=ok mode=${sampleMode ? "samples" : "slides"} module=${requestedModule ?? "all"} count=${rendered}`);
if (profileDir.startsWith(`${ROOT}${path.sep}.tmp-optional-render-`)) {
  fs.rmSync(profileDir, { recursive: true, force: true });
}
