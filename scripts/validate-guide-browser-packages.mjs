import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const PAGES_ROOT = "https://makernari.github.io/AX-slide-site";
const RESOURCE_PREFIX = `${PAGES_ROOT}/downloads/guide-resources/`;
const ROLES = ["backoffice", "marketing"];
const DAYS = [
  "M05-D01", "M05-D02", "M05-D03", "M05-D04",
  "M06-D01", "M06-D02", "M06-D03",
  "M07-D01", "M07-D02", "M07-D03",
  "M08-D01", "M08-D02", "M08-D03", "M08-D04",
  "M09-D01",
];
const DEPLOYED_EXTENSIONS = new Set([".csv", ".gs", ".html", ".md", ".pdf", ".png", ".txt"]);

const failures = [];
const linkedResources = new Set();
const linkedHtml = new Set();
let markdownFiles = 0;
let directLinks = 0;

function fail(message) {
  failures.push(message);
}

function walk(directory) {
  if (!fs.existsSync(directory)) return [];
  return fs.readdirSync(directory, { withFileTypes: true }).flatMap((entry) => {
    const absolute = path.join(directory, entry.name);
    return entry.isDirectory() ? walk(absolute) : [absolute];
  });
}

function relative(absolute) {
  return path.relative(ROOT, absolute).split(path.sep).join("/");
}

function localResource(url) {
  const encoded = url.slice(RESOURCE_PREFIX.length);
  const withoutFragment = encoded.split("#", 1)[0].split("?", 1)[0];
  const decoded = decodeURI(withoutFragment);
  const absolute = path.resolve(ROOT, "downloads", "guide-resources", ...decoded.split("/"));
  const resourceRoot = path.resolve(ROOT, "downloads", "guide-resources");
  if (!absolute.startsWith(`${resourceRoot}${path.sep}`)) return null;
  return absolute;
}

const activeMarkdown = [
  ...walk(path.join(ROOT, "guides", "notion")),
  ...walk(path.join(ROOT, "downloads", "guide-resources", "backoffice")),
  ...walk(path.join(ROOT, "downloads", "guide-resources", "marketing")),
].filter((file) => file.toLowerCase().endsWith(".md"));

for (const file of activeMarkdown) {
  markdownFiles += 1;
  const fileRelative = relative(file);
  const text = fs.readFileSync(file, "utf8");

  if (/browser-examples-[^)\s]+\.zip/i.test(text)) fail(`${fileRelative}: legacy browser ZIP link remains`);
  if (/START_HERE\.html/i.test(text)) fail(`${fileRelative}: legacy ZIP launcher instruction remains`);
  if (/ZIP 다운로드 전용|ZIP을 내려받아|압축을 푼 뒤/.test(text)) fail(`${fileRelative}: legacy ZIP instruction remains`);
  if (text.includes("https://raw.githubusercontent.com/makernari/AX-slide-site/main/downloads/guide-resources/")) {
    fail(`${fileRelative}: raw guide resource link remains`);
  }

  for (const match of text.matchAll(/https:\/\/makernari\.github\.io\/AX-slide-site\/downloads\/guide-resources\/[^)\s]+/g)) {
    const url = match[0];
    const absolute = localResource(url);
    directLinks += 1;
    if (!absolute) {
      fail(`${fileRelative}: unsafe resource URL ${url}`);
      continue;
    }
    const resourceRelative = relative(absolute);
    const extension = path.extname(absolute).toLowerCase();
    linkedResources.add(resourceRelative);
    if (extension === ".html") linkedHtml.add(resourceRelative);
    if (!fs.existsSync(absolute)) fail(`${fileRelative}: missing resource ${resourceRelative}`);
    if (!DEPLOYED_EXTENSIONS.has(extension)) fail(`${fileRelative}: resource type is not deployed ${resourceRelative}`);
    if (resourceRelative.includes("/reference-guides/")) fail(`${fileRelative}: instructor reference resource is not deployed`);
  }
}

for (const role of ROLES) {
  for (const day of DAYS) {
    for (const kind of ["learner", "instructor"]) {
      const guide = path.join(ROOT, "guides", "notion", role, kind, `${day}.md`);
      const text = fs.readFileSync(guide, "utf8");
      const screen = `${PAGES_ROOT}/#/resources/${role}`;
      if (!text.includes(screen)) fail(`${relative(guide)}: resource screen link is missing`);
      if (!text.includes("GUIDE-PAGES-RESOURCES-20260810")) fail(`${relative(guide)}: Pages resource notice is missing`);
    }
    const solution = `downloads/guide-resources/${role}/${day}/solutions/${day.toLowerCase()}-${role}-complete-example.html`;
    if (!linkedHtml.has(solution)) fail(`${solution}: direct completion example link is missing from active guides`);
  }
}

const deployedHtml = ["backoffice", "marketing", "common"]
  .flatMap((folder) => walk(path.join(ROOT, "downloads", "guide-resources", folder)))
  .filter((file) => file.toLowerCase().endsWith(".html"));

if (activeMarkdown.length !== 305) fail(`Expected 305 active Markdown files, found ${activeMarkdown.length}`);
if (deployedHtml.length !== 81) fail(`Expected 81 deployable HTML files, found ${deployedHtml.length}`);
if (directLinks < 800) fail(`Expected at least 800 direct resource links, found ${directLinks}`);

if (failures.length) {
  console.error(`Guide Pages resource validation failed (${failures.length})`);
  for (const message of failures) console.error(`- ${message}`);
  process.exitCode = 1;
} else {
  console.log("Guide Pages resource validation passed");
  console.log(`- active Markdown files: ${markdownFiles}`);
  console.log(`- direct resource links: ${directLinks}`);
  console.log(`- unique linked resources: ${linkedResources.size}`);
  console.log(`- unique linked HTML files: ${linkedHtml.size}`);
  console.log(`- deployable HTML files: ${deployedHtml.length}`);
  console.log("- legacy ZIP/raw resource links: 0");
}
