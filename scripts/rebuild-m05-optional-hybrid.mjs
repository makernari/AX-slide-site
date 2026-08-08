import fs from "node:fs";
import path from "node:path";

const ROOT = path.resolve(import.meta.dirname, "..");
const MANIFEST_PATH = path.join(ROOT, "data", "slide-manifest.json");
const CSV_PATH = path.join(ROOT, "data", "slide-manifest.csv");
const requestedModule = process.argv.find((arg) => arg.startsWith("--module="))?.split("=")[1] ?? "M05";
if (!/^M0[5-9]$/.test(requestedModule)) throw new Error(`Invalid module: ${requestedModule}`);
const SOURCE_ROOT = path.join(ROOT, "assets", "slide-sources", "optional", requestedModule);
const font = "'Pretendard','Noto Sans KR','Malgun Gothic',sans-serif";

const palettes = {
  COMMON: { accent: "#3157D5", accent2: "#14A89A", ink: "#10182B", muted: "#536078", pale: "#EEF2FF", pale2: "#EAF8F5" },
  BACKOFFICE: { accent: "#3157D5", accent2: "#14A89A", ink: "#10182B", muted: "#536078", pale: "#EDF3FC", pale2: "#EAF8F5" },
  MARKETING: { accent: "#E6614F", accent2: "#7357C8", ink: "#201D2C", muted: "#625A6B", pale: "#FCEAE6", pale2: "#F0ECFA" },
};

const courseLabels = { COMMON: "공통", BACKOFFICE: "경영지원", MARKETING: "마케팅" };
const tierLabels = { 선택: "선택 자료", 심화: "심화 자료", 예비: "예비 자료" };
const heroImages = {
  "COMMON-M06-D01-S025": { directory: "M06-D01", filename: "m06-d01-character-anchor-gpt-image-2.png" },
  "BACKOFFICE-M06-D01-S027": { directory: "M06-D01", filename: "m06-d01-backoffice-continuity-gpt-image-2.png" },
  "MARKETING-M06-D01-S027": { directory: "M06-D01", filename: "m06-d01-marketing-continuity-gpt-image-2.png" },
  "BACKOFFICE-M06-D01-S028": { directory: "M06-D01", filename: "m06-d01-distortion-recovery-gpt-image-2.png" },
  "MARKETING-M06-D01-S028": { directory: "M06-D01", filename: "m06-d01-marketing-distortion-recovery-gpt-image-2.png" },
  "COMMON-M08-D04-S024": { directory: "M08-D04", filename: "m08-d04-agent-approval-gate-gpt-image-2.png" },
  "COMMON-M08-D04-S025": { directory: "M08-D04", filename: "m08-d04-instruction-conflict-stop-gpt-image-2.png" },
  "BACKOFFICE-M08-D04-S026": { directory: "M08-D04", filename: "m08-d04-backoffice-email-preflight-gpt-image-2.png" },
  "MARKETING-M08-D04-S026": { directory: "M08-D04", filename: "m08-d04-marketing-publish-preflight-gpt-image-2.png" },
  "COMMON-M09-D01-S023": { directory: "M09-D01", filename: "m09-d01-demo-fallback-gpt-image-2.png" },
  "BACKOFFICE-M09-D01-S026": { directory: "M09-D01", filename: "m09-d01-backoffice-mini-lesson-gpt-image-2.png" },
  "MARKETING-M09-D01-S026": { directory: "M09-D01", filename: "m09-d01-marketing-mini-pitch-gpt-image-2.png" },
};

const layoutOverrides = {
  "COMMON-M07-D01-S024": "orbit",
  "COMMON-M07-D01-S025": "route",
  "BACKOFFICE-M07-D01-S026": "quadrant",
  "MARKETING-M07-D01-S026": "quadrant",
  "BACKOFFICE-M07-D01-S027": "flow",
  "MARKETING-M07-D01-S027": "flow",
  "COMMON-M07-D02-S023": "timeline",
  "COMMON-M07-D02-S024": "pipeline",
  "BACKOFFICE-M07-D02-S025": "decision",
  "MARKETING-M07-D02-S025": "decision",
  "BACKOFFICE-M07-D02-S026": "quadrant",
  "MARKETING-M07-D02-S026": "quadrant",
  "COMMON-M07-D03-S021": "quadrant",
  "COMMON-M07-D03-S022": "flow",
  "BACKOFFICE-M07-D03-S023": "ladder",
  "MARKETING-M07-D03-S023": "ladder",
  "BACKOFFICE-M07-D03-S024": "decision",
  "MARKETING-M07-D03-S024": "decision",
  "COMMON-M08-D01-S023": "pipeline",
  "COMMON-M08-D01-S024": "decision",
  "COMMON-M08-D01-S025": "flow",
  "BACKOFFICE-M08-D01-S026": "quadrant",
  "MARKETING-M08-D01-S026": "quadrant",
  "BACKOFFICE-M08-D01-S027": "decision",
  "MARKETING-M08-D01-S027": "decision",
  "BACKOFFICE-M08-D01-S028": "quadrant",
  "MARKETING-M08-D01-S028": "quadrant",
  "COMMON-M08-D02-S023": "quadrant",
  "COMMON-M08-D02-S024": "compare",
  "BACKOFFICE-M08-D02-S025": "flow",
  "MARKETING-M08-D02-S025": "flow",
  "BACKOFFICE-M08-D02-S026": "timeline",
  "MARKETING-M08-D02-S026": "timeline",
  "COMMON-M08-D03-S023": "quadrant",
  "COMMON-M08-D03-S024": "decision",
  "BACKOFFICE-M08-D03-S025": "compare",
  "MARKETING-M08-D03-S025": "compare",
  "BACKOFFICE-M08-D03-S026": "route",
  "MARKETING-M08-D03-S026": "route",
  "COMMON-M08-D04-S024": "hero",
  "COMMON-M08-D04-S025": "hero",
  "BACKOFFICE-M08-D04-S026": "hero",
  "MARKETING-M08-D04-S026": "hero",
  "BACKOFFICE-M08-D04-S027": "flow",
  "MARKETING-M08-D04-S027": "flow",
  "COMMON-M09-D01-S021": "ladder",
  "COMMON-M09-D01-S022": "compare",
  "COMMON-M09-D01-S023": "hero",
  "BACKOFFICE-M09-D01-S024": "decision",
  "MARKETING-M09-D01-S024": "decision",
  "BACKOFFICE-M09-D01-S025": "pipeline",
  "MARKETING-M09-D01-S025": "pipeline",
  "BACKOFFICE-M09-D01-S026": "hero",
  "MARKETING-M09-D01-S026": "hero",
};

function escapeXml(value) {
  return String(value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&apos;");
}

function csvEscape(value) {
  const text = Array.isArray(value) ? value.join(" / ") : String(value ?? "");
  return /[",\r\n]/.test(text) ? `"${text.replaceAll('"', '""')}"` : text;
}

function tierFromTitle(title) {
  return /^\[([^\]]+)\]/.exec(title)?.[1] ?? "선택";
}

function plainTitle(title) {
  return title.replace(/^\[[^\]]+\]\s*/, "");
}

function wrapWords(text, maxChars, maxLines = 2) {
  const words = String(text).trim().split(/\s+/);
  const lines = [];
  let line = "";
  for (const word of words) {
    const next = line ? `${line} ${word}` : word;
    if (line && next.length > maxChars) {
      lines.push(line);
      line = word;
    } else {
      line = next;
    }
  }
  if (line) lines.push(line);
  if (lines.length <= maxLines) return lines;
  const kept = lines.slice(0, maxLines);
  kept[maxLines - 1] = `${kept[maxLines - 1].replace(/[.…]+$/, "")}…`;
  return kept;
}

function textLines(lines, { x, y, lineHeight, className, anchor = "start", fill = "" }) {
  return lines.map((line, index) => `<text x="${x}" y="${y + index * lineHeight}" text-anchor="${anchor}" class="${className}"${fill ? ` fill="${fill}"` : ""}>${escapeXml(line)}</text>`).join("");
}

function iconKind(label) {
  if (/분석|수치|성과|차이/.test(label)) return "chart";
  if (/생성|초안|카피|제작|표현|아이디어/.test(label)) return "spark";
  if (/음성|오디오|녹취|원음|듣기|멀티모달/.test(label)) return "wave";
  if (/승인|담당|사람|관리자|실무자|경영진/.test(label)) return "person";
  if (/권한|비식별|안전|금지|경계/.test(label)) return "shield";
  if (/검토|확인|검증|대조|원본|근거|최신|현재/.test(label)) return "check";
  if (/기한|대기|일정|시행일|시간/.test(label)) return "clock";
  if (/문서|원문|자료|가이드|회의|요청/.test(label)) return "doc";
  if (/채널|게시|발행|외부|홍보/.test(label)) return "send";
  if (/형식|구조|표|상태|분류|단계/.test(label)) return "grid";
  if (/질문|재질문|답변/.test(label)) return "chat";
  return "node";
}

function iconSvg(label, x, y, color, color2, scale = 1) {
  const sw = 8;
  const k = iconKind(label);
  const shapes = {
    chart: `<path d="M18 76V42M50 76V22M82 76V52" stroke="${color}" stroke-width="${sw}" stroke-linecap="round"/><path d="M13 36l30-18 31 20 18-25" fill="none" stroke="${color2}" stroke-width="7" stroke-linecap="round" stroke-linejoin="round"/>`,
    spark: `<rect x="15" y="22" width="62" height="68" rx="14" fill="none" stroke="${color}" stroke-width="7"/><path d="M31 45h30M31 62h22" stroke="${color}" stroke-width="7" stroke-linecap="round"/><path d="M80 5l7 16 16 7-16 7-7 16-7-16-16-7 16-7z" fill="${color2}"/>`,
    wave: `<circle cx="50" cy="50" r="43" fill="none" stroke="${color}" stroke-width="7"/><path d="M20 52h12l8-24 12 46 10-33 8 11h12" fill="none" stroke="${color2}" stroke-width="7" stroke-linecap="round" stroke-linejoin="round"/>`,
    person: `<circle cx="50" cy="33" r="18" fill="none" stroke="${color}" stroke-width="7"/><path d="M18 88c4-24 17-34 32-34s28 10 32 34" fill="none" stroke="${color}" stroke-width="7" stroke-linecap="round"/><path d="M64 69l9 9 17-21" fill="none" stroke="${color2}" stroke-width="7" stroke-linecap="round" stroke-linejoin="round"/>`,
    shield: `<path d="M50 10l35 13v26c0 25-15 40-35 48-20-8-35-23-35-48V23z" fill="none" stroke="${color}" stroke-width="7"/><path d="M33 51l12 12 24-28" fill="none" stroke="${color2}" stroke-width="8" stroke-linecap="round" stroke-linejoin="round"/>`,
    check: `<circle cx="50" cy="50" r="39" fill="none" stroke="${color}" stroke-width="7"/><path d="M29 50l14 14 29-34" fill="none" stroke="${color2}" stroke-width="8" stroke-linecap="round" stroke-linejoin="round"/>`,
    clock: `<circle cx="50" cy="50" r="40" fill="none" stroke="${color}" stroke-width="7"/><path d="M50 24v29l20 12" fill="none" stroke="${color2}" stroke-width="8" stroke-linecap="round" stroke-linejoin="round"/>`,
    doc: `<path d="M22 9h44l16 17v65H22z" fill="none" stroke="${color}" stroke-width="7" stroke-linejoin="round"/><path d="M66 9v19h16M37 48h30M37 66h30" stroke="${color2}" stroke-width="7" stroke-linecap="round"/>`,
    send: `<path d="M9 49L91 14 66 91 48 59z" fill="none" stroke="${color}" stroke-width="7" stroke-linejoin="round"/><path d="M48 59L91 14" stroke="${color2}" stroke-width="7" stroke-linecap="round"/>`,
    grid: `<rect x="12" y="12" width="76" height="76" rx="13" fill="none" stroke="${color}" stroke-width="7"/><path d="M50 12v76M12 50h76" stroke="${color2}" stroke-width="6"/>`,
    chat: `<path d="M12 17h76v56H50L28 91V73H12z" fill="none" stroke="${color}" stroke-width="7" stroke-linejoin="round"/><path d="M31 42h38M31 57h25" stroke="${color2}" stroke-width="7" stroke-linecap="round"/>`,
    node: `<circle cx="50" cy="50" r="35" fill="none" stroke="${color}" stroke-width="7"/><circle cx="50" cy="50" r="12" fill="${color2}"/><path d="M50 7v13M50 80v13M7 50h13M80 50h13" stroke="${color}" stroke-width="7" stroke-linecap="round"/>`,
  };
  return `<g transform="translate(${x} ${y}) scale(${scale})">${shapes[k]}</g>`;
}

function cardLabel(label, x, y, width, p, options = {}) {
  const lines = wrapWords(label, options.maxChars ?? 10, 2);
  return textLines(lines, { x: x + width / 2, y, lineHeight: 36, className: options.className ?? "label", anchor: "middle", fill: options.fill ?? p.ink });
}

function flowLayout(labels, p) {
  const width = 348;
  const gap = 88;
  const start = 120;
  return labels.map((label, i) => {
    const x = start + i * (width + gap);
    const selected = i === labels.length - 1;
    const arrow = i < labels.length - 1 ? `<path d="M${x + width + 18} 623h48" stroke="#B8C4D8" stroke-width="8" stroke-linecap="round"/><path d="M${x + width + 49} 607l17 16-17 16" fill="none" stroke="${p.accent}" stroke-width="8" stroke-linecap="round" stroke-linejoin="round"/>` : "";
    return `${arrow}<g filter="url(#shadow)"><rect x="${x}" y="390" width="${width}" height="440" rx="38" fill="#FFFFFF" stroke="${selected ? p.accent : "#E0E6F0"}" stroke-width="${selected ? 6 : 2}"/></g><rect x="${x + 24}" y="416" width="64" height="40" rx="20" fill="${selected ? p.accent : p.pale}"/><text x="${x + 56}" y="444" text-anchor="middle" class="step" fill="${selected ? "#FFFFFF" : p.accent}">0${i + 1}</text><circle cx="${x + width / 2}" cy="570" r="78" fill="${selected ? "url(#brand)" : p.pale}" opacity="${selected ? 1 : .9}"/>${iconSvg(label, x + width / 2 - 45, 525, selected ? "#FFFFFF" : p.accent, selected ? "#FFFFFF" : p.accent2, .9)}${cardLabel(label, x, 735, width, p, { maxChars: 9, fill: selected ? p.accent : p.ink })}`;
  }).join("");
}

function orbitLayout(labels, p, slide) {
  const positions = [[142, 388], [142, 670], [1436, 388], [1436, 670]];
  const coreLabel = /저장 지점/.test(slide.title) ? "추적 중심" : "핵심 후보";
  const cards = labels.map((label, i) => {
    const [x, y] = positions[i];
    return `<g filter="url(#softShadow)"><rect x="${x}" y="${y}" width="470" height="190" rx="32" fill="#FFFFFF" stroke="#DCE4EF" stroke-width="2"/></g><rect x="${x + 24}" y="${y + 24}" width="130" height="142" rx="26" fill="${i % 2 ? p.pale2 : p.pale}"/>${iconSvg(label, x + 43, y + 45, p.accent, p.accent2, .9)}${cardLabel(label, x + 150, y + 105, 290, p, { maxChars: 8 })}`;
  }).join("");
  return `<path d="M612 483C790 483 804 566 885 566M1436 483C1258 483 1244 566 1163 566M612 765C790 765 804 676 885 676M1436 765C1258 765 1244 676 1163 676" fill="none" stroke="${p.accent}" stroke-width="6" opacity=".6"/>${cards}<circle cx="1024" cy="623" r="205" fill="url(#halo)"/><g filter="url(#shadow)"><path d="M1024 455l153 88v176l-153 88-153-88V543z" fill="url(#brand)"/></g><path d="M959 622h130M1024 557v130" stroke="#FFFFFF" stroke-width="13" stroke-linecap="round" opacity=".9"/><text x="1024" y="754" text-anchor="middle" class="core" fill="#FFFFFF">${coreLabel}</text>`;
}

function compareLayout(labels, p, slide) {
  const text = `${slide.title} ${slide.key_message}`;
  const captions = /다시 쓰기/.test(text)
    ? ["구조화 작업", "생성·분석"]
    : /산출물/.test(text)
      ? ["기록 산출물", "실행 산출물"]
      : /분기|청중/.test(text)
        ? ["공통 사실", "대상별 전달"]
        : /비교|공정/.test(text)
          ? ["동일 조건", "평가 기록"]
          : ["관점 1", "관점 2"];
  const sides = [[140, labels.slice(0, 2), captions[0]], [1148, labels.slice(2), captions[1]]];
  const panels = sides.map(([x, items, caption], side) => {
    const blocks = items.map((label, i) => `<g filter="url(#softShadow)"><rect x="${x + 54}" y="${485 + i * 190}" width="650" height="150" rx="28" fill="#FFFFFF" stroke="${side ? p.accent2 : p.accent}" stroke-width="3"/></g><circle cx="${x + 128}" cy="${560 + i * 190}" r="49" fill="${side ? p.pale2 : p.pale}"/>${iconSvg(label, x + 91, 523 + i * 190, side ? p.accent2 : p.accent, side ? p.accent : p.accent2, .74)}${cardLabel(label, x + 184, 572 + i * 190, 480, p, { maxChars: 14 })}`).join("");
    return `<rect x="${x}" y="386" width="760" height="490" rx="42" fill="${side ? p.pale2 : p.pale}" opacity=".55"/><rect x="${x + 42}" y="410" width="126" height="44" rx="22" fill="${side ? p.accent2 : p.accent}"/><text x="${x + 105}" y="440" text-anchor="middle" class="step" fill="#FFFFFF">${caption}</text>${blocks}`;
  }).join("");
  return `${panels}<g filter="url(#shadow)"><circle cx="1024" cy="628" r="86" fill="#FFFFFF" stroke="url(#brand)" stroke-width="8"/></g><path d="M984 628h80M1004 606l-22 22 22 22M1044 606l22 22-22 22" fill="none" stroke="${p.accent}" stroke-width="9" stroke-linecap="round" stroke-linejoin="round"/>`;
}

function quadrantLayout(labels, p) {
  const positions = [[160, 390], [1110, 390], [160, 674], [1110, 674]];
  const cards = labels.map((label, i) => {
    const [x, y] = positions[i];
    return `<g filter="url(#softShadow)"><rect x="${x}" y="${y}" width="778" height="190" rx="34" fill="#FFFFFF" stroke="#DFE5EF" stroke-width="2"/></g><circle cx="${x + 96}" cy="${y + 95}" r="56" fill="${i % 2 ? p.pale2 : p.pale}"/>${iconSvg(label, x + 54, y + 53, i % 2 ? p.accent2 : p.accent, i % 2 ? p.accent : p.accent2, .84)}<text x="${x + 188}" y="${y + 105}" class="label" fill="${p.ink}">${escapeXml(label)}</text><text x="${x + 716}" y="${y + 111}" text-anchor="end" class="ghost" fill="${i % 2 ? p.accent2 : p.accent}">0${i + 1}</text>`;
  }).join("");
  return `<path d="M938 485h72M1038 485h72M938 769h72M1038 769h72M1024 523v208" stroke="${p.accent}" stroke-width="6" stroke-linecap="round" opacity=".35"/>${cards}<circle cx="1024" cy="627" r="92" fill="url(#brand)" filter="url(#shadow)"/><path d="M987 627l24 24 50-58" fill="none" stroke="#FFFFFF" stroke-width="12" stroke-linecap="round" stroke-linejoin="round"/>`;
}

function ladderLayout(labels, p) {
  return labels.map((label, i) => {
    const x = 155 + i * 438;
    const y = 706 - i * 92;
    const h = 180 + i * 92;
    return `<g filter="url(#softShadow)"><path d="M${x} ${y}h370v${h}H${x}z" fill="${i === 3 ? "url(#brand)" : "#FFFFFF"}" stroke="${i === 3 ? p.accent : "#DFE5EF"}" stroke-width="${i === 3 ? 5 : 2}"/></g><text x="${x + 30}" y="${y + 50}" class="step" fill="${i === 3 ? "#FFFFFF" : p.accent}">0${i + 1}</text>${iconSvg(label, x + 137, y + 38, i === 3 ? "#FFFFFF" : p.accent, i === 3 ? "#FFFFFF" : p.accent2, .88)}${cardLabel(label, x + 30, y + 160, 310, p, { maxChars: 8, fill: i === 3 ? "#FFFFFF" : p.ink })}`;
  }).join("");
}

function decisionLayout(labels, p, slide) {
  const signals = labels.slice(0, 3).map((label, i) => {
    const y = 385 + i * 190;
    return `<g filter="url(#softShadow)"><rect x="150" y="${y}" width="650" height="145" rx="30" fill="#FFFFFF" stroke="#DFE5EF" stroke-width="2"/></g><circle cx="235" cy="${y + 72}" r="48" fill="${i % 2 ? p.pale2 : p.pale}"/>${iconSvg(label, 199, y + 36, p.accent, p.accent2, .72)}<text x="330" y="${y + 83}" class="label" fill="${p.ink}">${escapeXml(label)}</text><path d="M820 ${y + 72}h190" stroke="${p.accent}" stroke-width="7" stroke-linecap="round" opacity=".55"/>`;
  }).join("");
  const final = labels[3];
  const note = /작게/.test(final)
    ? "작은 범위에서 검증을 시작합니다"
    : /담당/.test(final)
      ? "담당자에게 안전하게 전달합니다"
      : /추가 데이터/.test(final)
        ? "질문이 분명할 때 데이터를 늘립니다"
        : /질문/.test(final)
          ? "모르면 추측하지 않고 질문합니다"
          : /승인/.test(final)
            ? "담당 검토 뒤 최종 확정합니다"
            : /재질문|재검토/.test(final)
              ? "근거를 보완한 뒤 다시 판단합니다"
              : /사람/.test(final) || /검증/.test(final)
                ? "사람이 마지막 기준을 확인합니다"
                : "마지막 기준을 확인하고 결정합니다";
  return `${signals}<path d="M1010 457v380" stroke="${p.accent}" stroke-width="7" stroke-linecap="round" opacity=".55"/><path d="M1010 647h160" stroke="${p.accent}" stroke-width="9" stroke-linecap="round"/><path d="M1148 628l21 19-21 19" fill="none" stroke="${p.accent}" stroke-width="9" stroke-linecap="round" stroke-linejoin="round"/><g filter="url(#shadow)"><rect x="1200" y="438" width="690" height="420" rx="52" fill="url(#brand)"/></g><circle cx="1545" cy="574" r="92" fill="#FFFFFF" opacity=".16"/>${iconSvg(final, 1495, 524, "#FFFFFF", "#FFFFFF", 1)}<text x="1545" y="746" text-anchor="middle" class="final" fill="#FFFFFF">${escapeXml(final)}</text><text x="1545" y="797" text-anchor="middle" class="small" fill="#FFFFFF" opacity=".82">${escapeXml(note)}</text>`;
}

function routeLayout(labels, p) {
  const root = labels[0];
  const branches = labels.slice(1).map((label, i) => {
    const x = 220 + i * 605;
    return `<g filter="url(#softShadow)"><rect x="${x}" y="690" width="478" height="180" rx="34" fill="#FFFFFF" stroke="${i === 2 ? p.accent2 : "#DFE5EF"}" stroke-width="${i === 2 ? 5 : 2}"/></g><circle cx="${x + 92}" cy="780" r="52" fill="${i === 2 ? p.pale2 : p.pale}"/>${iconSvg(label, x + 53, 741, i === 2 ? p.accent2 : p.accent, p.accent2, .78)}${cardLabel(label, x + 160, 790, 285, p, { maxChars: 8 })}`;
  }).join("");
  return `<g filter="url(#shadow)"><rect x="654" y="375" width="740" height="190" rx="48" fill="url(#brand)"/></g>${iconSvg(root, 742, 420, "#FFFFFF", "#FFFFFF", 1)}<text x="1080" y="485" text-anchor="middle" class="final" fill="#FFFFFF">${escapeXml(root)}</text><path d="M1024 565v68M459 633h1130M459 633v57M1024 633v57M1589 633v57" fill="none" stroke="${p.accent}" stroke-width="8" stroke-linecap="round" opacity=".72"/>${branches}`;
}

function timelineLayout(labels, p) {
  const xs = [275, 760, 1288, 1773];
  const cards = labels.map((label, i) => {
    const y = i % 2 ? 690 : 410;
    const connectorY = i % 2 ? 662 : 610;
    return `<path d="M${xs[i]} 626v${connectorY - 626}" stroke="${i % 2 ? p.accent2 : p.accent}" stroke-width="6" stroke-linecap="round"/><g filter="url(#softShadow)"><rect x="${xs[i] - 180}" y="${y}" width="360" height="170" rx="32" fill="#FFFFFF" stroke="${i % 2 ? p.accent2 : p.accent}" stroke-width="3"/></g>${iconSvg(label, xs[i] - 45, y + 25, i % 2 ? p.accent2 : p.accent, i % 2 ? p.accent : p.accent2, .9)}${cardLabel(label, xs[i] - 165, y + 145, 330, p, { maxChars: 9 })}<circle cx="${xs[i]}" cy="626" r="32" fill="${i % 2 ? p.accent2 : p.accent}"/><text x="${xs[i]}" y="635" text-anchor="middle" class="step" fill="#FFFFFF">${i + 1}</text>`;
  }).join("");
  return `<path d="M275 626C540 570 575 682 760 626S1100 570 1288 626s315 56 485 0" fill="none" stroke="url(#brand)" stroke-width="18" stroke-linecap="round" opacity=".18"/>${cards}`;
}

function pipelineLayout(labels, p) {
  if (labels.length === 3) {
    const width = 500;
    const gap = 90;
    const start = 184;
    return labels.map((label, i) => {
      const x = start + i * (width + gap);
      const arrow = i < 2 ? `<path d="M${x + width + 22} 625h46" stroke="${p.accent}" stroke-width="9" stroke-linecap="round"/><path d="M${x + width + 50} 607l19 18-19 18" fill="none" stroke="${p.accent}" stroke-width="9" stroke-linecap="round" stroke-linejoin="round"/>` : "";
      return `${arrow}<g filter="url(#shadow)"><rect x="${x}" y="430" width="${width}" height="390" rx="42" fill="${i === 2 ? "url(#brand)" : "#FFFFFF"}" stroke="${i === 2 ? p.accent : "#DFE5EF"}" stroke-width="${i === 2 ? 5 : 2}"/></g><rect x="${x + 28}" y="458" width="68" height="42" rx="21" fill="${i === 2 ? "#FFFFFF" : p.pale}"/><text x="${x + 62}" y="487" text-anchor="middle" class="step" fill="${i === 2 ? p.accent : p.accent}">0${i + 1}</text><circle cx="${x + width / 2}" cy="595" r="78" fill="${i === 2 ? "#FFFFFF" : p.pale2}" opacity=".94"/>${iconSvg(label, x + width / 2 - 45, 550, i === 2 ? p.accent : p.accent, i === 2 ? p.accent2 : p.accent2, .9)}${cardLabel(label, x + 40, 745, width - 80, p, { maxChars: 15, fill: i === 2 ? "#FFFFFF" : p.ink })}`;
    }).join("");
  }
  const width = 300;
  const gap = 82;
  const start = 110;
  return labels.map((label, i) => {
    const x = start + i * (width + gap);
    const y = i % 2 ? 540 : 410;
    const arrow = i < labels.length - 1 ? `<path d="M${x + width + 18} ${y + 145}h45" stroke="${p.accent}" stroke-width="7" stroke-linecap="round" opacity=".65"/>` : "";
    return `${arrow}<g filter="url(#softShadow)"><rect x="${x}" y="${y}" width="${width}" height="300" rx="34" fill="${i === labels.length - 1 ? "url(#brand)" : "#FFFFFF"}" stroke="${i === labels.length - 1 ? p.accent : "#DFE5EF"}" stroke-width="${i === labels.length - 1 ? 5 : 2}"/></g><text x="${x + 28}" y="${y + 46}" class="step" fill="${i === labels.length - 1 ? "#FFFFFF" : p.accent}">0${i + 1}</text>${iconSvg(label, x + 100, y + 66, i === labels.length - 1 ? "#FFFFFF" : p.accent, i === labels.length - 1 ? "#FFFFFF" : p.accent2, .95)}${cardLabel(label, x + 24, y + 238, width - 48, p, { maxChars: 8, fill: i === labels.length - 1 ? "#FFFFFF" : p.ink })}`;
  }).join("");
}

function heroLayout(labels, p, slide) {
  const hero = heroImages[slide.id];
  if (!hero) throw new Error(`Missing hero mapping for ${slide.id}`);
  const href = `../../../../generated-heroes/${hero.directory}/${hero.filename}`;
  const preserve = slide.course === "MARKETING" ? "xMidYMid slice" : "xMidYMin slice";
  const positions = [[150, 555], [430, 555], [150, 700], [430, 700]];
  const pills = labels.map((label, i) => {
    const [x, y] = positions[i];
    return `<g filter="url(#softShadow)"><rect x="${x}" y="${y}" width="250" height="104" rx="28" fill="#FFFFFF" opacity=".96"/></g><text x="${x + 22}" y="${y + 32}" class="step" fill="${i % 2 ? p.accent2 : p.accent}">0${i + 1}</text><text x="${x + 125}" y="${y + 70}" text-anchor="middle" class="core" fill="${i % 2 ? p.accent2 : p.accent}">${escapeXml(label)}</text>`;
  }).join("");
  return `<g filter="url(#shadow)"><rect x="104" y="370" width="1840" height="550" rx="48" fill="#FFFFFF"/></g><image href="${href}" x="630" y="370" width="1314" height="550" preserveAspectRatio="${preserve}" clip-path="url(#heroClip)"/><path d="M104 370h650l100 550H104z" fill="url(#brand)" clip-path="url(#heroClip)"/>${pills}<rect x="104" y="370" width="1840" height="550" rx="48" fill="none" stroke="${p.accent}" stroke-width="4" opacity=".45"/>`;
}

function chooseLayout(slide) {
  const text = `${slide.title} ${slide.key_message}`;
  if (layoutOverrides[slide.id]) return layoutOverrides[slide.id];
  if (heroImages[slide.id]) return "hero";
  if (["COMMON-M06-D02-S003", "COMMON-M06-D02-S017"].includes(slide.id)) return "pipeline";
  if (slide.id === "COMMON-M06-D01-S026") return "compare";
  if (slide.id === "COMMON-M06-D02-S024") return "timeline";
  if (/병목/.test(text)) return "orbit";
  if (/비교|분기|세 청중|다시 쓰기|산출물/.test(text)) return "compare";
  if (/신호|실패 기준|경계|거절|최소 완성선|반례/.test(text)) return "decision";
  if (/조건|품질|기준|공정|지침의 다섯 칸/.test(text)) return "quadrant";
  if (/복구|분리|상태판/.test(text)) return "route";
  if (/다음 버전/.test(text)) return "flow";
  if (/버전|가이드|승인 문서|출처|소리 우선순위/.test(text)) return "ladder";
  if (/대조|오디오|원문|순서|두 번 검수/.test(text)) return "timeline";
  if (/하이브리드/.test(text)) return "compare";
  return "flow";
}

const layoutFunctions = { flow: flowLayout, orbit: orbitLayout, compare: compareLayout, quadrant: quadrantLayout, ladder: ladderLayout, decision: decisionLayout, route: routeLayout, timeline: timelineLayout, pipeline: pipelineLayout, hero: heroLayout };

function slideSvg(slide, labels, layout) {
  const p = palettes[slide.course];
  const tier = tierFromTitle(slide.title);
  const badge = /^\[[^\]]+\]/.test(slide.title) ? (tierLabels[tier] ?? `${tier} 자료`) : "핵심 자료";
  const title = plainTitle(slide.title);
  const titleSize = title.length > 24 ? 66 : title.length > 19 ? 72 : 80;
  const messageLines = wrapWords(slide.key_message, 52, 2);
  const messageStartY = messageLines.length === 1 ? 288 : 274;
  const body = layoutFunctions[layout](labels, p, slide);
  return `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" width="2048" height="1152" viewBox="0 0 2048 1152">
  <defs>
    <linearGradient id="bg" x1="0" y1="0" x2="1" y2="1"><stop stop-color="#FBFCFE"/><stop offset="1" stop-color="#F1F4FA"/></linearGradient>
    <linearGradient id="brand" x1="0" y1="0" x2="1" y2="1"><stop stop-color="${p.accent}"/><stop offset="1" stop-color="${p.accent2}"/></linearGradient>
    <radialGradient id="halo"><stop stop-color="${p.accent}" stop-opacity=".22"/><stop offset=".72" stop-color="${p.accent}" stop-opacity=".05"/><stop offset="1" stop-color="${p.accent}" stop-opacity="0"/></radialGradient>
    <linearGradient id="heroShade" x1="0" y1="0" x2="0" y2="1"><stop stop-color="#10182B" stop-opacity="0"/><stop offset="1" stop-color="#10182B" stop-opacity=".76"/></linearGradient>
    <clipPath id="heroClip"><rect x="104" y="370" width="1840" height="550" rx="48"/></clipPath>
    <filter id="shadow" x="-30%" y="-30%" width="160%" height="180%"><feDropShadow dx="0" dy="16" stdDeviation="22" flood-color="#16213A" flood-opacity=".12"/></filter>
    <filter id="softShadow" x="-20%" y="-30%" width="140%" height="180%"><feDropShadow dx="0" dy="8" stdDeviation="12" flood-color="#16213A" flood-opacity=".10"/></filter>
    <pattern id="dots" width="36" height="36" patternUnits="userSpaceOnUse"><circle cx="2" cy="2" r="1.6" fill="#9DABC1" opacity=".18"/></pattern>
  </defs>
  <rect width="2048" height="1152" fill="url(#bg)"/>
  <rect width="2048" height="1152" fill="url(#dots)"/>
  <circle cx="1882" cy="142" r="270" fill="url(#halo)"/>
  <style>
    .meta{font-family:${font};font-size:25px;font-weight:800;letter-spacing:1px}
    .title{font-family:${font};font-size:${titleSize}px;font-weight:900;letter-spacing:-3px;fill:${p.ink}}
    .subtitle{font-family:${font};font-size:31px;font-weight:650;letter-spacing:-.8px;fill:${p.muted}}
    .label{font-family:${font};font-size:31px;font-weight:850;letter-spacing:-1px}
    .final{font-family:${font};font-size:36px;font-weight:900;letter-spacing:-1px}
    .core{font-family:${font};font-size:29px;font-weight:850;letter-spacing:-.8px}
    .small{font-family:${font};font-size:23px;font-weight:650;letter-spacing:-.4px}
    .step{font-family:${font};font-size:20px;font-weight:900;letter-spacing:1px}
    .ghost{font-family:${font};font-size:64px;font-weight:900;opacity:.13}
  </style>
  <rect x="104" y="60" width="154" height="48" rx="24" fill="url(#brand)"/>
  <text x="181" y="93" text-anchor="middle" class="meta" fill="#FFFFFF">${escapeXml(badge)}</text>
  <text x="1944" y="93" text-anchor="end" class="meta" fill="${p.accent}">${courseLabels[slide.course]} · ${slide.module} ${slide.day}</text>
  <text x="104" y="207" class="title">${escapeXml(title)}</text>
  ${textLines(messageLines, { x: 106, y: messageStartY, lineHeight: 42, className: "subtitle", fill: p.muted })}
  ${body}
</svg>`;
}

const manifest = JSON.parse(fs.readFileSync(MANIFEST_PATH, "utf8"));
const revisionIds = new Set(["COMMON-M06-D02-S003", "COMMON-M06-D02-S017"]);
const slides = manifest.slides.filter((slide) => slide.module === requestedModule && (/^\[(선택|심화|예비)\]/.test(slide.title) || revisionIds.has(slide.id)));
const expectedCounts = { M05: 33, M06: 20, M07: 18, M08: 27, M09: 9 };
if (expectedCounts[requestedModule] && slides.length !== expectedCounts[requestedModule]) {
  throw new Error(`Expected ${expectedCounts[requestedModule]} ${requestedModule} hybrid slides, found ${slides.length}`);
}

if (requestedModule === "M05") {
  const first = slides.find((slide) => slide.id === "COMMON-M05-D01-S020");
  if (!first) throw new Error("Missing COMMON-M05-D01-S020");
  first.title = "[선택] 2026 AI 흐름을 네 단계로 읽기";
  first.key_message = "AI는 생성에서 끝나지 않고 여러 입력과 도구를 연결해 실행하는 방향으로 확장된다.";
}

const layoutCounts = {};
for (const slide of slides) {
  const labels = slide.required_content.split(" / ").map((item) => item.trim()).filter(Boolean);
  if (![3, 4, 5].includes(labels.length)) throw new Error(`Expected three to five labels for ${slide.id}, found ${labels.length}`);
  const layout = chooseLayout(slide);
  layoutCounts[layout] = (layoutCounts[layout] ?? 0) + 1;
  slide.visual_type = `하이브리드 ${layout} 인포그래픽`;
  slide.image_status = "generated";
  slide.review_status = "pending";
  const sourceDir = revisionIds.has(slide.id)
    ? path.join(ROOT, "assets", "slide-sources", "revisions", requestedModule, slide.course.toLowerCase())
    : path.join(SOURCE_ROOT, slide.course.toLowerCase());
  fs.mkdirSync(sourceDir, { recursive: true });
  fs.writeFileSync(path.join(sourceDir, `${slide.id}.svg`), slideSvg(slide, labels, layout), "utf8");
}

fs.writeFileSync(MANIFEST_PATH, `${JSON.stringify(manifest, null, 2)}\n`, "utf8");
const fields = ["id", "course", "module", "day", "lesson", "order", "title", "purpose", "key_message", "required_content", "visual_type", "content_type", "image_filename", "prompt_status", "image_status", "review_status"];
const csv = [fields.join(","), ...manifest.slides.map((slide) => fields.map((field) => csvEscape(slide[field])).join(","))].join("\r\n") + "\r\n";
fs.writeFileSync(CSV_PATH, csv, "utf8");
console.log(`optional_hybrid=ok module=${requestedModule} count=${slides.length} layouts=${JSON.stringify(layoutCounts)}`);
