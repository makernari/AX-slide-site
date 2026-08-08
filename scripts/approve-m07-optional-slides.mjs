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

const sourceRoot = path.join(ROOT, "assets", "slide-sources", "optional", "M07");
const targetIds = new Set(walk(sourceRoot)
  .filter((file) => file.endsWith(".svg"))
  .map((file) => path.basename(file, ".svg")));

if (targetIds.size !== 18) throw new Error(`Expected 18 M07 optional slides, found ${targetIds.size}`);

const manifest = JSON.parse(fs.readFileSync(MANIFEST_PATH, "utf8"));
const targets = manifest.slides.filter((slide) => targetIds.has(slide.id));
if (targets.length !== 18 || targets.some((slide) => slide.module !== "M07")) {
  throw new Error(`M07 approval target mismatch: ${targets.length}`);
}
for (const slide of targets) slide.review_status = "approved";

fs.writeFileSync(MANIFEST_PATH, `${JSON.stringify(manifest, null, 2)}\n`, "utf8");
const fields = ["id", "course", "module", "day", "lesson", "order", "title", "purpose", "key_message", "required_content", "visual_type", "content_type", "image_filename", "prompt_status", "image_status", "review_status"];
const csv = [fields.join(","), ...manifest.slides.map((slide) => fields.map((field) => csvEscape(slide[field])).join(","))].join("\r\n") + "\r\n";
fs.writeFileSync(CSV_PATH, csv, "utf8");
console.log(`m07_optional_approval=ok count=${targets.length}`);
