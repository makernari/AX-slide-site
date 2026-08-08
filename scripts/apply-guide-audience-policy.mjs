import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const AS_OF = "2026-08-09";
const ROLES = {
  backoffice: {
    label: "경영지원",
    course: "스마트 경영지원",
    publicTitle: "AX 경영지원 개인 학습 대시보드",
    introFocus: "반복 업무와 사람의 검증 책임",
    dailyExample: "업무 장면·오늘 만든 결과·확인한 근거·다음 적용 행동",
    verify: "담당 역할·기한·수치·규정·개인정보·승인 책임",
  },
  marketing: {
    label: "마케팅",
    course: "마케팅·SNS 콘텐츠 기획·브랜딩",
    publicTitle: "AX 마케팅 개인 학습 대시보드",
    introFocus: "콘텐츠 목표·대상·채널과 브랜드 검증 책임",
    dailyExample: "콘텐츠 목표·오늘 만든 결과·브랜드 검토·다음 제작 행동",
    verify: "브랜드 사실·타깃·채널 맥락·과장 표현·저작권·검토 상태",
  },
};
const DAYS = [
  "M05-D01", "M05-D02", "M05-D03", "M05-D04",
  "M06-D01", "M06-D02", "M06-D03",
  "M07-D01", "M07-D02", "M07-D03",
  "M08-D01", "M08-D02", "M08-D03", "M08-D04",
  "M09-D01",
];

const LEARNER_POLICY = "LEARNER-ESSENTIAL-GUIDE-20260809";
const LEARNER_DASHBOARD = "LEARNER-PUBLIC-DASHBOARD-20260809";
const INSTRUCTOR_TOOLS = "INSTRUCTOR-DAY-OF-TOOL-CHECK-20260809";
const INSTRUCTOR_ONEPAGE = "INSTRUCTOR-ONE-PAGE-20260809";
const INSTRUCTOR_DASHBOARD = "INSTRUCTOR-PUBLIC-DASHBOARD-20260809";
const README_POLICY = "GUIDE-AUDIENCE-POLICY-20260809";

function read(relativePath) {
  return fs.readFileSync(path.join(ROOT, relativePath), "utf8");
}

function write(relativePath, content) {
  fs.writeFileSync(path.join(ROOT, relativePath), `${normalizeVrew(String(content)).trim()}\n`, "utf8");
}

function normalizeVrew(text) {
  return String(text)
    .replaceAll(
      "원본 교안의 도구 역할 비교는 유지하되 실제 최종 편집은 Vrew에서 완료합니다. CapCut 계정이나 체험 기간은 실습 완료 조건이 아닙니다.",
      "실제 최종 편집은 Vrew에서 완료합니다. 별도 편집 도구 계정이나 설치는 실습 완료 조건이 아닙니다.",
    )
    .replaceAll(
      "CapCut은 도구 역할 비교에서만 언급하고 설치·로그인·편집·내보내기를 요구하지 않습니다.",
      "별도 편집 도구는 사용하지 않고 Vrew에서 편집·내보내기를 완료합니다.",
    )
    .replaceAll(
      "최종 Excel의 M06-D01 이미지·Flow 영상과 M06-D02 Vrew·Suno·CapCut 역할 구조를 유지합니다.",
      "최종 Excel의 M06-D01 이미지·Flow 영상과 M06-D02 Vrew·Suno 제작 흐름을 유지합니다.",
    )
    .replaceAll(
      "운영 업데이트로 최종 편집 도구는 Vrew를 사용하고 CapCut은 역할 비교만 합니다.",
      "운영 업데이트로 최종 편집과 내보내기는 Vrew에서 완료합니다.",
    )
    .replaceAll("Vrew·Suno·CapCut", "Vrew·Suno")
    .replaceAll("Suno/CapCut 역할 비교", "Suno 음악 생성과 Vrew 편집 역할 구분")
    .replaceAll("- CapCut: 도구 역할 비교용이며 실제 편집·로그인·내보내기는 요구하지 않음", "- 별도 추가 편집 도구는 사용하지 않음")
    .replaceAll("- Vrew: 도구 역할 비교용이며 실제 편집·로그인·내보내기는 요구하지 않음", "- 별도 추가 편집 도구는 사용하지 않음")
    .replaceAll("CapCut 설치·로그인·체험 기간", "별도 편집 도구의 설치·로그인·체험 기간")
    .replaceAll("CapCut 세로 타임라인", "Vrew 세로 타임라인")
    .replaceAll("CapCut", "Vrew")
    .replaceAll("Vrew·Suno·Vrew", "Vrew·Suno")
    .replaceAll("Vrew/Vrew", "Vrew");
}

function removeMarker(text, marker) {
  const pattern = new RegExp(
    `\\n?<!-- ${marker}:START -->[\\s\\S]*?<!-- ${marker}:END -->\\n?`,
    "g",
  );
  return text.replace(pattern, "\n");
}

function stripAllMarkerBlocks(text) {
  return text.replace(
    /\n?<!-- ([A-Z0-9-]+):START -->[\s\S]*?<!-- \1:END -->\n?/g,
    "\n",
  );
}

function extractSection(text, number) {
  const pattern = new RegExp(`^## ${number}\\. .+$`, "m");
  const match = text.match(pattern);
  if (!match || match.index === undefined) throw new Error(`Missing learner section ${number}`);
  const next = text.slice(match.index + match[0].length).search(/^## \d+\. .+$/m);
  const end = next < 0
    ? text.length
    : match.index + match[0].length + next;
  return text.slice(match.index, end).trim();
}

function removeScreenshotPlanning(text) {
  const output = [];
  let skipping = false;
  for (const line of text.split(/\r?\n/)) {
    if (/^>\s*📷\s*실제 스크린샷 필요/.test(line)) {
      skipping = true;
      continue;
    }
    if (skipping) {
      if (!line.trim()) skipping = false;
      continue;
    }
    output.push(line);
  }
  return output.join("\n");
}

function cleanSection(text) {
  return normalizeVrew(removeScreenshotPlanning(stripAllMarkerBlocks(text)))
    .replace(/\n{3,}/g, "\n\n")
    .trim();
}

function renumberSection(text, number, title) {
  return cleanSection(text)
    .replace(/^## \d+\. .+$/m, `## ${number}. ${title}`)
    .replace(/^### \d+-/gm, `### ${number}-`);
}

function filterLesson(text, number, title) {
  const cleaned = cleanSection(text);
  const firstHeadingEnd = cleaned.indexOf("\n");
  const body = firstHeadingEnd < 0 ? "" : cleaned.slice(firstHeadingEnd + 1);
  const matches = [...body.matchAll(/^###\s+(.+)$/gm)];
  const keepWords = [
    "목표", "시작 위치", "단계별 따라 하기", "복사해서 사용할",
    "정상 결과", "막혔을 때", "완료 기준", "결과물 정리",
    "최종 검토", "저장 및 제출",
  ];
  const chunks = [];
  for (let index = 0; index < matches.length; index += 1) {
    const match = matches[index];
    const end = index + 1 < matches.length ? matches[index + 1].index : body.length;
    if (keepWords.some((word) => match[1].includes(word))) {
      chunks.push(body.slice(match.index, end).trim());
    }
  }
  if (!chunks.length) throw new Error(`No essential subsections found for ${title}`);
  return [
    `## ${number}. ${title}`,
    "",
    ...chunks.map((chunk) => chunk.replace(/^### \d+-/gm, `### ${number}-`)),
  ].join("\n\n");
}

function sectionBody(text) {
  return cleanSection(text).replace(/^## \d+\. .+\n?/, "").trim();
}

function learnerDashboardBlock(day, role) {
  if (day === "M05-D01") {
    return [
      `<!-- ${LEARNER_DASHBOARD}:START -->`,
      "## 11. 첫날 필수 · 개인 공개 학습 대시보드와 자기소개",
      "",
      "> 기본 운영은 정규 4시간 시작 전 35~40분입니다. 별도 시간이 없으면 강사 안내에 따라 3·4차시의 마지막 20분씩 나누어 진행합니다.",
      "",
      "### 11-1. 공개 공간과 비공개 공간을 먼저 분리합니다",
      "",
      `1. Notion의 개인 영역에 \`${role.publicTitle}\` 페이지를 만듭니다. 이 페이지만 웹에 게시합니다.`,
      `2. 별도로 \`AX ${role.label} 개인 작업실 (비공개)\` 페이지를 만듭니다. 프롬프트 원문·실패 기록·상세 메모는 이곳에 둡니다.`,
      "3. 공개 대시보드 아래에는 공개해도 되는 페이지만 둡니다. 공개 페이지의 하위 페이지는 같은 공개 범위를 이어받을 수 있으므로 비공개 작업 노트를 하위에 만들지 않습니다.",
      "",
      "### 11-2. 공개 대시보드에 필수 블록을 만듭니다",
      "",
      "아래 구조만 먼저 만들고 꾸미기는 수업 후에 합니다.",
      "",
      "```text",
      `페이지 제목: [별칭]의 ${role.publicTitle}`,
      "1. 이번 과정 목표 — 15일 뒤 만들고 싶은 변화 1문장",
      "2. 자기소개 — 별도 하위 페이지 1개",
      "3. 15일 학습 기록 — 일자 / 한 문장 배움 / 공개 결과 / 다음 행동",
      `4. 나의 검증 원칙 — ${role.verify}`,
      "```",
      "",
      "### 11-3. 자기소개 페이지를 만들고 30초 발표를 준비합니다",
      "",
      "1. 공개 대시보드에서 새 하위 페이지를 만들고 제목을 `자기소개`로 지정합니다.",
      "2. 실명 대신 별칭을 써도 됩니다. 소속 기관·부서·연락처·이메일은 넣지 않습니다.",
      `3. ${role.introFocus}을 중심으로 아래 네 문장을 작성합니다.`,
      "",
      "```text",
      "저는 [별칭]입니다.",
      `저는 [${role.label}에서 관심 있는 안전한 교육용 장면]을 개선하고 싶습니다.`,
      "이번 15일 동안 [만들고 싶은 결과]를 완성하겠습니다.",
      `AI 결과는 [${role.verify}] 기준으로 제가 확인하겠습니다.`,
      "```",
      "",
      "4. 발표할 때는 자기소개 페이지를 화면에 띄우고 네 문장만 30초 안에 말합니다.",
      "",
      "### 11-4. Markdown 파일은 ‘열기’가 아니라 ‘가져오기’로 편집합니다",
      "",
      "- 데스크톱에서 `.md` 파일을 Notion으로 바로 열면 읽기 전용 미리보기일 수 있습니다.",
      "- 편집 가능한 페이지가 필요하면 데스크톱 또는 웹에서 `설정 → 가져오기 → Text & Markdown`을 사용합니다.",
      "- 가져온 뒤 제목·표·코드 블록이 정상인지 확인하고, 필요한 블록만 공개 대시보드로 옮깁니다.",
      "",
      "### 11-5. 웹에 게시하고 공개 상태를 검사합니다",
      "",
      "1. 공개 대시보드에서 `공유 → 게시`를 엽니다. 현재 계정에 게시가 허용되지 않으면 강사에게 알리고 비공개 상태로 둡니다.",
      "2. 검색 엔진 색인, 외부 편집, 템플릿 복제 허용 옵션이 보이면 모두 끕니다.",
      "3. 게시 링크를 복사해 로그아웃 창 또는 시크릿 창에서 엽니다.",
      "4. 실명·연락처·기관명·고객정보·내부자료·공개하면 안 되는 하위 페이지가 보이지 않는지 확인합니다.",
      "5. 검사가 끝난 링크만 강사가 안내한 과정별 링크 보드에 `별칭｜과정｜대시보드 URL`로 제출합니다.",
      "",
      "### 11-6. 첫날 완료 기준",
      "",
      "- [ ] 공개 대시보드와 비공개 작업실이 분리되어 있음",
      "- [ ] 자기소개 하위 페이지와 30초 발표문이 있음",
      "- [ ] 15일 학습 기록 영역과 검증 원칙이 있음",
      "- [ ] 공개 옵션과 공개 내용을 로그아웃 상태에서 확인함",
      "- [ ] 같은 대시보드 URL을 과정 동안 계속 업데이트할 준비가 됨",
      `<!-- ${LEARNER_DASHBOARD}:END -->`,
    ].join("\n");
  }

  return [
    `<!-- ${LEARNER_DASHBOARD}:START -->`,
    "## 11. 종료 전 5분 · 개인 공개 학습 대시보드 업데이트",
    "",
    "1. 첫날 만든 공개 대시보드를 엽니다.",
    `2. 오늘 행에 \`${day}｜한 문장 배움｜공개해도 되는 결과 1개｜다음 행동 1개\`를 기록합니다.`,
    `3. 공개 기록은 \`${role.dailyExample}\`만 남기고 원본 입력·내부 메모·개인정보는 비공개 작업실에 둡니다.`,
    "4. 로그아웃 창에서 같은 URL을 열어 오늘 항목만 정상적으로 보이는지 확인합니다.",
    "5. 링크 주소가 바뀌지 않았으면 다시 제출하지 않고, 강사가 요청한 경우에만 완료 표시를 갱신합니다.",
    "",
    "완료 기준: 오늘의 배움·공개 결과·다음 행동이 한 줄씩 있고 공개 금지 정보가 없습니다.",
    `<!-- ${LEARNER_DASHBOARD}:END -->`,
  ].join("\n");
}

function buildLearnerGuide(source, day, role) {
  if (source.includes(`<!-- ${LEARNER_POLICY}:START -->`)) {
    return normalizeVrew(source);
  }
  const delimiter = source.indexOf("\n---");
  if (delimiter < 0) throw new Error(`Learner header delimiter missing: ${day}`);
  let header = normalizeVrew(source.slice(0, delimiter).trim());
  if (day === "M05-D01") {
    header = header.replace(
      /^(> 오늘의 최종 결과물:\s*.+)$/m,
      "$1, 개인 공개 학습 대시보드와 자기소개 발표 페이지",
    );
  }

  const policy = [
    `<!-- ${LEARNER_POLICY}:START -->`,
    "> 이 문서는 수업 중 반드시 수행할 내용만 담습니다. 선택 활동·강의 설명·정답 해설은 강사용 문서에 분리되어 있습니다.",
    "> 각 차시는 `시작 위치 → 따라 하기 → 정상 결과 → 막혔을 때 → 완료 기준` 순서로 진행합니다.",
    `<!-- ${LEARNER_POLICY}:END -->`,
  ].join("\n");

  const recovery = [
    "## 9. 막혔을 때 바로 복구하기",
    "",
    "### 9-1. 자주 발생하는 오류",
    "",
    sectionBody(extractSection(source, 12)),
    "",
    "### 9-2. 도구를 사용할 수 없을 때",
    "",
    sectionBody(extractSection(source, 13)),
  ].join("\n");

  const finish = [
    "## 10. 최종 점검·저장·제출",
    "",
    "### 10-1. 최종 점검표",
    "",
    sectionBody(extractSection(source, 15)),
    "",
    "### 10-2. 저장 및 제출",
    "",
    sectionBody(extractSection(source, 16)),
  ].join("\n");

  const next = renumberSection(extractSection(source, 18), 12, "다음 수업 준비");
  return normalizeVrew([
    header,
    "---",
    policy,
    renumberSection(extractSection(source, 4), 1, "오늘의 4시간 실습 지도"),
    renumberSection(extractSection(source, 5), 2, "시작 전 필수 준비"),
    renumberSection(extractSection(source, 6), 3, "안전하게 실습하는 규칙"),
    renumberSection(extractSection(source, 7), 4, "실습 전에 꼭 알아둘 개념"),
    filterLesson(extractSection(source, 8), 5, "1차시 실습"),
    filterLesson(extractSection(source, 9), 6, "2차시 실습"),
    filterLesson(extractSection(source, 10), 7, "3차시 실습"),
    filterLesson(extractSection(source, 11), 8, "4차시 실습"),
    recovery,
    finish,
    learnerDashboardBlock(day, role),
    next,
  ].join("\n\n")).replace(/\n{3,}/g, "\n\n");
}

function plain(value) {
  return String(value)
    .replace(/!\[[^\]]*\]\([^)]*\)/g, "")
    .replace(/\[([^\]]+)\]\([^)]*\)/g, "$1")
    .replace(/[*_`]/g, "")
    .replace(/\s+/g, " ")
    .trim();
}

function short(value, max = 66) {
  const text = plain(value);
  return text.length <= max ? text : `${text.slice(0, max - 1).trimEnd()}…`;
}

function tableText(value) {
  return short(value).replaceAll("|", "／");
}

function parseTools(learnerSource, day) {
  const compact = learnerSource.includes(`<!-- ${LEARNER_POLICY}:START -->`);
  const sectionNumber = compact ? 2 : 5;
  const section = extractSection(learnerSource, sectionNumber);
  const start = section.search(new RegExp(`^### ${sectionNumber}-2\\. `, "m"));
  if (start < 0) return ["수업용 브라우저와 계정"];
  const tail = section.slice(start);
  const next = tail.slice(tail.indexOf("\n") + 1).search(/^### /m);
  const block = next < 0 ? tail : tail.slice(0, tail.indexOf("\n") + 1 + next);
  const tools = block
    .split(/\r?\n/)
    .filter((line) => /^-\s+/.test(line))
    .map((line) => plain(line.replace(/^-\s+/, "")))
    .filter((tool) => tool && !tool.includes("현재 메뉴·무료 범위·사용 한도") && !tool.includes("별도 추가 편집 도구"));
  if (day === "M05-D01") tools.push("Notion 개인 워크스페이스와 웹 게시 권한");
  return [...new Set(tools)].slice(0, 10);
}

function parseSessions(instructorSource) {
  const tableRegex = /^\| ([1-4])차시 \| ([^|]+) \| ([^|]+) \| ([^|]+) \| ([^|]+) \| ([^|]+) \| ([^|]+) \|$/gm;
  const sessions = [...instructorSource.matchAll(tableRegex)].map((match) => ({
    number: Number(match[1]),
    time: match[2].trim(),
    slides: match[3].trim(),
    instructor: match[4].trim(),
    learner: match[5].trim(),
    output: match[6].trim(),
    checkpoint: match[7].trim(),
  }));
  if (sessions.length !== 4) throw new Error("Instructor four-session table missing");
  return sessions;
}

function metadata(text, label, fallback = "확인 필요") {
  const match = text.match(new RegExp(`^> ${label}:\\s*(.+)$`, "m"));
  return match ? plain(match[1]) : fallback;
}

function focus(text) {
  const match = text.match(/교육 초점은\s*\*\*([^*]+)\*\*/);
  if (match) return plain(match[1]);
  return plain(text.match(/^#\s+(.+)$/m)?.[1] ?? "오늘 실습");
}

function toolChecklistBlock(tools, day, role) {
  const rows = [...tools, "네트워크·브라우저·프로젝터", "수강생 배포 파일·대체 실습"]
    .map((tool) => `| ${tableText(tool)} | □ | □ | □ | □ | □ 정상 □ 제한 □ 중단 | 기록 |`);
  return [
    `<!-- ${INSTRUCTOR_TOOLS}:START -->`,
    "## 0. 수업 당일 도구 상태 점검표",
    "",
    `> ${AS_OF} 문서 기준 · 수업일 ____년 __월 __일 · 점검 시각 __:__ · 점검자 ______`,
    "> 이 표는 서비스 상태를 미리 단정하지 않습니다. 수업 당일 비식별 샘플 1건을 직접 실행한 결과만 표시합니다.",
    "",
    "| 도구·환경 | 로그인·접근 | 입력·생성 | 편집·검증 | 저장·재열기 | 최종 상태 | 제한 내용·대체 경로 |",
    "|---|:---:|:---:|:---:|:---:|---|---|",
    ...rows,
    "",
    "### 0-0-1. 15분 점검 순서",
    "",
    "1. 강사용 시연 계정만 남긴 새 브라우저 창을 열고 개인정보·최근 파일·API 키가 보이지 않는지 확인합니다.",
    "2. 각 필수 도구를 열어 로그인과 조직 정책 차단 여부를 확인합니다.",
    "3. 교육용 샘플 1건으로 `입력 → 실행 → 결과 확인 → 한 번 수정`까지 수행합니다.",
    "4. 결과를 저장하거나 내보낸 뒤 닫고 다시 열어 파일과 권한을 확인합니다.",
    "5. 수강생 배포 파일과 문서형 대체 실습을 네트워크 없이 한 번 엽니다.",
    "6. 핵심 도구 하나가 제한이면 그 차시만 대체 실습으로 전환하고, 둘 이상이 중단이면 처음부터 문서형 경로로 운영합니다.",
    "7. 실제 기관·고객 식별정보, 내부 수치, 권리 없는 자료, API 키가 화면·입력·결과에 노출되지 않았는지 마지막으로 확인합니다.",
    "",
    "### 0-0-2. 상태 판정 기준",
    "",
    "- **정상:** 강사와 수강생이 같은 최소 결과를 만들고 저장·재열기까지 가능",
    "- **제한:** 일부 계정·메뉴·생성 기능이 다르지만 준비된 대체 경로로 같은 완료 상태를 만들 수 있음",
    "- **중단:** 로그인·네트워크·조직 정책으로 핵심 실행이 불가능해 문서형 실습으로 즉시 전환해야 함",
    `<!-- ${INSTRUCTOR_TOOLS}:END -->`,
  ].join("\n");
}

function onePageBlock(source, sessions, day, role) {
  const required = metadata(source, "필수 결과물");
  const resource = metadata(source, "실습자료 위치");
  const rows = sessions.map((session) =>
    `| ${session.number}차시 | ${tableText(session.slides)} | ${tableText(session.learner)} | ${tableText(session.output)} | ${tableText(session.checkpoint)} |`,
  );
  return [
    `<!-- ${INSTRUCTOR_ONEPAGE}:START -->`,
    "## 0-1. 오늘의 강사 원페이지",
    "",
    `| 항목 | 오늘의 기준 |`,
    "|---|---|",
    `| 과정·일자 | ${role.course} · ${day} |`,
    `| 교육 초점 | ${tableText(focus(source))} |`,
    `| 반드시 남길 결과 | ${tableText(required)} |`,
    `| 사람의 최종 검증 | ${role.verify} |`,
    `| 실습자료 | ${tableText(resource)} |`,
    `| 대시보드 마감 | ${day === "M05-D01" ? "공개 대시보드·자기소개 생성과 30초 발표" : "같은 공개 URL에 오늘 기록 1행 추가"} |`,
    "",
    "### 0-1-1. 네 차시 진행 지도",
    "",
    "| 차시 | 교안 범위 | 수강생 핵심 행동 | 차시 결과물 | 완료를 확인할 질문 |",
    "|---|---|---|---|---|",
    ...rows,
    "",
    "### 0-1-2. 시간 운영선",
    "",
    "- 0~5분: 완성 결과와 완료 기준을 먼저 보여 줍니다.",
    "- 5~22분: 강사가 비식별 샘플 1건을 천천히 시연합니다.",
    "- 22~43분: 수강생이 필수 결과를 직접 만들고 강사는 빨강 상태부터 복구합니다.",
    "- 43분: 새 기능 설명을 멈추고 오류 수정·검증·저장만 진행합니다.",
    "- 49~50분: 파일을 닫았다 다시 찾고 다음 차시 입력을 확인합니다.",
    `- ${day === "M05-D01" ? "Notion 공개 대시보드는 수업 전 35~40분을 기본으로 하고, 별도 시간이 없으면 3·4차시 마지막 20분씩 사용합니다." : "4차시 종료 전 5분에 공개 대시보드 오늘 기록을 갱신합니다."}`,
    "",
    "### 0-1-3. 시간이 부족할 때 남길 것과 뺄 것",
    "",
    "- 반드시 남김: 네 차시 최소 결과, 오류 수정 근거 1건, 저장·재열기, 공개 대시보드 오늘 기록",
    "- 먼저 생략: 수업 전 AI 워밍업, 빠른 학습자 확장, 두 번째 도구 비교, 추가 디자인 꾸미기",
    "- 도구가 막힘: 3분 안에 해결되지 않으면 수강생용 가이드의 문서형 대체 실습으로 이동",
    "",
    "### 0-1-4. 종료 전 10분",
    "",
    "- [ ] 네 차시 결과와 사람 검증 기록이 있음",
    "- [ ] 실제 개인정보·내부자료·자격증명이 없음",
    "- [ ] 파일명·저장 위치·소유자·공유 범위를 확인함",
    "- [ ] 미완료자는 최소 결과와 다음 행동을 기록함",
    "- [ ] 개인 공개 대시보드의 공개 금지 정보와 링크 작동을 확인함",
    `<!-- ${INSTRUCTOR_ONEPAGE}:END -->`,
  ].join("\n");
}

function instructorDashboardBlock(day, role) {
  if (day !== "M05-D01") {
    return [
      `<!-- ${INSTRUCTOR_DASHBOARD}:START -->`,
      "## 0-2. 개인 공개 학습 대시보드 운영",
      "",
      "### 0-2-1. 종료 전 5분 루틴",
      "",
      `1. 화면에 \`${day}｜한 문장 배움｜공개 결과 1개｜다음 행동 1개\`를 표시합니다.`,
      "2. 수강생은 공개 대시보드에 오늘 행을 추가하고 상세 프롬프트·실패 기록은 비공개 작업실에 둡니다.",
      "3. 강사는 결과 내용보다 공개 금지 정보·깨진 링크·다른 과정 사례 혼입을 먼저 확인합니다.",
      "4. 로그아웃 창에서 같은 URL이 열리는지 짝과 확인하고, 링크 주소는 첫날과 동일하게 유지합니다.",
      "5. 게시 기능이 제한된 수강생은 비공개 페이지를 화면 공유하며 완료 상태만 기록합니다. 조직 정책을 우회하지 않습니다.",
      "",
      `완료 질문: “오늘 공개한 한 줄에 ${role.verify}가 노출되지 않았고, 다음 행동이 하나로 적혀 있나요?”`,
      `<!-- ${INSTRUCTOR_DASHBOARD}:END -->`,
    ].join("\n");
  }

  return [
    `<!-- ${INSTRUCTOR_DASHBOARD}:START -->`,
    "## 0-2. 첫날 상세 운영 · Notion 공개 학습 대시보드와 자기소개",
    "",
    "> 목표는 예쁘게 꾸미는 것이 아니라 `공개할 학습 요약`과 `비공개 작업 기록`을 분리하고, 같은 공개 URL을 15일 동안 안전하게 갱신하는 것입니다.",
    "",
    "### 0-2-1. 강사가 수업 전에 준비할 것",
    "",
    `- [ ] 강사용 샘플 \`${role.publicTitle}\`와 비공개 작업실을 서로 다른 최상위 페이지로 만듦`,
    "- [ ] 공개 샘플에는 가상 별칭·교육용 문장·가상 결과만 넣음",
    "- [ ] 게시 옵션에서 검색 엔진 색인·외부 편집·템플릿 복제 허용이 꺼져 있는지 확인함",
    "- [ ] 로그아웃 창에서 공개 대시보드와 자기소개만 보이고 비공개 작업실은 보이지 않는지 확인함",
    "- [ ] 게시가 제한된 계정을 위한 화면 공유·로컬 Markdown 대체안을 열어 둠",
    "- [ ] 과정별 링크 보드는 `별칭｜과정｜대시보드 URL｜공개 확인` 네 열만 사용함",
    "",
    "### 0-2-2. 권장 40분 운영표",
    "",
    "| 시간 | 강사가 하는 일 | 수강생 완료 신호 |",
    "|---:|---|---|",
    "| 0~5분 | 공개 대시보드·비공개 작업실·자기소개 완성 화면을 비교 | 공개와 비공개의 차이를 말함 |",
    "| 5~10분 | 개인 영역에서 두 최상위 페이지를 만드는 과정을 한 번만 시연 | 두 페이지 이름이 보임 |",
    "| 10~18분 | 공개 대시보드에 과정 목표·학습 기록·검증 원칙을 만듦 | 공개 홈 기본 구조 완성 |",
    "| 18~26분 | 자기소개 하위 페이지와 네 문장 발표문을 만듦 | 30초 발표문 완성 |",
    "| 26~33분 | 공유→게시와 공개 옵션 점검을 시연 | 게시 링크 복사 |",
    "| 33~37분 | 로그아웃 창에서 공개 범위와 하위 페이지를 검사 | 비공개 정보 0건 |",
    "| 37~40분 | 짝과 30초 발표 후 과정별 링크 보드에 제출 | 발표·링크 제출 완료 |",
    "",
    "### 0-2-3. 초보 강사가 그대로 읽을 안내 멘트",
    "",
    "> “오늘 만들 대시보드는 전 과정을 공유하는 공개 요약 공간입니다. 상세 프롬프트와 실패 기록은 별도의 비공개 작업실에 둡니다. 공개 페이지 아래에 비공개 노트를 만들면 공개 범위를 이어받을 수 있으니, 지금은 공개해도 되는 자기소개와 학습 요약만 하위에 만들겠습니다.”",
    "",
    "### 0-2-4. 화면을 따라 하는 상세 순서",
    "",
    `1. Notion의 개인 영역에서 새 페이지를 만들고 이름을 \`${role.publicTitle}\`로 지정합니다.`,
    `2. 같은 수준에 \`AX ${role.label} 개인 작업실 (비공개)\`를 하나 더 만듭니다. 두 페이지가 부모–자식 관계가 아닌지 확인합니다.`,
    "3. 공개 대시보드에 과정 목표 1문장, 15일 학습 기록 영역, 검증 원칙을 만듭니다.",
    "4. 공개 대시보드 안에 `자기소개` 하위 페이지를 만들고 별칭·관심 장면·15일 목표·사람의 검증 약속을 적습니다.",
    "5. 실제 기관명·부서·연락처·이메일·고객·내부 수치·개인 사진은 필수 항목이 아니며 입력하지 않게 합니다.",
    "6. Markdown을 사용할 때는 파일을 바로 열어 생기는 읽기 전용 미리보기와 `설정 → 가져오기 → Text & Markdown`의 편집 가능한 가져오기를 비교합니다.",
    "7. 공개 대시보드에서 `공유 → 게시`를 열고 현재 계정에 표시되는 게시 옵션을 확인합니다.",
    "8. 검색 엔진 색인·외부 편집·템플릿 복제 허용이 보이면 모두 끕니다. 메뉴가 다르면 추측하지 않고 현재 화면을 기록합니다.",
    "9. 링크를 복사해 로그아웃 창 또는 시크릿 창에서 열고 공개 대시보드·자기소개 외의 페이지가 보이지 않는지 확인합니다.",
    "10. 수강생은 자기소개 페이지를 띄우고 네 문장을 30초 안에 발표합니다.",
    "11. 검사된 링크만 과정별 링크 보드에 제출하고, 이후 14일은 같은 URL의 학습 기록만 갱신합니다.",
    "",
    "### 0-2-5. 게시가 되지 않을 때",
    "",
    "- 조직 정책으로 게시가 차단됨: 설정을 우회하지 않고 비공개 페이지를 화면 공유하거나 로컬 발표문을 사용합니다.",
    "- 공개 링크에서 로그인을 요구함: 게시가 아니라 내부 공유 링크일 수 있으므로 공유 탭과 게시 탭을 구분해 다시 확인합니다.",
    "- 예상하지 않은 하위 페이지가 보임: 즉시 게시를 중단하고 해당 페이지를 비공개 최상위 공간으로 옮긴 뒤 다시 검사합니다.",
    "- Markdown이 수정되지 않음: 읽기 전용으로 연 파일을 닫고 데스크톱·웹의 가져오기 기능으로 다시 불러옵니다.",
    "- 메뉴가 다름: 현재 화면에서 보이는 항목만 기록하고 게시 없이 대체 발표를 진행합니다.",
    "",
    "### 0-2-6. 완료 판정",
    "",
    "- [ ] 공개 대시보드와 비공개 작업실이 같은 수준에서 분리됨",
    "- [ ] 자기소개 페이지가 교육용·비식별 네 문장으로 구성됨",
    "- [ ] 30초 발표와 링크 제출을 완료함",
    "- [ ] 로그아웃 상태에서 공개 범위를 확인함",
    "- [ ] 같은 URL을 15일 동안 갱신하는 방법을 설명할 수 있음",
    "",
    "### 0-2-7. 확인한 Notion 공식 자료",
    "",
    `- 확인일: ${AS_OF}`,
    "- Markdown 가져오기: https://www.notion.com/help/import-data-into-notion",
    "- 게시 페이지 관리: https://www.notion.com/help/manage-your-notion-sites",
    "- 공유·권한·하위 페이지 권한 상속: https://www.notion.com/help/sharing-and-permissions",
    `<!-- ${INSTRUCTOR_DASHBOARD}:END -->`,
  ].join("\n");
}

function insertInstructorBlocks(source, blocks) {
  let text = normalizeVrew(source);
  for (const marker of [INSTRUCTOR_TOOLS, INSTRUCTOR_ONEPAGE, INSTRUCTOR_DASHBOARD]) {
    text = removeMarker(text, marker);
  }
  const delimiter = text.indexOf("\n---");
  if (delimiter < 0) throw new Error("Instructor header delimiter missing");
  const lineEnd = text.indexOf("\n", delimiter + 1);
  const insertion = lineEnd < 0 ? text.length : lineEnd + 1;
  return [text.slice(0, insertion).trimEnd(), "", ...blocks, "", text.slice(insertion).trimStart()]
    .join("\n")
    .replace(/\n{3,}/g, "\n\n");
}

function updateReadme(source, role) {
  let text = removeMarker(source, README_POLICY);
  const firstBreak = text.indexOf("\n");
  const block = [
    `<!-- ${README_POLICY}:START -->`,
    "## 가이드 사용 원칙",
    "",
    `- ${role.course} 수강생용 문서는 필수 준비·4차시 실행·오류 복구·제출·공개 대시보드 기록만 제공합니다.`,
    "- 강사용 문서는 수업 당일 도구 점검, 강사 원페이지, 초보 강사용 전체 실습 절차와 대체 운영을 제공합니다.",
    "- 수강생용과 강사용 문서는 공유 위치·권한·압축 파일을 서로 분리합니다.",
    "- 첫날에는 비공개 작업실과 공개 학습 대시보드를 분리하고, 자기소개 페이지로 30초 발표를 진행합니다.",
    `<!-- ${README_POLICY}:END -->`,
  ].join("\n");
  return `${text.slice(0, firstBreak + 1)}\n${block}\n${text.slice(firstBreak + 1).trimStart()}`;
}

let learnerCount = 0;
let instructorCount = 0;
const jobs = [];
for (const [roleKey, role] of Object.entries(ROLES)) {
  for (const day of DAYS) {
    const learnerPath = `guides/notion/${roleKey}/learner/${day}.md`;
    const instructorPath = `guides/notion/${roleKey}/instructor/${day}.md`;
    const learnerSource = read(learnerPath);
    const instructorSource = read(instructorPath);
    const tools = parseTools(learnerSource, day);
    const sessions = parseSessions(instructorSource);
    jobs.push({
      learnerPath,
      instructorPath,
      learnerContent: buildLearnerGuide(learnerSource, day, role),
      instructorContent: insertInstructorBlocks(instructorSource, [
        toolChecklistBlock(tools, day, role),
        onePageBlock(instructorSource, sessions, day, role),
        instructorDashboardBlock(day, role),
      ]),
    });
    learnerCount += 1;
    instructorCount += 1;
  }
  const readmePath = `guides/notion/${roleKey}/README.md`;
  jobs.push({ readmePath, readmeContent: updateReadme(read(readmePath), role) });
}

for (const job of jobs) {
  if (job.learnerPath) {
    write(job.learnerPath, job.learnerContent);
    write(job.instructorPath, job.instructorContent);
  } else {
    write(job.readmePath, job.readmeContent);
  }
}

let normalizedGuideDocuments = 0;
const NORMALIZED_TEXT_EXTENSIONS = new Set([".csv", ".html", ".js", ".json", ".md", ".mjs", ".svg"]);
function normalizeTextTree(directory) {
  for (const entry of fs.readdirSync(directory, { withFileTypes: true })) {
    const absolute = path.join(directory, entry.name);
    if (entry.isDirectory()) normalizeTextTree(absolute);
    else if (entry.isFile() && NORMALIZED_TEXT_EXTENSIONS.has(path.extname(entry.name).toLowerCase())) {
      const before = fs.readFileSync(absolute, "utf8");
      const after = normalizeVrew(before);
      if (after !== before) {
        fs.writeFileSync(absolute, after, "utf8");
        normalizedGuideDocuments += 1;
      }
    }
  }
}
normalizeTextTree(path.join(ROOT, "guides", "notion"));
normalizeTextTree(path.join(ROOT, "downloads", "guide-resources"));

console.log(JSON.stringify({
  learnerCount,
  instructorCount,
  firstDayDashboards: 2,
  dailyDashboardUpdates: 28,
  toolChecklists: 30,
  onePages: 30,
  normalizedGuideDocuments,
  vrewOnly: true,
}, null, 2));
