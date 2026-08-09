import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const PAGES_ROOT = "https://makernari.github.io/AX-slide-site";
const RAW_RESOURCE_ROOT =
  "https://raw.githubusercontent.com/makernari/AX-slide-site/main/downloads/guide-resources/";
const PAGES_RESOURCE_ROOT = `${PAGES_ROOT}/downloads/guide-resources/`;
const ACTIVE_ROOTS = [
  path.join(ROOT, "guides", "notion"),
  path.join(ROOT, "downloads", "guide-resources", "backoffice"),
  path.join(ROOT, "downloads", "guide-resources", "marketing"),
];

const LEGACY_ZIP_LINK = /\[([^\]]+)\]\(https:\/\/(?:raw\.githubusercontent\.com\/makernari\/AX-slide-site\/main|makernari\.github\.io\/AX-slide-site)\/downloads\/guide-resources\/(backoffice|marketing)\/(M\d\d-D\d\d)\/browser-examples-[^)]+\.zip\)/g;

function walkMarkdown(directory) {
  const files = [];
  for (const entry of fs.readdirSync(directory, { withFileTypes: true })) {
    const absolute = path.join(directory, entry.name);
    if (entry.isDirectory()) files.push(...walkMarkdown(absolute));
    else if (entry.isFile() && entry.name.toLowerCase().endsWith(".md")) files.push(absolute);
  }
  return files;
}

function htmlFiles(roleKey, dayId, folder) {
  const directory = path.join(
    ROOT,
    "downloads",
    "guide-resources",
    roleKey,
    dayId,
    folder,
  );
  if (!fs.existsSync(directory)) return [];
  return fs
    .readdirSync(directory)
    .filter((name) => name.toLowerCase().endsWith(".html"))
    .sort()
    .map((name) => `${folder}/${name}`);
}

function findNamed(files, pattern) {
  return files.find((file) => pattern.test(file)) ?? null;
}

function resourceTarget(roleKey, dayId, label, marker) {
  const solutions = htmlFiles(roleKey, dayId, "solutions");
  const warmups = htmlFiles(roleKey, dayId, "warmups");
  const supplements = htmlFiles(roleKey, dayId, "supplements");
  const examples = htmlFiles(roleKey, dayId, "examples");
  const starters = htmlFiles(roleKey, dayId, "starter");
  const normalizedLabel = label.trim();

  if (/전체 코드|별도 코드/.test(normalizedLabel)) {
    return starters[0] ?? solutions[0];
  }
  if (/캐릭터 시트/.test(normalizedLabel)) {
    return findNamed(examples, /character-sheet/i) ?? examples[0] ?? solutions[0];
  }
  if (/Vrew|타임라인/.test(normalizedLabel)) {
    return findNamed(examples, /vrew|timeline/i) ?? examples[0] ?? solutions[0];
  }
  if (/파이프라인/.test(normalizedLabel)) {
    return findNamed(examples, /pipeline/i) ?? examples[0] ?? solutions[0];
  }
  if (/DAILY-AI-WARMUP/.test(marker)) {
    return warmups[0] ?? solutions[0];
  }
  if (/GOOGLE-AI-DETAILED-PRACTICE/.test(marker)) {
    return supplements[0] ?? solutions[0];
  }
  if (/IMAGE-VIDEO|VREW/.test(marker)) {
    return (
      findNamed(examples, dayId === "M06-D02" ? /vrew|timeline/i : /pipeline/i) ??
      examples[0] ??
      solutions[0]
    );
  }
  if (/브라우저 결과 구조/.test(normalizedLabel)) {
    return supplements[0] ?? solutions[0];
  }
  if (/브라우저 결과 예시/.test(normalizedLabel)) {
    return (
      findNamed(examples, dayId === "M06-D02" ? /vrew|timeline/i : /pipeline/i) ??
      examples[0] ??
      solutions[0]
    );
  }
  if (/완성 예시|브라우저 예시 ZIP/.test(normalizedLabel)) {
    return solutions[0] ?? warmups[0];
  }
  return warmups[0] ?? solutions[0];
}

function linkLabel(original, target) {
  if (/\/solutions\//.test(`/${target}`)) return "완성 예시 바로 보기";
  if (/\/supplements\//.test(`/${target}`)) return "브라우저 결과 구조 바로 보기";
  if (original === "브라우저 예시 ZIP 내려받기") return "브라우저 예시 바로 보기";
  return original;
}

function pagesUrl(roleKey, dayId, relativePath) {
  if (!relativePath) {
    throw new Error(`No direct HTML target for ${roleKey}/${dayId}`);
  }
  const absolute = path.join(
    ROOT,
    "downloads",
    "guide-resources",
    roleKey,
    dayId,
    ...relativePath.split("/"),
  );
  if (!fs.existsSync(absolute)) {
    throw new Error(`Direct HTML target is missing: ${absolute}`);
  }
  return `${PAGES_RESOURCE_ROOT}${roleKey}/${dayId}/${relativePath}`;
}

function guideRole(file) {
  const normalized = file.split(path.sep).join("/");
  return normalized.match(/\/guides\/notion\/(backoffice|marketing)\/(?:learner|instructor)\//)?.[1] ?? null;
}

function resourceNotice(roleKey) {
  const label = roleKey === "backoffice" ? "경영지원" : "마케팅";
  return [
    "<!-- GUIDE-PAGES-RESOURCES-20260810:START -->",
    `> 자료 화면: [${label} 실습 자료](${PAGES_ROOT}/#/resources/${roleKey}). HTML 예시는 새 탭에서 바로 확인하고 파일별로 내려받을 수 있습니다.`,
    "<!-- GUIDE-PAGES-RESOURCES-20260810:END -->",
  ].join("\n");
}

function updateMarkdown(file) {
  const original = fs.readFileSync(file, "utf8");
  let marker = "";
  let zipLinks = 0;
  let next = original
    .split(/\r?\n/)
    .map((line) => {
      const start = line.match(/<!-- ([A-Z0-9-]+):START -->/);
      if (start) marker = start[1];
      const replaced = line.replace(
        LEGACY_ZIP_LINK,
        (match, label, roleKey, dayId) => {
          const target = resourceTarget(roleKey, dayId, label, marker);
          zipLinks += 1;
          return `[${linkLabel(label, target)}](${pagesUrl(roleKey, dayId, target)})`;
        },
      );
      if (/<!-- [A-Z0-9-]+:END -->/.test(line)) marker = "";
      return replaced;
    })
    .join("\n");

  next = next.replaceAll(RAW_RESOURCE_ROOT, PAGES_RESOURCE_ROOT);
  next = next
    .replaceAll(
      "> 브라우저 예시는 ZIP 다운로드 전용입니다. 압축을 푼 뒤 `START_HERE.html`을 더블클릭하세요. GitHub 원본 링크를 탭에서 바로 열면 HTML 소스가 텍스트로 보일 수 있습니다.",
      "> 브라우저 예시는 Pages 배포 링크에서 바로 열 수 있습니다. 필요한 HTML은 새 탭에서 확인하거나 개별 파일로 내려받으세요.",
    )
    .replaceAll(
      "ZIP을 내려받아 압축을 푼 뒤 `START_HERE.html`을 더블클릭하면 설치 없이 브라우저에서 열립니다.",
      "링크를 열면 설치 없이 브라우저에서 바로 확인할 수 있으며, 필요하면 HTML 파일을 개별 다운로드할 수 있습니다.",
    )
    .replaceAll(
      "ZIP을 내려받아 배포 링크를 선택하면 브라우저에서 열립니다.",
      "배포 링크를 선택하면 브라우저에서 바로 열립니다.",
    )
    .replaceAll("브라우저 예시 ZIP 내려받기", "브라우저 예시 바로 보기")
    .replaceAll("ZIP 다운로드 전용", "Pages 직접 열기")
    .replaceAll("ZIP 전체를 먼저 압축 해제한 뒤", "배포 링크에서")
    .replaceAll("압축을 푼 뒤 `START_HERE.html`을 더블클릭", "배포 링크를 선택");

  const roleKey = guideRole(file);
  if (roleKey) {
    const notice = resourceNotice(roleKey);
    const oldNotice = /<!-- OFFLINE-BROWSER-EXAMPLE-20260809:START -->[\s\S]*?<!-- OFFLINE-BROWSER-EXAMPLE-20260809:END -->/;
    const currentNotice = /<!-- GUIDE-PAGES-RESOURCES-20260810:START -->[\s\S]*?<!-- GUIDE-PAGES-RESOURCES-20260810:END -->/;
    if (oldNotice.test(next)) next = next.replace(oldNotice, notice);
    else if (currentNotice.test(next)) next = next.replace(currentNotice, notice);
    else {
      const heading = next.match(/^# .+$/m)?.[0];
      if (heading) next = next.replace(heading, `${heading}\n\n${notice}`);
    }
  }

  if (/browser-examples-[^)\s]+\.zip/.test(next)) {
    throw new Error(`Legacy browser ZIP link remains: ${file}`);
  }
  if (next !== original) fs.writeFileSync(file, `${next.trimEnd()}\n`, "utf8");
  return { changed: next !== original, zipLinks };
}

const files = ACTIVE_ROOTS.flatMap(walkMarkdown).sort();
let changedFiles = 0;
let rewrittenZipLinks = 0;
for (const file of files) {
  const result = updateMarkdown(file);
  if (result.changed) changedFiles += 1;
  rewrittenZipLinks += result.zipLinks;
}

console.log(
  JSON.stringify(
    {
      scannedMarkdownFiles: files.length,
      changedFiles,
      rewrittenZipLinks,
      pagesRoot: PAGES_ROOT,
    },
    null,
    2,
  ),
);
