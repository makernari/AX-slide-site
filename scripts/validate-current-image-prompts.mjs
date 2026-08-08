import crypto from "node:crypto";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const MODULES = ["M05", "M06", "M07", "M08", "M09"];
const IMPORTANT_FIELDS = [
  "course", "module", "day", "lesson", "order", "title", "purpose", "key_message",
  "required_content", "visual_type", "content_type", "image_filename", "image_status", "review_status",
];
const errors = [];
const counts = { prompts: 0, hybridSvg: 0, hybridHero: 0, fullSlide: 0, heroAssets: 0 };

function sha256(filePath) {
  return crypto.createHash("sha256").update(fs.readFileSync(filePath)).digest("hex");
}

function walk(directory) {
  if (!fs.existsSync(directory)) return [];
  return fs.readdirSync(directory, { withFileTypes: true }).flatMap((entry) => {
    const absolute = path.join(directory, entry.name);
    return entry.isDirectory() ? walk(absolute) : [absolute];
  });
}

function fail(message) {
  errors.push(message);
}

function assert(condition, message) {
  if (!condition) fail(message);
}

function decodeXml(text) {
  return text
    .replace(/<[^>]+>/g, "")
    .replaceAll("&amp;", "&")
    .replaceAll("&lt;", "<")
    .replaceAll("&gt;", ">")
    .replaceAll("&quot;", '"')
    .replaceAll("&apos;", "'")
    .replace(/\s+/g, " ")
    .trim();
}

function svgText(relativePath) {
  const svg = fs.readFileSync(path.join(ROOT, relativePath), "utf8");
  return [...new Set([...svg.matchAll(/<text\b[^>]*>([\s\S]*?)<\/text>/gi)]
    .map((match) => decodeXml(match[1]))
    .filter(Boolean))];
}

function pngDimensions(relativePath) {
  const buffer = fs.readFileSync(path.join(ROOT, relativePath));
  if (buffer.subarray(0, 8).toString("hex") !== "89504e470d0a1a0a") return null;
  return { width: buffer.readUInt32BE(16), height: buffer.readUInt32BE(20) };
}

const manifestPath = path.join(ROOT, "data", "slide-manifest.json");
const stylePath = path.join(ROOT, "docs", "design", "image_style_guide.md");
const manifestHash = sha256(manifestPath);
const styleHash = sha256(stylePath);
const manifest = JSON.parse(fs.readFileSync(manifestPath, "utf8"));
const currentById = new Map(manifest.slides.map((slide) => [slide.id, slide]));
const seen = new Set();

for (const module of MODULES) {
  const moduleSlides = manifest.slides.filter((slide) => slide.module === module);
  const promptManifestPath = path.join(ROOT, "prompts", module, `${module}_prompt_manifest.json`);
  const promptManifest = JSON.parse(fs.readFileSync(promptManifestPath, "utf8"));
  assert(promptManifest.schema_version === "2.0", `${module}: schema version mismatch`);
  assert(promptManifest.source_manifest_sha256 === manifestHash, `${module}: stale slide manifest hash`);
  assert(promptManifest.style_guide_sha256 === styleHash, `${module}: stale style guide hash`);
  assert(promptManifest.total_prompts === moduleSlides.length, `${module}: prompt count mismatch`);
  assert(promptManifest.image_generation_executed_in_this_update === false, `${module}: generation flag must remain false`);

  for (const prompt of promptManifest.prompts) {
    counts.prompts += 1;
    assert(!seen.has(prompt.id), `${prompt.id}: duplicate prompt entry`);
    seen.add(prompt.id);
    const slide = currentById.get(prompt.id);
    if (!slide) {
      fail(`${prompt.id}: no current slide`);
      continue;
    }
    for (const field of IMPORTANT_FIELDS) {
      assert(JSON.stringify(prompt[field]) === JSON.stringify(slide[field]), `${prompt.id}: stale ${field}`);
    }
    const expectedPath = `prompts/${slide.module}/${slide.course.toLowerCase()}/${slide.id}.md`;
    assert(prompt.prompt_file === expectedPath, `${prompt.id}: prompt path mismatch`);
    const absolutePrompt = path.join(ROOT, expectedPath);
    if (!fs.existsSync(absolutePrompt)) {
      fail(`${prompt.id}: prompt file missing`);
      continue;
    }
    const text = fs.readFileSync(absolutePrompt, "utf8");
    for (const token of [slide.id, slide.image_filename, slide.title.replace(/^\[[^\]]+\]\s*/, ""), "16:9"]) {
      assert(text.includes(token), `${prompt.id}: missing ${token}`);
    }
    assert(!/(?:ablearn|에이블런|CapCut|캡컷)/i.test(text), `${prompt.id}: forbidden vendor or tool name`);
    assert(!text.includes("\uFFFD"), `${prompt.id}: invalid Unicode replacement character`);

    if (prompt.production_mode === "hybrid-svg") counts.hybridSvg += 1;
    else if (prompt.production_mode === "hybrid-gpt-image-2-hero") counts.hybridHero += 1;
    else if (prompt.production_mode === "gpt-image-2-full-slide") counts.fullSlide += 1;
    else fail(`${prompt.id}: unknown production mode ${prompt.production_mode}`);

    if (prompt.source_svg) {
      assert(fs.existsSync(path.join(ROOT, prompt.source_svg)), `${prompt.id}: source SVG missing`);
      if (fs.existsSync(path.join(ROOT, prompt.source_svg))) {
        assert(JSON.stringify(prompt.exact_display_text) === JSON.stringify(svgText(prompt.source_svg)), `${prompt.id}: SVG display text mismatch`);
      }
    }
    if (prompt.hero_asset) {
      counts.heroAssets += 1;
      assert(prompt.production_mode === "hybrid-gpt-image-2-hero", `${prompt.id}: hero mode mismatch`);
      assert(fs.existsSync(path.join(ROOT, prompt.hero_asset)), `${prompt.id}: hero asset missing`);
      if (fs.existsSync(path.join(ROOT, prompt.hero_asset))) {
        const dimensions = pngDimensions(prompt.hero_asset);
        assert(dimensions !== null, `${prompt.id}: invalid hero PNG`);
        if (dimensions) assert(Math.abs(dimensions.width / dimensions.height - 16 / 9) < 0.002, `${prompt.id}: hero is not 16:9`);
      }
      assert(text.includes("텍스트 없는 hero 생성 프롬프트"), `${prompt.id}: hero prompt section missing`);
    }
  }

  const indexPath = path.join(ROOT, "prompts", module, `${module}_prompt_index.md`);
  const index = fs.readFileSync(indexPath, "utf8");
  assert(index.includes(`현재 교안 슬라이드: ${moduleSlides.length}장`), `${module}: index count missing`);
  for (const slide of moduleSlides) assert(index.includes(slide.id), `${module}: index missing ${slide.id}`);
}

const promptFiles = MODULES.flatMap((module) => walk(path.join(ROOT, "prompts", module)))
  .filter((file) => /(?:COMMON|BACKOFFICE|MARKETING)-M\d{2}-D\d{2}-S\d{3}\.md$/.test(file));
assert(promptFiles.length === manifest.slides.length, `prompt file total ${promptFiles.length} != ${manifest.slides.length}`);
assert(seen.size === manifest.slides.length, `manifest prompt total ${seen.size} != ${manifest.slides.length}`);
assert(manifest.slides.every((slide) => slide.prompt_status === "pending"), "source prompt status changed before approval");

if (errors.length) {
  console.error(`Current image prompt validation failed (${errors.length})`);
  for (const error of errors.slice(0, 100)) console.error(`- ${error}`);
  process.exitCode = 1;
} else {
  console.log(JSON.stringify({ ...counts, modules: MODULES.length, sourceSlides: manifest.slides.length, validation: "passed", imageGenerationExecuted: false }, null, 2));
}
