import fs from "node:fs";
import path from "node:path";
import { spawnSync } from "node:child_process";
import { fileURLToPath } from "node:url";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const TAR = path.join(process.env.SystemRoot || "C:\\Windows", "System32", "tar.exe");
const ROLES = ["backoffice", "marketing"];
const DAYS = [
  "M05-D01", "M05-D02", "M05-D03", "M05-D04",
  "M06-D01", "M06-D02", "M06-D03",
  "M07-D01", "M07-D02", "M07-D03",
  "M08-D01", "M08-D02", "M08-D03", "M08-D04",
  "M09-D01",
];

const failures = [];
const packagedSources = new Set();
let packageCount = 0;
let packagedHtml = 0;

function fail(message) {
  failures.push(message);
}

function listZip(zipPath) {
  const result = spawnSync(TAR, ["-tf", zipPath], { encoding: "utf8" });
  if (result.status !== 0) {
    fail(`${path.relative(ROOT, zipPath)}: ZIP listing failed: ${result.error?.message || result.stderr || result.stdout}`);
    return [];
  }
  return result.stdout.split(/\r?\n/).map((item) => item.replace(/^\.\//, "")).filter(Boolean);
}

for (const role of ROLES) {
  for (const day of DAYS) {
    const filename = `browser-examples-${role}-${day.toLowerCase()}-20260809.zip`;
    const zipPath = path.join(ROOT, "downloads", "guide-resources", role, day, filename);
    if (!fs.existsSync(zipPath)) {
      fail(`Missing ZIP: ${path.relative(ROOT, zipPath)}`);
      continue;
    }
    packageCount += 1;
    const entries = listZip(zipPath);
    if (!entries.includes("START_HERE.html")) fail(`${filename}: START_HERE.html missing`);
    if (!entries.includes("README.txt")) fail(`${filename}: README.txt missing`);
    if (entries.some((entry) => entry.startsWith("/") || entry.split(/[\\/]/).includes(".."))) fail(`${filename}: unsafe archive path`);
    const htmlEntries = entries.filter((entry) => /^examples\/.+\.html$/i.test(entry));
    const expected = day === "M05-D01" || day === "M09-D01"
      ? fs.readdirSync(path.join(ROOT, "downloads", "guide-resources", role, day), { recursive: true, withFileTypes: true })
          .filter((entry) => entry.isFile() && entry.name.toLowerCase().endsWith(".html")).length + 1
      : fs.readdirSync(path.join(ROOT, "downloads", "guide-resources", role, day), { recursive: true, withFileTypes: true })
          .filter((entry) => entry.isFile() && entry.name.toLowerCase().endsWith(".html")).length;
    if (htmlEntries.length !== expected) fail(`${filename}: expected ${expected} packaged HTML files, found ${htmlEntries.length}`);
    for (const entry of htmlEntries) packagedSources.add(path.basename(entry));
    packagedHtml += htmlEntries.length;
  }
}

const sourceHtml = [];
for (const root of [path.join(ROOT, "downloads", "guide-resources")]) {
  const stack = [root];
  while (stack.length) {
    const current = stack.pop();
    for (const entry of fs.readdirSync(current, { withFileTypes: true })) {
      const absolute = path.join(current, entry.name);
      if (entry.isDirectory()) stack.push(absolute);
      else if (entry.isFile() && entry.name.toLowerCase().endsWith(".html")) sourceHtml.push(entry.name);
    }
  }
}

for (const filename of sourceHtml) {
  if (!packagedSources.has(filename)) fail(`HTML source not included in any browser ZIP: ${filename}`);
}

const markdownFiles = [];
for (const root of [path.join(ROOT, "guides"), path.join(ROOT, "downloads")]) {
  const stack = [root];
  while (stack.length) {
    const current = stack.pop();
    for (const entry of fs.readdirSync(current, { withFileTypes: true })) {
      const absolute = path.join(current, entry.name);
      if (entry.isDirectory()) stack.push(absolute);
      else if (entry.isFile() && entry.name.toLowerCase().endsWith(".md")) markdownFiles.push(absolute);
    }
  }
}
let browserZipLinks = 0;
for (const file of markdownFiles) {
  const text = fs.readFileSync(file, "utf8");
  if (/https:\/\/raw\.githubusercontent\.com\/makernari\/AX-slide-site\/main\/downloads\/guide-resources\/(?:backoffice|marketing)\/M\d\d-D\d\d\/[^)\s]+\.html/i.test(text)) {
    fail(`${path.relative(ROOT, file)}: raw HTML link remains`);
  }
  if (/https:\/\/raw\.githubusercontent\.com\/makernari\/AX-slide-site\/main\/downloads\/guide-resources\/(?:backoffice|marketing)\/M\d\d-D\d\d\/solutions\/[^)\s]+-complete-example\.md/i.test(text)) {
    fail(`${path.relative(ROOT, file)}: raw complete-example Markdown link remains`);
  }
  browserZipLinks += (text.match(/browser-examples-(?:backoffice|marketing)-m\d\d-d\d\d-20260809\.zip/g) || []).length;
}

if (packageCount !== 30) fail(`Expected 30 ZIP packages, found ${packageCount}`);
if (sourceHtml.length !== 82) fail(`Expected 82 source HTML files, found ${sourceHtml.length}`);

if (failures.length) {
  console.error(`Guide browser package validation failed (${failures.length})`);
  for (const message of failures) console.error(`- ${message}`);
  process.exitCode = 1;
} else {
  console.log("Guide browser package validation passed");
  console.log(`- packages: ${packageCount}`);
  console.log(`- source HTML files covered: ${sourceHtml.length}`);
  console.log(`- packaged HTML copies: ${packagedHtml}`);
  console.log(`- guide/README ZIP links: ${browserZipLinks}`);
  console.log("- raw HTML links: 0");
  console.log("- raw complete-example Markdown links: 0");
}
