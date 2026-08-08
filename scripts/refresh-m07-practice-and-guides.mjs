import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const BASE_URL = "https://raw.githubusercontent.com/makernari/AX-slide-site/main/";
const AS_OF = "2026-08-08";
const MARKER_START = "<!-- M07-20260808-REFRESH:START -->";
const MARKER_END = "<!-- M07-20260808-REFRESH:END -->";

const roles = {
  backoffice: {
    label: "경영지원",
    accent: "#155EEF",
    soft: "#EAF2FF",
    verify: "필수값·담당 역할·기한·권한·원본 수치",
  },
  marketing: {
    label: "마케팅",
    accent: "#C2410C",
    soft: "#FFF1E8",
    verify: "브랜드 사실·채널·타깃·권리·성과 산식",
  },
};

const updates = {
  "M07-D01": {
    slug: "update-forms-automation-20260808.svg",
    title: "폼 링크보다 게시·응답자 권한을 먼저 확인하세요",
    change: [
      "Google Forms는 2025년 12월 이후 세분화된 응답자 접근 제어로 자동 전환",
      "응답자는 게시된 폼과 허용된 접근 범위에서만 제출 가능",
      "Form과 연결 Sheet의 공동작업자 권한은 이후 자동으로 동기화되지 않음",
    ],
    impact: "질문 설계 뒤 게시 대상·응답 요약 공개·Sheet 공유를 별도 체크하고, Apps Script는 수동 1회 실행 후 설치형 제출 트리거를 연결합니다.",
    caution: "설치형 트리거는 만든 사람의 권한으로 실행됩니다. 실제 개인정보 대신 가상 ID만 사용합니다.",
  },
  "M07-D02": {
    slug: "update-n8n-notion-20260808.svg",
    title: "n8n 2.x에서는 저장과 게시가 다른 단계입니다",
    change: [
      "2026-08-07 기준 n8n 안정 버전은 2.33.7",
      "n8n 2.0부터 Active·Inactive 대신 Publish·Unpublish 상태를 사용",
      "Notion 연결은 기능 권한과 대상 페이지·데이터베이스 접근을 함께 부여해야 함",
    ],
    impact: "수동 실행으로 입력·매핑·출력을 검증한 뒤 게시하고, 게시 전후 버전과 실행 로그를 결과물에 기록합니다.",
    caution: "Cloud·자체 호스팅·버전에 따라 메뉴가 다를 수 있어 버튼 위치 대신 트리거–매핑–로그–게시 상태를 평가합니다.",
  },
  "M07-D03": {
    slug: "update-chatgpt-sheets-20260808.svg",
    title: "파일 분석을 기본으로, Sheets 사이드바는 선택으로 사용하세요",
    change: [
      "ChatGPT 데이터 분석은 XLS·XLSX·CSV와 표·차트 분석을 지원",
      "생성한 코드·출력·가정은 사용자가 직접 검토해야 함",
      "ChatGPT for Google Sheets는 플랜·관리자 권한에 따라 사이드바에서 사용 가능",
    ],
    impact: "모든 학습자는 CSV 업로드 또는 필요한 범위 복사로 같은 분석을 수행하고, 사이드바가 보이면 동일 질문을 재검증하는 선택 경로로 씁니다.",
    caution: "정확한 수치는 원본 Sheet의 SUM·AVERAGE와 다시 비교하고 사실·해석·가설을 분리합니다.",
  },
};

const backofficeAppsScript = `/**
 * M07-D01 경영지원 교육용 Apps Script
 * 선택 행 또는 Google Sheet의 폼 제출 행을 Docs와 PDF로 변환합니다.
 * 실제 개인정보가 없는 실습용 사본에서만 사용하세요.
 */
const CONFIG = {
  sheetName: "폼 응답 1",
  idHeader: "신청ID",
  titlePrefix: "AURORA 교육 신청 확인서",
  outputFolderId: "",
  docUrlHeader: "문서URL",
  pdfUrlHeader: "PDFURL"
};

function ensureHeader_(sheet, header) {
  const width = Math.max(sheet.getLastColumn(), 1);
  const headers = sheet.getRange(1, 1, 1, width).getDisplayValues()[0];
  const index = headers.indexOf(header);
  if (index >= 0) return index + 1;
  const column = width + 1;
  sheet.getRange(1, column).setValue(header);
  return column;
}

function createReportFromRow_(sheet, row) {
  if (row < 2) throw new Error("제목 행이 아닌 응답 행을 선택하세요.");
  const width = sheet.getLastColumn();
  const headers = sheet.getRange(1, 1, 1, width).getDisplayValues()[0];
  const values = sheet.getRange(row, 1, 1, width).getDisplayValues()[0];
  const record = Object.fromEntries(headers.map((header, index) => [header, values[index]]));
  const recordId = record[CONFIG.idHeader] || "ROW-" + row;

  const document = DocumentApp.create(CONFIG.titlePrefix + " - " + recordId);
  const body = document.getBody();
  body.appendParagraph(CONFIG.titlePrefix).setHeading(DocumentApp.ParagraphHeading.HEADING1);
  headers
    .filter((header) => header && ![CONFIG.docUrlHeader, CONFIG.pdfUrlHeader].includes(header))
    .forEach((header) => {
      body.appendParagraph(header).setHeading(DocumentApp.ParagraphHeading.HEADING2);
      body.appendParagraph(record[header] || "확인 필요");
    });
  document.saveAndClose();

  const documentFile = DriveApp.getFileById(document.getId());
  const folder = CONFIG.outputFolderId
    ? DriveApp.getFolderById(CONFIG.outputFolderId)
    : DriveApp.getRootFolder();
  if (CONFIG.outputFolderId) documentFile.moveTo(folder);
  const pdfBlob = documentFile.getBlob().getAs(MimeType.PDF)
    .setName(CONFIG.titlePrefix + " - " + recordId + ".pdf");
  const pdfFile = folder.createFile(pdfBlob);

  sheet.getRange(row, ensureHeader_(sheet, CONFIG.docUrlHeader)).setValue(document.getUrl());
  sheet.getRange(row, ensureHeader_(sheet, CONFIG.pdfUrlHeader)).setValue(pdfFile.getUrl());
  return { documentUrl: document.getUrl(), pdfUrl: pdfFile.getUrl() };
}

function createReportFromActiveRow() {
  const sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName(CONFIG.sheetName);
  if (!sheet) throw new Error("시트 이름을 확인하세요: " + CONFIG.sheetName);
  const range = sheet.getActiveRange();
  if (!range) throw new Error("응답 행의 셀 하나를 선택하세요.");
  return createReportFromRow_(sheet, range.getRow());
}

function onFormSubmit(e) {
  if (!e || !e.range) throw new Error("설치형 Sheet 폼 제출 트리거에서 실행하세요.");
  if (e.range.getSheet().getName() !== CONFIG.sheetName) return;
  createReportFromRow_(e.range.getSheet(), e.range.getRow());
}
`;

const marketingAppsScript = backofficeAppsScript
  .replace("M07-D01 경영지원", "M07-D01 마케팅")
  .replace('idHeader: "신청ID"', 'idHeader: "요청ID"')
  .replace("AURORA 교육 신청 확인서", "PICO 캠페인 콘텐츠 요청 카드");

const packs = {
  "M07-D01": {
    backoffice: {
      title: "교육 신청 폼 → 확인서·PDF → 결과물 DB",
      summary: "가상 교육 신청 폼을 최소 수집 원칙으로 만들고 응답 행을 Docs·PDF 확인서로 변환해 Notion 결과물 DB에 등록합니다.",
      difference: "오후 마케팅과 달리 교육 회차·가상 부서·처리 상태·문서 보관 권한이 핵심입니다.",
      sourceName: "m07-d01-backoffice-source-pack.md",
      source: `# M07-D01 경영지원 원자료 · 교육 신청 자동 확인서

> 교육용 가상 조직 AURORA 운영센터 · 실제 기관·개인정보 없음 · ${AS_OF} 검수

## BO-F1 · 폼 목적과 응답 대상

- 목적: 사내 교육 신청을 접수하고 신청 확인서를 자동 생성한다.
- 응답 대상: 가상 교육 그룹 ‘AURORA-LEARNERS’.
- 공개 금지: 응답 요약, 실제 이메일, 휴대전화, 주민번호, 소속 상세 정보.
- 수집 항목: 신청ID, 가상부서, 교육과정, 희망회차, 참여목적.
- 신청ID 예: EDU-101. 이름 대신 가상 ID를 사용한다.

## BO-F2 · 질문 설계표

| 질문 | 유형 | 필수 | 선택지·규칙 |
|---|---|---|---|
| 신청ID | 단답형 | 예 | EDU-숫자 3자리 |
| 가상부서 | 드롭다운 | 예 | 운영1팀·운영2팀·지원팀 |
| 교육과정 | 드롭다운 | 예 | 문서보안기초·회의기록기초 |
| 희망회차 | 객관식 | 예 | 1회·2회 |
| 참여목적 | 장문형 | 아니오 | 80자 이내, 민감정보 금지 |

삭제할 질문: 개인 휴대전화, 주민번호, 실제 상급자 이메일.

## BO-F3 · 응답 Sheet 열

타임스탬프 | 신청ID | 가상부서 | 교육과정 | 희망회차 | 참여목적 | 처리상태 | 문서URL | PDFURL

- 한 응답은 한 행, 질문은 열 제목으로 유지한다.
- 처리상태 기본값은 ‘접수’다.
- 열 제목을 바꾸면 코드와 Notion 매핑도 함께 수정한다.

## BO-F4 · Apps Script 설정

- 시트명: 폼 응답 1
- ID 열: 신청ID
- 문서 제목: AURORA 교육 신청 확인서
- 출력 폴더: 비식별 실습 폴더, 없으면 빈 문자열 유지
- 첫 실행: 응답 행 선택 → createReportFromActiveRow 실행 → 권한 확인
- 자동 실행: Apps Script 트리거에서 onFormSubmit / 스프레드시트 / 폼 제출 시 선택

## BO-F5 · Notion 결과물 DB 속성

| 속성 | 유형 | 값 |
|---|---|---|
| 신청 ID | 제목 | 신청ID |
| 가상 부서 | 선택 | 가상부서 |
| 교육 과정 | 선택 | 교육과정 |
| 희망 회차 | 선택 | 희망회차 |
| 처리 상태 | 상태 | 접수·검수·완료 |
| 확인서 | URL | PDFURL |
| 검수 메모 | 텍스트 | 권한·누락 확인 |

공유는 ‘초대된 사람만’을 기본으로 하고, 구조를 바꿀 필요가 없는 참여자는 ‘내용 편집 가능’ 범위를 검토한다.

## BO-F6 · 실패 테스트

1. 폼을 게시하지 않은 채 응답 링크만 전달한다.
2. 신청ID 열을 신청번호로 바꾸고 코드는 수정하지 않는다.
3. 문서URL과 PDFURL 열이 없을 때 재실행한다.
4. 설치형 트리거를 만들지 않고 자동 생성됐다고 판단한다.
5. Form 권한을 바꾼 뒤 연결 Sheet 권한도 자동 변경됐다고 가정한다.
`,
      outputs: ["교육 신청 Form 설계표", "응답 Sheet", "Docs·PDF 확인서", "Notion 결과물 DB 등록표"],
      sampleHeader: ["타임스탬프", "신청ID", "가상부서", "교육과정", "희망회차", "참여목적", "처리상태", "문서URL", "PDFURL"],
      sampleRows: [
        ["2026-08-08 09:10", "EDU-101", "운영1팀", "문서보안기초", "1회", "업무자료 분류", "접수", "", ""],
        ["2026-08-08 09:14", "EDU-102", "지원팀", "회의기록기초", "2회", "결정사항 기록", "접수", "", ""],
        ["2026-08-08 09:21", "EDU-103", "운영2팀", "문서보안기초", "1회", "", "접수", "", ""],
        ["2026-08-08 09:27", "", "지원팀", "회의기록기초", "2회", "누락 시험", "확인 필요", "", ""],
      ],
      sessions: [
        "질문 유형·필수값·최소 수집을 정하고 게시 대상과 응답자 접근을 확인합니다.",
        "응답을 Sheet에 연결해 한 응답=한 행과 열 제목·누락값을 확인합니다.",
        "제공 코드를 수정해 선택 행을 Docs·PDF로 만들고 설치형 제출 트리거를 연결합니다.",
        "확인서 링크·상태·메모를 Notion 결과물 DB에 등록하고 공유 권한을 확인합니다.",
      ],
      prompts: [
        "BO-F1~F2만 사용해 Google Form 질문, 유형, 필수 여부, 검증 규칙, 삭제할 개인정보를 표로 작성하세요.",
        "BO-F3과 샘플 CSV를 대조해 열 제목·빈 값·중복 ID·처리상태 오류를 검사하세요.",
        "BO-F4의 설정값으로 수동 실행→권한 확인→설치형 Sheet 폼 제출 트리거 순서를 초보자 체크리스트로 작성하세요.",
        "BO-F5에 따라 Notion DB 속성 매핑과 최소 공유 권한, 링크 재탐색 시험을 작성하세요.",
      ],
      completed: `# M07-D01 경영지원 완성 예시

> 가상 교육 데이터 · 실제 조직·개인정보 없음 · ${AS_OF} 검수

## Form·Sheet

- 필수 질문: 신청ID·가상부서·교육과정·희망회차
- 선택 질문: 참여목적 80자 이내
- 삭제: 휴대전화·주민번호·실제 상급자 이메일
- 게시: AURORA-LEARNERS만 응답 가능, 응답 요약 공개 끔
- Sheet 검수: EDU-104 누락 행은 자동 문서 생성 전 ‘확인 필요’로 분기

## Apps Script 실행 기록

1. 폼 응답 1의 EDU-101 행을 선택했다.
2. createReportFromActiveRow를 실행하고 필요한 권한을 확인했다.
3. Docs와 PDF URL이 각각 해당 열에 기록되는지 확인했다.
4. onFormSubmit 설치형 Sheet 제출 트리거를 연결했다.
5. 새 가상 응답으로 자동 생성 여부를 재시험했다.

## Notion 등록

| 신청 ID | 교육 과정 | 상태 | 확인서 | 검수 메모 |
|---|---|---|---|---|
| EDU-101 | 문서보안기초 | 검수 | 가상 PDF URL | 열·권한 정상 |

공유 범위는 초대된 실습자만으로 제한했다. Form과 Sheet 권한은 따로 확인했다.
`,
      appsScript: backofficeAppsScript,
      screen: {
        slug: "practice-training-request-report.svg",
        title: "교육 신청 → Docs·PDF 확인서 → 결과물 DB",
        subtitle: "최소 수집·열 제목·트리거 권한 고정",
        columns: [
          ["Form", "가상 ID", "게시 대상", "필수 질문"],
          ["Sheet·Code", "한 응답=한 행", "수동 1회", "제출 트리거"],
          ["Notion", "확인서 URL", "처리 상태", "최소 권한"],
        ],
        footer: "오후 마케팅과 다른 결과: 교육 신청 확인서 + 보관·처리 권한",
      },
    },
    marketing: {
      title: "콘텐츠 요청 폼 → 기획 카드·PDF → 콘텐츠 DB",
      summary: "가상 캠페인 콘텐츠 요청을 구조화하고 응답 행을 기획 카드와 PDF로 변환해 Notion 콘텐츠 DB에 등록합니다.",
      difference: "오전 경영지원과 달리 캠페인 목표·타깃·채널·확정 사실·금지 표현이 핵심입니다.",
      sourceName: "m07-d01-marketing-source-pack.md",
      source: `# M07-D01 마케팅 원자료 · 캠페인 콘텐츠 요청 카드

> 교육용 가상 브랜드 PICO PICNIC · 실제 브랜드·고객정보 없음 · ${AS_OF} 검수

## MK-F1 · 폼 목적과 응답 대상

- 목적: PICO PICNIC 가상 캠페인의 콘텐츠 요청을 받아 기획 카드를 생성한다.
- 응답 대상: 가상 제작 그룹 ‘PICO-CREATORS’.
- 수집 금지: 고객 이름·전화번호·실제 후기·개인 SNS 계정.
- 수집 항목: 요청ID, 캠페인명, 채널, 목표, 가상타깃, 핵심사실, 금지표현, 마감일.
- 확인된 행사 사실: 2026년 9월 5일 11:00~17:00, 가상 장소 River Hall.
- 금지: ‘지역 1위’, ‘만족도 100%’, 확정되지 않은 할인.

## MK-F2 · 질문 설계표

| 질문 | 유형 | 필수 | 선택지·규칙 |
|---|---|---|---|
| 요청ID | 단답형 | 예 | CNT-숫자 3자리 |
| 캠페인명 | 단답형 | 예 | PICO PICNIC |
| 채널 | 체크박스 | 예 | Instagram·Blog·YouTube |
| 목표 | 객관식 | 예 | 인지도·참여·방문 |
| 가상타깃 | 단답형 | 예 | 인구통계 대신 상황·관심사 |
| 핵심사실 | 장문형 | 예 | 날짜·시간·장소만 |
| 금지표현 | 장문형 | 예 | 근거 없는 효능·순위·할인 |
| 마감일 | 날짜 | 예 | 2026-08-28 이전 |

## MK-F3 · 응답 Sheet 열

타임스탬프 | 요청ID | 캠페인명 | 채널 | 목표 | 가상타깃 | 핵심사실 | 금지표현 | 마감일 | 제작상태 | 기획서URL | PDFURL

- 복수 채널은 쉼표로 들어올 수 있어 분기 전에 값을 확인한다.
- 응답 요약 공개는 자유서술 내용이 노출될 수 있으므로 끈다.

## MK-F4 · Apps Script 설정

- 시트명: 폼 응답 1
- ID 열: 요청ID
- 문서 제목: PICO 캠페인 콘텐츠 요청 카드
- 첫 실행: 선택 행 수동 생성 후 카드 내용과 URL 열 확인
- 자동 실행: onFormSubmit 설치형 Sheet 폼 제출 트리거

## MK-F5 · Notion 콘텐츠 DB 속성

| 속성 | 유형 | 값 |
|---|---|---|
| 요청 ID | 제목 | 요청ID |
| 캠페인 | 텍스트 | 캠페인명 |
| 채널 | 다중 선택 | 채널 |
| 목표 | 선택 | 목표 |
| 제작 상태 | 상태 | 요청·기획·검수·완료 |
| 기획 카드 | URL | PDFURL |
| 브랜드 검수 | 체크박스 | 사실·금지 표현 확인 |

## MK-F6 · 실패 테스트

1. 개인 SNS 계정과 실제 고객 후기를 질문으로 수집한다.
2. 폼은 게시했지만 제작 그룹에 응답자 권한을 주지 않는다.
3. 핵심사실이 비어 있는데 ‘지역 1위’ 문장을 자동 카드에 넣는다.
4. 채널 복수값을 단일 선택 속성에 그대로 매핑한다.
5. Notion 페이지를 누구나 웹에서 볼 수 있게 공개한다.
`,
      outputs: ["콘텐츠 요청 Form 설계표", "응답 Sheet", "기획 카드·PDF", "Notion 콘텐츠 DB 등록표"],
      sampleHeader: ["타임스탬프", "요청ID", "캠페인명", "채널", "목표", "가상타깃", "핵심사실", "금지표현", "마감일", "제작상태", "기획서URL", "PDFURL"],
      sampleRows: [
        ["2026-08-08 13:10", "CNT-201", "PICO PICNIC", "Instagram", "인지도", "주말 나들이 정보를 찾는 가상 독자", "9월 5일 11~17시 River Hall", "1위·100%·미확정 할인", "2026-08-24", "요청", "", ""],
        ["2026-08-08 13:18", "CNT-202", "PICO PICNIC", "Blog, YouTube", "방문", "체험 프로그램을 비교하는 가상 가족", "9월 5일 River Hall", "실제 후기 생성 금지", "2026-08-26", "요청", "", ""],
        ["2026-08-08 13:27", "CNT-203", "PICO PICNIC", "YouTube", "참여", "짧은 행사 영상을 찾는 가상 시청자", "11:00~17:00", "할인 확정 금지", "2026-08-28", "요청", "", ""],
        ["2026-08-08 13:32", "CNT-204", "PICO PICNIC", "개인계정", "매출", "실제 고객 이름", "지역 1위", "", "2026-08-30", "확인 필요", "", ""],
      ],
      sessions: [
        "채널·목표·타깃·사실·금지 표현 질문과 응답자 접근 범위를 설계합니다.",
        "응답 Sheet에서 복수 채널·필수 사실·마감일·위험 입력을 확인합니다.",
        "제공 코드를 수정해 기획 카드와 PDF를 만들고 설치형 제출 트리거를 연결합니다.",
        "채널·목표·상태·기획 링크를 Notion 콘텐츠 DB에 등록하고 공개 범위를 확인합니다.",
      ],
      prompts: [
        "MK-F1~F2만 사용해 콘텐츠 요청 Form 질문과 필수 여부를 설계하고 실제 고객정보·후기 수집 항목을 제거하세요.",
        "MK-F3과 샘플 CSV에서 복수 채널·누락 사실·근거 없는 목표·마감일 오류를 찾아 수정 상태를 표시하세요.",
        "MK-F4 기준으로 선택 행 기획 카드 생성→PDF 확인→설치형 Sheet 폼 제출 트리거 연결 절차를 작성하세요.",
        "MK-F5에 따라 Notion 콘텐츠 DB 매핑과 브랜드 검수·공개 범위 시험을 작성하세요.",
      ],
      completed: `# M07-D01 마케팅 완성 예시

> 가상 캠페인 데이터 · 실제 고객·브랜드 자료 없음 · ${AS_OF} 검수

## Form·Sheet

- 필수: 요청ID·캠페인명·채널·목표·가상타깃·핵심사실·금지표현·마감일
- 삭제: 고객 이름·전화번호·개인 SNS 계정·실제 후기
- 게시: PICO-CREATORS만 응답 가능, 응답 요약 공개 끔
- CNT-204는 채널·타깃·사실·금지 표현이 부적절해 ‘확인 필요’로 분리

## 자동 카드

카드 제목은 ‘PICO 캠페인 콘텐츠 요청 카드 - CNT-201’이다. 핵심사실과 금지표현을 별도 구역으로 두고 기획서URL·PDFURL을 응답 행에 기록했다. 설치형 제출 트리거는 수동 1회 성공 후 연결했다.

## Notion 등록

| 요청 ID | 채널 | 목표 | 상태 | 브랜드 검수 |
|---|---|---|---|---|
| CNT-201 | Instagram | 인지도 | 기획 | 사실·금지 표현 확인 |

페이지는 제작 그룹에만 공유했고 웹 공개를 끈 상태로 재탐색했다.
`,
      appsScript: marketingAppsScript,
      screen: {
        slug: "practice-content-request-card.svg",
        title: "콘텐츠 요청 → 기획 카드·PDF → 콘텐츠 DB",
        subtitle: "목표·타깃·채널·브랜드 사실 고정",
        columns: [
          ["Form", "가상 타깃", "복수 채널", "금지 표현"],
          ["Sheet·Code", "필수 사실", "기획 카드", "제출 트리거"],
          ["Notion", "채널·목표", "제작 상태", "브랜드 검수"],
        ],
        footer: "오전 경영지원과 다른 결과: 콘텐츠 기획 카드 + 브랜드·채널 검수",
      },
    },
  },
  "M07-D02": {
    backoffice: {
      title: "시설 요청 Sheet → n8n 분류 → 업무 DB",
      summary: "전날 자료 없이 제공된 시설 요청 Sheet와 노드 카드로 트리거·정규화·조건·Notion 등록·로그 수정을 완성합니다.",
      difference: "오후 마케팅과 달리 시설 영역·긴급도·완료기한·처리 책임과 누락값 차단이 핵심입니다.",
      sourceName: "m07-d02-backoffice-source-pack.md",
      source: `# M07-D02 경영지원 원자료 · 시설 요청 자동화 구조대

> 교육용 가상 조직 AURORA 운영센터 · 실제 시스템·자격증명 없음 · ${AS_OF} 검수

## BO-N1 · 단독 수강용 전날 흐름 요약

가상 Form 응답이 Google Sheet의 한 행으로 들어오고, 문서 링크가 같은 행에 기록됐다고 가정한다. 오늘은 이 행을 n8n에서 읽어 Notion 업무 DB에 등록한다. Apps Script·Form을 실제로 만들지 않아도 제공 CSV로 시작할 수 있다.

## BO-N2 · 입력 열

요청ID | 접수일 | 시설영역 | 요청내용 | 긴급도 | 완료기한 | 보고서링크 | 처리상태 | 요약초안 | 분류초안

허용 시설영역: 회의실·공용장비·안내표지. 허용 긴급도: 낮음·보통·높음. 필수값: 요청ID·시설영역·요청내용·긴급도·완료기한.

## BO-N3 · 노드 맵

1. Manual Trigger로 학습 실행
2. Google Sheets: 새 행 또는 여러 행 읽기
3. Edit Fields: 열 이름·날짜·상태 정규화
4. If: 필수값이 모두 있는가
5. Notion: 업무 DB에 새 페이지 생성
6. 실패 분기: 오류 사유와 실행 로그 기록
7. 실시간 운영 시험이 가능할 때만 Google Sheets Trigger로 교체

## BO-N4 · Sheets–Notion 매핑

| Sheet 열 | Notion 속성 | 유형 | 규칙 |
|---|---|---|---|
| 요청ID | 요청 ID | 제목 | 그대로 |
| 시설영역 | 시설 영역 | 선택 | 허용값만 |
| 긴급도 | 우선순위 | 선택 | 낮음·보통·높음 |
| 완료기한 | 완료 기한 | 날짜 | YYYY-MM-DD |
| 요약초안 | 요청 요약 | 텍스트 | 원문과 대조 |
| 분류초안 | 업무 유형 | 선택 | 시설 요청 |
| 보고서링크 | 보고서 | URL | 접근 가능한 링크만 |
| 처리상태 | 상태 | 상태 | 접수·검수·완료 |

## BO-N5 · 고장 카드

- ERR-BO-1: 요청_ID라는 잘못된 열 이름
- ERR-BO-2: 긴급도 값 ‘즉시’는 허용 목록에 없음
- ERR-BO-3: 완료기한 누락
- ERR-BO-4: example.invalid 보고서 URL
- ERR-BO-5: Notion 연결에 대상 DB 접근을 주지 않음

## BO-N6 · Apps Script와 n8n 비교 기준

| 기준 | Apps Script | n8n |
|---|---|---|
| 시작 | 함수·설치형 트리거 | 트리거 노드 |
| 데이터 연결 | 코드 변수·열 이름 | 노드 필드·표현식 |
| 오류 확인 | 실행 기록·예외 | 노드별 실행 로그 |
| 배포 | 트리거 저장 | 저장 후 Publish |
| 권한 | 스크립트 만든 사람 | 연결 자격증명·대상 DB 접근 |
`,
      outputs: ["n8n 업무 요청 노드 맵", "Sheets–Notion 매핑표", "오류 수정·실행 로그", "Apps Script–n8n 비교표"],
      sampleHeader: ["요청ID", "접수일", "시설영역", "요청내용", "긴급도", "완료기한", "보고서링크", "처리상태", "요약초안", "분류초안"],
      sampleRows: [
        ["REQ-301", "2026-08-08", "회의실", "가상 3회의실 화면 연결 점검", "보통", "2026-08-12", "", "접수", "회의실 화면 연결 점검", "시설 요청"],
        ["REQ-302", "2026-08-08", "공용장비", "교육용 빔프로젝터 케이블 확인", "높음", "2026-08-10", "", "접수", "공용장비 케이블 확인", "시설 요청"],
        ["REQ-303", "2026-08-08", "안내표지", "가상 층 안내판 문구 교체", "낮음", "2026-08-20", "", "접수", "안내표지 문구 교체", "시설 요청"],
        ["REQ-304", "2026-08-08", "회의실", "좌석 배치 확인", "즉시", "2026-08-09", "", "확인 필요", "허용값 오류", "시설 요청"],
        ["REQ-305", "2026-08-08", "공용장비", "가상 태블릿 충전 상태", "보통", "", "", "확인 필요", "기한 누락", "시설 요청"],
        ["REQ-306", "2026-08-08", "안내표지", "교육실 방향 화살표", "낮음", "2026-08-18", "https://example.invalid/report", "확인 필요", "링크 교체 필요", "시설 요청"],
      ],
      sessions: [
        "Apps Script 흐름을 트리거–노드–연결–게시 상태의 n8n 노드 맵으로 바꿉니다.",
        "제공 CSV를 Google Sheets 입력으로 읽고 첫 행의 JSON·필수값을 확인합니다.",
        "열과 Notion 속성을 매핑하고 요약·분류 초안을 원문과 대조해 등록합니다.",
        "잘못된 열·허용값·기한·URL·DB 접근을 고치고 재실행 로그를 남깁니다.",
      ],
      prompts: [
        "BO-N1~N3으로 Manual Trigger부터 Notion까지 노드 이름, 입력, 출력, 실패 분기를 표로 작성하세요.",
        "샘플 CSV에서 필수값·허용 시설영역·긴급도·날짜·URL 오류를 찾아 정상 행과 차단 행을 나누세요.",
        "BO-N4 매핑을 기준으로 각 Notion 속성에 넣을 표현식과 데이터 유형을 작성하세요. 자격증명 값은 쓰지 마세요.",
        "BO-N5 오류 5종의 중단 노드, 로그 근거, 수정, 재실행 결과, 게시 전 확인을 기록하세요.",
      ],
      completed: `# M07-D02 경영지원 완성 예시

> 가상 시설 요청 · 실제 시스템·자격증명 없음 · ${AS_OF} 검수

## 노드 맵

Manual Trigger → Google Sheets → Edit Fields → If 필수값 → Notion Create Page. 실패 분기는 오류 사유를 기록하고 Notion 등록을 중단한다.

## 실행 판정

| 요청 ID | 판정 | 이유 |
|---|---|---|
| REQ-301~303 | 등록 가능 | 필수값·허용값 정상 |
| REQ-304 | 차단 | 긴급도 ‘즉시’ 불허 |
| REQ-305 | 차단 | 완료기한 누락 |
| REQ-306 | 차단 | 가짜 URL 교체 필요 |

## 게시 기록

수동 실행에서 3개 정상 행과 3개 차단 행을 확인했다. Notion 연결의 대상 DB 접근을 확인한 뒤 저장했고, n8n 2.x의 Publish 전 상태에서는 자동 실행되지 않음을 기록했다.
`,
      screen: {
        slug: "practice-facility-request-workflow.svg",
        title: "시설 요청 Sheet → n8n 검증 → 업무 DB",
        subtitle: "필수값·긴급도·기한·책임 고정",
        columns: [
          ["입력", "시설 영역", "긴급도", "완료 기한"],
          ["워크플로우", "Edit Fields", "If 차단", "실행 로그"],
          ["Notion", "요청 ID", "처리 상태", "보고서 URL"],
        ],
        footer: "오후 마케팅과 다른 결과: 시설 요청 처리 + 누락·기한 차단",
      },
    },
    marketing: {
      title: "콘텐츠 요청 Sheet → n8n 채널 분기 → 콘텐츠 DB",
      summary: "제공된 콘텐츠 요청 Sheet를 n8n에서 읽고 채널·목표·콘텐츠 유형을 정규화해 Notion 콘텐츠 DB에 등록합니다.",
      difference: "오전 경영지원과 달리 채널 표준화·캠페인 목표·콘텐츠 유형·브랜드 검수 상태가 핵심입니다.",
      sourceName: "m07-d02-marketing-source-pack.md",
      source: `# M07-D02 마케팅 원자료 · 콘텐츠 요청 자동화 구조대

> 교육용 가상 브랜드 PICO PICNIC · 실제 계정·자격증명 없음 · ${AS_OF} 검수

## MK-N1 · 단독 수강용 입력 흐름

가상 콘텐츠 요청 Form의 응답 행과 기획 카드 링크가 Sheet에 있다고 가정한다. 전날 수업을 듣지 않아도 제공 CSV와 아래 노드 카드로 시작한다.

## MK-N2 · 입력 열과 허용값

요청ID | 접수일 | 채널 | 목표 | 콘텐츠유형 | 가상타깃 | 핵심사실 | 마감일 | 기획서링크 | 제작상태 | 요약초안 | 분류초안

- 채널: Instagram·Blog·YouTube
- 목표: 인지도·참여·방문
- 콘텐츠 유형: 카드뉴스·블로그글·쇼츠
- 필수: 요청ID·채널·목표·콘텐츠유형·핵심사실·마감일

## MK-N3 · 노드 맵

1. Manual Trigger
2. Google Sheets: 요청 행 읽기
3. Edit Fields: 채널·목표·상태 표준화
4. Switch: 채널별 제작 큐 분기
5. If: 필수 사실과 금지 표현 확인
6. Notion: 콘텐츠 DB 새 페이지 생성
7. 실패 분기: 브랜드 검수 필요와 로그 기록
8. 검증 뒤에만 Google Sheets Trigger와 Publish 사용

## MK-N4 · Sheets–Notion 매핑

| Sheet 열 | Notion 속성 | 유형 | 규칙 |
|---|---|---|---|
| 요청ID | 요청 ID | 제목 | 그대로 |
| 채널 | 채널 | 선택 | 표준 채널명 |
| 목표 | 캠페인 목표 | 선택 | 허용값만 |
| 콘텐츠유형 | 콘텐츠 유형 | 선택 | 채널과 조합 확인 |
| 가상타깃 | 타깃 메모 | 텍스트 | 실제 고객정보 금지 |
| 요약초안 | 요청 요약 | 텍스트 | 핵심사실 대조 |
| 기획서링크 | 기획서 | URL | 접근 권한 확인 |
| 제작상태 | 제작 상태 | 상태 | 요청·기획·검수·완료 |

## MK-N5 · 고장 카드

- ERR-MK-1: 채널 ‘인스타’를 Instagram 속성과 매핑하지 않음
- ERR-MK-2: 목표가 비어 있는데 전환으로 임의 분류
- ERR-MK-3: YouTube 요청을 카드뉴스로 고정
- ERR-MK-4: 기획서 링크가 제작 그룹에 공유되지 않음
- ERR-MK-5: Notion 연결이 콘텐츠 DB에 접근하지 못함

## MK-N6 · 코드·노드 비교

Apps Script는 열 이름과 함수로 이동을 정의하고, n8n은 노드와 표현식으로 정의한다. 두 방식 모두 입력 스키마·권한·실행 로그·사람의 브랜드 검수가 필요하다.
`,
      outputs: ["n8n 콘텐츠 요청 노드 맵", "Sheets–Notion 매핑표", "채널 분기·오류 로그", "Apps Script–n8n 비교표"],
      sampleHeader: ["요청ID", "접수일", "채널", "목표", "콘텐츠유형", "가상타깃", "핵심사실", "마감일", "기획서링크", "제작상태", "요약초안", "분류초안"],
      sampleRows: [
        ["CNT-401", "2026-08-08", "Instagram", "인지도", "카드뉴스", "주말 나들이 정보 탐색자", "9월 5일 11~17시", "2026-08-24", "", "요청", "행사 인지도 카드", "Instagram 카드뉴스"],
        ["CNT-402", "2026-08-08", "Blog", "방문", "블로그글", "프로그램 비교 독자", "River Hall", "2026-08-26", "", "요청", "행사 방문 정보", "Blog 글"],
        ["CNT-403", "2026-08-08", "YouTube", "참여", "쇼츠", "짧은 행사 영상 시청자", "9월 5일", "2026-08-28", "", "요청", "행사 참여 쇼츠", "YouTube 쇼츠"],
        ["CNT-404", "2026-08-08", "인스타", "인지도", "카드뉴스", "가상 독자", "River Hall", "2026-08-24", "", "확인 필요", "채널 표준화", "Instagram 카드뉴스"],
        ["CNT-405", "2026-08-08", "Blog", "", "블로그글", "가상 독자", "9월 5일", "2026-08-26", "", "확인 필요", "목표 누락", "Blog 글"],
        ["CNT-406", "2026-08-08", "YouTube", "참여", "카드뉴스", "가상 시청자", "11~17시", "2026-08-28", "https://example.invalid/plan", "확인 필요", "유형·링크 확인", "YouTube 쇼츠"],
      ],
      sessions: [
        "콘텐츠 요청 흐름을 트리거–정규화–채널 분기–등록–게시 상태로 재구성합니다.",
        "제공 CSV를 읽고 채널·목표·콘텐츠 유형·핵심사실의 첫 입력을 확인합니다.",
        "열과 Notion 속성을 매핑하고 채널별 제작 큐와 브랜드 검수 상태를 등록합니다.",
        "잘못된 채널·누락 목표·유형·링크·DB 접근을 고치고 실행 로그를 비교합니다.",
      ],
      prompts: [
        "MK-N1~N3으로 채널 분기가 포함된 n8n 노드 맵과 각 노드의 입력·출력을 작성하세요.",
        "샘플 CSV의 채널·목표·콘텐츠 유형·핵심사실·마감일·URL 오류를 찾아 차단 기준을 작성하세요.",
        "MK-N4의 Notion 속성 매핑과 Instagram·Blog·YouTube Switch 분기 조건을 작성하세요.",
        "MK-N5 오류 5종을 로그 근거로 수정하고 브랜드 검수·Publish 전 확인까지 기록하세요.",
      ],
      completed: `# M07-D02 마케팅 완성 예시

> 가상 콘텐츠 요청 · 실제 브랜드·자격증명 없음 · ${AS_OF} 검수

## 노드 맵

Manual Trigger → Google Sheets → Edit Fields → Switch 채널 → If 필수 사실 → Notion Create Page. 실패 분기는 브랜드 검수 필요 상태로 기록한다.

## 실행 판정

| 요청 ID | 판정 | 이유 |
|---|---|---|
| CNT-401~403 | 등록 가능 | 채널·목표·유형 정상 |
| CNT-404 | 수정 후 | 인스타 → Instagram 표준화 |
| CNT-405 | 차단 | 목표 누락 |
| CNT-406 | 차단 | YouTube–카드뉴스 불일치·가짜 URL |

저장 후 Publish 전에는 트리거가 자동 실행되지 않는 점을 확인하고, 게시 전 콘텐츠 DB 접근과 제작 그룹 링크 권한을 점검했다.
`,
      screen: {
        slug: "practice-content-intake-workflow.svg",
        title: "콘텐츠 요청 Sheet → n8n 분기 → 콘텐츠 DB",
        subtitle: "채널·목표·유형·브랜드 검수 고정",
        columns: [
          ["입력", "채널", "캠페인 목표", "콘텐츠 유형"],
          ["워크플로우", "Edit Fields", "Switch 분기", "브랜드 If"],
          ["Notion", "제작 큐", "기획서 URL", "검수 상태"],
        ],
        footer: "오전 경영지원과 다른 결과: 채널 제작 큐 + 브랜드·유형 검수",
      },
    },
  },
  "M07-D03": {
    backoffice: {
      title: "업무 요청 데이터 → 처리율·이상점 → 1페이지 보고서",
      summary: "12주 가상 업무 요청 데이터를 사람이 먼저 계산한 뒤 ChatGPT 분석과 대조해 사실·해석·가설을 구분합니다.",
      difference: "오후 마케팅과 달리 요청량·완료율·평균 처리일·만족도·비용과 운영 개선이 핵심입니다.",
      sourceName: "m07-d03-backoffice-source-pack.md",
      source: `# M07-D03 경영지원 원자료 · 업무 요청 처리 데이터

> 12주 교육용 가상 데이터 · 실제 조직·예산·개인정보 없음 · ${AS_OF} 검수

## BO-A1 · 분석 질문

1. 전체 요청과 완료 건수, 완료율은 얼마인가?
2. 교육·계정·시설 중 완료율과 평균 처리일이 가장 취약한 유형은 무엇인가?
3. 이상점과 누락값은 어느 행에 있는가?
4. 확인된 사실과 가능한 원인을 어떻게 구분할 것인가?

## BO-A2 · 사람이 먼저 계산할 값

- 전체 요청 = SUM(요청건수)
- 전체 완료 = SUM(완료건수)
- 완료율 = 전체 완료 / 전체 요청
- 유형별 평균 처리일 = AVERAGEIF 또는 필터 후 AVERAGE
- 만족도 빈칸은 0점으로 바꾸지 않고 제외 개수를 표시
- 차트 1: 유형별 완료율, 차트 2: 주차별 요청·완료

## BO-A3 · 검증 기준

- 전체: 요청 281건, 완료 249건, 완료율 88.6%
- 시설: 요청 54건, 완료 44건, 완료율 81.5%, 평균 처리일 4.9일
- 2026-06-29 시설 행: 만족도 누락, 처리일 6.2일, 비용 650,000원
- 사실: 시설 완료율이 세 유형 중 가장 낮다.
- 해석: 시설 처리 흐름의 점검이 필요하다.
- 가설: 부품 대기나 승인 지연일 수 있으나 원자료로 확인되지 않았다.

## BO-A4 · ChatGPT 입력 지시

- 제공 CSV 전체 또는 필요한 열 범위를 사용한다.
- 계산식·분모·제외한 빈 값 개수를 표시하게 한다.
- 원본에 없는 조직 정책·원인·담당자를 만들지 않게 한다.
- 결과 수치는 BO-A3 및 Sheet 수식과 대조한다.

## BO-A5 · 1페이지 보고서 구조

제목 → 질문 → 핵심 수치 3개 → 차트 1~2개 → 사실 → 해석 → 가설 → 추가 확인 → 다음 행동.
`,
      outputs: ["검산된 Google Sheet", "핵심 차트 2개", "AI 분석 대조표", "경영지원 1페이지 보고서"],
      sampleHeader: ["날짜", "가상부서", "요청유형", "요청건수", "완료건수", "평균처리일", "만족도", "비용"],
      sampleRows: [
        ["2026-05-04", "운영1팀", "교육", "18", "16", "3.2", "4.2", "320000"],
        ["2026-05-11", "운영1팀", "교육", "20", "18", "3.0", "4.1", "340000"],
        ["2026-05-18", "운영2팀", "계정", "34", "30", "2.1", "4.0", "120000"],
        ["2026-05-25", "운영2팀", "계정", "38", "31", "3.4", "3.5", "125000"],
        ["2026-06-01", "지원팀", "시설", "12", "9", "5.8", "3.2", "610000"],
        ["2026-06-08", "지원팀", "시설", "14", "13", "4.0", "4.0", "420000"],
        ["2026-06-15", "운영1팀", "교육", "22", "20", "2.8", "4.3", "360000"],
        ["2026-06-22", "운영2팀", "계정", "36", "35", "1.9", "4.4", "128000"],
        ["2026-06-29", "지원팀", "시설", "15", "10", "6.2", "", "650000"],
        ["2026-07-06", "운영1팀", "교육", "19", "17", "3.1", "4.0", "330000"],
        ["2026-07-13", "운영2팀", "계정", "40", "38", "1.8", "4.5", "130000"],
        ["2026-07-20", "지원팀", "시설", "13", "12", "3.6", "4.1", "430000"],
      ],
      sessions: [
        "Sheet 사본·행·열·필터를 확인하고 분석 질문 3개와 검산 셀을 만듭니다.",
        "SUM·AVERAGE·필터로 전체·유형별 수치와 이상점·누락값을 확인하고 차트를 만듭니다.",
        "CSV 또는 필요한 범위를 ChatGPT에 제공해 사실·변화·가능한 원인·추가 질문을 받습니다.",
        "AI 수치를 원본과 대조하고 사실·해석·가설을 구분한 1페이지 보고서를 완성합니다.",
      ],
      prompts: [
        "BO-A1~A2와 CSV를 사용해 분석 질문별 필요한 열, 계산식, 필터, 차트를 계획하세요.",
        "전체·요청유형별 요청건수, 완료건수, 완료율, 평균처리일을 계산하고 빈 만족도 수를 따로 표시하세요.",
        "계산 결과를 사실·해석·가설·추가 확인으로 나누세요. 원자료에 없는 원인은 확정하지 마세요.",
        "제목, 핵심 수치 3개, 차트 설명, 사실, 해석, 가설, 추가 확인, 다음 행동이 있는 1페이지 보고서를 작성하세요.",
      ],
      completed: `# M07-D03 경영지원 완성 예시

> 12주 가상 업무 요청 데이터 · ${AS_OF} 검수

## 핵심 수치

- 전체 요청 281건, 완료 249건, 완료율 88.6%
- 시설 완료율 81.5%로 교육·계정보다 낮음
- 시설 평균 처리일 4.9일, 6월 29일 만족도 1건 누락

## 사실·해석·가설

| 구분 | 내용 |
|---|---|
| 사실 | 시설 유형은 54건 중 44건 완료, 완료율 81.5%다. |
| 해석 | 시설 요청의 처리 흐름을 우선 점검할 필요가 있다. |
| 가설 | 부품 대기·승인 지연 가능성이 있으나 현재 자료로 확정할 수 없다. |

## 다음 행동

6월 29일 시설 요청의 미완료 5건과 만족도 누락 원인을 가상 운영 기록에서 추가 확인한다. AI 결과는 Sheet의 SUM·필터 결과와 대조했다.
`,
      screen: {
        slug: "practice-service-data-analysis.svg",
        title: "업무 요청 281건 → 완료율 검산 → 운영 보고",
        subtitle: "사실·해석·가설과 누락값 분리",
        columns: [
          ["질문", "요청·완료", "유형별 비교", "이상점"],
          ["검산", "SUM", "완료율", "빈 값 1건"],
          ["보고", "사실", "해석·가설", "다음 확인"],
        ],
        footer: "오후 마케팅과 다른 결과: 처리율·기한·운영 개선 보고",
      },
    },
    marketing: {
      title: "콘텐츠 성과 데이터 → CTR·CPA → 1페이지 리포트",
      summary: "12개 가상 콘텐츠의 노출·클릭·전환·비용을 검산하고 채널 성과와 한계를 분리해 마케팅 리포트를 작성합니다.",
      difference: "오전 경영지원과 달리 채널·콘텐츠 유형·가중 CTR·전환·CPA와 인과 과장이 핵심입니다.",
      sourceName: "m07-d03-marketing-source-pack.md",
      source: `# M07-D03 마케팅 원자료 · 콘텐츠 성과 데이터

> 12개 교육용 가상 콘텐츠 · 실제 광고·고객·매출 자료 없음 · ${AS_OF} 검수

## MK-A1 · 분석 질문

1. 전체 노출·클릭·전환·비용과 가중 CTR·CPA는 얼마인가?
2. 채널별 CTR과 CPA는 어떻게 다른가?
3. 단순 행 CTR 평균과 SUM(클릭)/SUM(노출)은 왜 다른가?
4. 성과 차이에서 확정할 수 없는 원인은 무엇인가?

## MK-A2 · 사람이 먼저 계산할 값

- 전체 CTR = SUM(클릭) / SUM(노출)
- 전체 CPA = SUM(비용) / SUM(전환)
- 채널별 CTR·CPA는 채널 필터 또는 피벗으로 합계 후 계산
- 행별 CTR의 단순 평균을 채널 성과로 사용하지 않음
- 차트 1: 채널별 CTR, 차트 2: 채널별 CPA

## MK-A3 · 검증 기준

- 전체: 노출 125,700, 클릭 4,599, 전환 312, 비용 3,325,000원
- 전체 가중 CTR 3.66%, CPA 약 10,657원
- Blog: CTR 7.37%, CPA 약 5,649원
- Instagram: CTR 3.50%, CPA 약 11,653원
- YouTube: CTR 2.06%, CPA 약 19,206원
- 사실: 이 가상 표본에서 Blog의 CTR이 높고 CPA가 낮다.
- 금지: Blog가 항상 최고다, YouTube가 실패했다, 채널 때문에 전환이 늘었다.

## MK-A4 · ChatGPT 입력 지시

- CSV 전체 또는 날짜·채널·노출·클릭·전환·비용 열을 제공한다.
- 채널별 합계와 산식을 함께 출력하게 한다.
- 표본·콘텐츠 유형·기간 차이를 한계로 표시하게 한다.
- 최신 Sheets 사이드바가 있어도 동일 산식을 원본 셀에서 재검산한다.

## MK-A5 · 1페이지 리포트 구조

질문 → 전체 성과 → 채널 비교 차트 → 사실 → 해석 → 가설 → 한계 → 다음 실험. 실제 고객 세그먼트나 매출을 만들지 않는다.
`,
      outputs: ["검산된 Google Sheet", "채널 차트 2개", "AI 분석 대조표", "마케팅 1페이지 리포트"],
      sampleHeader: ["날짜", "채널", "콘텐츠유형", "노출", "클릭", "전환", "비용"],
      sampleRows: [
        ["2026-05-04", "Instagram", "카드뉴스", "8200", "310", "22", "240000"],
        ["2026-05-11", "Instagram", "쇼츠", "12500", "360", "18", "310000"],
        ["2026-05-18", "Blog", "사례형", "5400", "410", "31", "180000"],
        ["2026-05-25", "YouTube", "쇼츠", "16800", "290", "14", "420000"],
        ["2026-06-01", "Instagram", "카드뉴스", "9100", "355", "25", "250000"],
        ["2026-06-08", "Blog", "가이드형", "6100", "455", "34", "190000"],
        ["2026-06-15", "YouTube", "쇼츠", "18100", "340", "19", "430000"],
        ["2026-06-22", "Instagram", "쇼츠", "13200", "420", "24", "320000"],
        ["2026-06-29", "Blog", "사례형", "5800", "398", "28", "175000"],
        ["2026-07-06", "YouTube", "가이드형", "14500", "390", "30", "360000"],
        ["2026-07-13", "Instagram", "카드뉴스", "9800", "401", "29", "255000"],
        ["2026-07-20", "Blog", "가이드형", "6200", "470", "38", "195000"],
      ],
      sessions: [
        "Sheet 구조와 분석 질문을 확인하고 가중 CTR·CPA 검산 셀을 만듭니다.",
        "SUM·필터·간단 차트로 채널별 노출·클릭·전환·비용을 사람이 먼저 비교합니다.",
        "CSV 또는 필요한 범위를 ChatGPT에 제공해 채널 차이·가능한 원인·추가 질문을 생성합니다.",
        "산식과 수치를 재검산하고 사실·해석·가설·한계를 나눈 1페이지 리포트를 작성합니다.",
      ],
      prompts: [
        "MK-A1~A2와 CSV를 사용해 전체·채널별 CTR·CPA 산식과 차트 계획을 작성하세요.",
        "노출·클릭·전환·비용을 채널별로 합산한 뒤 CTR=클릭/노출, CPA=비용/전환으로 계산하세요.",
        "채널 결과를 사실·해석·가설·한계로 분리하고 인과관계나 실제 매출을 만들지 마세요.",
        "핵심 수치, 채널 차트 설명, 한계, 다음 동일조건 실험이 있는 1페이지 마케팅 리포트를 작성하세요.",
      ],
      completed: `# M07-D03 마케팅 완성 예시

> 12개 가상 콘텐츠 성과 · 실제 캠페인 자료 없음 · ${AS_OF} 검수

## 핵심 수치

- 전체 노출 125,700, 클릭 4,599, 전환 312
- 가중 CTR 3.66%, CPA 약 10,657원
- Blog CTR 7.37%, CPA 약 5,649원
- YouTube CTR 2.06%, CPA 약 19,206원

## 사실·해석·가설

| 구분 | 내용 |
|---|---|
| 사실 | 이 표본에서 Blog의 CTR은 높고 CPA는 낮다. |
| 해석 | 다음 비교에서 Blog 형식의 재현 가능성을 점검할 가치가 있다. |
| 가설 | 콘텐츠 유형이나 타깃 차이가 영향을 줬을 수 있으나 채널 효과로 확정할 수 없다. |

## 다음 실험

같은 메시지·기간·예산으로 채널을 비교하고, 행별 CTR 단순 평균 대신 합계 기반 CTR을 사용한다. ChatGPT 결과는 Sheet 수식과 대조했다.
`,
      screen: {
        slug: "practice-content-performance-analysis.svg",
        title: "콘텐츠 12개 → 가중 CTR·CPA → 성과 리포트",
        subtitle: "채널 수치·산식·인과 과장 분리",
        columns: [
          ["질문", "채널 비교", "가중 CTR", "CPA"],
          ["검산", "노출 합계", "클릭·전환", "비용 합계"],
          ["리포트", "사실", "해석·한계", "다음 실험"],
        ],
        footer: "오전 경영지원과 다른 결과: 채널 성과 산식 + 인과 과장 방지",
      },
    },
  },
};

function write(relativePath, content) {
  const destination = path.join(ROOT, relativePath);
  fs.mkdirSync(path.dirname(destination), { recursive: true });
  fs.writeFileSync(destination, `${content.trim()}\n`, "utf8");
}

function escapeXml(value) {
  return String(value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;");
}

function textLines(lines, x, y, options = {}) {
  const size = options.size ?? 31;
  const weight = options.weight ?? 500;
  const fill = options.fill ?? "#172B4D";
  const gap = options.gap ?? Math.round(size * 1.55);
  const anchor = options.anchor ?? "start";
  return `<text x="${x}" y="${y}" font-family="Arial, 'Noto Sans KR', sans-serif" font-size="${size}" font-weight="${weight}" fill="${fill}" text-anchor="${anchor}">${lines
    .map((line, index) => `<tspan x="${x}" dy="${index === 0 ? 0 : gap}">${escapeXml(line)}</tspan>`)
    .join("")}</text>`;
}

function wrapText(value, maxChars) {
  const words = String(value).trim().split(/\s+/);
  const lines = [];
  let current = "";
  for (const word of words) {
    const candidate = current ? `${current} ${word}` : word;
    if (candidate.length <= maxChars || !current) current = candidate;
    else {
      lines.push(current);
      current = word;
    }
  }
  if (current) lines.push(current);
  return lines;
}

function svgFrame(body) {
  return `<svg xmlns="http://www.w3.org/2000/svg" width="1600" height="900" viewBox="0 0 1600 900" role="img">
  <rect width="1600" height="900" fill="#F7F9FC"/>
  ${body}
</svg>`;
}

function renderUpdateCard(update) {
  const cards = update.change.map((item, index) => {
    const y = 310 + index * 126;
    return `<rect x="105" y="${y}" width="1390" height="94" rx="22" fill="#FFFFFF" stroke="#D9E2F2" stroke-width="2"/>
      <circle cx="158" cy="${y + 47}" r="25" fill="#FF6B57"/>
      <text x="158" y="${y + 57}" font-family="Arial, sans-serif" font-size="28" font-weight="700" fill="#FFFFFF" text-anchor="middle">${index + 1}</text>
      ${textLines([item], 210, y + 58, { size: 28, weight: 650 })}`;
  }).join("\n");
  return svgFrame(`
    <rect x="64" y="54" width="1472" height="792" rx="34" fill="#FFFFFF" stroke="#C9D7EC" stroke-width="3"/>
    <rect x="64" y="54" width="1472" height="160" rx="34" fill="#0B1F44"/>
    <rect x="108" y="94" width="248" height="58" rx="29" fill="#FF6B57"/>
    ${textLines(["최신 업데이트 카드"], 232, 133, { size: 27, weight: 750, fill: "#FFFFFF", anchor: "middle" })}
    ${textLines([`${AS_OF} 확인`], 1490, 132, { size: 24, weight: 600, fill: "#D8E5FF", anchor: "end" })}
    ${textLines([update.title], 104, 275, { size: 44, weight: 800, fill: "#0B1F44" })}
    ${cards}
    <rect x="105" y="684" width="900" height="136" rx="22" fill="#EAF2FF"/>
    ${textLines(["수업 반영", ...wrapText(update.impact, 34)], 137, 714, { size: 20, weight: 650, fill: "#155EEF", gap: 27 })}
    <rect x="1030" y="684" width="465" height="136" rx="22" fill="#FFF1E8"/>
    ${textLines(["확인", ...wrapText(update.caution, 18)], 1060, 714, { size: 19, weight: 650, fill: "#9A3412", gap: 25 })}
    ${textLines(["교육용 요약 · 메뉴와 제공 범위는 수업 계정에서 확인"], 800, 842, { size: 18, weight: 500, fill: "#667085", anchor: "middle" })}
  `);
}

function renderRoleScreen(role, screen) {
  const columns = screen.columns.map((items, index) => {
    const x = 98 + index * 492;
    const rows = items.slice(1).map((item, row) => {
      const y = 390 + row * 105;
      return `<rect x="${x + 28}" y="${y}" width="390" height="76" rx="16" fill="#FFFFFF" stroke="#D6DFEE" stroke-width="2"/>
        <circle cx="${x + 66}" cy="${y + 38}" r="16" fill="${role.accent}" opacity="${0.95 - row * 0.15}"/>
        ${textLines([item], x + 96, y + 48, { size: 25, weight: 650 })}`;
    }).join("\n");
    return `<rect x="${x}" y="294" width="446" height="414" rx="26" fill="${role.soft}" stroke="${role.accent}" stroke-width="2"/>
      <rect x="${x}" y="294" width="446" height="78" rx="26" fill="${role.accent}"/>
      ${textLines([items[0]], x + 223, 344, { size: 30, weight: 750, fill: "#FFFFFF", anchor: "middle" })}
      ${rows}`;
  }).join("\n");
  return svgFrame(`
    <rect x="54" y="46" width="1492" height="808" rx="32" fill="#FFFFFF" stroke="#C9D7EC" stroke-width="3"/>
    <rect x="54" y="46" width="1492" height="74" rx="32" fill="#0B1F44"/>
    <circle cx="98" cy="83" r="9" fill="#FF6B57"/><circle cx="128" cy="83" r="9" fill="#FBBF24"/><circle cx="158" cy="83" r="9" fill="#22C55E"/>
    ${textLines([`교육용 가상 화면 · ${AS_OF} 기준`], 800, 93, { size: 23, weight: 650, fill: "#D8E5FF", anchor: "middle" })}
    ${textLines([role.label], 101, 181, { size: 25, weight: 750, fill: role.accent })}
    ${textLines([screen.title], 101, 240, { size: 42, weight: 800, fill: "#0B1F44" })}
    ${textLines([screen.subtitle], 1498, 232, { size: 23, weight: 550, fill: "#52627A", anchor: "end" })}
    ${columns}
    <path d="M544 500 H580" stroke="#8FA6C7" stroke-width="8" stroke-linecap="round"/><path d="M1070 500 H1106" stroke="#8FA6C7" stroke-width="8" stroke-linecap="round"/>
    <rect x="98" y="742" width="1404" height="76" rx="20" fill="#0B1F44"/>
    ${textLines([screen.footer], 800, 790, { size: 26, weight: 700, fill: "#FFFFFF", anchor: "middle" })}
  `);
}

function csvEscape(value) {
  return `"${String(value).replaceAll('"', '""')}"`;
}

function buildCsv(header, rows) {
  return [header, ...rows].map((row) => row.map(csvEscape).join(",")).join("\n");
}

function prefix(dayId, roleKey) {
  return `m07-${dayId.slice(-3).toLowerCase()}-${roleKey}`;
}

function buildReadme(dayId, roleKey, pack) {
  const role = roles[roleKey];
  const filePrefix = prefix(dayId, roleKey);
  return `# ${dayId} ${role.label} 실습자료

기준일: ${AS_OF}

## 단독·연속 수강 원칙

- 이 과정만 수강해도 원자료·샘플·프롬프트·템플릿·완성 예시로 네 차시를 끝낼 수 있습니다.
- 오전·오후를 모두 수강해도 입력 데이터·업무 규칙·오류·최종 산출물을 반복하지 않습니다.
- ${pack.difference}

## 오늘의 과제

${pack.summary}

## 파일 구성

- starter/${pack.sourceName}: 직무별 교육 원자료
- starter/${filePrefix}-starter.md: 차시별 시작 파일
${pack.appsScript ? `- starter/${filePrefix}-report-generator.gs: Docs·PDF 교육용 코드\n` : ""}- samples/${filePrefix}-samples.csv: 복사 가능한 가상 입력 데이터
- templates/${filePrefix}-practice-template.md: 빈 결과물 틀
- templates/${filePrefix}-prompt-pack.txt: 복사 프롬프트
- solutions/${filePrefix}-complete-example.md: 완성 예시

## 안전 기준

- 실제 개인정보·조직 내부 데이터·자격증명·API 키를 넣지 않습니다.
- 기능·메뉴·요금·한도는 수업 계정에서 확인합니다.
- ${role.verify}를 사람이 최종 확인합니다.
`;
}

function buildStarter(dayId, roleKey, pack) {
  const role = roles[roleKey];
  return `# ${dayId} ${role.label} 시작 파일

> 기준일: ${AS_OF} · 단독 수강자는 이 파일과 원자료부터 시작

## 과제

${pack.summary}

## 네 차시

${pack.sessions.map((session, index) => `${index + 1}. ${session}`).join("\n")}

## 제출 결과물

${pack.outputs.map((output) => `- ${output}`).join("\n")}

## 완료 기준

- [ ] 원자료의 필수값·허용값·금지·한계를 표시함
- [ ] 실제 개인정보·자격증명·조직 내부자료가 없음
- [ ] 오류 또는 누락 입력을 정상 입력과 분리함
- [ ] ${role.verify}를 원본과 대조함
- [ ] 도구 접근이 없을 때 문서형 대체 결과를 완성함
`;
}

function buildTemplate(dayId, roleKey, pack) {
  const role = roles[roleKey];
  return `# ${dayId} ${role.label} 실습 템플릿

## A. 입력·스키마 검토

| 항목·열 | 유형 | 필수·허용값 | 위험·누락 | 수정 |
|---|---|---|---|---|
|  |  |  |  |  |

## B. 네 차시 작업 기록

| 차시 | 시작 입력 | 수행 | 정상 결과 | 오류·사람의 수정 |
|---|---|---|---|---|
| 1 |  |  |  |  |
| 2 |  |  |  |  |
| 3 |  |  |  |  |
| 4 |  |  |  |  |

## C. 결과물

${pack.outputs.map((output) => `### ${output}\n\n- 내용:\n- 근거·산식:\n- 확인 필요:`).join("\n\n")}

## D. 단독·연속 수강 신규성

- 이 직무만의 입력:
- 다른 직무와 다른 판단:
- 다른 오류 사례:
- 다른 최종 산출물:

## E. 최종 검수

- [ ] 원자료 밖 사실·수치·성과·원인을 만들지 않음
- [ ] 실제 개인정보·자격증명·내부 링크가 없음
- [ ] ${role.verify} 확인
- [ ] 계정·권한·버전·대체 실습을 기록함
`;
}

function buildPromptPack(dayId, roleKey, pack) {
  const role = roles[roleKey];
  return `# ${dayId} ${role.label} 프롬프트 모음

기준일: ${AS_OF}
원자료: starter/${pack.sourceName}

${pack.prompts.map((prompt, index) => `## 프롬프트 ${index + 1} · ${index + 1}차시\n\n${prompt}`).join("\n\n")}

## 공통 검수 프롬프트

결과를 원자료·CSV·실행 로그와 대조하세요. 열: 결과 | 근거 ID·행 | 오류·과장·누락 | 수정 | 승인 역할. 실제 개인정보·자격증명·API 키를 만들지 말고 ${role.verify}를 확인하세요.

## 도구 대체 프롬프트

도구·계정·연결 권한이 없다고 가정하고 같은 학습 목표를 입력표, 매핑표, 노드 카드, 수동 계산, 오류 로그로 완료하는 절차와 제출 기준을 작성하세요.
`;
}

function guideInsert(dayId, roleKey, pack, guideType) {
  const update = updates[dayId];
  const role = roles[roleKey];
  const commonImage = `assets/guide-images/common/${dayId}/${update.slug}`;
  const roleImage = `assets/guide-images/${roleKey}/${dayId}/${pack.screen.slug}`;
  const sourcePath = `downloads/guide-resources/${roleKey}/${dayId}/starter/${pack.sourceName}`;
  const instructorNote = guideType === "instructor"
    ? `\n### 강사 운영 메모\n\n- 오전·오후 폴더와 가상 입력을 분리해 배포합니다.\n- 실제 계정이 없어도 CSV·코드·노드 카드·검산표로 같은 평가를 진행합니다.\n- ${role.verify}가 빠진 결과는 완성으로 처리하지 않습니다.\n`
    : "";
  return `${MARKER_START}

### 최신 업데이트 카드 · ${AS_OF}

![${update.title}](${BASE_URL}${commonImage})

- 최신 확인: ${update.change.join(" / ")}
- 수업 반영: ${update.impact}
- 확인: ${update.caution}

### 단독 수강·연속 수강 설계

- 단독 수강: 이 가이드와 원자료·샘플 CSV만으로 네 차시를 시작할 수 있습니다.
- 연속 수강: ${pack.difference}
- 공통 이론은 유지하지만 입력 스키마·업무 규칙·오류·결과물은 다른 직무와 공유하지 않습니다.

![${pack.screen.title}](${BASE_URL}${roleImage})

- [직무별 실제 원자료 열기](${BASE_URL}${sourcePath})
- 제출 결과: ${pack.outputs.join(" / ")}
${instructorNote}
${MARKER_END}`;
}

function insertGuideRefresh(relativePath, insert) {
  const absolutePath = path.join(ROOT, relativePath);
  let text = fs.readFileSync(absolutePath, "utf8");
  const marked = new RegExp(`${MARKER_START}[\\s\\S]*?${MARKER_END}`, "g");
  if (marked.test(text)) text = text.replace(marked, insert);
  else {
    const index = text.indexOf("## 2.");
    if (index < 0) throw new Error(`Guide insertion anchor missing: ${relativePath}`);
    text = `${text.slice(0, index).trimEnd()}\n\n${insert}\n\n${text.slice(index)}`;
  }
  fs.writeFileSync(absolutePath, `${text.trim()}\n`, "utf8");
}

function main() {
  for (const [dayId, update] of Object.entries(updates)) {
    write(`assets/guide-images/common/${dayId}/${update.slug}`, renderUpdateCard(update));
  }

  let refreshedPacks = 0;
  let updatedGuides = 0;
  for (const [dayId, dayPacks] of Object.entries(packs)) {
    for (const [roleKey, pack] of Object.entries(dayPacks)) {
      const root = `downloads/guide-resources/${roleKey}/${dayId}`;
      const filePrefix = prefix(dayId, roleKey);
      write(`${root}/README.md`, buildReadme(dayId, roleKey, pack));
      write(`${root}/starter/${pack.sourceName}`, pack.source);
      write(`${root}/starter/${filePrefix}-starter.md`, buildStarter(dayId, roleKey, pack));
      if (pack.appsScript) write(`${root}/starter/${filePrefix}-report-generator.gs`, pack.appsScript);
      write(`${root}/samples/${filePrefix}-samples.csv`, buildCsv(pack.sampleHeader, pack.sampleRows));
      write(`${root}/templates/${filePrefix}-practice-template.md`, buildTemplate(dayId, roleKey, pack));
      write(`${root}/templates/${filePrefix}-prompt-pack.txt`, buildPromptPack(dayId, roleKey, pack));
      write(`${root}/solutions/${filePrefix}-complete-example.md`, pack.completed);
      write(`assets/guide-images/${roleKey}/${dayId}/${pack.screen.slug}`, renderRoleScreen(roles[roleKey], pack.screen));
      refreshedPacks += 1;

      for (const guideType of ["learner", "instructor"]) {
        insertGuideRefresh(
          `guides/notion/${roleKey}/${guideType}/${dayId}.md`,
          guideInsert(dayId, roleKey, pack, guideType),
        );
        updatedGuides += 1;
      }
    }
  }

  console.log(JSON.stringify({
    asOf: AS_OF,
    updateCards: Object.keys(updates).length,
    roleVisuals: refreshedPacks,
    refreshedPacks,
    updatedGuides,
  }, null, 2));
}

main();
