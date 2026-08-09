import fs from "node:fs";
import path from "node:path";
import { spawnSync } from "node:child_process";
import { fileURLToPath } from "node:url";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const AS_OF = "2026-08-09";
const RAW_ROOT = "https://raw.githubusercontent.com/makernari/AX-slide-site/main";
const MEDIA_ROOT = path.join(ROOT, "downloads", "guide-resources", "common", "example-media");
const ROLES = {
  backoffice: { label: "경영지원", course: "스마트 경영지원", accent: "#155EEF", dark: "#0B3B8F", soft: "#EAF2FF" },
  marketing: { label: "마케팅", course: "마케팅·SNS 콘텐츠 기획·브랜딩", accent: "#C2410C", dark: "#8A2D0B", soft: "#FFF1E8" },
};
const DAYS = [
  "M05-D01", "M05-D02", "M05-D03", "M05-D04",
  "M06-D01", "M06-D02", "M06-D03",
  "M07-D01", "M07-D02", "M07-D03",
  "M08-D01", "M08-D02", "M08-D03", "M08-D04",
  "M09-D01",
];
const KINDS = {
  "backoffice/M05-D01": "memo",
  "marketing/M05-D01": "scrapbook",
  "backoffice/M05-D02": "voice",
  "marketing/M05-D02": "hooks",
  "backoffice/M05-D03": "sources",
  "marketing/M05-D03": "thumbnail",
  "backoffice/M05-D04": "redline",
  "marketing/M05-D04": "carousel",
  "backoffice/M06-D01": "sticker",
  "marketing/M06-D01": "doodle",
  "backoffice/M06-D02": "comic",
  "marketing/M06-D02": "character",
  "backoffice/M06-D03": "ladder",
  "marketing/M06-D03": "evidence",
  "backoffice/M07-D01": "form",
  "marketing/M07-D01": "comments",
  "backoffice/M07-D02": "workflow",
  "marketing/M07-D02": "pipeline",
  "backoffice/M07-D03": "chart",
  "marketing/M07-D03": "scorecard",
  "backoffice/M08-D01": "wireframe",
  "marketing/M08-D01": "landing",
  "backoffice/M08-D02": "bug",
  "marketing/M08-D02": "ab",
  "backoffice/M08-D03": "qa",
  "marketing/M08-D03": "brandqa",
  "backoffice/M08-D04": "risk",
  "marketing/M08-D04": "preflight",
  "backoffice/M09-D01": "mirror",
  "marketing/M09-D01": "collage",
};

function lines(items) {
  return items.join("\n");
}

function escapeHtml(value) {
  return String(value ?? "")
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;");
}

function stripMarkdown(value) {
  return String(value ?? "")
    .replace(/!\[[^\]]*\]\([^)]*\)/g, "")
    .replace(/\[([^\]]+)\]\([^)]*\)/g, "$1")
    .replace(/[*_`>#]/g, "")
    .replace(/\s+/g, " ")
    .trim();
}

function short(value, max = 74) {
  const text = stripMarkdown(value);
  return text.length <= max ? text : `${text.slice(0, max - 1).trimEnd()}…`;
}

function write(relativePath, content) {
  const destination = path.join(ROOT, relativePath);
  fs.mkdirSync(path.dirname(destination), { recursive: true });
  fs.writeFileSync(destination, `${String(content).trim()}\n`, "utf8");
}

function mediaData(filename) {
  const absolute = path.join(MEDIA_ROOT, filename);
  if (!fs.existsSync(absolute)) throw new Error(`Missing generated media: ${absolute}`);
  return `data:image/png;base64,${fs.readFileSync(absolute).toString("base64")}`;
}

const media = {
  cafe: mediaData("fictional-cafe-product-photo.png"),
  office: mediaData("fictional-office-safety-photo.png"),
  product: mediaData("fictional-coral-speaker-photo.png"),
  doodle: mediaData("fictional-coral-speaker-ms-paint.png"),
  character: mediaData("fictional-character-three-scenes.png"),
  facilitator: mediaData("fictional-training-facilitator-sheet.png"),
  workbench: mediaData("ai-workbench-reflection.png"),
  collage: mediaData("brand-collaboration-collage.png"),
};

function parseGuide(roleKey, dayId) {
  const file = path.join(ROOT, "guides", "notion", roleKey, "instructor", `${dayId}.md`);
  const text = fs.readFileSync(file, "utf8");
  const title = text.match(/^#\s+(.+)$/m)?.[1] || `${dayId} ${ROLES[roleKey].label}`;
  const required = text.match(/^> 필수 결과물:\s*(.+)$/m)?.[1] || "차시별 결과물과 검수 기록";
  const rows = [...text.matchAll(/^\| ([1-4])차시 \| ([^|]+) \| ([^|]+) \| ([^|]+) \| ([^|]+) \| ([^|]+) \| ([^|]+) \|$/gm)]
    .map((match) => ({
      number: Number(match[1]),
      time: match[2].trim(),
      slides: match[3].trim(),
      instructor: match[4].trim(),
      learner: match[5].trim(),
      output: match[6].trim(),
      checkpoint: match[7].trim(),
    }));
  if (rows.length !== 4) throw new Error(`Expected four session rows: ${file}`);
  return { file, text, title, required, rows, roleKey, dayId };
}

function parseSolution(roleKey, dayId) {
  const file = path.join(ROOT, "downloads", "guide-resources", roleKey, dayId, "solutions", `${dayId.toLowerCase()}-${roleKey}-complete-example.md`);
  const text = fs.readFileSync(file, "utf8");
  const headings = [...text.matchAll(/^##\s+(.+)$/gm)];
  const sections = headings.map((heading, index) => {
    const start = heading.index + heading[0].length;
    const end = headings[index + 1]?.index ?? text.length;
    return { title: stripMarkdown(heading[1]), body: text.slice(start, end).trim() };
  });
  if (sections.length < 1) throw new Error(`Expected at least one solution section: ${file}`);
  return { file, text, sections };
}

function chooseSolutionSection(solution, session, index, used) {
  const ignored = new Set(["완성", "예시", "결과", "초안", "카드", "업무", "문서"]);
  const terms = stripMarkdown(session.output)
    .split(/[^0-9A-Za-z가-힣]+/)
    .map((term) => term.trim())
    .filter((term) => term.length >= 2 && !ignored.has(term));
  const ranked = solution.sections.map((section, sectionIndex) => {
    const title = section.title.toLowerCase();
    const haystack = `${section.title} ${section.body}`.toLowerCase();
    const score = terms.reduce((sum, term) => sum + (title.includes(term.toLowerCase()) ? 4 : haystack.includes(term.toLowerCase()) ? 1 : 0), 0);
    return { section, sectionIndex, score: score - (used.has(sectionIndex) ? 5 : 0) };
  }).sort((a, b) => b.score - a.score || a.sectionIndex - b.sectionIndex);
  let selected = ranked[0];
  if (!selected || selected.score <= 0) {
    return {
      title: stripMarkdown(session.output),
      body: lines([
        `- 작성 내용: ${stripMarkdown(session.learner)}`,
        `- 완료 결과: ${stripMarkdown(session.output)}`,
        `- 검수 기준: ${stripMarkdown(session.checkpoint)}`,
        "- 저장 상태: 파일을 닫고 다시 찾아 열어 확인함",
      ]),
    };
  }
  used.add(selected.sectionIndex);
  return selected.section;
}

function tablePreview(body) {
  const rows = body.split(/\r?\n/).filter((line) => /^\|.+\|$/.test(line.trim()));
  if (rows.length < 2) return "";
  const parsed = rows
    .filter((line) => !/^\|\s*:?-+/.test(line.trim()))
    .slice(0, 5)
    .map((line) => line.trim().slice(1, -1).split("|").map((cell) => short(cell, 34)));
  if (parsed.length < 2) return "";
  const width = Math.min(3, parsed[0].length);
  const head = parsed[0].slice(0, width).map((cell) => `<th>${escapeHtml(cell)}</th>`).join("");
  const bodyRows = parsed.slice(1).map((row) => `<tr>${row.slice(0, width).map((cell) => `<td>${escapeHtml(cell)}</td>`).join("")}</tr>`).join("");
  return `<table><thead><tr>${head}</tr></thead><tbody>${bodyRows}</tbody></table>`;
}

function sectionPreview(section) {
  const table = tablePreview(section.body);
  if (table) return table;
  const bullets = section.body.split(/\r?\n/)
    .filter((line) => /^\s*(?:[-*]|\d+\.)\s+/.test(line))
    .map((line) => short(line.replace(/^\s*(?:[-*]|\d+\.)\s+/, ""), 68))
    .filter(Boolean)
    .slice(0, 5);
  if (bullets.length) return `<ul>${bullets.map((item) => `<li>${escapeHtml(item)}</li>`).join("")}</ul>`;
  const paragraphs = section.body.split(/\n\s*\n/).map((item) => short(item, 130)).filter(Boolean).slice(0, 3);
  return paragraphs.map((item) => `<p>${escapeHtml(item)}</p>`).join("");
}

function buildCompleteHtml(guide, solution) {
  const role = ROLES[guide.roleKey];
  const usedSections = new Set();
  const cards = guide.rows.map((session, index) => {
    const section = chooseSolutionSection(solution, session, index, usedSections);
    return lines([
      `<article class="session-card">`,
      `  <div class="card-top"><span class="session">${session.number}차시</span><span class="done">검수 완료</span></div>`,
      `  <h2>${escapeHtml(short(section.title, 38))}</h2>`,
      `  <div class="artifact">${sectionPreview(section)}</div>`,
      `  <div class="result"><b>결과</b><span>${escapeHtml(short(session.output, 58))}</span></div>`,
      `  <div class="verify"><b>확인</b><span>${escapeHtml(short(session.checkpoint, 58))}</span></div>`,
      `</article>`,
    ]);
  }).join("\n");
  return lines([
    "<!doctype html>",
    "<html lang=\"ko\">",
    "<head>",
    "  <meta charset=\"utf-8\">",
    "  <meta name=\"viewport\" content=\"width=device-width,initial-scale=1\">",
    `  <title>${escapeHtml(guide.dayId)} · ${escapeHtml(role.label)} · 실제 작성형 완성 예시</title>`,
    "  <style>",
    `    :root{font-family:Arial,'Noto Sans KR',system-ui,sans-serif;color:#132746;background:#edf3f9;--accent:${role.accent};--dark:${role.dark};--soft:${role.soft}}`,
    "    *{box-sizing:border-box}body{margin:0;min-width:320px}.page{width:min(1600px,100%);height:900px;margin:0 auto;padding:22px;display:grid;grid-template-rows:112px 68px 1fr;gap:14px}",
    "    header{border-radius:24px;background:linear-gradient(135deg,var(--dark),var(--accent));color:#fff;padding:20px 30px;display:flex;align-items:center;justify-content:space-between;gap:22px;box-shadow:0 14px 34px #12345a22}.eyebrow{font-size:14px;font-weight:800;letter-spacing:.08em;margin:0 0 7px;color:#dce9ff}.title{font-size:30px;line-height:1.15;margin:0}.meta{text-align:right}.role{display:inline-block;background:#fff;color:var(--dark);padding:8px 14px;border-radius:999px;font-weight:850}.meta p{font-size:13px;margin:9px 0 0;color:#e5efff}",
    "    .summary{background:#fff;border:1px solid #ccdaeb;border-radius:18px;padding:12px 20px;display:grid;grid-template-columns:116px 1fr 260px;gap:16px;align-items:center}.summary b{color:var(--accent)}.summary span{font-size:14px;line-height:1.35}.summary small{text-align:right;color:#52627a;line-height:1.35}",
    "    .grid{display:grid;grid-template-columns:1fr 1fr;grid-template-rows:1fr 1fr;gap:14px;min-height:0}.session-card{background:#fff;border:1px solid #cbd9e9;border-radius:20px;padding:14px 16px;min-height:0;display:grid;grid-template-rows:30px 32px 1fr 30px 30px;gap:6px;overflow:hidden}.card-top{display:flex;justify-content:space-between;align-items:center}.session,.done{padding:6px 10px;border-radius:999px;font-size:12px;font-weight:850}.session{background:var(--accent);color:#fff}.done{background:#eaf8ef;color:#14723b}.session-card h2{font-size:18px;line-height:1.2;margin:0;color:#0b1f44}.artifact{border:1px solid #d8e2ef;background:#f8fafc;border-radius:13px;padding:10px 12px;overflow:hidden}.artifact ul{margin:0;padding-left:18px;display:grid;gap:4px}.artifact li,.artifact p{font-size:12px;line-height:1.34;margin:0}.artifact table{width:100%;border-collapse:collapse;table-layout:fixed;font-size:11px}.artifact th,.artifact td{padding:5px 6px;border-bottom:1px solid #dbe4ef;text-align:left;overflow-wrap:anywhere}.artifact th{color:var(--dark);background:var(--soft)}.result,.verify{display:grid;grid-template-columns:48px 1fr;align-items:center;border-radius:9px;padding:5px 9px;font-size:12px}.result{background:var(--soft)}.verify{background:#f3f6fa}.result b,.verify b{color:var(--dark)}",
    "    @media(max-width:760px){.page{height:auto;min-height:100vh;padding:12px;grid-template-rows:auto auto auto}header{align-items:flex-start;flex-direction:column}.title{font-size:25px}.meta{text-align:left}.summary{grid-template-columns:1fr}.summary small{text-align:left}.grid{grid-template-columns:1fr;grid-template-rows:none}.session-card{min-height:390px}.artifact li,.artifact p{font-size:13px}}",
    "    @media print{body{background:#fff}.page{padding:0}}",
    "  </style>",
    "</head>",
    "<body data-example-ready=\"true\">",
    "  <main class=\"page\">",
    `    <header><div><p class="eyebrow">REAL-WORLD PRACTICE EXAMPLE · ${guide.dayId}</p><h1 class="title">${escapeHtml(short(guide.title.replace(/^\[[^\]]+\]\s*/, ""), 66))}</h1></div><div class="meta"><span class="role">${escapeHtml(role.course)}</span><p>교육용 가상 데이터 · 브라우저 독립 실행 · ${AS_OF}</p></div></header>`,
    `    <section class="summary"><b>오늘의 완성물</b><span>${escapeHtml(guide.required)}</span><small>실제 기관 자료가 아닌 실습용 결과입니다.<br>표현보다 근거·검수·완료 상태를 확인하세요.</small></section>`,
    `    <section class="grid">${cards}</section>`,
    "  </main>",
    "  <script>document.documentElement.dataset.exampleReady='true'</script>",
    "</body>",
    "</html>",
  ]);
}

function parseWarmup(file) {
  const html = fs.readFileSync(file, "utf8");
  const title = html.match(/<h1 class="title">([^<]+)<\/h1>/)?.[1] || "오늘의 AI 워밍업";
  const input = html.match(/<article class="panel"><h2><span>INPUT<\/span>([^<]+)<\/h2>/)?.[1] || "가상 입력";
  const output = html.match(/<article class="panel"><h2><span>RESULT<\/span>([^<]+)<\/h2>/)?.[1] || "완성 결과";
  return { title, input, output };
}

const chip = (label, tone = "blue") => `<span class="chip ${tone}">${escapeHtml(label)}</span>`;
const row = (a, b, c = "") => `<div class="data-row"><b>${escapeHtml(a)}</b><span>${escapeHtml(b)}</span>${c ? `<em>${escapeHtml(c)}</em>` : ""}</div>`;
const realPhoto = (src, alt, extra = "") => `<div class="photo-shell"><img src="${src}" alt="${escapeHtml(alt)}">${extra}</div>`;

function warmupScene(kind) {
  switch (kind) {
    case "memo":
      return {
        input: `<div class="paper memo"><i>09:30 강의실 확인</i><i>교재 수량 24? 재확인</i><i>오후 링크 담당 미정</i><i>금요일까지 안내문</i><small>교육용 가상 메모</small></div>`,
        output: `<div class="artifact-card"><h3>오늘의 할 일</h3>${row("강의실 확인","교육 운영","오늘 09:30")}${row("교재 수량 확인","자료 담당","[판독 필요]")}${row("안내문 초안","교육 운영","금요일")}</div>`,
      };
    case "scrapbook":
      return {
        input: realPhoto(media.cafe, "가상 카페 제품 사진"),
        output: realPhoto(media.cafe, "감성 메모가 추가된 가상 카페 제품 사진", `<span class="sticky s1">오늘의 작은 발견</span><span class="bubble b1">잠깐의 여유</span><span class="doodle-mark d1">♡</span><span class="doodle-mark d2">✦</span>`),
      };
    case "voice":
      return {
        input: `<div class="audio-card"><button aria-label="재생">▶</button><div><b>가상 회의 음성 · 00:30</b><div class="wavebars">▂▅▃▇▄▆▂▅▃▆▄</div><p>“교재 수량은 내일 확인하고, 안내문은 금요일 전까지…”</p></div></div>`,
        output: `<div class="artifact-card"><h3>회의 후속조치</h3>${row("교재 수량 재확인","자료 담당","내일")}${row("안내문 초안 작성","교육 운영","금요일")}${row("링크 담당 지정","확인 필요","기한 미정")}</div>`,
      };
    case "hooks":
      return {
        input: `<div class="audio-card"><button aria-label="재생">▶</button><div><b>상품 아이디어 · 00:20</b><div class="wavebars coral">▃▇▄▅▂▆▅▃▇</div><p>“작고 가벼워 책상과 여행에서 모두 쓰는 스피커예요.”</p></div></div>`,
        output: `<div class="hook-list"><article><b>호기심형</b><p>손바닥 크기로 공간이 달라진다면?</p></article><article><b>문제형</b><p>책상 위 스피커, 너무 크지 않았나요?</p></article><article><b>반전형</b><p>작지만 두 공간을 오갑니다</p></article></div>`,
      };
    case "sources":
      return {
        input: `<div class="source-pair"><article><b>안내문 A</b><p>접수: 8월 20일</p><p>대상: 신규 수강생</p></article><article><b>안내문 B</b><p>접수: 8월 22일</p><p>대상: 신규 수강생</p></article></div>`,
        output: `<div class="artifact-card"><h3>출처 비교표</h3>${row("공통","대상: 신규 수강생","A·B")}${row("충돌","접수일 20일 ↔ 22일","확인 필요")}${row("다음 행동","담당 부서에 날짜 확인","미확정")}</div>`,
      };
    case "thumbnail":
      return {
        input: `<div class="paper"><b>가상 콘텐츠 요약</b><p>작은 스피커 하나로 책상과 여행 가방의 공간을 줄이고, 충전 상태를 한눈에 확인합니다.</p><small>원문에 성과 수치 없음</small></div>`,
        output: `<div class="thumb-grid"><article>작은 공간의<br><b>큰 변화</b></article><article><b>책상 위</b><br>무엇을 줄일까?</article><article><b>2개 공간</b><br>하나로 연결</article></div>`,
      };
    case "redline":
      return {
        input: `<div class="slide-mock"><h3>8월 교육 운영 브리핑</h3><strong>참여 48명</strong><div class="mini-bars"><i></i><i></i><i></i></div><p>다음 일정: 자료 제출</p></div>`,
        output: `<div class="slide-mock redlined"><h3>8월 교육 운영 브리핑</h3><strong>참여 48명</strong><div class="mini-bars"><i></i><i></i><i></i></div><p>다음 일정: 자료 제출</p><span class="rednote n1">기준일?</span><span class="rednote n2">담당 역할</span><span class="rednote n3">기한 필요</span></div>`,
      };
    case "carousel":
      return {
        input: `<div class="brief"><b>핵심 문장</b><p>작은 스피커로 일상 공간을 가볍게 바꿉니다.</p><span>대상: 이동이 잦은 20–30대</span></div>`,
        output: `<div class="carousel-grid"><article><small>1 · 문제</small><b>공간은 좁고</b></article><article><small>2 · 발견</small><b>필요한 건 하나</b></article><article><small>3 · 해결</small><b>가볍게 이동</b></article><article><small>4 · 행동</small><b>내 공간에 놓기</b></article></div>`,
      };
    case "sticker":
      return {
        input: realPhoto(media.office, "교육용 가상 사무공간 사진"),
        output: realPhoto(media.office, "관찰 안내 스티커가 추가된 교육용 가상 사무공간", `<span class="pin p1">① 이동선 확인</span><span class="pin p2">② 적치 위치 확인</span><span class="pin p3">③ 전원 사용 확인</span><small class="edu">교육용 예시</small>`),
      };
    case "doodle":
      return { input: realPhoto(media.product, "가상 제품 사진"), output: realPhoto(media.doodle, "MS Paint 낙서 스타일로 변환한 가상 제품") };
    case "comic":
      return {
        input: `<div class="steps"><span>신청서 입력</span><span>담당 역할 확인</span><span>접수 완료 기록</span></div>`,
        output: `<div class="comic-grid"><article><i>1</i><b>신청</b><p>“항목을 채웠어요”</p></article><article><i>2</i><b>사람 확인</b><p>“누락을 볼게요”</p></article><article><i>3</i><b>완료</b><p>“접수 기록 완료”</p></article></div>`,
      };
    case "character":
      return {
        input: `<div class="character-card"><b>고정 요소 4개</b><p>짙은 갈색 단발 · 크림 블라우스 · 코랄 카디건 · 네이비 가방</p><span>변화: 카메라 거리만</span></div>`,
        output: realPhoto(media.character, "같은 가상 캐릭터의 발견 체험 추천 세 장면"),
      };
    case "ladder":
      return {
        input: `<div class="question"><small>막연한 질문</small><b>업무 효율을 높이는 방법은?</b></div>`,
        output: `<div class="ladder">${["용어 정의","대상 범위","필요 근거","비교 기준","결론 조건"].map((item, i) => `<span style="--i:${i}">${i + 1}. ${item}</span>`).join("")}</div>`,
      };
    case "evidence":
      return {
        input: `<div class="claim-list"><p>“짧은 영상이 항상 효과적이다”</p><p>“저녁 게시가 가장 좋다”</p><p>“댓글 질문이 늘었다”</p></div>`,
        output: `<div class="artifact-card"><h3>근거·확신도</h3>${row("확인 필요","‘항상’의 범위 없음","원자료 확인")}${row("일부 근거","표본·채널 제한","분석 보고서")}${row("근거 있음","가상 댓글 표 +18%","집계 방식 확인")}</div>`,
      };
    case "form":
      return {
        input: `<form class="form-mock"><label>신청 유형<input value="일반"></label><label>희망 일정<input placeholder="예: 8월 20일"></label><label>연락 방법<input placeholder="선택 기준 없음"></label><button type="button">제출</button></form>`,
        output: `<div class="artifact-card"><h3>초보자 점검표</h3>${row("신청 유형","선택지 설명 추가","모호함")}${row("희망 일정","입력 형식 예시 제공","예시")}${row("연락 방법","필수 여부·오류 복구","누락")}</div>`,
      };
    case "comments":
      return {
        input: `<div class="comments"><p>“가방에 쏙 들어가서 좋아요”</p><p>“충전 상태가 바로 보이면 좋겠어요”</p><p>“책상에서 자리 차지 안 해요”</p><p>“버튼이 단순해서 편해요”</p></div>`,
        output: `<div class="customer-words"><article><b>“가방에 쏙”</b><span>이동 편의 기대</span></article><article><b>“바로 보이면”</b><span>상태 확인 기대</span></article><article><b>“자리 차지 안 해요”</b><span>작은 크기 선호</span></article></div>`,
      };
    case "workflow":
      return {
        input: `<div class="steps"><span>입력</span><span>검토</span><span>승인</span><span>기록</span></div>`,
        output: `<div class="metro"><span>입력</span><i></i><span>검토</span><i></i><span class="human-check">사람 승인</span><i></i><span>기록</span><b>반려 시 검토로 돌아감 ↩</b></div>`,
      };
    case "pipeline":
      return {
        input: `<div class="request-stack"><p>릴스 초안 · 8/20</p><p>제품 카드 · 8/21</p><p>뉴스레터 · 8/22</p><p>후기 요약 · 8/23</p></div>`,
        output: `<div class="kanban"><section><b>아이디어</b><p>후기 요약</p></section><section><b>제작</b><p>릴스 초안</p></section><section><b>검토</b><p>제품 카드</p></section><section><b>게시 준비</b><p>뉴스레터</p></section></div>`,
      };
    case "chart":
      return {
        input: `<div class="small-table">${row("항목","6월","7월")}${row("처리 건수","42","57")}${row("재작업","9","6")}${row("대기","12","14")}</div>`,
        output: `<div class="chart-card"><div class="bar-chart"><i style="height:52%"></i><i style="height:78%"></i></div><b>처리 건수는 42→57건 증가</b><p>원인은 표만으로 알 수 없어 확인 필요</p></div>`,
      };
    case "scorecard":
      return {
        input: `<div class="small-table">${row("채널","도달","저장")}${row("A","12,400","186")}${row("B","8,900","243")}${row("C","15,100","122")}</div>`,
        output: `<div class="scorecard"><h3>목표 · 저장 행동</h3><strong>채널 B 저장률 2.7%</strong><p>도달은 작지만 목표 지표가 가장 높음</p><span>다음 실험: 첫 장 메시지만 변경</span></div>`,
      };
    case "wireframe":
      return {
        input: `<div class="wire-sketch"><i>업무 유형</i><i>내용 입력</i><button>실행</button><section>결과</section></div>`,
        output: `<div class="app-ui"><header>요청문 초안 도우미</header><label>업무 유형<select><option>자료 제출 요청</option></select></label><label>필수 항목<textarea>제출 항목, 기한, 문의 방법</textarea></label><button>초안 만들기</button><section>빈 값은 입력 안내를 표시합니다.</section></div>`,
      };
    case "landing":
      return {
        input: realPhoto(media.product, "가상 제품 사진"),
        output: `<div class="phone"><img src="${media.product}" alt="가상 제품"><h3>가볍게, 두 공간을 잇다</h3><p>작은 크기 · 휴대용 스트랩 · 충전 상태 표시</p><button>자세히 보기</button><small>재생 시간: 확인 필요</small></div>`,
      };
    case "bug":
      return {
        input: `<div class="error-screen"><b>요청을 완료하지 못했습니다</b><code>status: 400 · field: due_date</code><p>입력값을 확인해 주세요.</p></div>`,
        output: `<div class="artifact-card"><h3>비개발자용 오류 설명</h3>${row("보이는 현상","저장 요청 실패","확정")}${row("확인할 입력","due_date 값","확정")}${row("원인 후보","날짜 형식 불일치","추정")}${row("다음 행동","가상 입력 형식 확인","안전")}</div>`,
      };
    case "ab":
      return {
        input: `<div class="copy-card"><small>A안</small><b>작은 스피커로 일상을 바꿔 보세요.</b><p>사실: 작고 휴대 가능</p></div>`,
        output: `<div class="ab-grid"><article><small>A</small><b>작은 스피커로 일상을 바꿔 보세요.</b></article><article><small>B</small><b>책상과 여행, 하나로 들어 보세요.</b></article><footer>변경: 첫 문장 구조 · 가설: 사용 장면 구체화 · 지표: 상세 클릭률</footer></div>`,
      };
    case "qa":
      return {
        input: `<div class="paper"><b>가상 운영 규정</b><p>교육 자료는 검토 완료 표시 후 공유한다. 외부 공유는 담당자의 승인을 받는다.</p><small>질문: 자료를 바로 공개해도 되나요?</small></div>`,
        output: `<div class="qa-card"><small>답변</small><b>바로 공개하지 않습니다.</b><p>근거: “외부 공유는 담당자의 승인을 받는다.”</p><span>문서에 승인 기준이 없으면: 근거 없음</span></div>`,
      };
    case "brandqa":
      return {
        input: `<div class="paper"><b>가상 브랜드 가이드</b><p>차분하고 구체적으로 말한다. ‘최고·유일·완벽’ 표현은 사용하지 않는다.</p><small>카피: “세상에서 가장 완벽한 사운드”</small></div>`,
        output: `<div class="qa-card coral"><small>수정 필요</small><b>작은 공간에 또렷한 소리를 더합니다.</b><p>근거: 과장 표현 금지 · 구체적 장면 사용</p><span>사운드 성능 수치는 확인 필요</span></div>`,
      };
    case "risk":
      return {
        input: `<div class="action-cards"><span>조회</span><span>초안</span><span>메일 발송</span><span>공개 공유</span><span>삭제</span><span>기록</span></div>`,
        output: `<div class="traffic"><section><b>자동 가능</b><span>조회</span><span>초안</span></section><section><b>사람 확인 후</b><span>기록</span></section><section><b>실습 금지</b><span>메일 발송</span><span>공개 공유</span><span>삭제</span></section></div>`,
      };
    case "preflight":
      return {
        input: `<div class="post-draft"><b>가상 게시물 초안</b><p>작은 공간에 어울리는 휴대용 스피커</p><span>#가상캠페인 #교육용</span></div>`,
        output: `<div class="ticket"><header>POST PREFLIGHT</header>${row("브랜드 사실","통과","✓")}${row("과장 표현","통과","✓")}${row("저작권","확인 필요","!")}${row("채널 규격","통과","✓")}${row("사람 승인","대기","!")}</div>`,
      };
    case "mirror":
      return {
        input: `<div class="keyword-grid">${chip("지시")}${chip("검증","teal")}${chip("수정")}${chip("협업","teal")}</div>`,
        output: realPhoto(media.workbench, "지시 검증 수정 협업 습관을 나타내는 가상 작업대"),
      };
    case "collage":
      return {
        input: `<div class="keyword-grid coral">${chip("목표","coral")}${chip("선택","navy")}${chip("초안","coral")}${chip("검수","navy")}</div>`,
        output: realPhoto(media.collage, "사람과 AI의 브랜드 작업 역할을 구분한 가상 콜라주"),
      };
    default:
      throw new Error(`Unsupported warmup kind: ${kind}`);
  }
}

function buildWarmupHtml(roleKey, dayId, info, kind) {
  const role = ROLES[roleKey];
  const scene = warmupScene(kind);
  return lines([
    "<!doctype html>",
    "<html lang=\"ko\">",
    "<head>",
    "  <meta charset=\"utf-8\">",
    "  <meta name=\"viewport\" content=\"width=device-width,initial-scale=1\">",
    `  <title>${escapeHtml(dayId)} · ${escapeHtml(info.title)} · 실제 사용형 예시</title>`,
    "  <style>",
    `    :root{font-family:Arial,'Noto Sans KR',system-ui,sans-serif;color:#132746;background:#edf3f9;--accent:${role.accent};--dark:${role.dark};--soft:${role.soft}}`,
    "    *{box-sizing:border-box}body{margin:0;min-width:320px}.page{width:min(1600px,100%);height:900px;margin:0 auto;padding:22px;display:grid;grid-template-rows:112px 1fr 126px;gap:14px}",
    "    header{border-radius:24px;background:linear-gradient(135deg,var(--dark),var(--accent));color:#fff;padding:20px 30px;display:flex;align-items:center;justify-content:space-between;gap:22px}.eyebrow{font-size:14px;font-weight:850;letter-spacing:.08em;margin:0 0 7px;color:#e4edff}.title{font-size:31px;line-height:1.15;margin:0}.meta{text-align:right}.tag{display:inline-block;background:#fff;color:var(--dark);padding:8px 14px;border-radius:999px;font-weight:850}.meta p{font-size:13px;margin:9px 0 0;color:#e6efff}",
    "    .work{display:grid;grid-template-columns:1fr 116px 1fr;gap:14px;min-height:0}.panel{background:#fff;border:1px solid #cbd9e9;border-radius:22px;padding:15px;display:grid;grid-template-rows:40px 1fr;min-width:0;min-height:0}.panel h2{font-size:18px;margin:0;color:var(--dark);display:flex;align-items:center;gap:9px}.panel h2 span{background:var(--soft);padding:6px 10px;border-radius:999px;font-size:12px}.preview{background:#f6f8fb;border:1px solid #d8e2ef;border-radius:16px;display:grid;place-items:center;min-height:0;overflow:hidden;position:relative;padding:14px}.bridge{display:flex;flex-direction:column;align-items:center;justify-content:center;text-align:center}.bridge strong{width:62px;height:62px;border-radius:50%;background:var(--accent);color:#fff;display:grid;place-items:center;font-size:31px}.bridge b{font-size:14px;color:var(--dark);margin-top:12px}.bridge p{font-size:12px;line-height:1.45;color:#52627a}",
    "    .footer{background:#fff;border:1px solid #cbd9e9;border-radius:20px;padding:14px 20px;display:grid;grid-template-columns:repeat(4,1fr);gap:12px}.footer div{border-left:3px solid var(--accent);padding-left:12px}.footer b{display:block;color:var(--dark);font-size:13px;margin-bottom:5px}.footer span{font-size:12px;line-height:1.35;color:#455872}",
    "    .paper,.artifact-card,.brief,.question,.character-card,.copy-card,.post-draft{width:88%;background:#fff;border:1px solid #cad7e7;border-radius:14px;padding:20px;box-shadow:0 10px 26px #17365a18}.paper b,.artifact-card h3,.brief b,.question b,.character-card b,.copy-card b,.post-draft b{color:var(--dark)}.paper p,.brief p,.question b,.character-card p,.copy-card b,.post-draft p{font-size:18px;line-height:1.5}.paper small,.brief span,.question small,.character-card span,.copy-card p,.post-draft span{color:#52627a}",
    "    .memo{transform:rotate(-1deg);background:#fff9d9;font-family:'Segoe Print','Malgun Gothic',sans-serif}.memo i{display:block;font-style:normal;font-size:18px;line-height:1.8;border-bottom:1px solid #d9cf9b}.memo small{display:block;margin-top:12px}.data-row{display:grid;grid-template-columns:120px 1fr auto;gap:10px;align-items:center;padding:8px 0;border-bottom:1px solid #e0e7f0;font-size:13px}.data-row:last-child{border-bottom:0}.data-row b{color:var(--dark)}.data-row em{font-style:normal;background:var(--soft);padding:4px 7px;border-radius:8px;font-size:11px}.artifact-card h3{margin:0 0 9px}.small-table{width:90%;background:#fff;border:1px solid #cad7e7;border-radius:14px;padding:18px}",
    "    .photo-shell{width:100%;height:100%;position:relative;overflow:hidden;border-radius:13px;background:#e8edf4}.photo-shell img{width:100%;height:100%;object-fit:cover;display:block}.sticky,.bubble,.pin,.edu{position:absolute;background:#fff7c7;border:2px solid var(--accent);border-radius:10px;padding:8px 11px;font-weight:850;box-shadow:0 5px 16px #18263c33}.s1{left:4%;top:6%;transform:rotate(-4deg)}.b1{right:5%;top:18%;border-radius:999px}.doodle-mark{position:absolute;color:var(--accent);font-size:42px;font-weight:900}.d1{left:8%;bottom:12%}.d2{right:12%;bottom:10%}.pin{font-size:12px}.p1{left:5%;bottom:6%}.p2{left:47%;top:48%}.p3{right:5%;top:22%}.edu{right:4%;bottom:4%;font-size:11px;background:#fff}.photo-shell:has(.pin):after{content:'';position:absolute;inset:0;border:4px solid var(--accent);border-radius:13px;pointer-events:none}",
    "    .audio-card{width:90%;background:#101d33;color:#fff;border-radius:18px;padding:22px;display:grid;grid-template-columns:72px 1fr;gap:18px;align-items:center}.audio-card button{width:64px;height:64px;border:0;border-radius:50%;background:var(--accent);color:#fff;font-size:24px}.audio-card b{font-size:17px}.audio-card p{color:#cbd8e8;margin:8px 0 0}.wavebars{color:#70c6ff;letter-spacing:6px;font-size:28px;margin:14px 0}.wavebars.coral{color:#ffb08e}.hook-list,.customer-words{width:88%;display:grid;gap:10px}.hook-list article,.customer-words article{background:#fff;border:1px solid #cad7e7;border-left:5px solid var(--accent);border-radius:12px;padding:13px 16px}.hook-list b,.customer-words b{color:var(--dark)}.hook-list p{margin:5px 0 0;font-size:16px}.customer-words article{display:flex;justify-content:space-between;gap:12px}.customer-words span{color:#52627a}",
    "    .source-pair{width:92%;display:grid;grid-template-columns:1fr 1fr;gap:12px}.source-pair article{background:#fff;border:1px solid #cad7e7;border-radius:14px;padding:18px}.source-pair b{color:var(--dark)}.source-pair p{padding:8px;background:var(--soft);border-radius:8px}.thumb-grid,.carousel-grid,.comic-grid{width:94%;display:grid;gap:10px}.thumb-grid{grid-template-columns:repeat(3,1fr)}.thumb-grid article{aspect-ratio:4/3;background:linear-gradient(145deg,var(--dark),var(--accent));color:#fff;border-radius:14px;padding:16px;display:grid;place-items:center;text-align:center;font-size:18px}.carousel-grid{grid-template-columns:repeat(4,1fr)}.carousel-grid article{aspect-ratio:3/4;border-radius:14px;padding:14px;background:var(--soft);border:2px solid var(--accent);display:flex;flex-direction:column;justify-content:space-between}.carousel-grid small{color:var(--accent);font-weight:800}.carousel-grid b{font-size:17px}.comic-grid{grid-template-columns:repeat(3,1fr)}.comic-grid article{background:#fff;border:1px solid #cad7e7;border-radius:14px;padding:15px;text-align:center;min-height:180px}.comic-grid i{width:48px;height:48px;background:var(--accent);color:#fff;border-radius:50%;display:grid;place-items:center;margin:0 auto 18px;font-style:normal;font-weight:900}.comic-grid b{display:block;color:var(--dark);font-size:17px}",
    "    .slide-mock{width:90%;height:82%;background:#fff;border:1px solid #cbd7e6;border-radius:13px;padding:22px;position:relative}.slide-mock h3{color:var(--dark);margin:0 0 22px}.slide-mock strong{font-size:36px;color:var(--accent)}.mini-bars{display:flex;align-items:end;gap:12px;height:130px;margin:12px 0}.mini-bars i{width:18%;background:var(--accent);border-radius:6px 6px 0 0}.mini-bars i:nth-child(1){height:40%}.mini-bars i:nth-child(2){height:75%}.mini-bars i:nth-child(3){height:58%}.redlined:after{content:'';position:absolute;left:25%;top:17%;width:36%;height:26%;border:5px solid #e11d48;border-radius:50%;transform:rotate(-5deg)}.rednote{position:absolute;color:#be123c;font-family:'Segoe Print','Malgun Gothic';font-weight:900}.n1{right:8%;top:12%}.n2{left:7%;bottom:18%}.n3{right:8%;bottom:6%}",
    "    .steps{width:88%;display:flex;gap:9px;align-items:center;justify-content:center;flex-wrap:wrap}.steps span{background:#fff;border:2px solid var(--accent);color:var(--dark);border-radius:12px;padding:13px 17px;font-weight:800}.steps span:not(:last-child):after{content:'→';margin-left:20px;color:var(--accent)}.character-card{border-left:6px solid var(--accent)}.ladder{width:86%;display:flex;flex-direction:column;gap:9px}.ladder span{width:calc(56% + var(--i) * 9%);background:var(--soft);border-left:5px solid var(--accent);padding:10px 14px;border-radius:9px;font-weight:750}.claim-list,.comments,.request-stack{width:88%;display:grid;gap:9px}.claim-list p,.comments p,.request-stack p{margin:0;background:#fff;border:1px solid #cad7e7;border-radius:11px;padding:12px 14px}",
    "    .form-mock,.app-ui{width:88%;background:#fff;border:1px solid #cad7e7;border-radius:14px;padding:18px;display:grid;gap:10px}.form-mock label,.app-ui label{font-size:12px;font-weight:800;color:var(--dark)}.form-mock input,.app-ui select,.app-ui textarea{width:100%;margin-top:5px;border:1px solid #aebed3;border-radius:8px;padding:9px;background:#fff;font:inherit}.form-mock button,.app-ui button,.phone button{border:0;background:var(--accent);color:#fff;border-radius:8px;padding:10px;font-weight:850}.metro{width:94%;display:flex;align-items:center;justify-content:center;gap:7px;position:relative}.metro span{padding:13px 16px;border:3px solid var(--accent);border-radius:999px;background:#fff;color:var(--dark);font-weight:850}.metro i{width:34px;height:5px;background:var(--accent)}.metro .human-check{background:#fff0cf;border-color:#f59e0b}.metro b{position:absolute;bottom:-70px;background:#fff0f2;color:#be123c;padding:8px 12px;border-radius:9px}.kanban{width:96%;display:grid;grid-template-columns:repeat(4,1fr);gap:8px}.kanban section{background:#e9eef5;border-radius:12px;padding:11px;min-height:210px}.kanban b{color:var(--dark)}.kanban p{background:#fff;border-left:4px solid var(--accent);border-radius:8px;padding:10px;font-size:12px}",
    "    .chart-card,.scorecard{width:88%;background:#fff;border:1px solid #cad7e7;border-radius:14px;padding:18px}.bar-chart{height:160px;display:flex;gap:30px;align-items:end;justify-content:center;border-bottom:2px solid #8091a8;margin-bottom:12px}.bar-chart i{width:70px;background:var(--accent);border-radius:8px 8px 0 0}.chart-card b,.scorecard h3{color:var(--dark)}.chart-card p,.scorecard p{color:#52627a}.scorecard strong{display:block;font-size:27px;color:var(--accent);margin:22px 0}.scorecard span{display:block;background:var(--soft);padding:12px;border-radius:9px}.wire-sketch{width:82%;background:#fffdf2;border:2px dashed #8091a8;border-radius:14px;padding:20px;transform:rotate(-1deg)}.wire-sketch i,.wire-sketch section{display:block;border:2px dashed #a4b2c3;border-radius:8px;padding:12px;margin:10px 0;font-style:normal}.wire-sketch button{border:2px dashed var(--accent);background:none;color:var(--accent);padding:9px 20px}.app-ui header{background:var(--dark);color:#fff;border-radius:8px;padding:10px;font-weight:850}.app-ui textarea{height:62px}.app-ui section{background:var(--soft);padding:9px;border-radius:8px;font-size:12px}",
    "    .phone{width:270px;background:#fff;border:8px solid #122037;border-radius:34px;padding:12px;box-shadow:0 14px 30px #10274425}.phone img{width:100%;height:170px;object-fit:cover;border-radius:17px}.phone h3{margin:10px 0 6px;color:var(--dark)}.phone p{font-size:12px;color:#52627a}.phone button{width:100%}.phone small{display:block;color:#9a3412;background:#fff0df;padding:7px;border-radius:7px;margin-top:8px}.error-screen{width:90%;background:#101827;color:#fff;border-radius:16px;padding:24px}.error-screen b{display:block;font-size:21px;margin-bottom:16px}.error-screen code{display:block;background:#251b27;color:#ffb4b4;padding:14px;border-radius:8px}.error-screen p{color:#cbd5e1}.ab-grid{width:94%;display:grid;grid-template-columns:1fr 1fr;gap:12px}.ab-grid article{background:#fff;border:1px solid #cad7e7;border-top:5px solid var(--accent);border-radius:12px;padding:18px}.ab-grid small{display:block;color:var(--accent);font-weight:850;margin-bottom:13px}.ab-grid b{font-size:18px}.ab-grid footer{grid-column:1/-1;background:var(--soft);padding:12px;border-radius:9px;font-size:12px}.qa-card{width:88%;background:#fff;border:1px solid #cad7e7;border-left:7px solid var(--accent);border-radius:14px;padding:22px}.qa-card small{color:var(--accent);font-weight:850}.qa-card b{display:block;color:var(--dark);font-size:23px;margin:12px 0}.qa-card p{background:var(--soft);padding:12px;border-radius:8px}.qa-card span{color:#52627a;font-size:12px}",
    "    .action-cards{width:90%;display:grid;grid-template-columns:repeat(3,1fr);gap:9px}.action-cards span{background:#fff;border:1px solid #cad7e7;border-radius:10px;padding:15px;text-align:center;font-weight:800}.traffic{width:94%;display:grid;grid-template-columns:repeat(3,1fr);gap:10px}.traffic section{border-radius:13px;padding:14px;min-height:210px}.traffic section:nth-child(1){background:#e3f6e9}.traffic section:nth-child(2){background:#fff3cf}.traffic section:nth-child(3){background:#ffe4e6}.traffic b{display:block;margin-bottom:12px}.traffic span{display:block;background:#fff9;padding:8px;border-radius:8px;margin:7px 0}.ticket{width:88%;background:#fff;border:2px dashed var(--accent);border-radius:14px;padding:18px}.ticket header{border-radius:8px;background:var(--dark);padding:10px 14px;margin-bottom:7px;font-size:14px}.keyword-grid{width:86%;display:grid;grid-template-columns:1fr 1fr;gap:13px}.chip{display:grid;place-items:center;background:#eaf2ff;color:#0b3b8f;border-radius:16px;padding:30px;font-size:24px;font-weight:900}.chip.teal{background:#e0f5f2;color:#0f766e}.chip.coral{background:#fff0e8;color:#9a3412}.chip.navy{background:#e9eef7;color:#172b4d}",
    "    @media(max-width:760px){.page{height:auto;min-height:100vh;padding:12px;grid-template-rows:auto auto auto}header{align-items:flex-start;flex-direction:column}.title{font-size:25px}.meta{text-align:left}.work{grid-template-columns:1fr}.bridge{min-height:120px}.bridge strong{transform:rotate(90deg)}.panel{min-height:480px}.footer{grid-template-columns:1fr 1fr}.source-pair,.thumb-grid,.carousel-grid,.comic-grid,.kanban,.traffic,.ab-grid{grid-template-columns:1fr 1fr}.metro{flex-wrap:wrap}.phone{width:min(300px,100%)}}",
    "  </style>",
    "</head>",
    "<body data-warmup-ready=\"true\">",
    "  <main class=\"page\">",
    `    <header><div><p class="eyebrow">REAL-WORLD AI WARM-UP · ${dayId}</p><h1 class="title">${escapeHtml(info.title)}</h1></div><div class="meta"><span class="tag">${escapeHtml(role.course)}</span><p>교육용 가상 입력 · 실제 결과 구조 · ${AS_OF}</p></div></header>`,
    `    <section class="work"><article class="panel"><h2><span>INPUT</span>${escapeHtml(info.input)}</h2><div class="preview">${scene.input}</div></article><div class="bridge"><strong>→</strong><b>한 번 실행</b><p>유지 1개<br>수정 1개<br>검수 1회</p></div><article class="panel"><h2><span>RESULT</span>${escapeHtml(info.output)}</h2><div class="preview">${scene.output}</div></article></section>`,
    "    <footer class=\"footer\"><div><b>1 · 입력</b><span>가상·비식별 자료인지 확인</span></div><div><b>2 · 실행</b><span>원문 밖 사실을 만들지 않기</span></div><div><b>3 · 수정</b><span>유지할 것과 바꿀 것을 분리</span></div><div><b>4 · 기록</b><span>입력·첫 결과·수정 이유·최종 캡처</span></div></footer>",
    "  </main>",
    "  <script>document.documentElement.dataset.warmupReady='true'</script>",
    "</body>",
    "</html>",
  ]);
}

function buildCharacterSheet(roleKey) {
  const role = ROLES[roleKey];
  const isBackoffice = roleKey === "backoffice";
  const src = isBackoffice ? media.facilitator : media.character;
  const title = isBackoffice ? "가상 교육 진행자 한결" : "가상 캠페인 모델 리아";
  const fixed = isBackoffice
    ? "30대 가상 성인 · 짧은 검정 머리 · 네이비 셔츠 · 주황 교육 조끼"
    : "20대 후반 가상 성인 · 짙은 갈색 단발 · 크림 블라우스 · 코랄 카디건 · 네이비 가방";
  const labels = isBackoffice ? ["정면", "좌측 3/4", "우측 3/4", "전신"] : ["발견", "체험", "추천", "고정 요소"];
  return lines([
    "<!doctype html><html lang=\"ko\"><head><meta charset=\"utf-8\"><meta name=\"viewport\" content=\"width=device-width,initial-scale=1\">",
    `<title>${title} 실제 이미지 캐릭터 시트</title><style>`,
    `:root{font-family:Arial,'Noto Sans KR',system-ui,sans-serif;--accent:${role.accent};--dark:${role.dark};--soft:${role.soft}}*{box-sizing:border-box}body{margin:0;background:#edf3f9;color:#172b4d}.page{width:1600px;height:900px;padding:24px;display:grid;grid-template-rows:130px 1fr 150px;gap:16px;margin:auto}header{background:linear-gradient(135deg,var(--dark),var(--accent));color:#fff;border-radius:26px;padding:24px 30px;display:flex;justify-content:space-between;align-items:center}header h1{font-size:34px;margin:6px 0 0}.id{background:#fff;color:var(--dark);border-radius:999px;padding:10px 16px;font-weight:850}.sheet{background:#fff;border:1px solid #cbd9e9;border-radius:22px;padding:18px;position:relative;overflow:hidden}.sheet img{width:100%;height:100%;display:block;object-fit:cover;border-radius:14px}.labels{position:absolute;left:32px;right:32px;bottom:30px;display:grid;grid-template-columns:repeat(4,1fr);gap:18px}.pose{background:#fffeb;border:1px solid #fff;border-radius:999px;padding:8px;text-align:center;font-weight:850;color:var(--dark);backdrop-filter:blur(8px)}.specs{display:grid;grid-template-columns:1.4fr 1fr 1fr;gap:14px}.box{background:#fff;border:1px solid #cbd9e9;border-top:5px solid var(--accent);border-radius:16px;padding:16px}.box b{display:block;color:var(--dark);margin-bottom:8px}.box span{font-size:14px;line-height:1.4}.palette i{display:inline-block;width:28px;height:28px;border-radius:50%;margin-right:7px;background:var(--accent)}.palette i:nth-child(3){background:var(--dark)}.palette i:nth-child(4){background:#f4eadb}.palette i:nth-child(5){background:#334155}@media(max-width:760px){.page{width:100%;height:auto;min-height:100vh;padding:12px;grid-template-rows:auto 520px auto}header{align-items:flex-start;flex-direction:column}.sheet img{object-fit:cover}.specs{grid-template-columns:1fr}.labels{grid-template-columns:1fr 1fr}}`,
    `</style></head><body data-media-ready="true"><main class="page"><header><div><div>REAL IMAGE CHARACTER CONSISTENCY · M06-D01</div><h1>${title}</h1></div><div class="id">${isBackoffice ? "BO-HANGYEOL-02" : "MK-RIA-02"}</div></header><section class="sheet"><img src="${src}" alt="${title} 실제 이미지 일관성 예시"><div class="labels">${labels.map((label) => `<div class="pose">${label}</div>`).join("")}</div></section><footer class="specs"><div class="box"><b>항상 고정</b><span>${fixed}</span></div><div class="box"><b>변경 가능</b><span>${isBackoffice ? "표정 · 손동작 · 카메라 거리" : "장면 · 카메라 거리 · 손동작"}</span></div><div class="box palette"><b>색상 기준</b><i></i><i></i><i></i><i></i></div></footer></main><script>document.documentElement.dataset.mediaReady='true'</script></body></html>`,
  ]);
}

function updateGuideLinks() {
  const result = spawnSync(process.execPath, [path.join(ROOT, "scripts", "update-guide-pages-links.mjs")], {
    cwd: ROOT,
    encoding: "utf8",
  });
  if (result.status !== 0) {
    throw new Error(`Guide Pages link update failed: ${result.stderr || result.stdout}`);
  }
  return JSON.parse(result.stdout);
}

function main() {
  const completeFiles = [];
  const warmupFiles = [];
  for (const roleKey of Object.keys(ROLES)) {
    for (const dayId of DAYS) {
      const guide = parseGuide(roleKey, dayId);
      const solution = parseSolution(roleKey, dayId);
      const completeRelative = `downloads/guide-resources/${roleKey}/${dayId}/solutions/${dayId.toLowerCase()}-${roleKey}-complete-example.html`;
      write(completeRelative, buildCompleteHtml(guide, solution));
      completeFiles.push(completeRelative);

      const warmupRelative = `downloads/guide-resources/${roleKey}/${dayId}/warmups/${dayId.toLowerCase()}-${roleKey}-ai-warmup.html`;
      const warmupAbsolute = path.join(ROOT, warmupRelative);
      const info = parseWarmup(warmupAbsolute);
      write(warmupRelative, buildWarmupHtml(roleKey, dayId, info, KINDS[`${roleKey}/${dayId}`]));
      warmupFiles.push(warmupRelative);
    }
  }

  write("downloads/guide-resources/backoffice/M06-D01/examples/m06-d01-backoffice-character-sheet.html", buildCharacterSheet("backoffice"));
  write("downloads/guide-resources/marketing/M06-D01/examples/m06-d01-marketing-character-sheet.html", buildCharacterSheet("marketing"));

  const linkUpdate = updateGuideLinks();
  write("docs/review/guide-real-example-upgrade-2026-08-09.md", lines([
    "# 가이드 실사용 예시·Pages 직접 열기 개선 기록",
    "",
    `기준일: ${AS_OF}`,
    "",
    `- 실제 작성형 완성 예시 HTML: ${completeFiles.length}개`,
    `- 실제 사용형 AI 워밍업 HTML: ${warmupFiles.length}개`,
    "- 실제 이미지 기반 캐릭터 시트 HTML: 2개",
    "- HTML 예시는 GitHub Pages에서 브라우저로 직접 열고 파일별로 다운로드",
    "- 중복 브라우저 예시 ZIP은 생성하지 않음",
    `- 가이드·README 수정 파일: ${linkUpdate.changedFiles}개`,
    `- 이전 ZIP 링크를 직접 HTML 링크로 교체: ${linkUpdate.rewrittenZipLinks}건`,
    "- GPT Image 생성 원본: 8개, 모두 비식별 가상 장면이며 한글 설명은 HTML 레이어로 처리",
    "- 외부 런타임·외부 링크·API 키·실제 개인정보 없음",
  ]));

  console.log(JSON.stringify({
    completeExamples: completeFiles.length,
    warmupExamples: warmupFiles.length,
    characterSheets: 2,
    browserPackages: 0,
    guideLinkUpdate: linkUpdate,
  }, null, 2));
}

main();
