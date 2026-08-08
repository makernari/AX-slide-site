import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const AS_OF = "2026-08-08";
const START = "<!-- LEARNER-CLASS-PREVIEW-20260808:START -->";
const END = "<!-- LEARNER-CLASS-PREVIEW-20260808:END -->";
const RAW_ROOT = "https://raw.githubusercontent.com/makernari/AX-slide-site/main";

const roles = {
  backoffice: {
    label: "경영지원",
    course: "AI 활용 스마트 경영지원 전문강사 양성과정",
    accent: "#2563EB",
    accent2: "#0F766E",
    dark: "#102A56",
    pale: "#EAF2FF",
    surface: "#F6F9FF",
  },
  marketing: {
    label: "마케팅",
    course: "AI 활용 스마트 마케팅 전문강사 양성과정",
    accent: "#EA580C",
    accent2: "#B4236B",
    dark: "#7C2D12",
    pale: "#FFF0E8",
    surface: "#FFF9F5",
  },
};

function escapeXml(value) {
  return String(value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&apos;");
}

function cleanMarkdown(value) {
  return String(value)
    .replace(/!\[([^\]]*)\]\([^)]*\)/g, "$1")
    .replace(/\[([^\]]+)\]\([^)]*\)/g, "$1")
    .replace(/[*_`]/g, "")
    .replace(/<br\s*\/?>/gi, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function wrapText(value, maxChars, maxLines) {
  const text = cleanMarkdown(value);
  const lines = [];
  let rest = text;
  while (rest && lines.length < maxLines) {
    if (rest.length <= maxChars) {
      lines.push(rest);
      rest = "";
      break;
    }
    let cut = rest.lastIndexOf(" ", maxChars);
    if (cut < Math.floor(maxChars * 0.55)) cut = maxChars;
    lines.push(rest.slice(0, cut).trim());
    rest = rest.slice(cut).trim();
  }
  if (rest && lines.length) {
    const last = lines.length - 1;
    lines[last] = `${lines[last].slice(0, Math.max(1, maxChars - 1)).trim()}…`;
  }
  return lines;
}

function tspans(lines, x, y, lineHeight, attrs = "") {
  return lines
    .map((line, index) => `<tspan x="${x}" y="${y + index * lineHeight}" ${attrs}>${escapeXml(line)}</tspan>`)
    .join("");
}

function parseGuide(markdown, filePath) {
  const titleMatch = markdown.match(/^# \[(M\d{2}-D\d{2})\]\s+(.+)$/m);
  if (!titleMatch) throw new Error(`제목을 찾을 수 없습니다: ${filePath}`);

  const dayId = titleMatch[1];
  const title = cleanMarkdown(titleMatch[2].replace(/\s+—\s+(경영지원|마케팅)\s+수강생용\s*$/, ""));
  const finalOutput = cleanMarkdown(
    markdown.match(/^>\s*오늘의 최종 결과물:\s*(.+)$/m)?.[1] ?? "차시별 결과물과 최종 완료본",
  );
  const scheduleStart = markdown.indexOf("## 4. 4시간 전체 진행 순서");
  const scheduleEnd = scheduleStart >= 0 ? markdown.indexOf("\n## 5.", scheduleStart) : -1;
  if (scheduleStart < 0 || scheduleEnd < 0) throw new Error(`4시간 전체 진행 순서 구간을 찾지 못했습니다: ${filePath}`);
  const schedule = markdown.slice(scheduleStart, scheduleEnd);
  const rows = [...schedule.matchAll(/^\|\s*([1-4]차시)\s*\|\s*([^|]+?)\s*\|\s*([^|]+?)\s*\|\s*([^|]+?)\s*\|$/gm)].map(
    (match) => ({ session: match[1], time: cleanMarkdown(match[2]), activity: cleanMarkdown(match[3]), output: cleanMarkdown(match[4]) }),
  );
  if (rows.length !== 4) throw new Error(`4개 차시를 찾지 못했습니다: ${filePath} (${rows.length}개)`);
  return { dayId, title, finalOutput, rows };
}

function infographicSvg(guide, role) {
  const cards = guide.rows.map((row, index) => {
    const x = 82 + index * 374;
    const isLast = index === guide.rows.length - 1;
    const activityLines = wrapText(row.activity, 14, 4);
    const outputLines = wrapText(row.output, 15, 2);
    const connector = isLast
      ? ""
      : `<path d="M ${x + 318} 287 H ${x + 350}" stroke="#9FB0C8" stroke-width="8" stroke-linecap="round"/><path d="M ${x + 340} 275 L ${x + 354} 287 L ${x + 340} 299" fill="none" stroke="#9FB0C8" stroke-width="8" stroke-linecap="round" stroke-linejoin="round"/>`;
    return `
      <g aria-label="${escapeXml(row.session)} ${escapeXml(row.activity)}">
        <rect x="${x}" y="246" width="318" height="390" rx="28" fill="#FFFFFF" stroke="#D8E2EF" stroke-width="3"/>
        <rect x="${x}" y="246" width="318" height="86" rx="28" fill="${index % 2 === 0 ? role.accent : role.accent2}"/>
        <rect x="${x}" y="304" width="318" height="28" fill="${index % 2 === 0 ? role.accent : role.accent2}"/>
        <circle cx="${x + 44}" cy="287" r="25" fill="#FFFFFF" fill-opacity="0.20"/>
        <text x="${x + 44}" y="296" text-anchor="middle" font-size="26" font-weight="900" fill="#FFFFFF">${index + 1}</text>
        <text x="${x + 82}" y="281" font-size="23" font-weight="850" fill="#FFFFFF">${escapeXml(row.session)}</text>
        <text x="${x + 82}" y="309" font-size="17" font-weight="700" fill="#FFFFFF" fill-opacity="0.9">${escapeXml(row.time)} · LEARN</text>
        <text font-size="20" font-weight="780" fill="#17233B">${tspans(activityLines, x + 24, 372, 28)}</text>
        <line x1="${x + 24}" y1="490" x2="${x + 294}" y2="490" stroke="#E5EBF3" stroke-width="2"/>
        <rect x="${x + 24}" y="518" width="82" height="31" rx="15" fill="${role.pale}"/>
        <text x="${x + 65}" y="540" text-anchor="middle" font-size="15" font-weight="850" fill="${role.dark}">OUTPUT</text>
        <text font-size="18" font-weight="720" fill="#43516A">${tspans(outputLines, x + 24, 578, 27)}</text>
      </g>${connector}`;
  }).join("");

  const finalLines = wrapText(guide.finalOutput, 70, 2);
  return `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" width="1600" height="900" viewBox="0 0 1600 900" role="img" aria-labelledby="title desc">
  <title id="title">${escapeXml(role.label)} ${escapeXml(guide.dayId)} 4시간 수업 진행 인포그래픽</title>
  <desc id="desc">1차시부터 4차시까지 핵심 활동과 결과물을 순서대로 보여 주는 수강생용 미리보기</desc>
  <rect width="1600" height="900" fill="${role.surface}"/>
  <circle cx="1460" cy="-10" r="230" fill="${role.pale}"/>
  <circle cx="80" cy="858" r="160" fill="${role.pale}"/>
  <rect x="54" y="42" width="1492" height="816" rx="38" fill="#FFFFFF" stroke="#D8E2EF" stroke-width="3"/>
  <rect x="54" y="42" width="1492" height="164" rx="38" fill="${role.dark}"/>
  <rect x="54" y="168" width="1492" height="38" fill="${role.dark}"/>
  <rect x="88" y="76" width="196" height="36" rx="18" fill="#FFFFFF" fill-opacity="0.16"/>
  <text x="186" y="101" text-anchor="middle" font-size="17" font-weight="850" fill="#FFFFFF">LEARNER PREVIEW</text>
  <text x="88" y="154" font-size="${guide.title.length > 34 ? 29 : 34}" font-weight="900" fill="#FFFFFF">${escapeXml(guide.dayId)} · ${escapeXml(guide.title)}</text>
  <rect x="1254" y="82" width="244" height="78" rx="24" fill="#FFFFFF"/>
  <text x="1376" y="112" text-anchor="middle" font-size="17" font-weight="800" fill="${role.dark}">${escapeXml(role.label)} 과정</text>
  <text x="1376" y="145" text-anchor="middle" font-size="25" font-weight="900" fill="${role.accent}">총 4시간 · 4차시</text>
  <text x="82" y="229" font-size="18" font-weight="750" fill="#64748B">준비 → 이해 → 직접 실행 → 검수 → 저장까지, 오늘의 결과물이 만들어지는 순서</text>
  ${cards}
  <rect x="82" y="682" width="1436" height="128" rx="26" fill="${role.pale}" stroke="${role.accent}" stroke-opacity="0.25" stroke-width="2"/>
  <rect x="108" y="706" width="176" height="36" rx="18" fill="${role.accent}"/>
  <text x="196" y="731" text-anchor="middle" font-size="17" font-weight="900" fill="#FFFFFF">FINAL CHECK</text>
  <text x="314" y="728" font-size="18" font-weight="800" fill="${role.dark}">오늘 완성할 결과</text>
  <text font-size="21" font-weight="760" fill="#26354F">${tspans(finalLines, 314, 762, 28)}</text>
  <g transform="translate(1176 712)">
    <rect width="316" height="70" rx="20" fill="#FFFFFF"/>
    <circle cx="34" cy="35" r="20" fill="${role.accent2}"/>
    <path d="M24 35 L31 42 L45 27" fill="none" stroke="#FFFFFF" stroke-width="5" stroke-linecap="round" stroke-linejoin="round"/>
    <text x="68" y="30" font-size="16" font-weight="850" fill="${role.dark}">200분 학습 + 40분 휴식·정리</text>
    <text x="68" y="52" font-size="14" font-weight="650" fill="#64748B">각 차시 결과를 저장하면 다음 단계로 이동</text>
  </g>
  <text x="1516" y="840" text-anchor="end" font-size="13" font-weight="700" fill="#7A879B">교육용 수강생 가이드 · ${AS_OF}</text>
</svg>`;
}

function previewBlock(guide, roleKey) {
  const role = roles[roleKey];
  const imagePath = `assets/guide-images/${roleKey}/${guide.dayId}/learner-class-preview-${AS_OF.replaceAll("-", "")}.svg`;
  const tableRows = guide.rows.map((row) => `| ${row.session} | ${row.time} | ${row.activity} | ${row.output} |`).join("\n");
  return [
    START,
    "",
    "### Preview · 오늘 수업 한눈에 보기",
    "",
    `![${role.label} ${guide.dayId} 4시간 수업 진행 인포그래픽](${RAW_ROOT}/${imagePath})`,
    "",
    "> 인포그래픽은 **활동이 이어지는 순서**를, 아래 표는 **시간과 차시별 결과물**을 보여 줍니다. 각 차시가 끝날 때 결과물을 저장하면 다음 단계로 이동합니다.",
    "",
    "| 순서 | 시간 | 핵심 활동 | 그때 완성하는 것 |",
    "| --- | ---: | --- | --- |",
    tableRows,
    "| 휴식·마무리 | 40분 | 차시 사이 저장·권한 확인 30분 + 최종 점검 10분 | 누락 없는 완료본 |",
    "",
    `- **총 수업 시간:** 240분 = 학습 200분 + 휴식·최종 정리 40분`,
    `- **오늘의 최종 결과:** ${guide.finalOutput}`,
    "- **따라가는 방법:** 현재 차시의 결과물을 저장한 뒤 다음 차시로 넘어갑니다. 도구 사용이 막히면 같은 결과물을 만드는 문서형 대체 실습을 사용합니다.",
    "",
    END,
  ].join("\n");
}

function replaceOrInsert(markdown, block) {
  const startIndex = markdown.indexOf(START);
  const endIndex = markdown.indexOf(END);
  if (startIndex >= 0 && endIndex >= startIndex) {
    return `${markdown.slice(0, startIndex)}${block}${markdown.slice(endIndex + END.length)}`;
  }

  const sectionOne = markdown.indexOf("## 1. 오늘 무엇을 하게 되나요?");
  if (sectionOne < 0) throw new Error("1번 섹션을 찾을 수 없습니다.");
  const firstEnhancement = markdown.indexOf("<!--", sectionOne);
  const sectionTwo = markdown.indexOf("\n## 2.", sectionOne);
  const insertAt = firstEnhancement >= 0 && (sectionTwo < 0 || firstEnhancement < sectionTwo) ? firstEnhancement : sectionTwo;
  if (insertAt < 0) throw new Error("Preview 삽입 위치를 찾을 수 없습니다.");
  return `${markdown.slice(0, insertAt).trimEnd()}\n\n${block}\n\n${markdown.slice(insertAt).trimStart()}`;
}

const written = [];
for (const [roleKey, role] of Object.entries(roles)) {
  const guideDir = path.join(ROOT, "guides", "notion", roleKey, "learner");
  const files = fs.readdirSync(guideDir).filter((name) => /^M\d{2}-D\d{2}\.md$/.test(name)).sort();
  for (const fileName of files) {
    const guidePath = path.join(guideDir, fileName);
    const markdown = fs.readFileSync(guidePath, "utf8");
    const guide = parseGuide(markdown, guidePath);
    const imageDir = path.join(ROOT, "assets", "guide-images", roleKey, guide.dayId);
    fs.mkdirSync(imageDir, { recursive: true });
    const imagePath = path.join(imageDir, `learner-class-preview-${AS_OF.replaceAll("-", "")}.svg`);
    fs.writeFileSync(imagePath, infographicSvg(guide, role), "utf8");
    fs.writeFileSync(guidePath, `${replaceOrInsert(markdown, previewBlock(guide, roleKey)).trimEnd()}\n`, "utf8");
    written.push({ role: role.label, dayId: guide.dayId, guidePath, imagePath });
  }
}

const auditPath = path.join(ROOT, "downloads", "guide-resources", `learner-class-preview-audit-${AS_OF}.md`);
const audit = [
  "# 수강생용 가이드 Preview 반영 감사표",
  "",
  `- 기준일: ${AS_OF}`,
  `- 대상 문서: ${written.length}개`,
  `- 16:9 인포그래픽: ${written.length}개`,
  `- 요약표: ${written.length}개`,
  "- 구성: 4개 차시 핵심 활동·결과물 + 휴식·마무리 + 최종 결과",
  "- 적용 위치: 수강생용 가이드 1번 소개 직후, 최신 업데이트 카드 이전",
  "- 원문 기준: 각 가이드의 `4시간 전체 진행 순서` 표를 그대로 파싱하여 시각화",
  "- 강사용 가이드·웹 강의교안: 변경 없음",
  "",
  "## 생성 파일",
  "",
  "| 과정 | 일자 | 수강생용 가이드 | 인포그래픽 |",
  "| --- | --- | --- | --- |",
  ...written.map((item) => {
    const relGuide = path.relative(ROOT, item.guidePath).replaceAll("\\", "/");
    const relImage = path.relative(ROOT, item.imagePath).replaceAll("\\", "/");
    return `| ${item.role} | ${item.dayId} | \`${relGuide}\` | \`${relImage}\` |`;
  }),
  "",
].join("\n");
fs.writeFileSync(auditPath, audit, "utf8");

console.log(JSON.stringify({ learnerGuides: written.length, infographics: written.length, tables: written.length, audit: path.relative(ROOT, auditPath).replaceAll("\\", "/") }, null, 2));
