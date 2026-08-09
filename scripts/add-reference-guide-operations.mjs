import crypto from "node:crypto";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const AS_OF = "2026-08-08";
const RAW_ROOT = "https://raw.githubusercontent.com/makernari/AX-slide-site/main";
const PAGES_ROOT = "https://makernari.github.io/AX-slide-site";
const markers = {
  learnerStart: "<!-- LEARNER-NOTION-PRECLASS-20260808:START -->",
  learnerEnd: "<!-- LEARNER-NOTION-PRECLASS-20260808:END -->",
  releaseStart: "<!-- LEARNER-REFERENCE-RELEASE-20260808:START -->",
  releaseEnd: "<!-- LEARNER-REFERENCE-RELEASE-20260808:END -->",
  instructorStart: "<!-- INSTRUCTOR-REFERENCE-MATERIALS-20260808:START -->",
  instructorEnd: "<!-- INSTRUCTOR-REFERENCE-MATERIALS-20260808:END -->",
  readmeStart: "<!-- REFERENCE-GUIDE-OPERATIONS-20260808:START -->",
  readmeEnd: "<!-- REFERENCE-GUIDE-OPERATIONS-20260808:END -->",
};

const sourceFiles = [
  {
    key: "notion",
    file: "01_Notion_무료플랜_200퍼센트_활용가이드_이지영.pdf",
    label: "Notion 무료 플랜 200% 활용 가이드",
    pages: 29,
    use: "첫날 사전 설정·과정 기록 시스템·포트폴리오 정리",
  },
  {
    key: "workbook",
    file: "02_Google_AI_도구_15가지_실습워크북_2026_이지영.docx",
    label: "Google AI 도구 15가지 실습 워크북",
    pages: "작성형 DOCX",
    use: "첫 실행→한 조건 수정→미니 프로젝트 기록",
  },
  {
    key: "fieldGuide",
    file: "02_무료로_시작하는_Google_AI_도구_15가지_2026_이지영.pdf",
    label: "무료로 시작하는 Google AI 도구 15가지",
    pages: 151,
    use: "도구별 Quick Start·Prompt Lab·오류 해결·통합 프로젝트",
  },
];

const roles = {
  backoffice: {
    label: "경영지원",
    accent: "#2563EB",
    dark: "#102A56",
    soft: "#EAF2FF",
    record: "업무 요청·승인·기한·검증 근거가 남는 학습 기록",
    example: "사내 업무 결과물은 원본 링크·담당 역할·확인 상태를 함께 기록",
  },
  marketing: {
    label: "마케팅",
    accent: "#EA580C",
    dark: "#7C2D12",
    soft: "#FFF0E8",
    record: "브랜드·콘텐츠·채널·성과 가설이 남는 학습 기록",
    example: "캠페인 결과물은 채널·대상·핵심 메시지·수정 이유를 함께 기록",
  },
};

const dayUse = {
  "M05-D01": { notion: "p.2, 4–11, 23–24", google: "p.2–16 · 사용법·프롬프트 기본·Tool 01 Gemini", workbook: "START + TOOL 01 Gemini", mode: "사전 30~40분 설정 + 정규 도입 5분", action: "개인 Notion 홈·수업 노트 DB·첫 기록을 만든 뒤 Gemini 결과를 첫 노트에 연결" },
  "M05-D02": { notion: "p.12, 24", google: "p.8–16 · Tool 01 Gemini", workbook: "TOOL 01", mode: "실습 종료 전 7분", action: "회의록·Gem 실습의 최종 프롬프트와 수정 이유를 프롬프트 보관함에 기록" },
  "M05-D03": { notion: "p.13–14, 24", google: "p.26–34 · Tool 03 Gemini Notebook", workbook: "TOOL 03", mode: "시연 전 8분 + 종료 5분", action: "출처 기반 질문·오디오·학습 결과를 원본 링크와 함께 수업 노트에 기록" },
  "M05-D04": { notion: "p.10, 14", google: "p.80–88 · Tool 09 Mixboard", workbook: "TOOL 09", mode: "시연 전 7분", action: "무드보드 선택 기준과 최종 결과 링크를 실습 결과물 DB에 기록" },
  "M06-D01": { notion: "p.12, 14, 19", google: "p.35–43 · Tool 04 / p.62–70 · Tool 07", workbook: "TOOL 04 Nano Banana 2 + TOOL 07 Flow", mode: "1차시·3차시 각 6분", action: "이미지 프롬프트의 고정 요소와 Flow 장면 연속성 검수를 두 도구 기록란에 남김" },
  "M06-D02": { notion: "p.14, 19", google: "p.53–61 · Tool 06 / p.71–79 · Tool 08", workbook: "TOOL 06 Vids + TOOL 08 Flow Music", mode: "도구 역할 비교 8분", action: "Google 자료는 영상·음악 제작 흐름 비교에만 쓰고 실제 최종 편집은 Vrew 기준 유지" },
  "M06-D03": { notion: "p.13, 24", google: "p.17–25 · Tool 02 Search AI Mode", workbook: "TOOL 02", mode: "리서치 시작 전 8분", action: "검색 조건·공식 출처·불확실 표시를 확인한 뒤 직무별 리서치 기준으로 전환" },
  "M07-D01": { notion: "p.9–14", google: "직접 연계 없음", workbook: "사용하지 않음", mode: "Notion 연동 전 10분", action: "데이터베이스의 행=페이지, 속성=검색 라벨 개념을 Forms·Apps Script 결과 저장에 연결" },
  "M07-D02": { notion: "p.14–17", google: "직접 연계 없음", workbook: "사용하지 않음", mode: "권한 설명 8분", action: "n8n·Notion 연동 전에 링크·게스트·웹 게시와 편집 권한 차이를 확인" },
  "M07-D03": { notion: "p.9–10", google: "p.2–7 · 상태표·프롬프트 기본·화면 차이", workbook: "FINAL REVIEW · SOURCE CHECK", mode: "분석 검수 7분", action: "수치·고유명사·출처 확인 습관을 데이터 분석 오류 기록에 연결" },
  "M08-D01": { notion: "p.12, 14", google: "p.89–106 · Tool 10·11 / p.116–124 · Tool 13", workbook: "TOOL 10 Stitch + 11 Opal + 13 AI Studio", mode: "앱 제작 전 10분", action: "화면 설계→미니앱→AI Studio 앱 흐름을 비교하고 실제 수업은 AI Studio 커리큘럼으로 수행" },
  "M08-D02": { notion: "p.12, 14", google: "p.125–133 · Tool 14 Jules", workbook: "TOOL 14", mode: "코딩 에이전트 비교 5분", action: "Jules는 비교 사례로만 제시하고 실제 분석·수정·테스트는 Codex 실습 기준 유지" },
  "M08-D03": { notion: "p.13–14", google: "p.26–34 · Tool 03 Gemini Notebook", workbook: "TOOL 03", mode: "RAG 비교 7분", action: "출처 기반 Notebook과 직접 구성하는 RAG의 공통점·차이를 한 표로 기록" },
  "M08-D04": { notion: "p.12–14", google: "p.98–106 · Tool 11 Opal", workbook: "TOOL 11", mode: "에이전트 개념 비교 5분", action: "Opal은 자연어 미니앱 비교 사례로만 쓰고 MCP·Function Calling·에이전트 실습 흐름은 유지" },
  "M09-D01": { notion: "p.14, 18, 27", google: "p.143–148 · 통합 프로젝트 5종", workbook: "INTEGRATED PROJECTS + FINAL REVIEW + 30-DAY PLAN", mode: "회고 15분 + 종료 후 배포", action: "15일 결과물을 포트폴리오 후보로 고르고 최종 회고 뒤 원본 세 자료를 일괄 배포" },
};

function escapeXml(value) {
  return String(value).replaceAll("&", "&amp;").replaceAll("<", "&lt;").replaceAll(">", "&gt;").replaceAll('"', "&quot;");
}

function sha256(filePath) {
  return crypto.createHash("sha256").update(fs.readFileSync(filePath)).digest("hex");
}

function replaceOrInsert(markdown, start, end, block, anchor, before = true) {
  const startIndex = markdown.indexOf(start);
  const endIndex = markdown.indexOf(end);
  if (startIndex >= 0 && endIndex >= startIndex) {
    return `${markdown.slice(0, startIndex)}${block}${markdown.slice(endIndex + end.length)}`;
  }
  const anchorIndex = markdown.indexOf(anchor);
  if (anchorIndex < 0) throw new Error(`삽입 위치를 찾을 수 없습니다: ${anchor}`);
  const index = before ? anchorIndex : anchorIndex + anchor.length;
  return `${markdown.slice(0, index).trimEnd()}\n\n${block}\n\n${markdown.slice(index).trimStart()}`;
}

function notionInfographic() {
  const steps = [
    ["01", "개인 공간", "계정·개인 워크스페이스"],
    ["02", "홈", "AX 과정 대시보드"],
    ["03", "수업 노트", "날짜·모듈·이해도"],
    ["04", "재사용 자산", "프롬프트·도구·결과물"],
    ["05", "첫 기록", "핵심·시도·오류·링크"],
  ];
  const cards = steps.map((step, index) => {
    const x = 72 + index * 300;
    const connector = index === 4 ? "" : `<path d="M ${x + 252} 421 H ${x + 286}" stroke="#A4B2C7" stroke-width="8" stroke-linecap="round"/><path d="M ${x + 276} 409 L ${x + 290} 421 L ${x + 276} 433" fill="none" stroke="#A4B2C7" stroke-width="8" stroke-linecap="round" stroke-linejoin="round"/>`;
    return `<g><rect x="${x}" y="274" width="252" height="294" rx="28" fill="#FFFFFF" stroke="#D7E0ED" stroke-width="3"/><circle cx="${x + 126}" cy="332" r="34" fill="${index < 2 ? "#2563EB" : index < 4 ? "#7C3AED" : "#0F766E"}"/><text x="${x + 126}" y="341" text-anchor="middle" font-size="23" font-weight="900" fill="#FFFFFF">${step[0]}</text><text x="${x + 126}" y="411" text-anchor="middle" font-size="26" font-weight="900" fill="#17233B">${escapeXml(step[1])}</text><line x1="${x + 34}" y1="444" x2="${x + 218}" y2="444" stroke="#E4EAF2" stroke-width="2"/><text x="${x + 126}" y="489" text-anchor="middle" font-size="18" font-weight="700" fill="#52627A">${escapeXml(step[2])}</text><text x="${x + 126}" y="526" text-anchor="middle" font-size="15" font-weight="700" fill="#8190A6">저장 후 다음 단계</text></g>${connector}`;
  }).join("");
  return `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" width="1600" height="900" viewBox="0 0 1600 900" role="img" aria-labelledby="title desc">
  <title id="title">수업 시작 전 개인 Notion 학습 시스템 만들기</title><desc id="desc">개인 워크스페이스부터 첫 수업 기록까지 30분에 만드는 다섯 단계</desc>
  <rect width="1600" height="900" fill="#F4F7FB"/><circle cx="1488" cy="25" r="240" fill="#EAF2FF"/><circle cx="50" cy="865" r="180" fill="#F1E9FF"/>
  <rect x="38" y="38" width="1524" height="824" rx="40" fill="#FFFFFF" stroke="#D7E0ED" stroke-width="3"/>
  <rect x="38" y="38" width="1524" height="174" rx="40" fill="#101828"/><rect x="38" y="174" width="1524" height="38" fill="#101828"/>
  <rect x="76" y="72" width="238" height="38" rx="19" fill="#FFFFFF" fill-opacity="0.14"/><text x="195" y="99" text-anchor="middle" font-size="17" font-weight="900" fill="#FFFFFF">BEFORE CLASS · DAY 1</text>
  <text x="76" y="158" font-size="40" font-weight="900" fill="#FFFFFF">30~40분 완성 · 나만의 Notion 수업 정리 시스템</text>
  <rect x="1280" y="83" width="232" height="78" rx="24" fill="#FFFFFF"/><text x="1396" y="113" text-anchor="middle" font-size="17" font-weight="800" fill="#101828">정규 수업과 별도</text><text x="1396" y="145" text-anchor="middle" font-size="24" font-weight="900" fill="#2563EB">첫날 시작 전</text>
  <text x="72" y="250" font-size="18" font-weight="750" fill="#64748B">꾸미기보다 “10초 안에 새 노트 만들기, 20초 안에 지난 프롬프트 찾기”가 완성 기준입니다.</text>
  ${cards}
  <rect x="72" y="620" width="1456" height="168" rx="30" fill="#F7F8FC" stroke="#D7E0ED" stroke-width="2"/>
  <text x="106" y="669" font-size="20" font-weight="900" fill="#102A56">수업이 시작되면 이렇게 기록합니다</text>
  <g font-size="18" font-weight="720" fill="#334155"><text x="106" y="715">① 오늘의 한 줄 핵심</text><text x="400" y="715">② 다시 쓸 최종 프롬프트</text><text x="772" y="715">③ 막힌 점과 해결</text><text x="1072" y="715">④ 결과 링크와 다음 행동</text></g>
  <rect x="106" y="744" width="854" height="30" rx="15" fill="#EAF2FF"/><text x="533" y="765" text-anchor="middle" font-size="16" font-weight="850" fill="#102A56">Notion은 지도 · Google Drive는 원본 파일 창고</text>
  <rect x="986" y="744" width="508" height="30" rx="15" fill="#ECFDF3"/><text x="1240" y="765" text-anchor="middle" font-size="16" font-weight="850" fill="#0F766E">원본 교재 3종은 전체 과정 종료 후 제공</text>
  <text x="1518" y="838" text-anchor="end" font-size="13" font-weight="700" fill="#7A879B">교육용 구조 안내 · 실제 Notion 화면과 다를 수 있음 · ${AS_OF}</text>
</svg>`;
}

function releaseTimelineSvg() {
  return `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" width="1600" height="900" viewBox="0 0 1600 900" role="img" aria-labelledby="title desc">
  <title id="title">제공 교재 세 종의 과정 운영과 종료 후 배포 순서</title><desc id="desc">첫날 사전 안내, 수업 중 강사 활용, 매일 개인 기록, M09 종료 후 원본 배포의 네 단계</desc>
  <rect width="1600" height="900" fill="#F6F8FC"/><rect x="42" y="42" width="1516" height="816" rx="40" fill="#FFFFFF" stroke="#D7E0ED" stroke-width="3"/>
  <rect x="42" y="42" width="1516" height="176" rx="40" fill="#17233B"/><rect x="42" y="180" width="1516" height="38" fill="#17233B"/>
  <text x="82" y="102" font-size="18" font-weight="850" fill="#AFC6FF">REFERENCE MATERIAL JOURNEY</text><text x="82" y="165" font-size="40" font-weight="900" fill="#FFFFFF">언제 보여 주고, 언제 배포할까요?</text>
  <rect x="1260" y="86" width="248" height="74" rx="22" fill="#FFFFFF"/><text x="1384" y="116" text-anchor="middle" font-size="16" font-weight="800" fill="#17233B">원본 3종</text><text x="1384" y="145" text-anchor="middle" font-size="22" font-weight="900" fill="#EA580C">M09 종료 후 제공</text>
  <path d="M 180 436 H 1420" stroke="#CCD7E6" stroke-width="12" stroke-linecap="round"/>
  ${[
    ["1", 214, "첫날 시작 전", "Notion 30~40분", "강사 화면을 보며 개인 정리 공간 완성", "#2563EB"],
    ["2", 594, "M05~M08", "관련 페이지만 시연", "PDF·워크북 원본은 강사만 열고 배포 보류", "#7C3AED"],
    ["3", 974, "매일 종료", "개인 Notion 기록", "핵심·프롬프트·오류·결과 링크만 남김", "#0F766E"],
    ["4", 1354, "M09 종료 후", "원본 3종 배포", "권한·파일명·열기·수신 여부 확인", "#EA580C"],
  ].map(([n,x,a,b,c,color]) => `<g><circle cx="${x}" cy="436" r="52" fill="${color}"/><text x="${x}" y="450" text-anchor="middle" font-size="38" font-weight="900" fill="#FFFFFF">${n}</text><rect x="${x-154}" y="284" width="308" height="104" rx="24" fill="#FFFFFF" stroke="${color}" stroke-width="3"/><text x="${x}" y="326" text-anchor="middle" font-size="18" font-weight="800" fill="${color}">${escapeXml(a)}</text><text x="${x}" y="359" text-anchor="middle" font-size="24" font-weight="900" fill="#17233B">${escapeXml(b)}</text><rect x="${x-154}" y="500" width="308" height="118" rx="24" fill="#F7F9FC" stroke="#D7E0ED" stroke-width="2"/><text x="${x}" y="542" text-anchor="middle" font-size="16" font-weight="720" fill="#475569">${escapeXml(c.slice(0,22))}</text><text x="${x}" y="571" text-anchor="middle" font-size="16" font-weight="720" fill="#475569">${escapeXml(c.slice(22))}</text></g>`).join("")}
  <rect x="88" y="690" width="1424" height="112" rx="28" fill="#FFF7ED" stroke="#FDBA74" stroke-width="2"/><text x="120" y="735" font-size="19" font-weight="900" fill="#9A3412">배포 안전선</text><text x="270" y="735" font-size="18" font-weight="740" fill="#4B5563">편집 권한 없이 제공 · 저작권/배포 범위 확인 · API Key/개인정보 미포함 · 수신 후 파일 열기 확인</text><text x="270" y="771" font-size="17" font-weight="700" fill="#64748B">Notion에는 원본을 중복 업로드하지 않고 제공 위치·읽은 날짜·내 활용 메모만 기록합니다.</text>
  <text x="1518" y="836" text-anchor="end" font-size="13" font-weight="700" fill="#7A879B">강사용 운영 기준 · ${AS_OF}</text>
</svg>`;
}

function notionDashboardHtml(roleKey) {
  const role = roles[roleKey];
  return `<!doctype html><html lang="ko"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>${role.label} Notion 학습 대시보드 구조 예시</title><style>
  :root{font-family:Arial,'Noto Sans KR',sans-serif;--a:${role.accent};--d:${role.dark};--s:${role.soft};color:#20242c;background:#eef2f7}*{box-sizing:border-box}body{margin:0}.notice{background:#101828;color:#fff;padding:12px 22px;font-size:14px;text-align:center}.app{min-height:calc(100vh - 42px);display:grid;grid-template-columns:250px 1fr}.side{background:#f7f5f2;border-right:1px solid #ddd8d2;padding:28px 18px}.brand{font-weight:900;font-size:18px;margin-bottom:30px}.nav{display:grid;gap:8px}.nav div{padding:10px 12px;border-radius:9px;color:#555}.nav .active{background:#e8e5e1;color:#111;font-weight:800}.main{padding:42px;max-width:1240px;width:100%;margin:auto}.cover{height:120px;border-radius:18px;background:linear-gradient(120deg,var(--d),var(--a));margin-bottom:-24px}.title{background:#fff;border:1px solid #e3e7ef;border-radius:18px;padding:28px 32px;position:relative;box-shadow:0 12px 35px #1e293b12}.title h1{margin:0 0 8px;font-size:34px}.title p{margin:0;color:#667085}.grid{display:grid;grid-template-columns:repeat(4,1fr);gap:14px;margin-top:22px}.card{background:#fff;border:1px solid #dce3ed;border-radius:16px;padding:18px;min-height:128px}.card b{display:block;color:var(--d);margin-bottom:10px}.card span{font-size:14px;line-height:1.55;color:#667085}.section{margin-top:24px;background:#fff;border:1px solid #dce3ed;border-radius:18px;padding:22px}.section h2{font-size:20px;margin:0 0 14px}.table{width:100%;border-collapse:collapse}.table th,.table td{text-align:left;border-bottom:1px solid #e6ebf2;padding:12px 10px;font-size:14px}.table th{background:var(--s);color:var(--d)}.tag{display:inline-block;padding:5px 9px;border-radius:999px;background:var(--s);color:var(--d);font-weight:800}.foot{margin-top:18px;padding:14px 16px;background:#fff7ed;border-radius:14px;color:#9a3412;font-size:14px}@media(max-width:800px){.app{grid-template-columns:1fr}.side{display:none}.main{padding:18px}.grid{grid-template-columns:1fr 1fr}.title h1{font-size:26px}}@media(max-width:520px){.grid{grid-template-columns:1fr}}
  </style></head><body data-media-ready="true"><div class="notice">교육용 구조 예시 · 실제 Notion 화면·메뉴와 다를 수 있습니다</div><main class="app"><aside class="side"><div class="brand">${role.label} AX 학습노트</div><div class="nav"><div class="active">⌂ AX 과정 홈</div><div>▤ 수업 노트</div><div>⌁ 프롬프트 보관함</div><div>◫ AI 도구·참고 링크</div><div>▣ 실습 결과물</div><div>✓ 과정 회고</div></div></aside><section class="main"><div class="cover"></div><header class="title"><h1>AX 전문 강사 양성과정</h1><p>${role.record}</p></header><div class="grid"><article class="card"><b>오늘 할 일</b><span>□ 새 수업 노트 만들기<br>□ 최종 프롬프트 저장<br>□ 결과 링크 확인</span></article><article class="card"><b>수업 노트</b><span>날짜 · 모듈 · 이해도<br>핵심 · 시행착오 · 다음 행동</span></article><article class="card"><b>프롬프트 보관함</b><span>도구 · 목적 · 버전<br>입력 조건 · 수정 이유</span></article><article class="card"><b>실습 결과물</b><span>대표 화면 · 원본 링크<br>배운 점 · 개선점</span></article></div><section class="section"><h2>수업 노트 DB · 첫 기록 예시</h2><table class="table"><thead><tr><th>노트 제목</th><th>날짜</th><th>모듈</th><th>이해도</th><th>복습</th></tr></thead><tbody><tr><td>M05-D01 · AI 적용 후보 찾기</td><td>2026-08-XX</td><td><span class="tag">M05</span></td><td>보통</td><td>□</td></tr><tr><td colspan="5"><b>내 기록 원칙:</b> ${role.example}</td></tr></tbody></table></section><div class="foot">원본 PDF·영상·고해상도 이미지는 Drive에 보관하고, Notion에는 설명·대표 화면·원본 링크를 둡니다.</div></section></main><script>document.documentElement.dataset.mediaReady='true'</script></body></html>`;
}

function learnerPreclassBlock(roleKey) {
  const role = roles[roleKey];
  const htmlUrl = `${PAGES_ROOT}/downloads/guide-resources/${roleKey}/M05-D01/examples/m05-d01-${roleKey}-notion-dashboard.html`;
  const markdownGuideUrl = `${PAGES_ROOT}/downloads/guide-resources/common/M05-D01/markdown-to-notion-learner-guide-20260808.pdf`;
  return [
    markers.learnerStart,
    "",
    "### 수업 시작 전 · Notion에 15일 학습노트 만들기",
    "",
    "> **사전 준비 30~40분 · 정규 4시간에 포함되지 않음** — 강사가 화면으로 안내하고, 수강생은 자신의 개인 워크스페이스를 만듭니다. 원본 Notion 활용 가이드는 전체 과정 종료 후 제공합니다.",
    "",
    `![수업 시작 전 개인 Notion 학습 시스템 만들기](${RAW_ROOT}/assets/guide-images/common/M05-D01/notion-preclass-system-gpt-image-2-20260808.png)`,
    "",
    `- [Markdown(.md) 실습 문서를 Notion에서 작성하는 방법 PDF 받기](${markdownGuideUrl}) — 첫 시간에 시작 파일·빈 템플릿을 편집 가능한 개인 Notion 페이지로 가져올 때 사용합니다.`,
    `- [완성 화면 구조 예시 열기](${htmlUrl}) — 실제 서비스 화면이 아니라 완성 구조를 보여 주는 교육용 HTML입니다.`,
    "",
    "| 시간 | 지금 할 일 | 화면에 남아야 하는 것 |",
    "| --- | --- | --- |",
    "| 0~5분 | 개인 계정으로 로그인하고 개인 워크스페이스 확인 | 나 혼자 사용하는 학습 공간 |",
    "| 5~10분 | `AX 전문 강사 양성과정` 홈 페이지 생성 | 과정 목표·바로가기 영역 |",
    "| 10~22분 | `수업 노트` DB와 날짜·모듈·이해도·복습 속성 생성 | 새 노트 1개를 만들 수 있는 표 |",
    "| 22~30분 | 기본 수업 노트 템플릿 생성 | 한 줄 핵심·프롬프트·결과·막힌 점·다음 행동 |",
    "| 30~40분 | 프롬프트·도구 링크·실습 결과물 보관함을 추가하거나 빠른 학습자 확장 | 과정 홈에서 네 보관함으로 이동 가능 |",
    "",
    "#### 시간이 부족하면 15분 최소 경로",
    "",
    "1. 과정 홈 페이지를 만듭니다.",
    "2. 수업 노트 DB에 `날짜·모듈·이해도` 세 속성만 만듭니다.",
    "3. 첫 노트에 `한 줄 핵심·최종 프롬프트·막힌 점·결과 링크` 네 줄을 적습니다.",
    "4. 꾸미기·차트·버튼·Web Clipper는 수업 후 확장합니다.",
    "",
    `- **${role.label} 기록 기준:** ${role.record}`,
    "- **저장 원칙:** Notion은 설명과 탐색을 맡고, 원본 파일은 Google Drive에 보관합니다.",
    "- **공유 원칙:** 반 전체 워크스페이스에 들어가지 않고 개인 공간을 유지합니다. 공유가 필요하면 강사의 안내에 따라 특정 페이지만 사용합니다.",
    "",
    markers.learnerEnd,
  ].join("\n");
}

function learnerReleaseBlock() {
  return [
    markers.releaseStart,
    "",
    "### 과정 종료 후 제공되는 참고자료",
    "",
    `![제공 교재 세 종의 과정 운영과 종료 후 배포 순서](${RAW_ROOT}/assets/guide-images/common/M09-D01/reference-release-timeline-gpt-image-2-20260808.png)`,
    "",
    "> 세 원본 파일은 M09 수업과 최종 회고가 끝난 뒤 강사가 별도 전달합니다. 이 가이드에는 조기 다운로드 링크를 넣지 않습니다.",
    "",
    "| 종료 후 받는 자료 | 이후 활용 방법 |",
    "| --- | --- |",
    "| Notion 무료 플랜 200% 활용 가이드 PDF | 과정 노트 구조를 보완하고 개인 포트폴리오로 확장 |",
    "| Google AI 도구 15가지 실습 워크북 DOCX | 관심 도구 5개를 골라 30일 재실행 기록 작성 |",
    "| 무료로 시작하는 Google AI 도구 15가지 PDF | Quick Start·Prompt Lab·오류 해결·통합 프로젝트 복습 |",
    "",
    "받은 뒤에는 파일명을 바꾸거나 Notion에 다시 업로드하지 말고, 제공 위치·읽은 날짜·내가 다시 할 실습만 개인 Notion에 기록합니다. 기능·무료 범위·화면은 바뀔 수 있으므로 실제 실행 전 공식 도움말과 현재 계정을 다시 확인합니다.",
    "",
    markers.releaseEnd,
  ].join("\n");
}

function instructorBlock(roleKey, dayId) {
  const role = roles[roleKey];
  const use = dayUse[dayId];
  const special = dayId === "M05-D01" ? [
    "",
    "#### 첫날 수업 시작 전 40분 운영표",
    "",
    "- **첫 시간 공통 배포:** `downloads/guide-resources/common/M05-D01/markdown-to-notion-learner-guide-20260808.pdf`를 제공하고, 파일 탐색기의 읽기 전용 열기와 `설정 → 가져오기 → Text & Markdown`의 편집 가능한 가져오기를 구분해 시연합니다.",
    "",
    "| 시각 | 강사 행동 | 수강생 완료 신호 |",
    "| --- | --- | --- |",
    "| -40~-35분 | Notion 가이드 p.2의 최종 구조를 보여 주고 ‘꾸미기보다 재탐색’이라고 안내 | 개인 워크스페이스 확인 |",
    "| -35~-30분 | p.4~7을 참고해 가입·페이지·블록·슬래시 명령만 시연 | 과정 홈 페이지 생성 |",
    "| -30~-18분 | p.8~9를 참고해 과정 홈과 수업 노트 DB 생성 | 날짜·모듈·이해도 속성 |",
    "| -18~-10분 | p.11 템플릿의 핵심·프롬프트·결과·막힌 점·다음 행동 생성 | 기본 수업 노트 템플릿 |",
    "| -10~-5분 | p.23~24의 완성 기준으로 첫 노트 작성 | 새 노트 10초·지난 기록 20초 내 찾기 |",
    "| -5~0분 | 빨강·노랑·초록 상태 확인, 미완료자는 15분 최소 구조로 전환 | 정규 수업 시작 화면 준비 |",
    "",
    "강의 팁: 데이터베이스 네 개를 모두 만드는 것보다 `수업 노트 DB + 첫 노트`를 전원이 완성하는 것을 우선합니다. 빠른 학습자는 프롬프트·도구 링크·결과물 DB를 추가합니다.",
    "",
    "#### 2026-08-08 공식 확인 카드",
    "",
    "- Notion 무료 플랜은 개인 사용자의 페이지·블록을 무제한 제공하지만 멤버 2명 이상이면 제한이 생길 수 있습니다.",
    "- 무료 플랜의 파일 업로드는 파일당 5MB, 페이지 기록 7일, 외부 게스트 10명, 차트 1개이며 오프라인 페이지는 선택 다운로드 방식입니다.",
    "- Notion AI는 무료 플랜의 핵심 수업 도구가 아니라 제한된 체험으로 취급합니다.",
    "- 수업 당일에는 Notion 공식 요금제 페이지와 오프라인 도움말을 다시 확인합니다. 공식 URL은 별도 강사 운영 문서에 모아 둡니다.",
  ].join("\n") : "";
  const release = dayId === "M09-D01" ? [
    "",
    "#### 전체 수업 종료 후 원본 3종 배포",
    "",
    "1. M09 필수 결과물과 최종 회고가 끝났는지 확인합니다.",
    "2. `references/guide/`의 원본 세 파일을 편집 권한 없이 LMS·Drive·기관 승인 채널 중 하나로 제공합니다.",
    "3. 수강생에게 파일명·자료 목적·기준일·기능 변동 가능성을 함께 안내합니다.",
    "4. 대표 수강생 1명이 PDF 두 개와 DOCX 한 개를 실제로 열어 보게 합니다.",
    "5. 수강생은 원본을 Notion에 재업로드하지 않고 제공 위치·읽은 날짜·다시 할 실습만 기록하게 합니다.",
    "6. 배포 일시·채널·대상·파일 3개·수신 확인을 강사용 체크리스트에 남깁니다.",
  ].join("\n") : "";
  return [
    markers.instructorStart,
    "",
    "### 제공 교재 활용 카드 · 강사 전용",
    "",
    "> 원본 세 자료는 수업 중 강사 화면 공유·발췌 시연용입니다. 수강생에게는 M09 종료 후 일괄 제공합니다. 정규 차시의 목표와 사례는 최종 Excel을 우선하며, 제공 교재의 생활형 예시는 설명용으로만 사용합니다.",
    "",
    "| 자료 | 오늘 열 위치 | 오늘의 사용 방식 |",
    "| --- | --- | --- |",
    `| Notion 무료 플랜 활용 가이드 PDF | ${use.notion} | ${use.action} |`,
    `| Google AI 도구 15가지 PDF | ${use.google} | 현재 화면·지역·계정 차이를 확인한 뒤 해당 기능의 구조만 시연 |`,
    `| Google AI 실습 워크북 DOCX | ${use.workbook} | 첫 실행→한 조건 수정→결과·오류 기록 칸을 직무 사례에 적용 |`,
    "",
    `- **권장 투입 시점:** ${use.mode}`,
    `- **${role.label} 전환:** ${role.example}`,
    "- **원본 위치:** `references/guide/` — 사이트·수강생 메뉴·공개 다운로드 경로에 복사하지 않습니다.",
    "- **배포 잠금:** M09 종료 전에는 원본 파일 링크·첨부·QR을 수강생 문서에 넣지 않습니다.",
    "- **녹화·캡처:** 원본 하단의 이메일과 개인 계정 정보가 보이는 화면은 공개 녹화본에서 가립니다.",
    "- **최신성:** 무료 범위·메뉴·지역 제공 여부는 원문을 그대로 단정하지 말고 수업 당일 공식 도움말과 실제 계정 화면을 확인합니다.",
    special,
    release,
    "",
    markers.instructorEnd,
  ].join("\n");
}

function readmeBlock(roleKey, dayId) {
  const prefix = dayId === "M05-D01"
    ? `- 수강생 첫 시간 안내 PDF: [Markdown(.md) 실습 문서를 Notion에서 작성하는 방법](${PAGES_ROOT}/downloads/guide-resources/common/M05-D01/markdown-to-notion-learner-guide-20260808.pdf)\n- Notion 사전 준비 완성 구조: \`examples/m05-d01-${roleKey}-notion-dashboard.html\`\n- 원본 Notion PDF는 전체 과정 종료 후 강사가 별도 제공합니다.`
    : "- 전체 과정 종료 후 제공되는 원본 3종은 이 폴더에 복사하지 않으며 강사가 승인 채널로 별도 제공합니다.";
  return `${markers.readmeStart}\n\n## 제공 교재 운영\n\n${prefix}\n\n${markers.readmeEnd}`;
}

function referenceDashboardHtml() {
  const rows = Object.entries(dayUse).map(([day, use]) => `<tr><td><b>${day}</b></td><td>${escapeXml(use.notion)}</td><td>${escapeXml(use.google)}</td><td>${escapeXml(use.workbook)}</td><td>${escapeXml(use.mode)}</td></tr>`).join("");
  return `<!doctype html><html lang="ko"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>강사용 제공 교재 운영 대시보드</title><style>:root{font-family:Arial,'Noto Sans KR',sans-serif;color:#17233b;background:#edf2f7}*{box-sizing:border-box}body{margin:0}.page{max-width:1400px;margin:auto;padding:34px}.hero{background:#17233b;color:#fff;padding:30px 34px;border-radius:26px;display:flex;justify-content:space-between;gap:20px;align-items:center}.hero h1{margin:5px 0;font-size:34px}.badge{background:#fff;color:#17233b;border-radius:18px;padding:14px 18px;font-weight:900}.cards{display:grid;grid-template-columns:repeat(3,1fr);gap:16px;margin:18px 0}.card{background:#fff;border:1px solid #d8e1ed;border-radius:20px;padding:20px}.card b{display:block;margin-bottom:9px}.lock{color:#b42318;font-weight:850}.tablewrap{background:#fff;border:1px solid #d8e1ed;border-radius:20px;padding:18px;overflow:auto}table{border-collapse:collapse;width:100%;min-width:1050px}th,td{border-bottom:1px solid #e3e9f1;text-align:left;padding:12px 10px;font-size:14px;vertical-align:top}th{background:#eef4ff;color:#102a56}.release{margin-top:18px;background:#fff7ed;border:1px solid #fdba74;border-radius:20px;padding:18px 22px}.release b{color:#9a3412}@media(max-width:800px){.page{padding:14px}.hero{align-items:flex-start;flex-direction:column}.cards{grid-template-columns:1fr}}</style></head><body data-media-ready="true"><main class="page"><header class="hero"><div><small>INSTRUCTOR ONLY · ${AS_OF}</small><h1>제공 교재 3종 운영 대시보드</h1><div>첫날 사전 안내 → 일자별 발췌 시연 → M09 종료 후 원본 배포</div></div><div class="badge">정규 15일 · 60시간 유지</div></header><section class="cards">${sourceFiles.map((f) => `<article class="card"><b>${escapeXml(f.label)}</b><span>${escapeXml(f.pages)} · ${escapeXml(f.use)}</span><p class="lock">M09 종료 전 원본 배포 잠금</p></article>`).join("")}</section><section class="tablewrap"><table><thead><tr><th>일자</th><th>Notion PDF</th><th>Google AI PDF</th><th>작성 워크북</th><th>투입 시점</th></tr></thead><tbody>${rows}</tbody></table></section><section class="release"><b>종료 후 배포 체크:</b> 권한 확인 → 승인 채널 업로드 → 파일 3개 열기 → 수신 확인 → 배포 기록. 원본을 웹 강의교안이나 공개 다운로드 경로에 넣지 않습니다.</section></main><script>document.documentElement.dataset.mediaReady='true'</script></body></html>`;
}

const commonM05 = path.join(ROOT, "assets", "guide-images", "common", "M05-D01");
const commonM09 = path.join(ROOT, "assets", "guide-images", "common", "M09-D01");
fs.mkdirSync(commonM05, { recursive: true });
fs.mkdirSync(commonM09, { recursive: true });
fs.writeFileSync(path.join(commonM05, "notion-preclass-system-20260808.svg"), notionInfographic(), "utf8");
fs.writeFileSync(path.join(commonM09, "reference-release-timeline-20260808.svg"), releaseTimelineSvg(), "utf8");

const resourceRoot = path.join(ROOT, "downloads", "guide-resources", "reference-guides");
fs.mkdirSync(resourceRoot, { recursive: true });
fs.writeFileSync(path.join(resourceRoot, "reference-materials-dashboard.html"), referenceDashboardHtml(), "utf8");

for (const roleKey of Object.keys(roles)) {
  const exampleDir = path.join(ROOT, "downloads", "guide-resources", roleKey, "M05-D01", "examples");
  fs.mkdirSync(exampleDir, { recursive: true });
  fs.writeFileSync(path.join(exampleDir, `m05-d01-${roleKey}-notion-dashboard.html`), notionDashboardHtml(roleKey), "utf8");

  const learnerM05Path = path.join(ROOT, "guides", "notion", roleKey, "learner", "M05-D01.md");
  let learnerM05 = fs.readFileSync(learnerM05Path, "utf8");
  learnerM05 = replaceOrInsert(learnerM05, markers.learnerStart, markers.learnerEnd, learnerPreclassBlock(roleKey), "<!-- M05-20260808-REFRESH:START -->");
  fs.writeFileSync(learnerM05Path, `${learnerM05.trimEnd()}\n`, "utf8");

  const learnerM09Path = path.join(ROOT, "guides", "notion", roleKey, "learner", "M09-D01.md");
  let learnerM09 = fs.readFileSync(learnerM09Path, "utf8");
  learnerM09 = replaceOrInsert(learnerM09, markers.releaseStart, markers.releaseEnd, learnerReleaseBlock(), "## 18. 다음 수업 준비");
  fs.writeFileSync(learnerM09Path, `${learnerM09.trimEnd()}\n`, "utf8");

  for (const dayId of Object.keys(dayUse)) {
    const instructorPath = path.join(ROOT, "guides", "notion", roleKey, "instructor", `${dayId}.md`);
    let instructor = fs.readFileSync(instructorPath, "utf8");
    const firstComment = instructor.indexOf("<!--", instructor.indexOf("## 1."));
    if (firstComment < 0) throw new Error(`강사용 삽입 위치 없음: ${instructorPath}`);
    const anchor = instructor.slice(firstComment, instructor.indexOf("-->", firstComment) + 3);
    instructor = replaceOrInsert(instructor, markers.instructorStart, markers.instructorEnd, instructorBlock(roleKey, dayId), anchor);
    fs.writeFileSync(instructorPath, `${instructor.trimEnd()}\n`, "utf8");
  }

  for (const dayId of ["M05-D01", "M09-D01"]) {
    const readmePath = path.join(ROOT, "downloads", "guide-resources", roleKey, dayId, "README.md");
    let readme = fs.readFileSync(readmePath, "utf8");
    const block = readmeBlock(roleKey, dayId);
    const startIndex = readme.indexOf(markers.readmeStart);
    const endIndex = readme.indexOf(markers.readmeEnd);
    if (startIndex >= 0 && endIndex >= startIndex) readme = `${readme.slice(0, startIndex)}${block}${readme.slice(endIndex + markers.readmeEnd.length)}`;
    else readme = `${readme.trimEnd()}\n\n${block}`;
    fs.writeFileSync(readmePath, `${readme.trimEnd()}\n`, "utf8");
  }
}

const sourceManifest = sourceFiles.map((source) => {
  const filePath = path.join(ROOT, "references", "guide", source.file);
  if (!fs.existsSync(filePath)) throw new Error(`참고자료 없음: ${source.file}`);
  const stat = fs.statSync(filePath);
  return { ...source, bytes: stat.size, sha256: sha256(filePath) };
});

const csv = [
  "day_id,notion_pages,google_ai_pdf_pages,workbook_section,use_timing,instructor_action",
  ...Object.entries(dayUse).map(([day, use]) => [day, use.notion, use.google, use.workbook, use.mode, use.action].map((value) => String(value).replaceAll(",", "·")).join(",")),
].join("\n");
fs.writeFileSync(path.join(resourceRoot, "15-day-reference-page-map.csv"), `${csv}\n`, "utf8");

const distributionChecklist = [
  "# 과정 종료 후 제공 교재 배포 체크리스트",
  "",
  `- 기준일: ${AS_OF}`,
  "- 배포 시점: M09-D01 필수 결과물·최종 회고 종료 후",
  "- 배포 방식: 기관 승인 LMS·Drive·메일 중 하나, 원본 편집 권한 없음",
  "",
  "## 배포할 원본",
  "",
  ...sourceManifest.map((source) => `- [ ] \`${source.file}\` · ${source.bytes.toLocaleString("ko-KR")} bytes · SHA-256 \`${source.sha256}\``),
  "",
  "## 실행 순서",
  "",
  "- [ ] 세 파일의 저작권·배포 대상·배포 기간을 확인했다.",
  "- [ ] 공개 웹 경로나 강의교안 사이트가 아닌 승인 채널에 업로드했다.",
  "- [ ] 수강생 권한은 보기·다운로드이며 원본 편집 권한이 아니다.",
  "- [ ] PDF 2개와 DOCX 1개의 파일명이 유지되었다.",
  "- [ ] 대표 수강생이 세 파일을 실제로 열었다.",
  "- [ ] 기준일 이후 기능·가격·지역 조건은 공식 도움말에서 다시 확인하라고 안내했다.",
  "- [ ] Notion에는 원본을 중복 업로드하지 않고 제공 위치·읽은 날짜·활용 메모만 기록하도록 안내했다.",
  "- [ ] 배포 일시·채널·대상·수신 확인을 아래에 기록했다.",
  "",
  "| 배포 일시 | 채널 | 대상 | 파일 3종 확인 | 수신 확인자 | 비고 |",
  "| --- | --- | --- | --- | --- | --- |",
  "|  |  |  | □ |  |  |",
  "",
].join("\n");
fs.writeFileSync(path.join(resourceRoot, "course-end-distribution-checklist.md"), distributionChecklist, "utf8");

const operationsGuide = [
  "# 제공 교재 3종 · 강사용 수업 활용 계획",
  "",
  `- 기준일: ${AS_OF}`,
  "- 수업 운영: 첫날 사전 Notion 설정 → 일자별 발췌 시연 → M09 종료 후 원본 일괄 배포",
  "- 정규 과정: 15일·60시간·60차시 변경 없음",
  "- 원본 보관: `references/guide/`",
  "- 공개 사이트: 포함하지 않음",
  "",
  "## 원본 확인",
  "",
  "| 자료 | 형식·분량 | 수업 역할 | SHA-256 |",
  "| --- | --- | --- | --- |",
  ...sourceManifest.map((source) => `| ${source.label} | ${source.pages} | ${source.use} | \`${source.sha256}\` |`),
  "",
  "## 15일 페이지 맵",
  "",
  "| 일자 | Notion PDF | Google AI PDF | 작성 워크북 | 투입 시점 |",
  "| --- | --- | --- | --- | --- |",
  ...Object.entries(dayUse).map(([day, use]) => `| ${day} | ${use.notion} | ${use.google} | ${use.workbook} | ${use.mode} |`),
  "",
  "## 강사가 지킬 원칙",
  "",
  "1. 제공 교재는 설명을 보강하지만 최종 Excel의 차시 목표·실습 결과물을 바꾸지 않습니다.",
  "2. 생활형 예시는 기능 이해에만 쓰고 실제 수행은 경영지원·마케팅별 가상 직무 사례로 전환합니다.",
  "3. M09 종료 전에는 원본 링크·첨부·QR·공개 다운로드를 수강생 문서에 넣지 않습니다.",
  "4. 무료 범위·메뉴·크레딧·지역 제공 여부는 수업 당일 공식 도움말과 실제 계정을 우선합니다.",
  "5. 공개 녹화·캡처에는 이메일·계정·최근 파일·API Key가 보이지 않게 합니다.",
  "6. 수강생 기록은 `한 줄 핵심·최종 프롬프트·막힌 점과 해결·결과 링크`만 남겨 필기 부담을 줄입니다.",
  "",
  "## 2026-08-08 공식 확인 메모",
  "",
  "- [Notion 공식 요금제](https://www.notion.com/ko/pricing)에서 개인 무료 사용자의 무제한 페이지·블록, 멤버 2명 이상 제한, 파일당 5MB, 기록 7일, 게스트 10명, 차트 1개, 제한된 AI 체험을 다시 확인했습니다.",
  "- [Gemini Notebook 공식 도움말](https://support.google.com/gemininotebook/answer/16164461?hl=en)은 PDF·웹·YouTube·오디오·Docs·Slides 출처와 출처 기반 대화·학습 자료 변환을 안내합니다.",
  "- [NotebookLM 명칭 변경 공식 발표](https://blog.google/innovation-and-ai/products/gemini-notebook/notebooklm-gemini-notebook/)에 따라 현재 명칭은 Gemini Notebook입니다.",
  "- [Learn Your Way 공식 소개](https://blog.google/products-and-platforms/products/education/learn-your-way/)는 Google Research 실험으로 설명하므로 필수 실습이 아니라 접근 가능자 선택 확장으로만 다룹니다.",
  "",
  "## 함께 사용할 파일",
  "",
  "- `reference-materials-dashboard.html`: 일자별 페이지를 수업 전에 빠르게 확인",
  "- `15-day-reference-page-map.csv`: 필터·정렬 가능한 페이지 맵",
  "- `course-end-distribution-checklist.md`: M09 종료 후 배포 기록",
  "",
].join("\n");
fs.writeFileSync(path.join(resourceRoot, "instructor-reference-use-plan-2026-08-08.md"), operationsGuide, "utf8");

console.log(JSON.stringify({
  sourceFiles: sourceManifest.length,
  instructorGuidesUpdated: Object.keys(dayUse).length * Object.keys(roles).length,
  learnerPreclassGuides: Object.keys(roles).length,
  learnerReleaseGuides: Object.keys(roles).length,
  svgInfographics: 2,
  htmlExamples: 3,
  referencePageMapRows: Object.keys(dayUse).length,
  apiKeyRequired: false,
}, null, 2));
