import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const SCRIPT_DIR = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(SCRIPT_DIR, "..");
const OUTPUT = path.join(ROOT, ".pages-dist");

const RUNTIME_FILES = [
  "index.html",
  "assets/css/app.css",
  "assets/js/app.js",
  "assets/images/placeholders/missing-slide.svg",
  "data/slide-manifest.json",
];

const COURSE_FOLDERS = {
  COMMON: "common",
  BACKOFFICE: "backoffice",
  MARKETING: "marketing",
};

function fail(message) {
  throw new Error(message);
}

function normalize(relativePath) {
  return relativePath.split(path.sep).join("/");
}

function resolveInside(base, relativePath) {
  const resolved = path.resolve(base, relativePath);
  if (resolved !== base && !resolved.startsWith(`${base}${path.sep}`)) {
    fail(`Path escapes its base directory: ${relativePath}`);
  }
  return resolved;
}

function requireRegularFile(relativePath) {
  const source = resolveInside(ROOT, relativePath);
  if (!fs.existsSync(source)) fail(`Required source file is missing: ${relativePath}`);
  const stat = fs.lstatSync(source);
  if (!stat.isFile() || stat.isSymbolicLink()) {
    fail(`Required source is not a regular file: ${relativePath}`);
  }
  return source;
}

function copyAllowedFile(relativePath, expectedPaths) {
  const normalized = normalize(relativePath);
  const source = requireRegularFile(normalized);
  const destination = resolveInside(OUTPUT, normalized);
  fs.mkdirSync(path.dirname(destination), { recursive: true });
  fs.copyFileSync(source, destination);
  expectedPaths.add(normalized);
}

function walkFiles(directory, prefix = "") {
  const entries = fs.readdirSync(directory, { withFileTypes: true });
  const files = [];
  for (const entry of entries) {
    const relative = prefix ? `${prefix}/${entry.name}` : entry.name;
    const absolute = path.join(directory, entry.name);
    if (entry.isSymbolicLink()) fail(`Deployment artifact contains a symbolic link: ${relative}`);
    if (entry.isDirectory()) files.push(...walkFiles(absolute, relative));
    else if (entry.isFile()) files.push(relative);
    else fail(`Deployment artifact contains an unsupported entry: ${relative}`);
  }
  return files;
}

function validateRelativeRuntimePaths() {
  const index = fs.readFileSync(requireRegularFile("index.html"), "utf8");
  const localReferences = [...index.matchAll(/\b(?:src|href)=["']([^"']+)["']/gi)]
    .map((match) => match[1])
    .filter((value) => !value.startsWith("#") && !/^https?:\/\//i.test(value));

  const invalidReferences = localReferences.filter((value) => !value.startsWith("./"));
  if (invalidReferences.length) {
    fail(`index.html contains non-relative local paths: ${invalidReferences.join(", ")}`);
  }
  for (const required of ["./assets/css/app.css", "./assets/js/app.js"]) {
    if (!localReferences.includes(required)) fail(`index.html is missing runtime reference: ${required}`);
  }

  const app = fs.readFileSync(requireRegularFile("assets/js/app.js"), "utf8");
  for (const required of [
    'const MANIFEST_URL = "./data/slide-manifest.json";',
    'const SLIDE_ASSET_ROOT = "./assets/slides/";',
  ]) {
    if (!app.includes(required)) fail(`app.js relative path contract is missing: ${required}`);
  }

  const externalUrls = [...new Set(app.match(/https:\/\/[^"'`\s]+/g) ?? [])].sort();
  if (externalUrls.length) {
    fail(`Unexpected external URL in app.js: ${externalUrls.join(", ") || "(none)"}`);
  }
}

function validateManifest() {
  const manifestPath = requireRegularFile("data/slide-manifest.json");
  const manifest = JSON.parse(fs.readFileSync(manifestPath, "utf8"));
  if (!manifest || !Array.isArray(manifest.slides)) {
    fail("data/slide-manifest.json must contain a slides array");
  }
  if (manifest.slides.length !== 430) {
    fail(`Expected 430 manifest slides, found ${manifest.slides.length}`);
  }

  const imagePaths = [];
  const ids = new Set();
  const filenames = new Set();
  for (const slide of manifest.slides) {
    if (!/^(?:COMMON|BACKOFFICE|MARKETING)-M0[5-9]-D\d{2}-S\d{3}$/.test(slide.id)) {
      fail(`Invalid slide ID: ${slide.id}`);
    }
    if (ids.has(slide.id)) fail(`Duplicate slide ID: ${slide.id}`);
    ids.add(slide.id);

    const expectedFilename = `${slide.id}.png`;
    if (slide.image_filename !== expectedFilename) {
      fail(`Image filename does not match slide ID: ${slide.id}`);
    }
    if (filenames.has(slide.image_filename)) {
      fail(`Duplicate image filename: ${slide.image_filename}`);
    }
    filenames.add(slide.image_filename);

    if (slide.review_status !== "approved") {
      fail(`Deployment requires review_status approved: ${slide.id}`);
    }
    if (!["generated", "approved"].includes(slide.image_status)) {
      fail(`Deployment requires a generated or approved image: ${slide.id}`);
    }
    if (!/^M0[5-9]$/.test(slide.module)) {
      fail(`Unsupported deployment module: ${slide.id}`);
    }

    const folder = COURSE_FOLDERS[slide.course];
    if (!folder) fail(`Unsupported course value: ${slide.id}`);
    imagePaths.push(
      `assets/slides/${slide.module}/${folder}/${slide.image_filename}`,
    );
  }
  return imagePaths;
}

function main() {
  validateRelativeRuntimePaths();
  const imagePaths = validateManifest();

  if (fs.existsSync(OUTPUT)) {
    const resolvedOutput = path.resolve(OUTPUT);
    if (resolvedOutput !== path.join(ROOT, ".pages-dist")) {
      fail(`Refusing to clean unexpected output directory: ${resolvedOutput}`);
    }
    fs.rmSync(resolvedOutput, { recursive: true, force: true });
  }
  fs.mkdirSync(OUTPUT, { recursive: true });

  const expectedPaths = new Set();
  for (const relativePath of RUNTIME_FILES) copyAllowedFile(relativePath, expectedPaths);
  for (const relativePath of imagePaths) copyAllowedFile(relativePath, expectedPaths);

  fs.writeFileSync(path.join(OUTPUT, ".nojekyll"), "", "utf8");
  expectedPaths.add(".nojekyll");

  const actualPaths = walkFiles(OUTPUT).sort();
  const expected = [...expectedPaths].sort();
  const unexpected = actualPaths.filter((file) => !expectedPaths.has(file));
  const missing = expected.filter((file) => !actualPaths.includes(file));
  if (unexpected.length || missing.length) {
    fail(
      [
        unexpected.length ? `Unexpected artifact files: ${unexpected.join(", ")}` : "",
        missing.length ? `Missing artifact files: ${missing.join(", ")}` : "",
      ]
        .filter(Boolean)
        .join("\n"),
    );
  }

  const blockedExtensions = new Set([".csv", ".md", ".pdf", ".py", ".pyc", ".xlsx"]);
  const blocked = actualPaths.filter((file) =>
    blockedExtensions.has(path.extname(file).toLowerCase()),
  );
  if (blocked.length) fail(`Blocked file type in deployment artifact: ${blocked.join(", ")}`);

  const totalBytes = actualPaths.reduce(
    (sum, relativePath) => sum + fs.statSync(path.join(OUTPUT, relativePath)).size,
    0,
  );
  console.log("GitHub Pages artifact ready");
  console.log(`- output: ${path.relative(ROOT, OUTPUT)}`);
  console.log(`- files: ${actualPaths.length}`);
  console.log(`- slide images: ${imagePaths.length}`);
  console.log(`- size: ${(totalBytes / 1024 / 1024).toFixed(2)} MiB`);
  console.log("- excluded source groups: guides, guide images, guide resources, local instructions, docs, prompts, references, scripts, original spreadsheets and PDFs");
}

main();
