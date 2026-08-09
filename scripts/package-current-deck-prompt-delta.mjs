import crypto from "node:crypto";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const PACKAGE_NAME = "current-deck-prompt-delta-20260809";
const PACKAGE_ROOT = path.resolve(ROOT, "prompts", PACKAGE_NAME);
const PROMPTS_ROOT = path.resolve(ROOT, "prompts");
const MODULES = ["M05", "M06", "M07", "M08", "M09"];
const COURSES = ["COMMON", "BACKOFFICE", "MARKETING"];
const CHANGED_IDS = new Set(["COMMON-M06-D02-S003", "COMMON-M06-D02-S017"]);

if (!PACKAGE_ROOT.startsWith(`${PROMPTS_ROOT}${path.sep}`) || path.basename(PACKAGE_ROOT) !== PACKAGE_NAME) {
  throw new Error(`Unsafe package root: ${PACKAGE_ROOT}`);
}

function sha256(filePath) {
  return crypto.createHash("sha256").update(fs.readFileSync(filePath)).digest("hex");
}

function relative(filePath) {
  return path.relative(ROOT, filePath).replaceAll("\\", "/");
}

function write(relativePath, content) {
  const target = path.join(PACKAGE_ROOT, relativePath);
  fs.mkdirSync(path.dirname(target), { recursive: true });
  fs.writeFileSync(target, `${String(content).trim()}\n`, "utf8");
}

function cleanTitle(title) {
  return title.replace(/^\[[^\]]+\]\s*/, "");
}

if (fs.existsSync(PACKAGE_ROOT)) fs.rmSync(PACKAGE_ROOT, { recursive: true, force: true });
fs.mkdirSync(PACKAGE_ROOT, { recursive: true });

const delta = [];
for (const module of MODULES) {
  const promptManifestPath = path.join(ROOT, "prompts", module, `${module}_prompt_manifest.json`);
  const promptManifest = JSON.parse(fs.readFileSync(promptManifestPath, "utf8"));
  for (const prompt of promptManifest.prompts) {
    if (!prompt.source_svg) continue;
    const changeType = CHANGED_IDS.has(prompt.id) ? "changed" : "new";
    const courseDir = prompt.course.toLowerCase();
    const source = path.join(ROOT, prompt.prompt_file);
    const bundled = `${changeType}/${module}/${courseDir}/${prompt.id}.md`;
    const target = path.join(PACKAGE_ROOT, bundled);
    fs.mkdirSync(path.dirname(target), { recursive: true });
    fs.copyFileSync(source, target);
    delta.push({
      change_type: changeType,
      id: prompt.id,
      course: prompt.course,
      module: prompt.module,
      day: prompt.day,
      lesson: prompt.lesson,
      order: prompt.order,
      title: prompt.title,
      visual_type: prompt.visual_type,
      production_mode: prompt.production_mode,
      image_filename: prompt.image_filename,
      source_svg: prompt.source_svg,
      source_prompt: prompt.prompt_file,
      bundled_prompt: bundled,
      prompt_sha256: sha256(source),
      ...(prompt.hero_asset ? { hero_asset: prompt.hero_asset } : {}),
    });
  }
}

delta.sort((a, b) => {
  if (a.change_type !== b.change_type) return a.change_type === "changed" ? -1 : 1;
  return a.module.localeCompare(b.module) || a.day.localeCompare(b.day) || a.course.localeCompare(b.course) || a.order - b.order;
});

const changed = delta.filter((item) => item.change_type === "changed");
const added = delta.filter((item) => item.change_type === "new");
if (changed.length !== 2 || added.length !== 105 || delta.length !== 107) {
  throw new Error(`Delta count mismatch: changed=${changed.length}, new=${added.length}, total=${delta.length}`);
}

const readme = [
  "# 현재 교안 기준 이미지 프롬프트 델타 패키지",
  "",
  "> 기준일: 2026-08-09  ",
  "> 범위: 변경 2개 + 신규 105개 = 107개  ",
  "> 실제 이미지 생성: 수행하지 않음",
  "",
  "## 폴더 구성",
  "",
  "```text",
  `${PACKAGE_NAME}/`,
  "├─ changed/                 # 현재 교안 내용 변경으로 재작성한 2개",
  "├─ new/                     # 선택·심화·예비 슬라이드 신규 105개",
  "├─ ALL_107_PROMPTS.md        # 107개 전문 합본",
  "├─ PROMPT_DELTA_INDEX.md     # 모듈·과정별 목록",
  "└─ prompt-delta-manifest.json",
  "```",
  "",
  "## 변경 프롬프트 2개",
  "",
  ...changed.map((item) => `- \`${item.id}\` — ${cleanTitle(item.title)}`),
  "",
  "## 신규 프롬프트 105개",
  "",
  "승인 후 추가된 선택·심화·예비 슬라이드와 M06~M09 하이브리드 슬라이드입니다. 각 문서는 현재 승인 SVG의 실제 화면 문구, 16:9 규격, 과정별 색상, 한글 오류 시 하이브리드 조합 방식을 포함합니다.",
  "",
  "## 사용 순서",
  "",
  "1. `PROMPT_DELTA_INDEX.md`에서 필요한 모듈과 슬라이드를 찾습니다.",
  "2. 개별 프롬프트를 사용할 때는 `changed/` 또는 `new/` 아래의 문서를 엽니다.",
  "3. 한 파일로 검토할 때는 `ALL_107_PROMPTS.md`를 사용합니다.",
  "4. 실제 이미지 생성은 모듈별 실행 범위 승인 후 진행합니다.",
  "",
];
write("README.md", readme.join("\n"));

const index = [
  "# 변경 2장 + 신규 105장 이미지 프롬프트 인덱스",
  "",
  "> 현재 승인 교안 기준 · 총 107개",
  "",
  "## 변경 2개",
  "",
  "| 모듈 | 과정 | 일자 | 슬라이드 ID | 제목 | 프롬프트 |",
  "|---|---|---|---|---|---|",
  ...changed.map((item) => `| ${item.module} | ${item.course} | ${item.day} | \`${item.id}\` | ${item.title.replaceAll("|", "／")} | [열기](./${item.bundled_prompt}) |`),
];

for (const module of MODULES) {
  const moduleItems = added.filter((item) => item.module === module);
  index.push("", `## 신규 ${module} — ${moduleItems.length}개`);
  for (const course of COURSES) {
    const courseItems = moduleItems.filter((item) => item.course === course);
    if (!courseItems.length) continue;
    index.push("", `### ${course} — ${courseItems.length}개`, "", "| 일자 | 순서 | 슬라이드 ID | 제목 | 제작 방식 | 프롬프트 |", "|---|---:|---|---|---|---|");
    for (const item of courseItems) {
      index.push(`| ${item.day} | ${item.order} | \`${item.id}\` | ${item.title.replaceAll("|", "／")} | \`${item.production_mode}\` | [열기](./${item.bundled_prompt}) |`);
    }
  }
}
write("PROMPT_DELTA_INDEX.md", index.join("\n"));

const combined = [
  "# 현재 교안 델타 이미지 프롬프트 107개 합본",
  "",
  "> 변경 2개와 신규 105개의 원문을 검토하기 위한 합본입니다. 실제 이미지 생성은 수행하지 않았습니다.",
];
for (const item of delta) {
  const prompt = fs.readFileSync(path.join(PACKAGE_ROOT, item.bundled_prompt), "utf8").trim();
  combined.push("", "---", "", `<!-- ${item.change_type.toUpperCase()}:${item.id} -->`, "", prompt);
}
write("ALL_107_PROMPTS.md", combined.join("\n"));

const sourceManifestPath = path.join(ROOT, "data", "slide-manifest.json");
const packageManifest = {
  schema_version: "1.0",
  package: PACKAGE_NAME,
  created_at: "2026-08-09",
  source_manifest: "data/slide-manifest.json",
  source_manifest_sha256: sha256(sourceManifestPath),
  actual_image_generation_executed: false,
  counts: { changed: changed.length, new: added.length, total: delta.length },
  counts_by_module: Object.fromEntries(MODULES.map((module) => [module, delta.filter((item) => item.module === module).length])),
  prompts: delta,
};
write("prompt-delta-manifest.json", JSON.stringify(packageManifest, null, 2));

const bundledPromptFiles = delta.map((item) => path.join(PACKAGE_ROOT, item.bundled_prompt));
const failures = [];
for (const item of delta) {
  const target = path.join(PACKAGE_ROOT, item.bundled_prompt);
  if (!fs.existsSync(target)) failures.push(`missing ${item.bundled_prompt}`);
  else if (sha256(target) !== item.prompt_sha256) failures.push(`hash mismatch ${item.id}`);
}
if (bundledPromptFiles.length !== 107) failures.push(`bundled prompt count ${bundledPromptFiles.length}`);
const combinedText = fs.readFileSync(path.join(PACKAGE_ROOT, "ALL_107_PROMPTS.md"), "utf8");
for (const item of delta) if (!combinedText.includes(`<!-- ${item.change_type.toUpperCase()}:${item.id} -->`)) failures.push(`combined missing ${item.id}`);
if (/(?:ablearn|에이블런|CapCut|캡컷)/i.test(combinedText)) failures.push("forbidden vendor or tool name in combined prompts");

if (failures.length) {
  console.error(`Prompt delta packaging failed (${failures.length})`);
  for (const failure of failures) console.error(`- ${failure}`);
  process.exitCode = 1;
} else {
  console.log(JSON.stringify({ packageRoot: relative(PACKAGE_ROOT), changed: changed.length, new: added.length, total: delta.length, combinedBytes: Buffer.byteLength(combinedText), validation: "passed", imagesGenerated: false }, null, 2));
}
