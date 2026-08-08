import fs from "node:fs";
import path from "node:path";

const ROOT = path.resolve(import.meta.dirname, "..");
const OUTPUT = path.join(ROOT, "docs", "design", "samples", "optional-refresh");
fs.mkdirSync(OUTPUT, { recursive: true });

const font = "'Pretendard','Noto Sans KR','Malgun Gothic',sans-serif";

function shell({ accent, accent2, title, subtitle, course, body }) {
  return `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" width="2048" height="1152" viewBox="0 0 2048 1152">
  <defs>
    <linearGradient id="bg" x1="0" y1="0" x2="1" y2="1"><stop stop-color="#FBFCFE"/><stop offset="1" stop-color="#F1F4FA"/></linearGradient>
    <linearGradient id="brand" x1="0" y1="0" x2="1" y2="1"><stop stop-color="${accent}"/><stop offset="1" stop-color="${accent2}"/></linearGradient>
    <radialGradient id="halo"><stop stop-color="${accent}" stop-opacity=".22"/><stop offset=".7" stop-color="${accent}" stop-opacity=".05"/><stop offset="1" stop-color="${accent}" stop-opacity="0"/></radialGradient>
    <filter id="shadow" x="-30%" y="-30%" width="160%" height="170%"><feDropShadow dx="0" dy="16" stdDeviation="22" flood-color="#16213A" flood-opacity=".12"/></filter>
    <filter id="softShadow" x="-20%" y="-30%" width="140%" height="170%"><feDropShadow dx="0" dy="8" stdDeviation="12" flood-color="#16213A" flood-opacity=".10"/></filter>
    <pattern id="dots" width="36" height="36" patternUnits="userSpaceOnUse"><circle cx="2" cy="2" r="1.6" fill="#9DABC1" opacity=".18"/></pattern>
  </defs>
  <rect width="2048" height="1152" fill="url(#bg)"/>
  <rect x="0" y="0" width="2048" height="1152" fill="url(#dots)"/>
  <circle cx="1870" cy="150" r="270" fill="url(#halo)"/>
  <style>
    .meta{font-family:${font};font-size:25px;font-weight:800;letter-spacing:1px}
    .title{font-family:${font};font-size:82px;font-weight:900;letter-spacing:-3px;fill:#10182B}
    .subtitle{font-family:${font};font-size:34px;font-weight:650;letter-spacing:-1px;fill:#4E5A70}
    .label{font-family:${font};font-size:31px;font-weight:850;letter-spacing:-1px;fill:#151D30}
    .small{font-family:${font};font-size:23px;font-weight:650;letter-spacing:-.4px;fill:#5A667A}
    .step{font-family:${font};font-size:20px;font-weight:900;letter-spacing:1px}
    .message{font-family:${font};font-size:33px;font-weight:800;letter-spacing:-1px}
  </style>
  <rect x="104" y="62" width="150" height="48" rx="24" fill="url(#brand)"/>
  <text x="179" y="95" text-anchor="middle" class="meta" fill="#FFFFFF">선택 자료</text>
  <text x="1944" y="95" text-anchor="end" class="meta" fill="${accent}">${course}</text>
  <text x="104" y="215" class="title">${title}</text>
  <text x="106" y="274" class="subtitle">${subtitle}</text>
  ${body}
</svg>`;
}

function commonSample() {
  const steps = [
    { x: 118, no: "01", title: "분석·예측", desc: "정해진 데이터에서\n패턴과 가능성 찾기", icon: `<path d="M194 575v-74M246 575v-116M298 575v-48M350 575v-150" stroke="#3157D5" stroke-width="16" stroke-linecap="round"/><path d="M188 487l58-38 52 39 58-73" fill="none" stroke="#14A89A" stroke-width="10" stroke-linecap="round" stroke-linejoin="round"/>` },
    { x: 575, no: "02", title: "생성", desc: "질문과 지시에서\n새 초안 만들기", icon: `<rect x="651" y="438" width="172" height="142" rx="22" fill="#EEF2FF" stroke="#3157D5" stroke-width="8"/><path d="M690 484h94M690 521h72M690 558h86" stroke="#3157D5" stroke-width="10" stroke-linecap="round"/><path d="M829 424l12 28 28 12-28 12-12 28-12-28-28-12 28-12z" fill="#14A89A"/>` },
    { x: 1032, no: "03", title: "멀티모달", desc: "텍스트·이미지·음성을\n한 맥락에서 다루기", icon: `<circle cx="1198" cy="510" r="72" fill="#F0F4FF" stroke="#3157D5" stroke-width="8"/><rect x="1110" y="450" width="70" height="58" rx="12" fill="#FFFFFF" stroke="#14A89A" stroke-width="7"/><path d="M1126 492l17-19 20 20" fill="none" stroke="#14A89A" stroke-width="7"/><path d="M1214 470v78M1240 486v46M1266 458v102" stroke="#7357C8" stroke-width="12" stroke-linecap="round"/>` },
    { x: 1489, no: "04", title: "에이전트", desc: "목표에 맞춰 도구를 쓰고\n결과를 검증하며 실행하기", icon: `<circle cx="1655" cy="510" r="84" fill="url(#brand)"/><rect x="1604" y="474" width="102" height="76" rx="28" fill="#FFFFFF"/><circle cx="1637" cy="512" r="9" fill="#3157D5"/><circle cx="1673" cy="512" r="9" fill="#3157D5"/><path d="M1634 535h42M1655 449v-22M1643 427h24" stroke="#FFFFFF" stroke-width="9" stroke-linecap="round"/>` },
  ];
  const cards = steps.map((step, index) => {
    const arrow = index < 3 ? `<path d="M${step.x + 398} 592H${step.x + 447}" stroke="#B8C4D8" stroke-width="8" stroke-linecap="round"/><path d="M${step.x + 430} 574l18 18-18 18" fill="none" stroke="#3157D5" stroke-width="8" stroke-linecap="round" stroke-linejoin="round"/>` : "";
    const descLines = step.desc.split("\n").map((line, i) => `<text x="${step.x + 166}" y="${693 + i * 35}" text-anchor="middle" class="small">${line}</text>`).join("");
    return `${arrow}<g filter="url(#shadow)"><rect x="${step.x}" y="360" width="332" height="455" rx="38" fill="#FFFFFF" stroke="${index === 3 ? "#3157D5" : "#E0E6F0"}" stroke-width="${index === 3 ? 6 : 2}"/></g><rect x="${step.x + 24}" y="386" width="62" height="38" rx="19" fill="${index === 3 ? "#3157D5" : "#EDF1FF"}"/><text x="${step.x + 55}" y="413" text-anchor="middle" class="step" fill="${index === 3 ? "#FFFFFF" : "#3157D5"}">${step.no}</text>${step.icon}<text x="${step.x + 166}" y="647" text-anchor="middle" class="label">${step.title}</text>${descLines}`;
  }).join("");
  return shell({
    accent: "#3157D5", accent2: "#14A89A", course: "공통 · M05 D01",
    title: "2026 AI 흐름을 네 단계로 읽기",
    subtitle: "공식 기능 변화는 계속되지만, 수업에서는 능력의 확장 방향을 한 흐름으로 이해합니다.",
    body: `${cards}<g filter="url(#softShadow)"><rect x="306" y="895" width="1436" height="100" rx="50" fill="#101B36"/></g><circle cx="376" cy="945" r="34" fill="url(#brand)"/><path d="M359 945l13 13 24-29" fill="none" stroke="#FFFFFF" stroke-width="9" stroke-linecap="round" stroke-linejoin="round"/><text x="1024" y="958" text-anchor="middle" class="message" fill="#FFFFFF">AI는 생성에서 끝나지 않고, 여러 입력과 도구를 연결해 실행하는 방향으로 확장됩니다.</text>`,
  });
}

function backofficeSample() {
  const cards = [
    ["자주 반복", "같은 형식이\n계속 돌아오는가?", 260, 390, "repeat"],
    ["대기 길음", "승인과 전달에서\n시간이 멈추는가?", 1370, 390, "wait"],
    ["검토 많음", "사람이 같은 오류를\n반복 확인하는가?", 260, 705, "check"],
    ["형식 일정", "입력과 출력의 틀이\n대체로 같은가?", 1370, 705, "grid"],
  ];
  const cardSvg = cards.map(([title, desc, x, y, icon]) => {
    const lines = desc.split("\n").map((line, i) => `<text x="${x + 250}" y="${y + 121 + i * 32}" text-anchor="middle" class="small">${line}</text>`).join("");
    const icons = {
      repeat: `<path d="M${x + 54} ${y + 92}a44 44 0 1 1 10 36" fill="none" stroke="#14A89A" stroke-width="11" stroke-linecap="round"/><path d="M${x + 54} ${y + 92}l-1 32 31-4" fill="none" stroke="#14A89A" stroke-width="11" stroke-linecap="round" stroke-linejoin="round"/>`,
      wait: `<path d="M${x + 47} ${y + 55}h74M${x + 47} ${y + 139}h74M${x + 59} ${y + 58}c0 38 50 38 50 79M${x + 109} ${y + 58}c0 38-50 38-50 79" fill="none" stroke="#3157D5" stroke-width="10" stroke-linecap="round"/>`,
      check: `<rect x="${x + 48}" y="${y + 48}" width="76" height="98" rx="14" fill="none" stroke="#14A89A" stroke-width="9"/><path d="M${x + 65} ${y + 79}l9 9 17-20M${x + 65} ${y + 113}l9 9 17-20" fill="none" stroke="#14A89A" stroke-width="8" stroke-linecap="round" stroke-linejoin="round"/>`,
      grid: `<rect x="${x + 47}" y="${y + 54}" width="84" height="84" rx="12" fill="none" stroke="#3157D5" stroke-width="9"/><path d="M${x + 89} ${y + 54}v84M${x + 47} ${y + 96}h84" stroke="#3157D5" stroke-width="8"/>`,
    };
    return `<g filter="url(#softShadow)"><rect x="${x}" y="${y}" width="500" height="215" rx="32" fill="#FFFFFF" stroke="#DCE4EF" stroke-width="2"/></g><rect x="${x + 26}" y="${y + 26}" width="130" height="163" rx="26" fill="#F0F5FA"/>${icons[icon]}<text x="${x + 250}" y="${y + 74}" text-anchor="middle" class="label">${title}</text>${lines}`;
  }).join("");
  return shell({
    accent: "#3157D5", accent2: "#14A89A", course: "경영지원 · M05 D01",
    title: "반복 업무 병목 카드 분류",
    subtitle: "네 기준이 많이 겹치는 업무일수록 첫 자동화 후보로 검토하기 좋습니다.",
    body: `${cardSvg}<path d="M760 498C850 498 842 568 900 568M1288 498C1198 498 1206 568 1148 568M760 812C850 812 842 670 900 670M1288 812C1198 812 1206 670 1148 670" fill="none" stroke="#3157D5" stroke-width="6" opacity=".75"/><circle cx="1024" cy="620" r="185" fill="url(#halo)"/><g filter="url(#shadow)"><path d="M1024 435l148 86v198l-148 86-148-86V521z" fill="url(#brand)"/></g><path d="M956 616h136M1024 548v136" stroke="#FFFFFF" stroke-width="13" stroke-linecap="round" opacity=".9"/><text x="1024" y="750" text-anchor="middle" class="message" fill="#FFFFFF">첫 자동화 후보</text><text x="1024" y="1045" text-anchor="middle" class="message" fill="#172033">빈도·대기·검토·형식을 함께 보고, 작은 초안 업무부터 시작합니다.</text>`,
  });
}

function marketingSample() {
  const stages = [
    ["재가공 많음", "한 원본을 여러 채널로", 305, 505, "#E6614F"],
    ["검토 반복", "같은 문구를 여러 번 수정", 720, 410, "#7357C8"],
    ["채널 변형", "규격·톤·길이를 재조정", 1135, 410, "#E6614F"],
    ["일정 압박", "마감 직전 작업이 집중", 1550, 505, "#7357C8"],
  ];
  const pods = stages.map(([title, desc, cx, cy, color], index) => `<g filter="url(#softShadow)"><circle cx="${cx}" cy="${cy}" r="132" fill="#FFFFFF" stroke="${color}" stroke-width="7"/></g><circle cx="${cx}" cy="${cy - 56}" r="28" fill="${color}"/><text x="${cx}" y="${cy - 47}" text-anchor="middle" class="step" fill="#FFFFFF">0${index + 1}</text><text x="${cx}" y="${cy + 16}" text-anchor="middle" class="label">${title}</text><text x="${cx}" y="${cy + 63}" text-anchor="middle" class="small">${desc}</text>`).join("");
  return shell({
    accent: "#E6614F", accent2: "#7357C8", course: "마케팅 · M05 D01",
    title: "반복 콘텐츠 병목 카드 분류",
    subtitle: "제작량보다 재가공과 검토가 반복되는 지점을 먼저 찾아야 개선 효과가 큽니다.",
    body: `<path d="M305 505C545 270 835 270 1024 470C1213 270 1503 270 1743 505" fill="none" stroke="url(#brand)" stroke-width="22" stroke-linecap="round" opacity=".18"/><path d="M305 505C545 780 835 780 1024 580C1213 780 1503 780 1743 505" fill="none" stroke="url(#brand)" stroke-width="10" stroke-linecap="round" stroke-dasharray="18 22" opacity=".55"/>${pods}<g filter="url(#shadow)"><circle cx="1024" cy="650" r="152" fill="url(#brand)"/></g><path d="M957 635h134M990 590l-46 45 46 45M1058 590l46 45-46 45" fill="none" stroke="#FFFFFF" stroke-width="11" stroke-linecap="round" stroke-linejoin="round"/><text x="1024" y="722" text-anchor="middle" class="message" fill="#FFFFFF">개선 후보</text><g filter="url(#softShadow)"><rect x="315" y="900" width="1418" height="104" rx="52" fill="#FFFFFF" stroke="#E4DDEB" stroke-width="3"/></g><text x="1024" y="963" text-anchor="middle" class="message" fill="#201D2C">재가공·검토·채널 변형·일정 압박이 겹치는 콘텐츠부터 작게 테스트합니다.</text>`,
  });
}

const samples = {
  "sample-common-ai-flow.svg": commonSample(),
  "sample-backoffice-bottleneck.svg": backofficeSample(),
  "sample-marketing-bottleneck.svg": marketingSample(),
};

for (const [filename, svg] of Object.entries(samples)) {
  fs.writeFileSync(path.join(OUTPUT, filename), svg, "utf8");
  console.log(`created=${path.relative(ROOT, path.join(OUTPUT, filename))}`);
}
