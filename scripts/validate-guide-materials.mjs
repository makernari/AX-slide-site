import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const ROLES = ["backoffice", "marketing"];
const DAYS = [
  "M05-D01",
  "M05-D02",
  "M05-D03",
  "M05-D04",
  "M06-D01",
  "M06-D02",
  "M06-D03",
  "M07-D01",
  "M07-D02",
  "M07-D03",
  "M08-D01",
  "M08-D02",
  "M08-D03",
  "M08-D04",
  "M09-D01",
];
const TEXT_EXTENSIONS = new Set([".csv", ".html", ".js", ".json", ".md", ".mjs", ".svg"]);
const RAW_PREFIX = "https://raw.githubusercontent.com/makernari/AX-slide-site/main/";
const DEPLOYED_RESOURCE_EXTENSIONS = new Set([".csv", ".gs", ".html", ".md", ".pdf", ".png", ".txt"]);

const failures = [];
const counts = {
  guideDocuments: 0,
  imageReferences: 0,
  guideImages: 0,
  htmlExamples: 0,
  directResourceLinks: 0,
  resourceReadmes: 0,
  referenceSources: 0,
};

function fail(message) {
  failures.push(message);
}

function assert(condition, message) {
  if (!condition) fail(message);
}

function resolveInside(relativePath) {
  const absolute = path.resolve(ROOT, relativePath);
  if (absolute !== ROOT && !absolute.startsWith(`${ROOT}${path.sep}`)) {
    throw new Error(`Path escapes workspace: ${relativePath}`);
  }
  return absolute;
}

function read(relativePath) {
  const absolute = resolveInside(relativePath);
  if (!fs.existsSync(absolute)) {
    fail(`Missing file: ${relativePath}`);
    return "";
  }
  return fs.readFileSync(absolute, "utf8");
}

function occurrences(text, token) {
  return text.split(token).length - 1;
}

function requireMarker(text, marker, relativePath) {
  for (const edge of ["START", "END"]) {
    const token = `<!-- ${marker}:${edge} -->`;
    assert(occurrences(text, token) === 1, `${relativePath}: expected one ${token}`);
  }
}

function rejectMarker(text, marker, relativePath) {
  assert(!text.includes(`<!-- ${marker}:`), `${relativePath}: unexpected ${marker} block`);
}

function walk(relativeRoot) {
  const absoluteRoot = resolveInside(relativeRoot);
  if (!fs.existsSync(absoluteRoot)) return [];
  const files = [];
  const visit = (absolute, relative) => {
    for (const entry of fs.readdirSync(absolute, { withFileTypes: true })) {
      const childAbsolute = path.join(absolute, entry.name);
      const childRelative = path.join(relative, entry.name);
      if (entry.isDirectory()) visit(childAbsolute, childRelative);
      else if (entry.isFile()) files.push(childRelative.split(path.sep).join("/"));
      else fail(`Unsupported filesystem entry: ${childRelative}`);
    }
  };
  visit(absoluteRoot, relativeRoot);
  return files.sort();
}

function validateGuideDocument(role, day, kind) {
  const relativePath = `guides/notion/${role}/${kind}/${day}.md`;
  const text = read(relativePath);
  if (!text) return;
  counts.guideDocuments += 1;

  assert(text.startsWith(`# [${day}]`), `${relativePath}: day heading mismatch`);
  assert(
    text.includes(kind === "learner" ? "문서 구분: 수강생용" : "문서 구분: 강사용"),
    `${relativePath}: document audience mismatch`,
  );
  const expectedCourse = role === "backoffice"
    ? "AI 활용 스마트 경영지원 전문강사 양성과정"
    : "AI 활용 마케팅·SNS 콘텐츠 기획·브랜딩 전문강사 양성과정";
  const oppositeCourse = role === "backoffice"
    ? "AI 활용 마케팅·SNS 콘텐츠 기획·브랜딩 전문강사 양성과정"
    : "AI 활용 스마트 경영지원 전문강사 양성과정";
  assert(text.includes(`과정: ${expectedCourse}`), `${relativePath}: course role mismatch`);
  assert(!text.includes(`과정: ${oppositeCourse}`), `${relativePath}: opposite course title leaked into document`);

  if (kind === "learner") {
    requireMarker(text, "LEARNER-ESSENTIAL-GUIDE-20260809", relativePath);
    requireMarker(text, "LEARNER-PUBLIC-DASHBOARD-20260809", relativePath);
    for (const marker of [
      "LEARNER-CLASS-PREVIEW-20260808",
      "DAILY-AI-WARMUP-20260808",
      "GOOGLE-AI-DETAILED-PRACTICE-20260808",
      "M06-IMAGE-VIDEO-PIPELINE-20260808",
      "M06-VREW-FINISH-20260808",
      "LEARNER-NOTION-PRECLASS-20260808",
      "LEARNER-REFERENCE-RELEASE-20260808",
      "INSTRUCTOR-BEGINNER-RUNBOOK-20260808",
      "INSTRUCTOR-REFERENCE-MATERIALS-20260808",
      "INSTRUCTOR-DAY-OF-TOOL-CHECK-20260809",
      "INSTRUCTOR-ONE-PAGE-20260809",
      "INSTRUCTOR-PUBLIC-DASHBOARD-20260809",
    ]) rejectMarker(text, marker, relativePath);

    const h2 = [...text.matchAll(/^##\s+(.+)$/gm)].map((match) => match[1]);
    assert(h2.length === 12, `${relativePath}: expected 12 learner sections, found ${h2.length}`);
    assert(text.split(/\r?\n/).length <= 650, `${relativePath}: learner guide is not concise enough`);
    assert(text.includes("수업 중 반드시 수행할 내용만 담습니다"), `${relativePath}: learner essential-only policy missing`);
    assert(text.includes("공개 학습 대시보드"), `${relativePath}: learner dashboard routine missing`);
  } else {
    requireMarker(text, `${day.slice(0, 3)}-20260808-REFRESH`, relativePath);
    requireMarker(text, "INSTRUCTOR-BEGINNER-RUNBOOK-20260808", relativePath);
    requireMarker(text, "INSTRUCTOR-DAILY-AI-WARMUP-20260808", relativePath);
    requireMarker(text, "INSTRUCTOR-REFERENCE-MATERIALS-20260808", relativePath);
    requireMarker(text, "INSTRUCTOR-DAY-OF-TOOL-CHECK-20260809", relativePath);
    requireMarker(text, "INSTRUCTOR-ONE-PAGE-20260809", relativePath);
    requireMarker(text, "INSTRUCTOR-PUBLIC-DASHBOARD-20260809", relativePath);
    for (const marker of [
      "LEARNER-ESSENTIAL-GUIDE-20260809",
      "LEARNER-PUBLIC-DASHBOARD-20260809",
      "LEARNER-CLASS-PREVIEW-20260808",
      "LEARNER-NOTION-PRECLASS-20260808",
      "LEARNER-REFERENCE-RELEASE-20260808",
    ]) rejectMarker(text, marker, relativePath);

    const detailedPractice = day.startsWith("M05-") || day === "M06-D01";
    if (detailedPractice) requireMarker(text, "INSTRUCTOR-GOOGLE-AI-DETAILED-PRACTICE-20260808", relativePath);
    else rejectMarker(text, "INSTRUCTOR-GOOGLE-AI-DETAILED-PRACTICE-20260808", relativePath);
    if (day === "M06-D01") requireMarker(text, "INSTRUCTOR-M06-IMAGE-VIDEO-PIPELINE-20260808", relativePath);
    else rejectMarker(text, "INSTRUCTOR-M06-IMAGE-VIDEO-PIPELINE-20260808", relativePath);
    if (day === "M06-D02") requireMarker(text, "INSTRUCTOR-M06-VREW-FINISH-20260808", relativePath);
    else rejectMarker(text, "INSTRUCTOR-M06-VREW-FINISH-20260808", relativePath);

    assert(text.includes("초보 강사를 위한"), `${relativePath}: beginner instructor runbook missing`);
    assert(text.includes("수업 당일 도구 상태 점검표"), `${relativePath}: day-of tool checklist missing`);
    assert(text.includes("오늘의 강사 원페이지"), `${relativePath}: instructor one-page missing`);
    assert(text.includes("공개 학습 대시보드"), `${relativePath}: instructor dashboard routine missing`);
  }

  assert(!/(?:ablearn|에이블런)/i.test(text), `${relativePath}: previous vendor name leaked into guide`);
  assert(!/(?:CapCut|캡컷)/i.test(text), `${relativePath}: CapCut is not allowed; use Vrew only`);
  requireMarker(text, "GUIDE-PAGES-RESOURCES-20260810", relativePath);
  assert(
    text.includes(`https://makernari.github.io/AX-slide-site/#/resources/${role}`),
    `${relativePath}: course resource screen link is missing`,
  );

  if (day === "M05-D01") {
    for (const phrase of ["비공개 작업실", "자기소개", "30초", "로그아웃", "Text & Markdown"]) {
      assert(text.includes(phrase), `${relativePath}: first-day Notion practice is missing ${phrase}`);
    }
  }

  for (const match of text.matchAll(/!\[[^\]]*\]\((https:\/\/raw\.githubusercontent\.com\/makernari\/AX-slide-site\/main\/[^)]+)\)/g)) {
    counts.imageReferences += 1;
    const localPath = decodeURI(match[1].slice(RAW_PREFIX.length));
    assert(fs.existsSync(resolveInside(localPath)), `${relativePath}: missing linked image ${localPath}`);
  }
}

function validateReadme(role, day) {
  const relativePath = `downloads/guide-resources/${role}/${day}/README.md`;
  const text = read(relativePath);
  if (!text) return;
  counts.resourceReadmes += 1;
  for (const marker of ["INSTRUCTOR-HTML-EXAMPLE-20260808", "DAILY-AI-WARMUP-HTML-20260808"]) {
    requireMarker(text, marker, relativePath);
  }
  const detailed = day.startsWith("M05-") || day === "M06-D01";
  if (detailed) requireMarker(text, "GOOGLE-AI-DETAILED-PRACTICE-HTML-20260808", relativePath);
  else rejectMarker(text, "GOOGLE-AI-DETAILED-PRACTICE-HTML-20260808", relativePath);
  const mediaPipeline = day === "M06-D01" || day === "M06-D02";
  if (mediaPipeline) requireMarker(text, "M06-MEDIA-PIPELINE-20260808", relativePath);
  else rejectMarker(text, "M06-MEDIA-PIPELINE-20260808", relativePath);
  const referenceOperations = day === "M05-D01" || day === "M09-D01";
  if (referenceOperations) requireMarker(text, "REFERENCE-GUIDE-OPERATIONS-20260808", relativePath);
  else rejectMarker(text, "REFERENCE-GUIDE-OPERATIONS-20260808", relativePath);
}

function pngDimensions(buffer) {
  const signature = "89504e470d0a1a0a";
  if (buffer.length < 24 || buffer.subarray(0, 8).toString("hex") !== signature) return null;
  return { width: buffer.readUInt32BE(16), height: buffer.readUInt32BE(20) };
}

function validateGuideImages() {
  const imageFiles = walk("assets/guide-images").filter((file) => /\.(?:png|svg)$/i.test(file));
  for (const relativePath of imageFiles) {
    counts.guideImages += 1;
    const absolute = resolveInside(relativePath);
    if (relativePath.endsWith(".png")) {
      const dimensions = pngDimensions(fs.readFileSync(absolute));
      assert(dimensions !== null, `${relativePath}: invalid PNG signature`);
      if (dimensions) {
        assert(dimensions.width === 1600 && dimensions.height === 900, `${relativePath}: expected 1600x900, found ${dimensions.width}x${dimensions.height}`);
      }
    } else {
      const svg = fs.readFileSync(absolute, "utf8");
      assert(/<svg\b[^>]*\bviewBox=["']0 0 1600 900["']/i.test(svg), `${relativePath}: expected SVG viewBox 0 0 1600 900`);
      assert(!/<script\b/i.test(svg), `${relativePath}: script is not allowed in guide SVG`);
    }
  }
  assert(imageFiles.length === 163, `Expected 163 guide images, found ${imageFiles.length}`);
}

function validateHtmlExamples() {
  const htmlFiles = walk("downloads/guide-resources").filter((file) => file.endsWith(".html"));
  for (const relativePath of htmlFiles) {
    counts.htmlExamples += 1;
    const html = read(relativePath);
    assert(!/<(?:script|link)\b[^>]*(?:src|href)=["']https?:\/\//i.test(html), `${relativePath}: external runtime dependency is not allowed`);
    assert(!/<a\b[^>]*href=["']https?:\/\//i.test(html), `${relativePath}: external link is not allowed`);
  }
  assert(htmlFiles.length === 82, `Expected 82 guide HTML examples, found ${htmlFiles.length}`);
}

function validatePublishedResourceLinks() {
  const activeMarkdown = [
    ...walk("guides/notion"),
    ...walk("downloads/guide-resources/backoffice"),
    ...walk("downloads/guide-resources/marketing"),
  ].filter((file) => file.endsWith(".md"));

  for (const relativePath of activeMarkdown) {
    const text = read(relativePath);
    assert(!text.includes("browser-examples-"), `${relativePath}: legacy browser ZIP link remains`);
    assert(!text.includes("START_HERE.html"), `${relativePath}: legacy ZIP launcher instruction remains`);
    assert(
      !text.includes("https://raw.githubusercontent.com/makernari/AX-slide-site/main/downloads/guide-resources/"),
      `${relativePath}: raw guide resource link remains`,
    );

    for (const match of text.matchAll(/https:\/\/makernari\.github\.io\/AX-slide-site\/downloads\/guide-resources\/([^)\s]+)/g)) {
      const localPath = `downloads/guide-resources/${decodeURI(match[1])}`;
      const extension = path.extname(localPath).toLowerCase();
      counts.directResourceLinks += 1;
      assert(fs.existsSync(resolveInside(localPath)), `${relativePath}: missing published resource ${localPath}`);
      assert(DEPLOYED_RESOURCE_EXTENSIONS.has(extension), `${relativePath}: resource type is not deployed ${localPath}`);
      assert(!localPath.includes("/reference-guides/"), `${relativePath}: instructor reference resource must not be published`);
    }
  }

  assert(counts.directResourceLinks >= 800, `Expected at least 800 direct resource links, found ${counts.directResourceLinks}`);
}

function validateTextIntegrity() {
  const roots = ["assets/guide-images", "downloads/guide-resources", "guides/notion", "scripts"];
  const secretPatterns = [
    /\bsk-[A-Za-z0-9_-]{20,}\b/,
    /\bAIza[A-Za-z0-9_-]{20,}\b/,
    /-----BEGIN (?:RSA |EC |OPENSSH )?PRIVATE KEY-----/,
  ];
  for (const relativePath of roots.flatMap(walk)) {
    if (!TEXT_EXTENSIONS.has(path.extname(relativePath).toLowerCase())) continue;
    const text = read(relativePath);
    assert(!text.includes("\uFFFD"), `${relativePath}: Unicode replacement character found`);
    if (relativePath.endsWith(".md")) {
      assert(!/https:\/\/raw\.githubusercontent\.com\/makernari\/AX-slide-site\/main\/downloads\/guide-resources\/(?:backoffice|marketing)\/M\d\d-D\d\d\/[^)\s]+\.html/i.test(text), `${relativePath}: raw HTML link would open as source text`);
      assert(!/https:\/\/raw\.githubusercontent\.com\/makernari\/AX-slide-site\/main\/downloads\/guide-resources\//i.test(text), `${relativePath}: raw resource link should use GitHub Pages`);
    }
    for (const pattern of secretPatterns) {
      assert(!pattern.test(text), `${relativePath}: possible credential found`);
    }
  }
}

function validateReferenceOperations() {
  const sourceFiles = walk("references/guide").filter((file) => /\.(?:pdf|docx)$/i.test(file));
  counts.referenceSources = sourceFiles.length;
  assert(sourceFiles.length === 3, `Expected three instructor reference sources, found ${sourceFiles.length}`);

  const mapPath = "downloads/guide-resources/reference-guides/15-day-reference-page-map.csv";
  const rows = read(mapPath).trim().split(/\r?\n/);
  assert(rows.length === 16, `${mapPath}: expected header plus 15 rows, found ${rows.length}`);
  assert(rows[0] === "day_id,notion_pages,google_ai_pdf_pages,workbook_section,use_timing,instructor_action", `${mapPath}: header mismatch`);
  const actualDays = rows.slice(1).map((row, index) => {
    const columns = row.split(",");
    assert(columns.length === 6, `${mapPath}:${index + 2}: expected 6 columns, found ${columns.length}`);
    return columns[0];
  });
  assert(JSON.stringify(actualDays) === JSON.stringify(DAYS), `${mapPath}: day order or coverage mismatch`);

  for (const relativePath of [
    "downloads/guide-resources/reference-guides/reference-materials-dashboard.html",
    "downloads/guide-resources/reference-guides/instructor-reference-use-plan-2026-08-08.md",
    "downloads/guide-resources/reference-guides/course-end-distribution-checklist.md",
    "downloads/guide-resources/common/M05-D01/markdown-to-notion-learner-guide-20260808.html",
    "downloads/guide-resources/common/M05-D01/markdown-to-notion-learner-guide-20260808.pdf",
    "assets/guide-images/common/M05-D01/notion-preclass-system-20260808.svg",
    "assets/guide-images/common/M05-D01/notion-preclass-system-gpt-image-2-20260808.png",
    "assets/guide-images/common/M09-D01/reference-release-timeline-20260808.svg",
    "assets/guide-images/common/M09-D01/reference-release-timeline-gpt-image-2-20260808.png",
    "downloads/guide-resources/common/example-media/fictional-cafe-product-photo.png",
    "downloads/guide-resources/common/example-media/fictional-office-safety-photo.png",
    "downloads/guide-resources/common/example-media/fictional-coral-speaker-photo.png",
    "downloads/guide-resources/common/example-media/fictional-coral-speaker-ms-paint.png",
    "downloads/guide-resources/common/example-media/fictional-character-three-scenes.png",
    "downloads/guide-resources/common/example-media/fictional-training-facilitator-sheet.png",
    "downloads/guide-resources/common/example-media/ai-workbench-reflection.png",
    "downloads/guide-resources/common/example-media/brand-collaboration-collage.png",
  ]) {
    assert(fs.existsSync(resolveInside(relativePath)), `Missing reference operation artifact: ${relativePath}`);
  }

  const checklist = read("downloads/guide-resources/reference-guides/course-end-distribution-checklist.md");
  for (const sourcePath of sourceFiles) {
    const filename = path.basename(sourcePath);
    assert(checklist.includes(filename), `Distribution checklist is missing ${filename}`);
  }
}

function main() {
  for (const role of ROLES) {
    for (const day of DAYS) {
      validateGuideDocument(role, day, "learner");
      validateGuideDocument(role, day, "instructor");
      validateReadme(role, day);
    }
  }
  validateGuideImages();
  validateHtmlExamples();
  validatePublishedResourceLinks();
  validateTextIntegrity();
  validateReferenceOperations();

  assert(counts.guideDocuments === 60, `Expected 60 guide documents, found ${counts.guideDocuments}`);
  assert(counts.resourceReadmes === 30, `Expected 30 resource READMEs, found ${counts.resourceReadmes}`);

  if (failures.length) {
    console.error(`Guide material validation failed (${failures.length})`);
    for (const message of failures) console.error(`- ${message}`);
    process.exitCode = 1;
    return;
  }

  console.log("Guide material validation passed");
  for (const [label, value] of Object.entries(counts)) console.log(`- ${label}: ${value}`);
  console.log("- curriculum coverage: 15 days x 2 courses x learner/instructor");
  console.log("- reference operations: preclass setup, daily excerpts, M09 release gate");
  console.log("- credential scan: passed");
}

main();
