import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const SCRIPT_DIR = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(SCRIPT_DIR, "..");
const OUTPUT = path.join(ROOT, ".pages-dist");
const GUIDE_RESOURCE_SOURCE = path.join(ROOT, "downloads", "guide-resources");
const GITHUB_PAGES_MAX_BYTES = 1_000_000_000;

const GUIDE_RESOURCE_SCOPES = ["backoffice", "marketing", "common"];
const GUIDE_RESOURCE_EXTENSIONS = new Set([
  ".csv",
  ".gs",
  ".html",
  ".md",
  ".pdf",
  ".png",
  ".txt",
]);
const GUIDE_RESOURCE_OMITTED_ARCHIVE_EXTENSIONS = new Set([".zip"]);

const RUNTIME_FILES = [
  "index.html",
  "backoffice/index.html",
  "marketing/index.html",
  "assets/css/app.css",
  "assets/js/app.js",
  "assets/images/favicon.svg",
  "assets/images/placeholders/missing-slide.svg",
  "data/slide-manifest.json",
];

const ENTRYPOINTS = [
  {
    path: "index.html",
    appRoot: "./",
    stylesheet: "./assets/css/app.css",
    script: "./assets/js/app.js",
    courseLock: null,
  },
  {
    path: "backoffice/index.html",
    appRoot: "../",
    stylesheet: "../assets/css/app.css",
    script: "../assets/js/app.js",
    courseLock: "backoffice",
  },
  {
    path: "marketing/index.html",
    appRoot: "../",
    stylesheet: "../assets/css/app.css",
    script: "../assets/js/app.js",
    courseLock: "marketing",
  },
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

function writeGeneratedFile(relativePath, content, expectedPaths) {
  const normalized = normalize(relativePath);
  const destination = resolveInside(OUTPUT, normalized);
  fs.mkdirSync(path.dirname(destination), { recursive: true });
  fs.writeFileSync(destination, content, "utf8");
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

function collectGuideResources() {
  if (!fs.existsSync(GUIDE_RESOURCE_SOURCE)) {
    fail("Learner guide resource directory is missing: downloads/guide-resources");
  }

  const resources = [];
  for (const scope of GUIDE_RESOURCE_SCOPES) {
    const scopeDirectory = resolveInside(GUIDE_RESOURCE_SOURCE, scope);
    if (!fs.existsSync(scopeDirectory) || !fs.statSync(scopeDirectory).isDirectory()) {
      fail(`Learner guide resource scope is missing: ${scope}`);
    }

    for (const relativeFile of walkFiles(scopeDirectory).sort()) {
      const extension = path.extname(relativeFile).toLowerCase();
      const segments = normalize(relativeFile).split("/");
      if (GUIDE_RESOURCE_OMITTED_ARCHIVE_EXTENSIONS.has(extension)) continue;
      if (!GUIDE_RESOURCE_EXTENSIONS.has(extension)) {
        fail(`Unsupported learner resource file type: ${scope}/${relativeFile}`);
      }

      const context = segments[0];
      const dayMatch = /^(M0[5-9])-(D\d{2})$/.exec(context);
      if (scope !== "common" && !dayMatch) {
        fail(`Course learner resource must be inside a module-day folder: ${scope}/${relativeFile}`);
      }
      if (scope === "common" && !dayMatch && context !== "example-media") {
        fail(`Unsupported common learner resource group: ${scope}/${relativeFile}`);
      }

      const filename = segments.at(-1);
      const category = dayMatch
        ? segments.length > 2
          ? segments[1]
          : "guide"
        : context;
      const sourcePath = path.join(scopeDirectory, ...segments);
      const publicPath = `${scope}/${normalize(relativeFile)}`;
      resources.push({
        course: scope,
        module: dayMatch?.[1] ?? null,
        day: dayMatch?.[2] ?? null,
        category,
        name: filename,
        path: publicPath,
        size: fs.statSync(sourcePath).size,
        type: extension.slice(1),
      });
    }
  }

  const counts = Object.fromEntries(
    GUIDE_RESOURCE_SCOPES.map((scope) => [
      scope,
      resources.filter((resource) => resource.course === scope).length,
    ]),
  );
  return {
    schema_version: "1.0",
    summary: {
      total_files: resources.length,
      total_bytes: resources.reduce((sum, resource) => sum + resource.size, 0),
      course_files: counts,
    },
    resources,
  };
}

function validateRelativeRuntimePaths() {
  for (const entrypoint of ENTRYPOINTS) {
    const html = fs.readFileSync(requireRegularFile(entrypoint.path), "utf8");
    const localReferences = [...html.matchAll(/\b(?:src|href)=["']([^"']+)["']/gi)]
      .map((match) => match[1])
      .filter((value) => !value.startsWith("#") && !/^https?:\/\//i.test(value));

    for (const reference of localReferences) {
      const entryDirectory = path.dirname(resolveInside(ROOT, entrypoint.path));
      const resolvedReference = path.resolve(entryDirectory, reference);
      if (resolvedReference !== ROOT && !resolvedReference.startsWith(`${ROOT}${path.sep}`)) {
        fail(`${entrypoint.path} contains a path outside the site root: ${reference}`);
      }
      const relativeReference = normalize(path.relative(ROOT, resolvedReference));
      requireRegularFile(relativeReference);
    }

    for (const required of [entrypoint.stylesheet, entrypoint.script]) {
      if (!localReferences.includes(required)) {
        fail(`${entrypoint.path} is missing runtime reference: ${required}`);
      }
    }
    if (!html.includes(`data-app-root="${entrypoint.appRoot}"`)) {
      fail(`${entrypoint.path} is missing data-app-root="${entrypoint.appRoot}"`);
    }
    if (entrypoint.courseLock) {
      if (!html.includes(`data-course-lock="${entrypoint.courseLock}"`)) {
        fail(`${entrypoint.path} is missing its ${entrypoint.courseLock} course lock`);
      }
    } else if (/\bdata-course-lock=/.test(html)) {
      fail(`${entrypoint.path} must remain the unlocked course selector`);
    }

    const externalUrls = [...new Set(html.match(/https:\/\/[^"'`\s]+/g) ?? [])].sort();
    if (externalUrls.length) {
      fail(`Unexpected external URL in ${entrypoint.path}: ${externalUrls.join(", ")}`);
    }
  }

  const app = fs.readFileSync(requireRegularFile("assets/js/app.js"), "utf8");
  for (const required of [
    "const APP_ROOT = new URL(",
    'const MANIFEST_URL = new URL("data/slide-manifest.json", APP_ROOT).href;',
    '"data/guide-resources.json",',
    'const SLIDE_ASSET_ROOT = new URL("assets/slides/", APP_ROOT).href;',
    '"downloads/guide-resources/",',
  ]) {
    if (!app.includes(required)) fail(`app.js site-root path contract is missing: ${required}`);
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
  if (manifest.slides.length !== 535) {
    fail(`Expected 535 manifest slides, found ${manifest.slides.length}`);
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
  const guideManifest = collectGuideResources();

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
  for (const resource of guideManifest.resources) {
    copyAllowedFile(
      `downloads/guide-resources/${resource.path}`,
      expectedPaths,
    );
  }
  writeGeneratedFile(
    "data/guide-resources.json",
    `${JSON.stringify(guideManifest, null, 2)}\n`,
    expectedPaths,
  );

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
  const blocked = actualPaths.filter(
    (file) =>
      blockedExtensions.has(path.extname(file).toLowerCase()) &&
      !file.startsWith("downloads/guide-resources/"),
  );
  if (blocked.length) fail(`Blocked file type in deployment artifact: ${blocked.join(", ")}`);

  const totalBytes = actualPaths.reduce(
    (sum, relativePath) => sum + fs.statSync(path.join(OUTPUT, relativePath)).size,
    0,
  );
  if (totalBytes > GITHUB_PAGES_MAX_BYTES) {
    fail(
      `Published Pages site exceeds the 1 GB limit: ${(totalBytes / 1024 / 1024).toFixed(2)} MiB`,
    );
  }
  console.log("GitHub Pages artifact ready");
  console.log(`- output: ${path.relative(ROOT, OUTPUT)}`);
  console.log(`- files: ${actualPaths.length}`);
  console.log(`- slide images: ${imagePaths.length}`);
  console.log(`- learner resources: ${guideManifest.resources.length}`);
  console.log(`- size: ${(totalBytes / 1024 / 1024).toFixed(2)} MiB`);
  console.log("- excluded source groups: duplicate resource ZIP archives, instructor guides, guide images, guide audits, reference guides, local instructions, docs, prompts, references, scripts, original spreadsheets and PDFs");
}

main();
