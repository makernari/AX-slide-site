import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const AS_OF = "2026-08-08";
const BASE_URL = "https://raw.githubusercontent.com/makernari/AX-slide-site/main/";
const RESOURCE_URL = "https://makernari.github.io/AX-slide-site/";
const GUIDE_MARKER_START = "<!-- INSTRUCTOR-BEGINNER-RUNBOOK-20260808:START -->";
const GUIDE_MARKER_END = "<!-- INSTRUCTOR-BEGINNER-RUNBOOK-20260808:END -->";
const README_MARKER_START = "<!-- INSTRUCTOR-HTML-EXAMPLE-20260808:START -->";
const README_MARKER_END = "<!-- INSTRUCTOR-HTML-EXAMPLE-20260808:END -->";
const lines = (items) => items.join("\n");

const roles = {
  backoffice: {
    label: "경영지원",
    course: "스마트 경영지원",
    accent: "#155EEF",
    dark: "#0B3B8F",
    soft: "#EAF2FF",
    verify: "원문 근거·담당 역할·기한·수치·규정·개인정보·승인 책임",
    avoid: "마케팅 캠페인·브랜드 카피·채널 성과 사례",
  },
  marketing: {
    label: "마케팅",
    course: "마케팅·SNS 콘텐츠 기획·브랜딩",
    accent: "#C2410C",
    dark: "#8A2D0B",
    soft: "#FFF1E8",
    verify: "브랜드 사실·타깃·채널 맥락·과장 표현·저작권·검토 상태",
    avoid: "회의 담당자·내부 승인·시설 운영 사례",
  },
};

const focusFallbacks = {
  backoffice: {
    "M05-D01": "반복 경영지원 업무 발견·안전한 실습환경·15일 목표",
  },
  marketing: {
    "M05-D01": "목표·대상·채널·검증 책임과 15일 마케팅 목표",
  },
};

const moduleTips = {
  M05: [
    "기능 이름보다 입력–첫 결과–사람의 수정–저장 위치를 큰 소리로 설명합니다.",
    "프롬프트를 한 번에 길게 읽지 말고 역할, 입력, 조건, 출력 형식을 손가락으로 짚어 나눕니다.",
    "AI 문장이 자연스러워도 근거가 없으면 완성으로 처리하지 않습니다.",
  ],
  M06: [
    "생성 결과가 사람마다 달라도 같은 평가 기준으로 비교하면 정상이라고 먼저 안내합니다.",
    "생성 전에 목적·대상·비율·텍스트·권리 조건을 화면 한쪽에 고정합니다.",
    "이미지·영상이 생성되지 않으면 기다리게 하지 말고 제공 예시의 선택·검수 활동으로 즉시 전환합니다.",
  ],
  M07: [
    "자동화는 한 행 또는 한 건의 가상 입력으로 시험한 뒤 범위를 넓힙니다.",
    "입력 열–처리 단계–출력 위치를 같은 색이나 번호로 연결해 보여 줍니다.",
    "오류가 나면 재실행부터 하지 말고 마지막 정상 단계와 입력값을 먼저 확인합니다.",
  ],
  M08: [
    "앱·RAG·에이전트는 요구사항과 완료 조건을 먼저 보여 준 뒤 실행합니다.",
    "읽기·초안·승인·쓰기의 경계를 소리 내어 말하고, 삭제·발송·공개 게시는 실습 범위에서 제외합니다.",
    "정상 입력만 보여 주지 말고 빈 값·모호함·근거 없음·지시문 입력을 한 건씩 시험합니다.",
  ],
  M09: [
    "수업 설계 설명보다 먼저 120분 후 완성 상태와 평가표를 보여 줍니다.",
    "10–20–25–45–20의 합계를 수강생과 함께 계산하고, 실습 45분을 먼저 확보합니다.",
    "피드백은 좋다/나쁘다가 아니라 정합성·범위·시간·완료 기준에 맞춰 받게 합니다.",
  ],
};

const visualKinds = {
  "M05-D01": "cards",
  "M05-D02": "transcript",
  "M05-D03": "notebook",
  "M05-D04": "document",
  "M06-D01": "poster",
  "M06-D02": "video",
  "M06-D03": "research",
  "M07-D01": "form",
  "M07-D02": "workflow",
  "M07-D03": "chart",
  "M08-D01": "app",
  "M08-D02": "code",
  "M08-D03": "rag",
  "M08-D04": "agent",
  "M09-D01": "lesson",
};

function write(relativePath, content) {
  const destination = path.join(ROOT, relativePath);
  fs.mkdirSync(path.dirname(destination), { recursive: true });
  fs.writeFileSync(destination, String(content).trim() + "\n", "utf8");
}

function escapeHtml(value) {
  return String(value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll("\"", "&quot;");
}

function short(value, max = 54) {
  const text = String(value).replace(/\s+/g, " ").trim();
  return text.length <= max ? text : text.slice(0, max - 1).trimEnd() + "…";
}

function parseGuide(file, roleKey) {
  const text = fs.readFileSync(file, "utf8");
  const dayId = path.basename(file, ".md");
  const titleMatch = text.match(/^#\s+(.+)$/m);
  const requiredMatch = text.match(/^> 필수 결과물:\s*(.+)$/m);
  const resourceMatch = text.match(/^> 실습자료 위치:\s*(.+)$/m);
  const focusMatch = text.match(/교육 초점은\s*\*\*([^*]+)\*\*/);
  const tableRegex = /^\| ([1-4])차시 \| ([^|]+) \| ([^|]+) \| ([^|]+) \| ([^|]+) \| ([^|]+) \| ([^|]+) \|$/gm;
  const sessions = [...text.matchAll(tableRegex)].map((match) => ({
    number: Number(match[1]),
    time: match[2].trim(),
    slides: match[3].trim(),
    instructor: match[4].trim(),
    learner: match[5].trim(),
    output: match[6].trim(),
    checkpoint: match[7].trim(),
  }));
  if (!titleMatch || !requiredMatch || sessions.length !== 4) {
    throw new Error("Guide structure is incomplete: " + path.relative(ROOT, file));
  }
  return {
    file,
    text,
    dayId,
    module: dayId.slice(0, 3),
    title: titleMatch[1].trim(),
    focus: focusMatch
      ? focusMatch[1].trim()
      : (focusFallbacks[roleKey]?.[dayId] || titleMatch[1].replace(/^\[[^\]]+\]\s*/, "").trim()),
    required: requiredMatch[1].trim(),
    resource: resourceMatch ? resourceMatch[1].replaceAll(String.fromCharCode(96), "").trim() : "확인 필요",
    roleKey,
    role: roles[roleKey],
    sessions,
  };
}

function visualSvg(kind, role, session) {
  const a = role.accent;
  const d = role.dark;
  const s = role.soft;
  const label = escapeHtml(short(session.output, 24));
  const head = "<svg viewBox=\"0 0 560 315\" role=\"img\" aria-label=\"" + label + " 시각 예시\" xmlns=\"http://www.w3.org/2000/svg\">" +
    "<rect width=\"560\" height=\"315\" rx=\"24\" fill=\"#F7F9FC\"/><rect x=\"22\" y=\"20\" width=\"516\" height=\"275\" rx=\"20\" fill=\"#FFFFFF\" stroke=\"#D7E1EF\" stroke-width=\"2\"/>" +
    "<rect x=\"22\" y=\"20\" width=\"516\" height=\"46\" rx=\"20\" fill=\"" + d + "\"/><circle cx=\"48\" cy=\"43\" r=\"6\" fill=\"#FF6B57\"/><circle cx=\"68\" cy=\"43\" r=\"6\" fill=\"#FBBF24\"/><circle cx=\"88\" cy=\"43\" r=\"6\" fill=\"#22C55E\"/>";
  const title = "<text x=\"512\" y=\"50\" text-anchor=\"end\" font-family=\"Arial,'Noto Sans KR',sans-serif\" font-size=\"16\" font-weight=\"700\" fill=\"#FFFFFF\">" + label + "</text>";
  const end = "</svg>";
  const txt = (x, y, value, size = 17, weight = 650, fill = "#172B4D", anchor = "start") =>
    "<text x=\"" + x + "\" y=\"" + y + "\" text-anchor=\"" + anchor + "\" font-family=\"Arial,'Noto Sans KR',sans-serif\" font-size=\"" + size + "\" font-weight=\"" + weight + "\" fill=\"" + fill + "\">" + escapeHtml(value) + "</text>";
  let body = "";

  if (kind === "cards") {
    body = [0, 1, 2].map((i) => "<rect x=\"" + (48 + i * 158) + "\" y=\"92\" width=\"134\" height=\"112\" rx=\"16\" fill=\"" + (i === 0 ? s : "#F7F9FC") + "\" stroke=\"" + a + "\"/>" + txt(115 + i * 158, 130, "후보 " + (i + 1), 18, 750, d, "middle") + "<rect x=\"" + (67 + i * 158) + "\" y=\"151\" width=\"96\" height=\"10\" rx=\"5\" fill=\"#D7E1EF\"/><rect x=\"" + (67 + i * 158) + "\" y=\"174\" width=\"" + (50 + i * 18) + "\" height=\"10\" rx=\"5\" fill=\"" + a + "\"/>").join("") +
      txt(48, 246, "선택 근거", 17, 750, d) + "<line x1=\"136\" y1=\"241\" x2=\"505\" y2=\"241\" stroke=\"#B7C5DA\" stroke-width=\"2\"/>" + txt(48, 275, "저장 · 재탐색 · 사람 검토", 16, 650, "#52627A");
  } else if (kind === "transcript") {
    body = "<rect x=\"48\" y=\"88\" width=\"206\" height=\"174\" rx=\"16\" fill=\"" + s + "\"/>" + txt(66, 116, "원문", 18, 750, d) +
      [0, 1, 2, 3, 4].map((i) => "<rect x=\"66\" y=\"" + (135 + i * 22) + "\" width=\"" + (145 - i * 9) + "\" height=\"8\" rx=\"4\" fill=\"#9DB4D5\"/>").join("") +
      "<path d=\"M272 172 H310\" stroke=\"" + a + "\" stroke-width=\"8\" stroke-linecap=\"round\"/><path d=\"M302 160 L316 172 L302 184\" fill=\"none\" stroke=\"" + a + "\" stroke-width=\"6\"/>" +
      "<rect x=\"330\" y=\"88\" width=\"180\" height=\"174\" rx=\"16\" fill=\"#FFFFFF\" stroke=\"" + a + "\" stroke-width=\"2\"/>" + txt(348, 116, "검증 결과", 18, 750, d) +
      [0, 1, 2, 3].map((i) => "<circle cx=\"352\" cy=\"" + (145 + i * 27) + "\" r=\"8\" fill=\"" + (i === 2 ? "#F59E0B" : a) + "\"/><rect x=\"370\" y=\"" + (140 + i * 27) + "\" width=\"" + (110 - i * 7) + "\" height=\"9\" rx=\"4\" fill=\"#D7E1EF\"/>").join("");
  } else if (kind === "notebook") {
    body = "<rect x=\"46\" y=\"86\" width=\"150\" height=\"180\" rx=\"14\" fill=\"" + s + "\"/>" + txt(64, 114, "출처", 18, 750, d) +
      [0, 1, 2, 3].map((i) => "<rect x=\"64\" y=\"" + (132 + i * 28) + "\" width=\"112\" height=\"18\" rx=\"7\" fill=\"#FFFFFF\" stroke=\"#C8D5E7\"/>").join("") +
      "<circle cx=\"337\" cy=\"170\" r=\"43\" fill=\"" + a + "\"/>" + txt(337, 176, "핵심", 17, 750, "#FFFFFF", "middle") +
      [[260,112],[427,112],[260,230],[427,230]].map((p,i) => "<line x1=\"337\" y1=\"170\" x2=\"" + p[0] + "\" y2=\"" + p[1] + "\" stroke=\"#91A6C5\" stroke-width=\"3\"/><rect x=\"" + (p[0]-44) + "\" y=\"" + (p[1]-20) + "\" width=\"88\" height=\"40\" rx=\"12\" fill=\"" + (i % 2 ? "#FFF1E8" : s) + "\" stroke=\"" + a + "\"/>" + txt(p[0], p[1]+6, "노트 " + (i+1), 14, 700, d, "middle")).join("");
  } else if (kind === "document") {
    body = "<rect x=\"54\" y=\"84\" width=\"266\" height=\"188\" rx=\"12\" fill=\"#FFFFFF\" stroke=\"" + a + "\" stroke-width=\"2\"/>" + txt(76, 116, "한 페이지 결과", 19, 750, d) +
      "<rect x=\"76\" y=\"134\" width=\"218\" height=\"14\" rx=\"7\" fill=\"" + a + "\" opacity=\"0.85\"/>" +
      [0,1,2,3].map((i)=>"<rect x=\"76\" y=\"" + (165+i*22) + "\" width=\"" + (205-i*18) + "\" height=\"8\" rx=\"4\" fill=\"#D7E1EF\"/>").join("") +
      "<rect x=\"344\" y=\"84\" width=\"162\" height=\"82\" rx=\"14\" fill=\"" + s + "\"/>" + txt(425, 116, "비교", 18, 750, d, "middle") +
      "<rect x=\"365\" y=\"132\" width=\"120\" height=\"9\" rx=\"4\" fill=\"" + a + "\"/>" +
      "<rect x=\"344\" y=\"184\" width=\"162\" height=\"88\" rx=\"14\" fill=\"#FFF1E8\"/>" + txt(425, 217, "검증", 18, 750, "#9A3412", "middle") +
      "<circle cx=\"380\" cy=\"241\" r=\"10\" fill=\"#22C55E\"/>" + "<rect x=\"398\" y=\"236\" width=\"70\" height=\"9\" rx=\"4\" fill=\"#D7E1EF\"/>";
  } else if (kind === "poster") {
    body = "<rect x=\"54\" y=\"82\" width=\"190\" height=\"194\" rx=\"14\" fill=\"" + d + "\"/>" + "<circle cx=\"149\" cy=\"141\" r=\"48\" fill=\"" + a + "\"/>" + txt(149, 146, "VISUAL", 18, 800, "#FFFFFF", "middle") + "<rect x=\"78\" y=\"207\" width=\"142\" height=\"12\" rx=\"6\" fill=\"#FFFFFF\"/><rect x=\"96\" y=\"231\" width=\"106\" height=\"9\" rx=\"5\" fill=\"#FFFFFF\" opacity=\"0.7\"/>" +
      [0,1,2].map((i)=>"<rect x=\"278\" y=\"" + (84+i*64) + "\" width=\"226\" height=\"48\" rx=\"12\" fill=\"" + (i===1?s:"#F7F9FC") + "\" stroke=\"#CAD6E8\"/><rect x=\"292\" y=\"" + (96+i*64) + "\" width=\"62\" height=\"24\" rx=\"7\" fill=\"" + a + "\" opacity=\"" + (0.9-i*0.18) + "\"/>" + txt(370,111+i*64,"장면 "+(i+1),15,700,d)).join("");
  } else if (kind === "video") {
    body = "<rect x=\"58\" y=\"82\" width=\"142\" height=\"198\" rx=\"24\" fill=\"#0B1F44\"/><rect x=\"72\" y=\"104\" width=\"114\" height=\"136\" rx=\"10\" fill=\"" + s + "\"/><circle cx=\"129\" cy=\"172\" r=\"31\" fill=\"" + a + "\"/><path d=\"M122 157 L147 172 L122 187 Z\" fill=\"#FFFFFF\"/><rect x=\"92\" y=\"253\" width=\"74\" height=\"7\" rx=\"4\" fill=\"#FFFFFF\"/>" +
      "<rect x=\"234\" y=\"88\" width=\"272\" height=\"70\" rx=\"14\" fill=\"#FFFFFF\" stroke=\"#CAD6E8\"/>" + txt(252,116,"스크립트",16,750,d) + "<rect x=\"252\" y=\"130\" width=\"224\" height=\"8\" rx=\"4\" fill=\"#D7E1EF\"/>" +
      "<rect x=\"234\" y=\"174\" width=\"272\" height=\"44\" rx=\"12\" fill=\"" + s + "\"/>" + txt(252,202,"자막 · 타이밍",16,700,d) +
      "<rect x=\"234\" y=\"234\" width=\"272\" height=\"42\" rx=\"12\" fill=\"#ECFDF3\"/>" + "<circle cx=\"258\" cy=\"255\" r=\"10\" fill=\"#22C55E\"/>" + txt(280,261,"권리 확인 완료",15,700,"#166534");
  } else if (kind === "research") {
    body = "<rect x=\"48\" y=\"86\" width=\"464\" height=\"46\" rx=\"15\" fill=\"" + s + "\" stroke=\"" + a + "\"/><circle cx=\"74\" cy=\"109\" r=\"10\" fill=\"" + a + "\"/><rect x=\"96\" y=\"103\" width=\"260\" height=\"11\" rx=\"5\" fill=\"#B7C7DE\"/>" +
      [0,1,2].map((i)=>"<rect x=\"48\" y=\"" + (150+i*40) + "\" width=\"280\" height=\"28\" rx=\"9\" fill=\"#FFFFFF\" stroke=\"#D7E1EF\"/><circle cx=\"68\" cy=\"" + (164+i*40) + "\" r=\"7\" fill=\"" + (i===0?a:"#9AAAC0") + "\"/><rect x=\"84\" y=\"" + (159+i*40) + "\" width=\"" + (180-i*18) + "\" height=\"9\" rx=\"4\" fill=\"#D7E1EF\"/>").join("") +
      "<rect x=\"356\" y=\"150\" width=\"156\" height=\"108\" rx=\"14\" fill=\"#FFFFFF\" stroke=\"" + a + "\"/>" + txt(434,180,"근거 보고서",17,750,d,"middle") + "<rect x=\"378\" y=\"198\" width=\"112\" height=\"9\" rx=\"4\" fill=\"" + a + "\"/><rect x=\"378\" y=\"220\" width=\"90\" height=\"8\" rx=\"4\" fill=\"#D7E1EF\"/>";
  } else if (kind === "form") {
    body = "<rect x=\"48\" y=\"84\" width=\"190\" height=\"188\" rx=\"14\" fill=\"" + s + "\"/>" + txt(66,112,"입력 폼",18,750,d) +
      [0,1,2].map((i)=>"<rect x=\"66\" y=\"" + (132+i*42) + "\" width=\"152\" height=\"28\" rx=\"8\" fill=\"#FFFFFF\" stroke=\"#C7D4E6\"/>").join("") +
      "<path d=\"M252 178 H290\" stroke=\"" + a + "\" stroke-width=\"8\"/><path d=\"M282 166 L296 178 L282 190\" fill=\"none\" stroke=\"" + a + "\" stroke-width=\"5\"/>" +
      "<rect x=\"314\" y=\"84\" width=\"198\" height=\"188\" rx=\"14\" fill=\"#FFFFFF\" stroke=\"#C7D4E6\"/>" + txt(332,112,"응답·결과",18,750,d) +
      [0,1,2,3].map((i)=>"<line x1=\"332\" y1=\"" + (139+i*29) + "\" x2=\"492\" y2=\"" + (139+i*29) + "\" stroke=\"#D7E1EF\"/><rect x=\"342\" y=\"" + (148+i*29) + "\" width=\"" + (70+i*13) + "\" height=\"9\" rx=\"4\" fill=\"" + (i===2?a:"#9EB0C8") + "\"/>").join("");
  } else if (kind === "workflow") {
    body = [[86,150,"입력"],[220,100,"변환"],[220,205,"검증"],[376,150,"저장"]].map((n,i)=>"<rect x=\"" + n[0] + "\" y=\"" + n[1] + "\" width=\"104\" height=\"54\" rx=\"16\" fill=\"" + (i===2?"#FFF1E8":s) + "\" stroke=\"" + a + "\" stroke-width=\"2\"/>" + txt(n[0]+52,n[1]+34,n[2],16,750,d,"middle")).join("") +
      "<path d=\"M190 177 H210 M272 154 V163 M272 205 V195 M324 177 H366\" fill=\"none\" stroke=\"#8FA6C7\" stroke-width=\"6\" stroke-linecap=\"round\"/>" +
      "<rect x=\"86\" y=\"244\" width=\"394\" height=\"28\" rx=\"10\" fill=\"#0B1F44\"/>" + txt(283,264,"실행 로그 · 오류 위치 · 재시험",14,650,"#FFFFFF","middle");
  } else if (kind === "chart") {
    body = "<line x1=\"70\" y1=\"246\" x2=\"310\" y2=\"246\" stroke=\"#8395AF\" stroke-width=\"3\"/><line x1=\"70\" y1=\"100\" x2=\"70\" y2=\"246\" stroke=\"#8395AF\" stroke-width=\"3\"/>" +
      [0,1,2,3].map((i)=>"<rect x=\"" + (92+i*50) + "\" y=\"" + (205-i*27) + "\" width=\"30\" height=\"" + (41+i*27) + "\" rx=\"6\" fill=\"" + a + "\" opacity=\"" + (0.55+i*0.13) + "\"/>").join("") +
      "<polyline points=\"92,195 142,171 192,182 242,126 292,111\" fill=\"none\" stroke=\"#F97316\" stroke-width=\"5\"/>" +
      "<rect x=\"340\" y=\"92\" width=\"172\" height=\"166\" rx=\"14\" fill=\"#FFFFFF\" stroke=\"#CAD6E8\"/>" + txt(358,122,"1페이지 해석",17,750,d) + [0,1,2,3].map((i)=>"<rect x=\"358\" y=\"" + (143+i*24) + "\" width=\"" + (128-i*11) + "\" height=\"8\" rx=\"4\" fill=\"" + (i===1?a:"#D7E1EF") + "\"/>").join("");
  } else if (kind === "app") {
    body = "<rect x=\"48\" y=\"84\" width=\"464\" height=\"188\" rx=\"14\" fill=\"#FFFFFF\" stroke=\"#CAD6E8\"/>" + "<rect x=\"48\" y=\"84\" width=\"464\" height=\"36\" rx=\"14\" fill=\"" + s + "\"/>" +
      "<rect x=\"70\" y=\"141\" width=\"184\" height=\"34\" rx=\"9\" fill=\"#F7F9FC\" stroke=\"#CAD6E8\"/><rect x=\"70\" y=\"190\" width=\"184\" height=\"48\" rx=\"9\" fill=\"#F7F9FC\" stroke=\"#CAD6E8\"/><rect x=\"70\" y=\"247\" width=\"84\" height=\"13\" rx=\"6\" fill=\"" + a + "\"/>" +
      "<rect x=\"286\" y=\"141\" width=\"202\" height=\"119\" rx=\"13\" fill=\"" + s + "\"/>" + txt(387,174,"결과 미리보기",17,750,d,"middle") + "<circle cx=\"387\" cy=\"212\" r=\"22\" fill=\"" + a + "\"/>" + txt(387,219,"✓",22,800,"#FFFFFF","middle");
  } else if (kind === "code") {
    body = "<rect x=\"48\" y=\"84\" width=\"286\" height=\"188\" rx=\"14\" fill=\"#0F172A\"/>" + [0,1,2,3,4,5].map((i)=>"<rect x=\"68\" y=\"" + (106+i*24) + "\" width=\"" + (115+(i%3)*42) + "\" height=\"8\" rx=\"4\" fill=\"" + (i===2?"#38BDF8":"#64748B") + "\"/>").join("") +
      "<rect x=\"354\" y=\"84\" width=\"158\" height=\"86\" rx=\"14\" fill=\"#ECFDF3\"/>" + txt(433,116,"TEST PASS",17,800,"#166534","middle") + txt(433,145,"정상 · 경계",14,650,"#166534","middle") +
      "<rect x=\"354\" y=\"188\" width=\"158\" height=\"84\" rx=\"14\" fill=\"" + s + "\"/>" + txt(433,220,"변경 보고",17,800,d,"middle") + txt(433,248,"파일 · 이유",14,650,d,"middle");
  } else if (kind === "rag") {
    body = [0,1,2].map((i)=>"<rect x=\"48\" y=\"" + (90+i*52) + "\" width=\"144\" height=\"36\" rx=\"10\" fill=\"" + (i===1?s:"#F7F9FC") + "\" stroke=\"#CAD6E8\"/>" + txt(120,113+i*52,"문서 "+(i+1),15,700,d,"middle")).join("") +
      "<path d=\"M208 170 H260\" stroke=\"" + a + "\" stroke-width=\"7\"/>" + "<circle cx=\"288\" cy=\"170\" r=\"30\" fill=\"" + a + "\"/>" + txt(288,176,"검색",15,750,"#FFFFFF","middle") +
      "<path d=\"M318 170 H354\" stroke=\"" + a + "\" stroke-width=\"7\"/>" +
      "<rect x=\"370\" y=\"90\" width=\"142\" height=\"160\" rx=\"14\" fill=\"#FFFFFF\" stroke=\"" + a + "\"/>" + txt(441,119,"근거 답변",17,750,d,"middle") + [0,1,2].map((i)=>"<rect x=\"390\" y=\"" + (140+i*25) + "\" width=\"" + (104-i*15) + "\" height=\"8\" rx=\"4\" fill=\"#D7E1EF\"/>").join("") + "<rect x=\"390\" y=\"222\" width=\"72\" height=\"16\" rx=\"8\" fill=\"" + s + "\"/>";
  } else if (kind === "agent") {
    body = "<rect x=\"52\" y=\"132\" width=\"100\" height=\"56\" rx=\"16\" fill=\"" + s + "\" stroke=\"" + a + "\"/>" + txt(102,166,"읽기",16,750,d,"middle") +
      "<rect x=\"194\" y=\"132\" width=\"100\" height=\"56\" rx=\"16\" fill=\"" + s + "\" stroke=\"" + a + "\"/>" + txt(244,166,"초안",16,750,d,"middle") +
      "<path d=\"M336 160 L386 112 L436 160 L386 208 Z\" fill=\"#FFF1E8\" stroke=\"#F97316\" stroke-width=\"2\"/>" + txt(386,166,"사람 승인",15,750,"#9A3412","middle") +
      "<rect x=\"458\" y=\"132\" width=\"76\" height=\"56\" rx=\"16\" fill=\"#ECFDF3\" stroke=\"#22C55E\"/>" + txt(496,166,"기록",16,750,"#166534","middle") +
      "<path d=\"M152 160 H184 M294 160 H328 M436 160 H450\" stroke=\"#8FA6C7\" stroke-width=\"6\"/>" +
      "<rect x=\"74\" y=\"230\" width=\"430\" height=\"34\" rx=\"11\" fill=\"#0B1F44\"/>" + txt(289,252,"승인 없는 발송·게시·삭제 없음",14,650,"#FFFFFF","middle");
  } else {
    body = [0,1,2,3,4].map((i)=>"<rect x=\"" + (42+i*100) + "\" y=\"112\" width=\"82\" height=\"74\" rx=\"14\" fill=\"" + (i===3?s:"#F7F9FC") + "\" stroke=\"" + a + "\"/>" + txt(83+i*100,143,String(i+1),18,800,d,"middle") + txt(83+i*100,168,["문제","목표","시연","실습","피드백"][i],13,700,d,"middle")).join("") +
      "<rect x=\"58\" y=\"222\" width=\"444\" height=\"42\" rx=\"12\" fill=\"#0B1F44\"/>" + txt(280,249,"10 + 20 + 25 + 45 + 20 = 120분",16,750,"#FFFFFF","middle");
  }
  return head + title + body + end;
}

function buildExampleHtml(guide) {
  const kind = visualKinds[guide.dayId] || "lesson";
  const role = guide.role;
  const cards = guide.sessions.map((session) => lines([
    "<article class=\"session-card\">",
    "  <div class=\"visual\">" + visualSvg(kind, role, session) + "</div>",
    "  <div class=\"session-copy\">",
    "    <div class=\"session-top\"><span class=\"session-badge\">" + session.number + "차시</span><span class=\"status\">완성 예시</span></div>",
    "    <h2>" + escapeHtml(short(session.output, 42)) + "</h2>",
    "    <p class=\"activity\"><strong>학습자 수행</strong> " + escapeHtml(short(session.learner, 92)) + "</p>",
    "    <p class=\"check\"><strong>확인</strong> " + escapeHtml(short(session.checkpoint, 62)) + "</p>",
    "  </div>",
    "</article>",
  ])).join("\n");
  return lines([
    "<!doctype html>",
    "<html lang=\"ko\">",
    "<head>",
    "  <meta charset=\"utf-8\">",
    "  <meta name=\"viewport\" content=\"width=device-width,initial-scale=1\">",
    "  <title>" + escapeHtml(guide.dayId + " · " + guide.focus + " · 완성 결과 예시") + "</title>",
    "  <style>",
    "    :root{font-family:Arial,'Noto Sans KR',system-ui,sans-serif;color:#172b4d;background:#eef3f9;--accent:" + role.accent + ";--dark:" + role.dark + ";--soft:" + role.soft + "}",
    "    *{box-sizing:border-box}body{margin:0;min-width:320px}.page{width:min(1540px,100%);min-height:100vh;margin:0 auto;padding:22px}",
    "    header{height:126px;border-radius:26px;background:var(--dark);color:#fff;padding:23px 32px;display:flex;align-items:center;justify-content:space-between;gap:24px;box-shadow:0 14px 38px #10244724}",
    "    .eyebrow{font-size:15px;font-weight:800;letter-spacing:.08em;color:#d8e5ff;margin:0 0 7px}.title{font-size:34px;line-height:1.15;margin:0}.header-meta{text-align:right;min-width:260px}.role{display:inline-block;padding:8px 16px;border-radius:999px;background:#fff;color:var(--dark);font-weight:800}.date{font-size:14px;color:#d8e5ff;margin:10px 0 0}",
    "    .summary{height:78px;margin:14px 0;border-radius:20px;background:#fff;border:2px solid #d7e1ef;padding:14px 22px;display:grid;grid-template-columns:120px 1fr 310px;align-items:center;gap:18px}.summary strong{color:var(--accent)}.required{font-size:15px;line-height:1.35}.notice{font-size:13px;color:#52627a;text-align:right}",
    "    .grid{display:grid;grid-template-columns:1fr 1fr;grid-template-rows:repeat(2,minmax(0,1fr));gap:14px;height:620px}.session-card{background:#fff;border:2px solid #d7e1ef;border-radius:22px;padding:13px;display:grid;grid-template-columns:43% 57%;gap:15px;overflow:hidden}.visual{display:flex;align-items:center}.visual svg{width:100%;height:auto;display:block}.session-copy{padding:5px 8px 5px 0;min-width:0}.session-top{display:flex;justify-content:space-between;align-items:center}.session-badge{display:inline-flex;background:var(--accent);color:#fff;border-radius:999px;padding:7px 12px;font-size:14px;font-weight:800}.status{color:#166534;background:#ecfdf3;border-radius:999px;padding:6px 10px;font-size:12px;font-weight:750}.session-copy h2{font-size:21px;line-height:1.25;margin:13px 0 12px;color:#0b1f44}.session-copy p{font-size:14px;line-height:1.48;margin:8px 0}.session-copy strong{display:inline-block;color:var(--dark);margin-right:6px}.check{padding:10px 12px;border-radius:12px;background:var(--soft)}",
    "    @media(max-width:760px){.page{padding:12px}header{height:auto;min-height:150px;align-items:flex-start;flex-direction:column}.title{font-size:26px}.header-meta{text-align:left}.summary{height:auto;grid-template-columns:1fr}.notice{text-align:left}.grid{height:auto;grid-template-columns:1fr;grid-template-rows:none}.session-card{grid-template-columns:1fr}.session-copy{padding:4px}.visual svg{max-height:260px}}",
    "    @media print{body{background:#fff}.page{padding:0}header{box-shadow:none}.session-card{break-inside:avoid}}",
    "  </style>",
    "</head>",
    "<body data-example-ready=\"true\">",
    "  <main class=\"page\">",
    "    <header>",
    "      <div><p class=\"eyebrow\">INSTRUCTOR COMPLETE EXAMPLE · " + escapeHtml(guide.dayId) + "</p><h1 class=\"title\">" + escapeHtml(short(guide.focus, 64)) + "</h1></div>",
    "      <div class=\"header-meta\"><span class=\"role\">" + escapeHtml(role.course) + "</span><p class=\"date\">교육용 가상 완성 화면 · " + AS_OF + "</p></div>",
    "    </header>",
    "    <section class=\"summary\" aria-label=\"완성 결과 요약\"><strong>최종 결과물</strong><div class=\"required\">" + escapeHtml(guide.required) + "</div><div class=\"notice\">실제 서비스 화면이 아닌 강의용 디자인 예시<br>문구보다 구조·근거·완료 상태를 확인하세요.</div></section>",
    "    <section class=\"grid\" aria-label=\"차시별 완성 예시\">",
    cards,
    "    </section>",
    "  </main>",
    "  <script>document.documentElement.dataset.exampleReady = \"true\";</script>",
    "</body>",
    "</html>",
  ]);
}

function sessionRunCard(guide, session) {
  const role = guide.role;
  const extensions = [
    "같은 직무 원자료에서 입력 조건 하나만 바꾼 경계 사례를 만들고 예상 결과와 근거를 적습니다.",
    "정상 결과에 의도적 오류 하나를 넣고 동료가 " + session.checkpoint + " 기준으로 찾게 합니다.",
    "현재 결과물을 다른 숙련도 대상에게 설명할 때 유지할 것과 바꿀 것을 두 열로 비교합니다.",
    "완성 결과를 90초 동안 동료에게 가르치고 받은 질문 한 건을 수정 기록에 반영합니다.",
  ];
  return lines([
    "##### " + session.number + "차시 · " + session.output,
    "",
    "- 교안 범위: " + session.slides,
    "- 수강생이 하는 일: " + session.learner,
    "- 차시 완료 상태: 결과물 저장 완료 — " + session.output + " / 검수 기록 완료 — **" + session.checkpoint + "**",
    "",
    "강사가 그대로 읽어도 되는 시작 멘트:",
    "",
    "> “이번 50분의 결과는 ‘" + session.output + "’입니다. 화면을 따라 누르는 것보다 확인 기준 ‘" + session.checkpoint + "’에 맞춰 검수 기록을 남기면 완료입니다. 막히면 새 계정을 만들지 말고 제공된 샘플과 템플릿으로 같은 결과를 만들겠습니다.”",
    "",
    "| 시간 | 강사가 할 일 | 수강생이 할 일 | 멈춤·확인 신호 |",
    "|---|---|---|---|",
    "| 0~5분 | 완성 예시 HTML에서 이번 차시 카드만 보여 주고 결과물 이름을 읽는다. | 완료 상태를 자신의 말로 한 문장 적는다. | 무엇을 제출하는지 한 명이 말할 수 있음 |",
    "| 5~12분 | " + session.instructor + "의 핵심 기준만 설명한다. 메뉴 탐색은 하지 않는다. | 시작 파일에서 입력·금지 정보·저장 위치를 표시한다. | 실제 정보 대신 교육용 가상 자료 사용 확인 |",
    "| 12~22분 | 샘플 첫 행으로 입력→수행→결과→검증을 천천히 시연하고 각 클릭·판단 이유를 말한다. | 시연을 따라 하되 결과 옆에 근거 또는 확인 필요를 적는다. | 강사와 같은 최소 결과 1건 |",
    "| 22~35분 | 한 단계를 말하고 기다린 뒤 전체 진행률을 빨강·노랑·초록으로 확인한다. | 다음 활동을 단계별로 수행한다: " + session.learner + " | 절반 이상이 핵심 결과 구조를 만듦 |",
    "| 35~43분 | 개별 질문은 현재 단계·입력·예상 결과 세 가지만 묻고 직접 대신 조작하지 않는다. | 남은 샘플 또는 자신의 가상 입력으로 독립 수행한다. | " + session.output + " 초안 존재 |",
    "| 43~47분 | " + session.checkpoint + " 기준으로 짝 검수를 안내한다. | 결과와 원자료를 나란히 보고 오류·누락 한 건을 수정한다. | 수정 이유가 기록됨 |",
    "| 47~49분 | 미완료자는 최소 완주 경로로 전환하고 빠른 학습자는 아래 확장 실습을 시작시킨다. | 최소 결과 또는 확장 결과를 마무리한다. | 모든 사람이 제출 가능한 파일을 가짐 |",
    "| 49~50분 | 저장 위치와 다음 차시 입력을 화면에 고정해 읽는다. | 파일을 닫았다 다시 찾고 완료 상태를 표시한다. | 재탐색 성공 |",
    "",
    "막힌 수강생 3분 복구:",
    "",
    "1. “지금 몇 단계이며 어떤 입력을 넣었나요?”라고 묻습니다.",
    "2. 시작 파일·샘플 첫 행·빈 템플릿 중 하나만 다시 엽니다.",
    "3. 3분 안에 해결되지 않으면 도구 실행을 멈추고 템플릿에 예상 결과와 검증 근거를 적게 합니다.",
    "4. 최소 완료는 **" + session.output + "**의 기본 구조와 **" + session.checkpoint + "** 확인 기록입니다.",
    "",
    "빠른 학습자 추가 실습:",
    "",
    "- " + extensions[session.number - 1],
    "- 실제 자료·다른 과정 사례는 추가하지 않고 현재 " + role.label + " 가상 샘플만 사용합니다.",
    "- 확장 결과에도 " + role.verify + "를 표시해야 완료로 인정합니다.",
  ]);
}

function buildRunbook(guide, htmlRelative, imageRelative) {
  const role = guide.role;
  const tips = moduleTips[guide.module] || moduleTips.M09;
  const sessionSummary = guide.sessions.map((session) =>
    "| " + session.number + "차시 | " + session.output + " | " + session.checkpoint + " |"
  );
  const cards = guide.sessions.map((session) => sessionRunCard(guide, session));
  return lines([
    GUIDE_MARKER_START,
    "",
    "### 1-1. 초보 강사를 위한 ‘전원 완주’ 운영 매뉴얼",
    "",
    "> 이 보강 영역은 기존 상세 가이드의 요약본이 아니라 실제 수업 중 바로 읽고 사용할 수 있는 실행 순서입니다. 도구 화면이 달라도 결과물과 검증 기준을 유지합니다.",
    "",
    "#### 먼저 완성 결과를 보여 주세요",
    "",
    "![" + guide.dayId + " " + role.label + " 차시별 완성 결과 예시](" + BASE_URL + imageRelative + ")",
    "",
    "- [브라우저용 HTML 완성 예시 바로 보기](" + RESOURCE_URL + htmlRelative + ")",
    "- HTML 파일을 내려받아 더블클릭하면 설치 없이 브라우저에서 열립니다.",
    "- 이 화면은 실제 서비스 UI가 아니라 결과 구조·배치·완료 상태를 보여 주는 교육용 가상 디자인입니다.",
    "- 문구를 그대로 복사하게 하지 말고 자신의 결과에서 같은 구조와 검증 근거가 보이는지 확인하게 합니다.",
    "",
    "#### 오늘의 최소 완주 기준",
    "",
    "- 필수 결과물: " + guide.required,
    "- 실습자료 폴더: " + guide.resource,
    "- 오전·오후 혼선 방지: 현재 " + role.label + " 폴더만 배포하고 " + role.avoid + "는 사용하지 않습니다.",
    "- 사람의 최종 확인: " + role.verify,
    "",
    "| 차시 | 반드시 남아야 하는 결과 | 완료를 확인할 질문 |",
    "|---|---|---|",
    ...sessionSummary,
    "",
    "#### 수업 30분 전 준비",
    "",
    "- [ ] 강의교안에서 오늘 모듈·일자·1번 슬라이드를 열어 둠",
    "- [ ] 강사용 가이드, 수강생용 가이드, 시작 파일, 샘플, 빈 템플릿, HTML 완성 예시를 각각 한 번 열어 봄",
    "- [ ] 샘플 첫 행으로 1차시 최소 결과를 직접 만들어 저장·재탐색함",
    "- [ ] 실제 개인정보·기관 내부자료·고객자료·API 키가 화면과 최근 파일 목록에 보이지 않음",
    "- [ ] 네트워크·계정·권한이 없어도 사용할 문서형 대체 실습을 열어 둠",
    "- [ ] 타이머를 50분으로 맞추고 35분·43분·47분 알림을 준비함",
    "",
    "#### 처음 5분에 할 말",
    "",
    "> “오늘은 기능을 전부 익히는 시간이 아닙니다. 네 차시마다 작은 결과를 하나씩 남기고, 마지막에는 ‘왜 이 결과를 믿을 수 있는지’를 설명하면 완료입니다. 화면이 다르거나 계정이 없어도 준비된 가상 샘플과 템플릿으로 같은 결과를 만들 수 있으니, 혼자 막힌 상태로 기다리지 말고 현재 단계 색깔을 알려 주세요.”",
    "",
    "진행 상태는 세 가지만 사용합니다.",
    "",
    "- 🔴 빨강: 파일·계정·입력에서 막혀 결과가 아직 없음",
    "- 🟡 노랑: 결과는 있으나 근거·검증·저장 확인이 남음",
    "- 🟢 초록: 완료 기준을 충족하고 추가 실습 가능",
    "",
    "#### 강의용 핵심 팁",
    "",
    "- **결과 먼저:** 설명 전에 HTML 완성 예시에서 이번 차시 카드만 30초 보여 줍니다.",
    "- **한 번에 한 행동:** “파일 열기→입력 표시→실행→결과 대조→저장” 중 하나만 말한 뒤 기다립니다.",
    "- **I–We–You:** 강사 시연 1건, 모두 함께 1건, 수강생 독립 1건 순서로 진행합니다.",
    "- **질문을 작게:** “안 돼요”라고 하면 현재 단계, 사용한 입력, 기대한 결과만 묻습니다.",
    "- **시간을 지킴:** 43분부터 새 기능 설명을 멈추고 검증·수정·저장만 진행합니다.",
    "- **완료를 눈으로 확인:** 자연스러운 문장이나 예쁜 디자인보다 근거·오류 수정·재탐색을 확인합니다.",
    ...tips.map((tip) => "- " + tip),
    "",
    "#### 차시별 50분 운영카드",
    "",
    ...cards,
    "",
    "#### 여러 속도의 학습자를 동시에 운영하는 방법",
    "",
    "| 상태 | 강사의 첫 질문 | 바로 제공할 것 | 5분 뒤 목표 |",
    "|---|---|---|---|",
    "| 🔴 빨강 | 지금 단계와 마지막으로 보인 정상 화면은? | 샘플 첫 행·시작 파일·대체 템플릿 | 최소 결과 구조 1건 |",
    "| 🟡 노랑 | 결과의 근거와 확인 필요는 어디에 적었나요? | 검증 체크포인트와 완성 예시 | 오류 한 건 수정·저장 |",
    "| 🟢 초록 | 같은 기준이 실패하는 경계 입력은 무엇인가요? | 빠른 학습자 추가 실습 | 예상–실제–수정 기록 |",
    "",
    "강사는 빨강 학습자에게 먼저 가되 직접 대신 클릭하지 않습니다. 초록 학습자는 ‘보조 강사’가 아니라 검증 질문을 주고받는 동료 역할만 맡깁니다.",
    "",
    "#### 자주 쓰는 강의 멘트",
    "",
    "- 결과가 다를 때: “다른 결과가 나오는 것은 정상입니다. 지금은 같은 검증 기준을 통과하는지 보겠습니다.”",
    "- 메뉴가 다를 때: “비슷해 보이는 메뉴를 추측해 누르지 말고 현재 화면을 기록한 뒤 대체 실습으로 이동하겠습니다.”",
    "- AI가 사실을 만들 때: “문장이 자연스러운가가 아니라 입력에 근거가 있는가를 확인해 주세요.”",
    "- 시간이 부족할 때: “새 기능은 여기서 멈추고 지금 결과의 오류 수정과 저장을 완료하겠습니다.”",
    "- 빠른 학습자에게: “다른 사람 대신 해주지 말고, 실패할 입력 한 건과 판정 근거를 만들어 주세요.”",
    "",
    "#### 종료 전 10분 체크",
    "",
    "- [ ] 네 차시 결과가 모두 존재함",
    "- [ ] 각 결과에 입력 근거 또는 확인 필요가 표시됨",
    "- [ ] 오류·수정·재확인 기록이 최소 한 건 있음",
    "- [ ] 실제 개인정보·기관 내부자료·고객자료·자격증명 없음",
    "- [ ] 저장 위치·파일명·소유자·공유 범위를 확인함",
    "- [ ] 파일을 닫고 다시 찾아 열었음",
    "- [ ] 빠른 학습자의 확장 결과도 같은 직무 검증 기준을 통과함",
    "",
    GUIDE_MARKER_END,
  ]);
}

function replaceOrInsert(text, start, end, content, anchor) {
  const pattern = new RegExp(start + "[\\s\\S]*?" + end, "g");
  if (pattern.test(text)) return text.replace(pattern, content);
  const index = text.indexOf(anchor);
  if (index < 0) throw new Error("Insertion anchor missing: " + anchor);
  return text.slice(0, index).trimEnd() + "\n\n" + content + "\n\n" + text.slice(index);
}

function enhanceReadme(readmePath, htmlRelative, guide) {
  let text = fs.readFileSync(readmePath, "utf8");
  const block = lines([
    README_MARKER_START,
    "",
    "## 강사용 브라우저 완성 예시",
    "",
    "- " + guide.dayId + " " + guide.role.label + " 네 차시의 결과 구조와 디자인을 한 화면에서 확인합니다.",
    "- [HTML 완성 예시 바로 보기](" + RESOURCE_URL + htmlRelative + ")",
    "- 파일을 내려받은 뒤 더블클릭하면 브라우저에서 열립니다. 실제 서비스 UI가 아닌 교육용 가상 예시입니다.",
    "",
    README_MARKER_END,
  ]);
  const pattern = new RegExp(README_MARKER_START + "[\\s\\S]*?" + README_MARKER_END, "g");
  if (pattern.test(text)) text = text.replace(pattern, block);
  else text = text.trimEnd() + "\n\n" + block;
  fs.writeFileSync(readmePath, text.trim() + "\n", "utf8");
}

function main() {
  const guides = [];
  for (const roleKey of Object.keys(roles)) {
    const guideDir = path.join(ROOT, "guides", "notion", roleKey, "instructor");
    for (const name of fs.readdirSync(guideDir).filter((item) => /^M\d\d-D\d\d\.md$/.test(item)).sort()) {
      guides.push(parseGuide(path.join(guideDir, name), roleKey));
    }
  }
  if (guides.length !== 30) throw new Error("Expected 30 instructor guides, found " + guides.length);

  let sessionCards = 0;
  let htmlExamples = 0;
  for (const guide of guides) {
    const prefix = guide.dayId.toLowerCase() + "-" + guide.roleKey;
    const htmlRelative = "downloads/guide-resources/" + guide.roleKey + "/" + guide.dayId + "/solutions/" + prefix + "-complete-example.html";
    const imageRelative = "assets/guide-images/" + guide.roleKey + "/" + guide.dayId + "/complete-example-overview.png";
    write(htmlRelative, buildExampleHtml(guide));
    htmlExamples += 1;

    const runbook = buildRunbook(guide, htmlRelative, imageRelative);
    const updated = replaceOrInsert(guide.text, GUIDE_MARKER_START, GUIDE_MARKER_END, runbook, "## 2.");
    fs.writeFileSync(guide.file, updated.trim() + "\n", "utf8");
    enhanceReadme(path.join(ROOT, "downloads", "guide-resources", guide.roleKey, guide.dayId, "README.md"), htmlRelative, guide);
    sessionCards += guide.sessions.length;
  }

  const audit = lines([
    "# 강사용 가이드 초보자 완주·HTML 예시 보강 검토",
    "",
    "기준일: " + AS_OF,
    "",
    "## 반영 범위",
    "",
    "- 강사용 가이드: " + guides.length + "개",
    "- 차시별 50분 운영카드: " + sessionCards + "개",
    "- 브라우저용 HTML 완성 예시: " + htmlExamples + "개",
    "- HTML 내부 차시별 16:9 시각 미리보기: " + sessionCards + "개",
    "- 결과 개요 PNG: 렌더링 스크립트 실행 후 30개",
    "",
    "## 초보 강사 지원",
    "",
    "- 수업 30분 전 준비, 처음 5분 멘트, 50분 시간표, 3분 복구, 종료 10분 체크를 모든 가이드에 추가했습니다.",
    "- 각 운영카드는 기존 가이드의 교안 범위·강사 활동·수강생 활동·결과물·체크포인트를 그대로 읽어 생성합니다.",
    "- 계정·권한·네트워크가 없어도 샘플 첫 행과 템플릿으로 최소 결과를 완성하도록 했습니다.",
    "",
    "## 빠른 학습자 지원",
    "",
    "- 경계 입력 설계, 의도적 오류 찾기, 대상 전환 비교, 90초 동료 설명을 차시별로 배치했습니다.",
    "- 확장 실습도 현재 직무의 가상 원자료와 검증 기준만 사용합니다.",
    "",
    "## HTML·이미지 원칙",
    "",
    "- 실제 서비스 메뉴를 모사하지 않고 결과 구조·디자인·완료 상태만 보여 주는 교육용 가상 화면입니다.",
    "- 외부 스크립트·폰트·링크·개인정보·API 키를 사용하지 않습니다.",
    "- 한글과 표의 정확성이 중요한 UI·문서·워크플로우이므로 생성형 래스터 이미지 대신 HTML/CSS와 인라인 SVG를 사용했습니다.",
    "- HTML과 PNG는 가이드 전용이며 GitHub Pages 강의교안 산출물에서 제외됩니다.",
  ]);
  write("downloads/guide-resources/instructor-guide-enhancement-audit-2026-08-08.md", audit);

  console.log(JSON.stringify({
    asOf: AS_OF,
    instructorGuides: guides.length,
    sessionRunCards: sessionCards,
    htmlExamples,
    inlineVisuals: sessionCards,
  }, null, 2));
}

main();
