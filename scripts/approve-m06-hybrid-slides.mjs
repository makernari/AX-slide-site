import fs from "node:fs";
import path from "node:path";

const ROOT = path.resolve(import.meta.dirname, "..");
const MANIFEST_PATH = path.join(ROOT, "data", "slide-manifest.json");
const CSV_PATH = path.join(ROOT, "data", "slide-manifest.csv");

function walk(directory) {
  if (!fs.existsSync(directory)) return [];
  return fs.readdirSync(directory, { withFileTypes: true }).flatMap((entry) =>
    entry.isDirectory()
      ? walk(path.join(directory, entry.name))
      : [path.join(directory, entry.name)],
  );
}

function csvEscape(value) {
  const text = Array.isArray(value) ? value.join(" / ") : String(value ?? "");
  return /[",\r\n]/.test(text) ? `"${text.replaceAll('"', '""')}"` : text;
}

const sourceRoots = [
  path.join(ROOT, "assets", "slide-sources", "optional", "M06"),
  path.join(ROOT, "assets", "slide-sources", "revisions", "M06"),
];
const targetIds = new Set(sourceRoots.flatMap(walk)
  .filter((file) => file.endsWith(".svg"))
  .map((file) => path.basename(file, ".svg")));

if (targetIds.size !== 20) throw new Error(`Expected 20 M06 hybrid slides, found ${targetIds.size}`);

const manifest = JSON.parse(fs.readFileSync(MANIFEST_PATH, "utf8"));
const targets = manifest.slides.filter((slide) => targetIds.has(slide.id));
if (targets.length !== 20 || targets.some((slide) => slide.module !== "M06")) {
  throw new Error(`M06 approval target mismatch: ${targets.length}`);
}
for (const slide of targets) slide.review_status = "approved";

fs.writeFileSync(MANIFEST_PATH, `${JSON.stringify(manifest, null, 2)}\n`, "utf8");
const fields = ["id", "course", "module", "day", "lesson", "order", "title", "purpose", "key_message", "required_content", "visual_type", "content_type", "image_filename", "prompt_status", "image_status", "review_status"];
const csv = [fields.join(","), ...manifest.slides.map((slide) => fields.map((field) => csvEscape(slide[field])).join(","))].join("\r\n") + "\r\n";
fs.writeFileSync(CSV_PATH, csv, "utf8");
console.log(`m06_hybrid_approval=ok count=${targets.length}`);
