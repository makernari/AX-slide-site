import fs from "node:fs";
import path from "node:path";

const ROOT = path.resolve(import.meta.dirname, "..");
const MANIFEST_PATH = path.join(ROOT, "data", "slide-manifest.json");
const CSV_PATH = path.join(ROOT, "data", "slide-manifest.csv");

function csvEscape(value) {
  const text = Array.isArray(value) ? value.join(" / ") : String(value ?? "");
  return /[",\r\n]/.test(text) ? `"${text.replaceAll('"', '""')}"` : text;
}

const manifest = JSON.parse(fs.readFileSync(MANIFEST_PATH, "utf8"));
const targets = manifest.slides.filter((slide) => slide.module === "M05" && /^\[(선택|심화|예비)\]/.test(slide.title));
if (targets.length !== 33) throw new Error(`Expected 33 M05 optional slides, found ${targets.length}`);
for (const slide of targets) slide.review_status = "approved";

fs.writeFileSync(MANIFEST_PATH, `${JSON.stringify(manifest, null, 2)}\n`, "utf8");
const fields = ["id", "course", "module", "day", "lesson", "order", "title", "purpose", "key_message", "required_content", "visual_type", "content_type", "image_filename", "prompt_status", "image_status", "review_status"];
const csv = [fields.join(","), ...manifest.slides.map((slide) => fields.map((field) => csvEscape(slide[field])).join(","))].join("\r\n") + "\r\n";
fs.writeFileSync(CSV_PATH, csv, "utf8");
console.log(`m05_optional_approval=ok count=${targets.length}`);
