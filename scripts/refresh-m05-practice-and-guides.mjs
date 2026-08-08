import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const BASE_URL = "https://raw.githubusercontent.com/makernari/AX-slide-site/main/";
const AS_OF = "2026-08-08";
const MARKER_START = "<!-- M05-20260808-REFRESH:START -->";
const MARKER_END = "<!-- M05-20260808-REFRESH:END -->";

const roles = {
  backoffice: {
    label: "경영지원",
    accent: "#155EEF",
    soft: "#EAF2FF",
    verify: "담당 역할·기한·수치·규정·승인 상태",
  },
  marketing: {
    label: "마케팅",
    accent: "#C2410C",
    soft: "#FFF1E8",
    verify: "목표·타깃·브랜드 사실·채널·과장·저작권",
  },
};

const dayUpdates = {
  "M05-D01": {
    title: "Gem은 두 종류를 구분하세요",
    date: "2026-08-08 확인",
    change: [
      "기존 Gem: 반복 작업용 맞춤 지침과 지식 파일",
      "Labs 기반 Gem: Opal로 만드는 실험적 미니 앱·워크플로",
      "두 기능은 대상 계정·언어·공유 조건이 다를 수 있음",
    ],
    impact: "이 수업은 계정 차이가 적은 기존 Gem 체험 또는 문서형 대체 실습을 기본으로 합니다.",
    caution: "Labs 기능은 개인 계정·영어·실험 제공 조건을 확인한 경우에만 확장 활동으로 사용합니다.",
    slug: "update-gems-20260808.svg",
  },
  "M05-D02": {
    title: "녹취 도구와 Gem 메뉴는 계정별로 다릅니다",
    date: "2026-08-08 확인",
    change: [
      "클로바노트 정식 버전은 네이버 개인 계정 조건 확인",
      "Gem 생성은 Gemini 웹 앱에서 지침·지식·미리보기 후 저장",
      "미리보기 실행만으로는 Gem이 자동 저장되지 않음",
    ],
    impact: "음성 업로드가 막혀도 제공 녹취문으로 회의록 검증과 Gem 설계를 끝낼 수 있습니다.",
    caution: "실제 회의 음성·인명·연락처·기관 내부 발언은 넣지 않습니다.",
    slug: "update-transcription-gems-20260808.svg",
  },
  "M05-D03": {
    title: "NotebookLM의 현재 이름은 Gemini Notebook입니다",
    date: "2026-07-16 변경 · 2026-08-08 확인",
    change: [
      "NotebookLM이 Gemini Notebook으로 명칭 변경",
      "기존 소스 기반 질문·인용·오디오·학습자료 흐름은 유지",
      "코드 실행·동기화 등 새 기능은 순차 제공·요금제 조건 확인",
    ],
    impact: "교안에서는 ‘Gemini Notebook(구 NotebookLM)’으로 표기하고 출처 기반 기본 실습을 사용합니다.",
    caution: "새 기능이 보이지 않아도 기본 실습 완료에는 문제가 없습니다.",
    slug: "update-gemini-notebook-20260808.svg",
  },
  "M05-D04": {
    title: "도구 이름보다 조사 계획과 근거 통제가 중요합니다",
    date: "2026-08-08 확인",
    change: [
      "ChatGPT Deep Research: 조사 계획 편집·특정 사이트 지정·진행 중 수정",
      "ChatGPT Projects: 무료·유료 계정에서 장기 작업 맥락 관리",
      "맞춤형 GPT 제작·일부 고급 기능은 유료·관리자 설정 조건",
    ],
    impact: "세 LLM은 같은 근거·같은 요청으로 비교하고, 모델명 대신 실제 계정의 결과와 근거 표시를 평가합니다.",
    caution: "요금·한도·모델명은 고정 문구로 가르치지 않고 수업 당일 계정에서 확인합니다.",
    slug: "update-llm-comparison-20260808.svg",
  },
};

const packs = {
  "M05-D02": {
    backoffice: {
      title: "가상 교육운영 점검회의를 검증된 업무 회의록으로 전환",
      unique: "오후 마케팅과 달리 담당 역할·기한·승인 상태가 핵심이며, 결과는 정식 회의록과 액션 아이템 표입니다.",
      sourceName: "m05-d02-backoffice-source-pack.md",
      source: `# M05-D02 경영지원 원자료 묶음

> 교육용 가상 자료 · 실제 기관·개인 정보 없음 · ${AS_OF} 검수

## 사용 목적

교육운영 점검회의의 발언을 결정·제안·미확정·액션 아이템으로 구분합니다. 오후 마케팅 실습과 원자료·판단 기준·산출물 구조가 겹치지 않습니다.

## 가상 녹취문

**00:00 운영 역할**: 오늘은 8월 교육 준비 상태를 확인하겠습니다. 확정된 내용과 제안은 반드시 나눠 기록해 주세요.

**00:28 교육 역할**: 강의자료 제출 양식은 3판을 사용하기로 지난 회의에서 확정했습니다. 제가 8월 12일 15시까지 강사 역할 계정으로 교육용 양식을 보내겠습니다.

**01:16 시설 역할**: 실습실 점검표는 아직 최종 승인이 아닙니다. 8월 13일 11시까지 초안을 올리고 운영 역할의 확인을 받겠습니다.

**02:05 운영 역할**: 좋습니다. 점검표는 승인 전까지 ‘초안’으로 표시합니다.

**02:34 교육 역할**: 수강생 사전 안내를 금요일까지 보내면 어떨까요?

**02:50 운영 역할**: 여기서 금요일이 며칠인지와 발송 담당이 정해지지 않았습니다. 회의록에는 결정으로 쓰지 말고 확인 질문으로 남겨 주세요.

**03:22 시설 역할**: 장비 대여 수량은 12대로 들었는데, 신청표에는 10대로 표시되어 있습니다.

**03:43 운영 역할**: 수량은 오늘 확정하지 않습니다. 신청표 원본을 확인한 뒤 별도 승인하겠습니다.

**04:11 교육 역할**: 8월 14일 오전에 강사 사전 브리핑을 열자는 제안도 있습니다.

**04:32 운영 역할**: 일정 충돌 확인 전이므로 제안 상태로 기록해 주세요.

**05:05 운영 역할**: 오늘 확정은 두 가지입니다. 자료 양식 3판 사용, 시설 점검표는 승인 전 초안 표시입니다. 나머지는 확인 후 결정합니다.

## 원문 검증표

| 항목 | 원문 상태 | 올바른 기록 |
|---|---|---|
| 자료 양식 3판 | 확정 | 결정사항 |
| 8월 12일 15시 발송 | 담당·기한 명시 | 액션 아이템 |
| 실습실 점검표 | 승인 전 | 초안·승인 필요 |
| 금요일 안내 | 날짜·담당 불명 | 확인 질문 |
| 장비 12대 | 자료 충돌 | 수량 확인 필요 |
| 8월 14일 브리핑 | 제안 | 미확정 |

## Gem 테스트용 변형 입력

1. 정상 입력: 위 녹취문 전체
2. 모호 입력: “금요일까지 처리”, “그분이 확인”처럼 날짜·담당이 빠진 발언
3. 누락 입력: 결정은 있으나 승인자와 근거 위치가 없는 발언
`,
      csvHeader: ["time", "speaker_role", "utterance", "expected_class", "human_check"],
      csvRows: [
        ["00:28", "교육 역할", "강의자료 제출 양식은 3판을 사용", "결정", "이전 회의 확정 근거"],
        ["01:16", "시설 역할", "8월 13일 11시까지 점검표 초안", "액션", "승인 전 초안 표시"],
        ["02:34", "교육 역할", "금요일까지 안내 발송 제안", "미확정", "날짜와 담당 확인"],
        ["03:22", "시설 역할", "장비 12대와 신청표 10대가 충돌", "확인 필요", "원본 신청표 대조"],
        ["04:11", "교육 역할", "8월 14일 오전 브리핑 제안", "제안", "일정 충돌 확인"],
      ],
      outputs: ["정식 회의록", "액션 아이템 표", "확인 요청 초안", "회의록 Gem 지침", "정상·모호·누락 테스트표"],
      completed: `## 정식 회의록

### 결정사항

1. 강의자료 제출 양식은 3판을 사용한다. 근거: 00:28, 05:05.
2. 실습실 점검표는 운영 역할 승인 전까지 ‘초안’으로 표시한다. 근거: 01:16~02:05.

### 액션 아이템

| 작업 | 담당 역할 | 기한 | 완료 기준 | 승인 상태 |
|---|---|---|---|---|
| 교육용 양식 발송 | 교육 역할 | 8월 12일 15시 | 강사 역할 계정에서 파일 확인 | 확정 |
| 실습실 점검표 초안 등록 | 시설 역할 | 8월 13일 11시 | 초안 표기와 점검 항목 확인 | 운영 역할 승인 필요 |

### 미확정·확인 질문

- 수강생 사전 안내의 ‘금요일’은 정확히 며칠이며 담당 역할은 누구인가?
- 장비 수량은 신청표 10대와 구두 발언 12대 중 무엇이 최신인가?
- 8월 14일 오전 브리핑은 일정 충돌 확인 후 확정한다.

### 검증 기록

- ‘금요일 발송’을 결정사항에서 삭제하고 확인 질문으로 이동했다.
- 장비 수량을 12대로 단정하지 않고 원본 확인 필요로 표시했다.
`,
      screen: {
        title: "업무회의 녹취 → 승인 가능한 회의록",
        subtitle: "교육운영 점검회의 · 담당·기한·승인 중심",
        columns: [
          ["1 원문", "역할별 발언", "시간 위치", "자료 충돌 표시"],
          ["2 분류", "결정", "제안", "확인 필요"],
          ["3 결과", "액션 아이템", "담당·기한", "승인 상태"],
        ],
        footer: "오후 마케팅 실습과 다른 결과: 정식 회의록 + 업무 분장 + 승인 질문",
        slug: "practice-meeting-to-actions.svg",
      },
    },
    marketing: {
      title: "가상 브랜드 콘텐츠 기획회의를 촬영·검토·게시 일정으로 전환",
      unique: "오전 경영지원과 달리 아이디어·브랜드 사실·채널·게시 상태가 핵심이며, 결과는 콘텐츠 회의록과 제작 일정표입니다.",
      sourceName: "m05-d02-marketing-source-pack.md",
      source: `# M05-D02 마케팅 원자료 묶음

> 교육용 가상 브랜드 NOVA-TEA · 실제 고객·성과 정보 없음 · ${AS_OF} 검수

## 사용 목적

콘텐츠 기획회의의 발언을 아이디어·확정 메시지·촬영·브랜드 검토·게시 후보로 구분합니다. 오전 경영지원 실습과 원자료·판단 기준·산출물 구조가 겹치지 않습니다.

## 확인된 브랜드 사실

- NOVA-TEA는 교육용 가상 허브티 브랜드다.
- 이번 콘텐츠의 타깃은 저녁 루틴 콘텐츠에 관심 있는 성인이다.
- 허용 메시지: “저녁을 정리하는 차분한 티타임”.
- 금지 메시지: 수면 개선, 치료, 스트레스 해소 보장, 실제 후기, 확인되지 않은 할인.
- 채널은 가상 SNS-A이며 게시 전 브랜드 검토가 필요하다.

## 가상 녹취문

**00:00 콘텐츠 기획 역할**: 오늘은 SNS-A용 출시 콘텐츠의 메시지와 촬영·검토 일정을 정하겠습니다.

**00:35 브랜드 검토 역할**: 핵심 메시지는 “저녁을 정리하는 차분한 티타임”으로 확정하겠습니다. 효능 표현은 사용하지 않습니다.

**01:10 제작 역할**: 패키지와 머그를 보여 주는 3장면 촬영을 8월 13일 14시에 진행할 수 있습니다.

**01:42 콘텐츠 기획 역할**: 촬영 일정은 확정하고, 1차 편집본은 8월 14일 10시까지 제작 역할이 올려 주세요.

**02:18 브랜드 검토 역할**: 제가 8월 14일 12시까지 사실·금지 표현을 검토하겠습니다. 승인 전에는 게시 상태를 ‘검토 중’으로 둡니다.

**03:05 제작 역할**: “마시면 바로 편안해진다”는 문구가 훅으로 강할 것 같습니다.

**03:20 브랜드 검토 역할**: 입력 사실에 없는 효능이므로 사용하지 않습니다. 아이디어 목록에서도 위험 표현으로 표시해 주세요.

**04:02 콘텐츠 기획 역할**: 게시일은 8월 18일을 후보로 두되 채널 편성 확인 전에는 확정하지 않겠습니다.

**04:44 제작 역할**: 비하인드 장면을 추가하자는 아이디어도 있습니다.

**05:01 콘텐츠 기획 역할**: 그것은 확정안이 아니라 후속 콘텐츠 후보로 기록합니다.

## 원문 검증표

| 항목 | 원문 상태 | 올바른 기록 |
|---|---|---|
| 핵심 메시지 | 확정 | 브랜드 사실과 함께 기록 |
| 8월 13일 14시 촬영 | 확정 | 촬영 일정 |
| 8월 14일 10시 편집본 | 담당·기한 명시 | 제작 액션 |
| 8월 14일 12시 검토 | 승인 단계 | 브랜드 검토 일정 |
| ‘바로 편안’ 문구 | 금지 | 효능 과장 위험 |
| 8월 18일 게시 | 후보 | 편성 확인 필요 |
| 비하인드 장면 | 아이디어 | 후속 후보 |

## Gem 테스트용 변형 입력

1. 정상 입력: 위 녹취문 전체
2. 모호 입력: 타깃·채널·검토 담당이 빠진 콘텐츠 회의
3. 누락 입력: 게시일만 있고 브랜드 승인 단계가 없는 회의
`,
      csvHeader: ["time", "speaker_role", "utterance", "expected_class", "brand_check"],
      csvRows: [
        ["00:35", "브랜드 검토 역할", "저녁을 정리하는 차분한 티타임", "확정 메시지", "효능 표현 금지"],
        ["01:10", "제작 역할", "8월 13일 14시 3장면 촬영", "촬영 일정", "패키지 특징 유지"],
        ["02:18", "브랜드 검토 역할", "8월 14일 12시 검토", "승인 단계", "게시 전 승인"],
        ["03:05", "제작 역할", "마시면 바로 편안해진다", "금지 표현", "입력에 없는 효능"],
        ["04:02", "콘텐츠 기획 역할", "8월 18일 게시 후보", "게시 후보", "채널 편성 확인"],
      ],
      outputs: ["콘텐츠 회의록", "촬영·편집·검토·게시 일정표", "브랜드 위험 표현표", "콘텐츠 회의록 Gem 지침", "정상·모호·누락 테스트표"],
      completed: `## 콘텐츠 회의록

### 확정 메시지

- 타깃: 저녁 루틴 콘텐츠에 관심 있는 성인.
- 채널: 가상 SNS-A.
- 핵심 메시지: “저녁을 정리하는 차분한 티타임”. 근거: 00:35.
- 금지: 효능·치료·성과·후기·할인 임의 생성.

### 제작 일정

| 단계 | 담당 역할 | 기한 | 완료 기준 | 상태 |
|---|---|---|---|---|
| 3장면 촬영 | 제작 역할 | 8월 13일 14시 | 패키지와 머그의 일관성 | 확정 |
| 1차 편집본 | 제작 역할 | 8월 14일 10시 | 핵심 메시지와 채널 형식 반영 | 확정 |
| 브랜드 검토 | 브랜드 검토 역할 | 8월 14일 12시 | 사실·금지 표현 확인 | 승인 전 |
| 게시 | 콘텐츠 기획 역할 | 8월 18일 후보 | 채널 편성 확인 | 미확정 |

### 위험 표현과 후속 후보

- “마시면 바로 편안해진다”: 입력 사실에 없는 효능이므로 삭제.
- 비하인드 장면: 확정안이 아니라 후속 콘텐츠 아이디어로 보관.

### 검증 기록

- 게시 후보일을 확정 일정으로 바꾸지 않았다.
- 아이디어와 승인된 콘텐츠를 분리했다.
`,
      screen: {
        title: "콘텐츠 회의 녹취 → 제작 캘린더",
        subtitle: "NOVA-TEA 가상 기획회의 · 브랜드·채널·검토 중심",
        columns: [
          ["1 원문", "확정 메시지", "촬영 아이디어", "게시 후보"],
          ["2 검토", "브랜드 사실", "과장 표현", "타깃·채널"],
          ["3 결과", "촬영·편집", "브랜드 승인", "게시 상태"],
        ],
        footer: "오전 경영지원 실습과 다른 결과: 콘텐츠 회의록 + 제작 캘린더 + 위험 표현표",
        slug: "practice-content-meeting-to-calendar.svg",
      },
    },
  },
  "M05-D03": {
    backoffice: {
      title: "업무 절차 문서의 적용 범위와 예외를 출처 기반 온보딩 자료로 전환",
      unique: "오후 마케팅과 달리 절차·기한·예외·승인 조건을 판단하며, 인용 가능한 업무 온보딩 자료를 만듭니다.",
      sourceName: "m05-d03-backoffice-source-pack.md",
      source: `# M05-D03 경영지원 소스 묶음

> Gemini Notebook 등록용 교육 자료 · 실제 기관 규정 아님 · ${AS_OF} 검수

## BO-S1 · 교육 요청 처리 절차 · 2026-07-20판

### 1. 적용 범위

정규 교육 요청은 교육 시작일 3영업일 전 15시까지 접수한다. 긴급 요청은 안전·법정 의무 교육처럼 지연 시 위험이 명확한 경우에만 예외 검토한다.

### 2. 필수 입력

교육 목적, 대상 역할, 희망 일정, 완료 기준을 기록한다. 실제 주민번호·개인 연락처·민감한 평가정보는 수집하지 않는다.

### 3. 승인

접수 역할은 입력 누락을 확인하고, 일정 변경 또는 예산이 필요한 경우 운영 승인 역할에게 보낸다. 승인 전 상태는 ‘검토 중’이다.

## BO-S2 · 1페이지 업무보고 원칙 · 2026-06-30판

### 1. 구조

보고서는 현황, 확인된 문제, 가능한 원인, 대안, 요청 결정을 구분한다. 수치에는 기간과 분모를 붙인다.

### 2. 사실과 해석

원문에서 확인된 사실과 작성자의 해석을 같은 문장에 섞지 않는다. 원인을 확인하지 못했으면 가설로 표시한다.

### 3. 책임

AI가 만든 요약은 초안이다. 담당 역할·기한·수치·규정·승인은 원문과 사람이 확인한다.

## BO-S3 · 업무 인수인계 체크리스트 · 2026-05-15판

### 1. 필수 항목

업무 목적, 현재 상태, 다음 행동, 담당 역할, 기한, 저장 위치, 접근 권한, 미해결 위험을 남긴다.

### 2. 충돌 처리

이전 인수인계 메모에 “요청은 2일 전까지”라는 문장이 있어도, 최신 절차 BO-S1의 3영업일 전 기준을 우선한다. 충돌 사실은 삭제하지 말고 출처와 함께 기록한다.

## 질문 세트

1. 정규 교육 요청의 접수 기한은 무엇인가?
2. 긴급 요청은 누구나 사용할 수 있는가?
3. 보고서에서 사실과 가설은 어떻게 구분하는가?
4. 인수인계 문서와 최신 절차가 충돌하면 어떻게 하는가?
5. 자료에 없는 ‘승인 후 24시간 내 처리’ 규정을 알려 달라는 질문에는 어떻게 답해야 하는가?
`,
      csvHeader: ["source_id", "title", "version", "main_use", "trap"],
      csvRows: [
        ["BO-S1", "교육 요청 처리 절차", "2026-07-20", "기한·필수 입력·승인", "긴급 예외를 일반화"],
        ["BO-S2", "1페이지 업무보고 원칙", "2026-06-30", "사실·해석·가설", "분모 없는 수치"],
        ["BO-S3", "업무 인수인계 체크리스트", "2026-05-15", "담당·기한·권한", "이전 2일 기준 충돌"],
      ],
      outputs: ["출처 기반 업무 요약", "업무 절차 마인드맵", "퀴즈·정답", "3분 업무 브리핑 대본", "출처·충돌 검증 메모"],
      completed: `## 출처 기반 업무 요약

- 정규 교육 요청은 시작일 3영업일 전 15시까지 접수한다. [BO-S1 §1]
- 긴급 예외는 지연 위험이 명확한 경우에만 검토한다. [BO-S1 §1]
- 요청에는 목적·대상 역할·일정·완료 기준이 필요하다. [BO-S1 §2]
- 보고서는 사실·해석·가설을 분리하고 수치에 기간과 분모를 붙인다. [BO-S2 §1~2]
- 인수인계의 이전 2일 기준은 최신 BO-S1과 충돌하므로 최신 3영업일 기준을 우선한다. [BO-S3 §2]

## 마인드맵 텍스트

- 교육 요청
  - 접수: 3영업일 전 15시
  - 입력: 목적·대상·일정·완료 기준
  - 상태: 승인 전 ‘검토 중’
  - 예외: 안전·법정 의무 등 위험이 명확한 경우
- 업무보고
  - 사실 / 해석 / 가설
  - 기간·분모가 있는 수치
- 인수인계
  - 담당·기한·저장·권한·위험
  - 충돌 시 최신성·적용 범위 표시

## 퀴즈 예시

1. 정규 요청 기한은? → 시작일 3영업일 전 15시. [BO-S1 §1]
2. 승인 전 상태는? → 검토 중. [BO-S1 §3]
3. 자료에 없는 24시간 처리 규정은? → 근거 없음으로 답변을 거절하고 담당 확인 요청.

## 오디오 브리핑 대본 요약

“업무 요청을 빠르게 처리하는 것보다 먼저 적용 범위와 승인 상태를 확인해야 합니다. 최신 절차는 3영업일 전 15시 접수를 기준으로 하며…”
`,
      screen: {
        title: "절차 문서 → 출처 있는 온보딩",
        subtitle: "최신성·적용 범위·예외·승인 조건 확인",
        columns: [
          ["소스", "최신 절차", "보고 원칙", "인수인계"],
          ["질문", "기한은?", "예외는?", "충돌하면?"],
          ["답변", "출처 위치", "적용 범위", "확인 필요"],
        ],
        footer: "오후 마케팅 실습과 다른 판단: 규정 최신성 + 절차 예외 + 승인 책임",
        slug: "practice-procedure-sources.svg",
      },
    },
    marketing: {
      title: "브랜드 사실과 채널 원칙을 출처 기반 콘텐츠 온보딩 자료로 전환",
      unique: "오전 경영지원과 달리 브랜드 사실·금지 표현·타깃·채널 역할을 판단하며 콘텐츠 팀용 학습자료를 만듭니다.",
      sourceName: "m05-d03-marketing-source-pack.md",
      source: `# M05-D03 마케팅 소스 묶음

> Gemini Notebook 등록용 교육 자료 · 가상 브랜드 NOVA-TEA · ${AS_OF} 검수

## MK-S1 · 브랜드 핵심 사실 · 2026-07-22판

### 1. 브랜드 정의

NOVA-TEA는 허브 블렌드를 소개하는 교육용 가상 브랜드다. 이번 실습에서 사용할 수 있는 사실은 ‘가상 허브 블렌드’, ‘저녁 티타임 장면’, ‘성인 대상’뿐이다.

### 2. 허용·금지

허용: 향·장면·루틴을 묘사하는 표현. 금지: 수면 개선, 치료, 스트레스 해소 보장, 실제 고객 후기, 확인되지 않은 할인과 성과 수치.

### 3. 핵심 메시지

“저녁을 정리하는 차분한 티타임”을 기본 메시지로 사용한다.

## MK-S2 · 채널별 콘텐츠 원칙 · 2026-07-18판

### 1. 가상 블로그

브랜드 배경과 사용 장면을 충분히 설명하되 제품 효능을 만들지 않는다. 출처가 없는 시장 수치는 사용하지 않는다.

### 2. 가상 SNS-A

첫 문장은 한 가지 장면 또는 질문으로 시작한다. 한 게시물에 목표와 행동 요청을 하나씩 둔다.

### 3. 가상 뉴스레터

기존 구독자를 대상으로 핵심 메시지, 콘텐츠 링크, 다음 행동을 구분한다.

## MK-S3 · 검토 사례 메모 · 2026-06-10판

### 1. 통과 사례

“하루를 정리하며 향을 천천히 즐기는 티타임”은 장면 묘사이며 효능을 단정하지 않는다.

### 2. 반려 사례

“한 잔이면 숙면 완성”은 브랜드 사실에 없는 효능과 보장을 포함한다.

### 3. 충돌 사례

이전 아이디어 메모에 “숙면을 돕는 차”가 있지만 승인된 브랜드 사실 MK-S1과 충돌한다. 이전 메모를 근거로 사용하지 않는다.

## 질문 세트

1. NOVA-TEA에 대해 확인된 사실은 무엇인가?
2. 가상 SNS-A 첫 문장은 어떻게 구성하는가?
3. “한 잔이면 숙면 완성”은 왜 사용할 수 없는가?
4. 이전 아이디어 메모와 최신 브랜드 사실이 충돌하면 어떻게 하는가?
5. 자료에 없는 고객 만족도 수치를 요청하면 어떻게 답해야 하는가?
`,
      csvHeader: ["source_id", "title", "version", "main_use", "trap"],
      csvRows: [
        ["MK-S1", "브랜드 핵심 사실", "2026-07-22", "사실·허용·금지", "효능 임의 생성"],
        ["MK-S2", "채널별 콘텐츠 원칙", "2026-07-18", "채널 역할·행동 요청", "모든 채널에 같은 문안"],
        ["MK-S3", "검토 사례 메모", "2026-06-10", "통과·반려·충돌", "이전 숙면 표현 재사용"],
      ],
      outputs: ["출처 기반 브랜드 요약", "브랜드·채널 마인드맵", "퀴즈·정답", "3분 콘텐츠 브리핑 대본", "사실·과장 검증 메모"],
      completed: `## 출처 기반 브랜드 요약

- NOVA-TEA는 교육용 가상 허브 블렌드 브랜드다. [MK-S1 §1]
- 확인된 메시지는 “저녁을 정리하는 차분한 티타임”이다. [MK-S1 §3]
- 효능·치료·보장·후기·할인·성과 수치는 만들지 않는다. [MK-S1 §2]
- SNS-A는 한 장면 또는 질문으로 시작하고 목표와 행동 요청을 하나씩 둔다. [MK-S2 §2]
- 이전의 ‘숙면’ 아이디어는 최신 브랜드 사실과 충돌하므로 사용하지 않는다. [MK-S3 §3]

## 마인드맵 텍스트

- 브랜드 사실
  - 가상 허브 블렌드
  - 저녁 티타임 장면
  - 성인 대상
- 채널
  - 블로그: 배경·장면 설명
  - SNS-A: 한 장면·한 목표·한 행동
  - 뉴스레터: 메시지·링크·다음 행동
- 검토
  - 허용: 향·장면·루틴
  - 금지: 효능·보장·후기·할인·성과

## 퀴즈 예시

1. 기본 메시지는? → 저녁을 정리하는 차분한 티타임. [MK-S1 §3]
2. SNS-A의 원칙은? → 한 장면 또는 질문, 한 목표, 한 행동 요청. [MK-S2 §2]
3. 자료에 없는 만족도는? → 만들지 않고 확인 가능한 조사자료를 요청한다.

## 오디오 브리핑 대본 요약

“브랜드 콘텐츠는 멋진 문장보다 확인된 사실에서 시작합니다. NOVA-TEA에 대해 말할 수 있는 것은 가상 허브 블렌드와 저녁 티타임 장면…”
`,
      screen: {
        title: "브랜드 자료 → 출처 있는 콘텐츠 온보딩",
        subtitle: "브랜드 사실·금지 표현·타깃·채널 원칙 확인",
        columns: [
          ["소스", "브랜드 사실", "채널 원칙", "검토 사례"],
          ["질문", "무엇을 말해도 되나?", "어느 채널인가?", "과장인가?"],
          ["답변", "출처 위치", "허용·금지", "채널 적용"],
        ],
        footer: "오전 경영지원 실습과 다른 판단: 브랜드 사실 + 채널 맥락 + 과장 위험",
        slug: "practice-brand-sources.svg",
      },
    },
  },
  "M05-D04": {
    backoffice: {
      title: "업무 요청 지연 근거를 세 LLM로 비교해 관리자 결정 보고서로 전환",
      unique: "오후 마케팅과 달리 지연 현황·승인 병목·담당과 실행 일정이 핵심이며, 관리자 요약과 체크리스트를 만듭니다.",
      sourceName: "m05-d04-backoffice-source-pack.md",
      source: `# M05-D04 경영지원 비교 실습 원자료

> 교육용 가상 조직 · 실제 비용·성과 정보 없음 · ${AS_OF} 검수

## 동일 근거 자료

- 관찰 기간: 가상 2주.
- 접수된 교육 요청: 12건.
- 기한 내 완료: 8건.
- 지연: 4건.
- 지연 4건 중 입력 누락 2건, 승인 대기 1건, 저장 위치 혼선 1건.
- 비용 절감·처리시간 단축 수치는 측정하지 않음.
- 최신 절차는 요청 목적·대상·일정·완료 기준을 요구함. [M05-D03 BO-S1]

## 세 LLM에 넣을 동일 요청

“위 근거만 사용해 현황–문제–대안–권고안–실행 일정 구조의 1페이지 보고서를 작성하세요. 근거가 없는 수치와 원인은 만들지 말고 확인 필요를 표시하세요.”

## 블라인드 초안 A

요청 지연의 가장 큰 원인은 비효율적인 수작업이다. AI 자동화를 도입하면 처리시간을 25% 줄일 수 있다. 즉시 전면 자동화를 권고한다.

문제: 입력 누락과 승인 대기. 대안: AI 자동 분류. 기대효과: 월 300만 원 절감.

## 블라인드 초안 B

12건 중 4건이 지연되었다. 입력 누락 2건이 확인되었다. 모든 요청자는 양식을 정확히 작성해야 한다. 승인 대기와 저장 위치 문제도 개선한다.

권고: 양식을 다시 안내하고 담당자가 주의한다.

## 블라인드 초안 C

12건 중 8건은 기한 내 완료됐고 4건은 지연됐다. 지연 사유로 입력 누락 2건, 승인 대기 1건, 저장 위치 혼선 1건이 기록됐다. 비용·처리시간 효과는 측정하지 않아 단정할 수 없다.

권고: ① 요청 필수 항목 사전 점검, ② 승인 대기 상태 표시, ③ 저장 위치 고정. 2주간 같은 항목을 다시 기록한 뒤 효과를 판단한다.

## 정답이 아니라 비교 포인트

- A: 읽기 쉽지만 25%·300만 원·전면 자동화 근거가 없음.
- B: 핵심 수치는 있으나 실행 담당·기한·완료 기준이 약함.
- C: 근거 충실도와 확인 필요 표시는 좋으며 담당·기한을 추가해야 함.
`,
      csvHeader: ["draft", "evidence", "structure", "unsupported_claim", "next_revision"],
      csvRows: [
        ["A", "낮음", "부분", "25% 단축·월 300만 원 절감", "근거 없는 수치 삭제"],
        ["B", "중간", "낮음", "요청자 주의로 원인 단순화", "담당·기한·완료 기준 추가"],
        ["C", "높음", "높음", "없음", "실행 책임과 측정표 추가"],
      ],
      outputs: ["업무 브리핑 슬라이드 개요", "한 장 인포그래픽 설계", "세 LLM 비교표", "관리자 요약·실무 체크리스트·안내문", "최종 업무 개선 보고서", "업무별 AI 선택 가이드"],
      completed: `## 세 LLM 블라인드 비교

| 기준 | A | B | C |
|---|---|---|---|
| 원문 충실도 | 낮음 | 중간 | 높음 |
| 근거 없는 수치 | 25%·300만 원 | 없음 | 없음 |
| 조건·예외 | 누락 | 일부 | 확인 필요 표시 |
| 실행 가능성 | 전면 자동화로 과도 | 담당·기한 부족 | 보완 후 사용 가능 |

## 최종 보고서

### 현황

가상 2주 동안 12건을 접수했고 8건은 기한 내 완료, 4건은 지연됐다.

### 확인된 문제

- 입력 누락 2건
- 승인 대기 1건
- 저장 위치 혼선 1건

### 대안

1. 접수 시 목적·대상·일정·완료 기준 체크.
2. 승인 전 상태를 ‘검토 중’으로 표시.
3. 완료본 저장 위치와 소유 역할 고정.

### 권고안과 실행 일정

| 행동 | 담당 역할 | 기한 | 완료 기준 |
|---|---|---|---|
| 필수 입력 체크 적용 | 접수 역할 | 다음 실습 시작 전 | 4항목 누락 없음 |
| 승인 상태 열 추가 | 운영 역할 | 1주차 | 검토 중·승인 구분 |
| 2주 재측정 | 보고 역할 | 2주 후 | 같은 지연 사유로 비교 |

### 한계

비용과 처리시간을 측정하지 않았으므로 절감 효과를 단정하지 않는다.

## 관리자 요약

지연 4건의 기록된 사유를 줄이기 위해 입력 점검·승인 상태·저장 위치를 먼저 표준화하고 2주 후 같은 기준으로 재측정한다.
`,
      screen: {
        title: "업무 보고서 블라인드 심사",
        subtitle: "근거 없는 효과 수치를 제거하고 실행 책임을 보완",
        columns: [
          ["초안 A", "25% 단축", "300만 원 절감", "근거 없음"],
          ["초안 B", "핵심 수치", "담당·기한 부족", "부분 사용"],
          ["초안 C", "근거 충실", "확인 필요", "실행표 보완"],
        ],
        footer: "오후 마케팅 실습과 다른 결과: 관리자 결정 보고서 + 업무 체크리스트",
        slug: "practice-report-blind-review.svg",
      },
    },
    marketing: {
      title: "채널별 콘텐츠 검토 근거를 세 LLM로 비교해 캠페인 개선안으로 전환",
      unique: "오전 경영지원과 달리 목표·타깃·브랜드 사실·채널 실행안이 핵심이며, 경영진 요약과 채널별 실행안을 만듭니다.",
      sourceName: "m05-d04-marketing-source-pack.md",
      source: `# M05-D04 마케팅 비교 실습 원자료

> 교육용 가상 브랜드 NOVA-TEA · 실제 고객·성과 정보 없음 · ${AS_OF} 검수

## 동일 근거 자료

- 검토한 가상 콘텐츠: 8건.
- 1차 검토 통과: 5건.
- 수정 요청: 3건.
- 수정 사유: 효능처럼 읽히는 표현 1건, 타깃 불명확 1건, SNS-A 문안 길이 과다 1건.
- 조회·클릭·전환·매출 성과는 측정하지 않음.
- 핵심 메시지는 “저녁을 정리하는 차분한 티타임”. [M05-D03 MK-S1]
- SNS-A는 한 장면·한 목표·한 행동 요청을 사용. [M05-D03 MK-S2]

## 세 LLM에 넣을 동일 요청

“위 근거만 사용해 배경–문제–핵심 메시지–채널별 실행안–기대효과 구조의 보고서를 작성하세요. 측정하지 않은 성과는 보장하지 말고 측정 계획으로 표현하세요.”

## 블라인드 초안 A

이번 캠페인은 반응이 좋았지만 전환율이 낮았다. 카피를 개선하면 전환율이 18% 상승할 것이다. ‘숙면을 완성하는 차’로 메시지를 강화한다.

## 블라인드 초안 B

8건 중 3건이 수정됐다. 브랜드 문구를 더 매력적으로 쓰고 채널에 맞게 짧게 만든다. 타깃도 명확히 한다.

## 블라인드 초안 C

8건 중 5건이 1차 통과했고 3건은 효능 위험·타깃 불명확·문안 길이로 각각 수정 요청을 받았다. 성과 데이터가 없으므로 전환 상승을 단정할 수 없다.

핵심 메시지는 유지하고, SNS-A에서는 한 장면·한 목표·한 행동 요청으로 수정한다. 다음 게시물부터 통과 여부와 수정 사유를 기록해 개선 효과를 측정한다.

## 정답이 아니라 비교 포인트

- A: 18% 상승과 ‘숙면’ 표현이 근거·브랜드 원칙을 위반.
- B: 사실은 보존하지만 채널별 실행과 측정 기준이 모호.
- C: 근거와 브랜드 안전성은 좋고 타깃·구체 문안 예시를 보완해야 함.
`,
      csvHeader: ["draft", "brand_fact", "channel_fit", "unsupported_claim", "next_revision"],
      csvRows: [
        ["A", "위반", "낮음", "전환 18%·숙면 완성", "성과 삭제·핵심 메시지 복원"],
        ["B", "부분", "중간", "없음", "타깃·채널 실행안 구체화"],
        ["C", "충족", "높음", "없음", "카피 예시·측정표 추가"],
      ],
      outputs: ["콘텐츠 전략 슬라이드 개요", "캠페인 인포그래픽 설계", "세 LLM 비교표", "경영진 요약·채널별 실행안·외부 공유문", "최종 캠페인 개선 보고서", "콘텐츠 업무별 AI 선택 가이드"],
      completed: `## 세 LLM 블라인드 비교

| 기준 | A | B | C |
|---|---|---|---|
| 브랜드 사실 | 위반 | 부분 | 충족 |
| 근거 없는 성과 | 전환 18% | 없음 | 없음 |
| 채널 적합성 | 낮음 | 중간 | 높음 |
| 수정 방향 | 폐기 후 재작성 | 구체화 | 카피·측정표 보완 |

## 최종 캠페인 개선 보고서

### 배경

가상 콘텐츠 8건 중 5건이 1차 통과했고 3건은 수정 요청을 받았다.

### 확인된 문제

- 효능처럼 읽히는 표현 1건
- 타깃 불명확 1건
- SNS-A 문안 길이 과다 1건

### 핵심 메시지

“저녁을 정리하는 차분한 티타임”을 유지한다. 효능·보장·후기·성과 수치는 만들지 않는다.

### 채널별 실행안

| 채널 | 타깃 | 콘텐츠 역할 | 행동 요청 | 검토 기준 |
|---|---|---|---|---|
| SNS-A | 저녁 루틴에 관심 있는 성인 | 한 장면 소개 | 다음 콘텐츠 보기 | 한 목표·한 행동·효능 없음 |
| 가상 블로그 | 브랜드 배경을 확인하려는 독자 | 사실과 장면 설명 | 브랜드 원칙 확인 | 출처 없는 시장 수치 없음 |

### 기대효과와 측정

성과 향상을 보장하지 않는다. 다음 4건에서 1차 통과 여부·수정 사유·채널 적합성을 같은 기준으로 기록한다.

## 경영진 요약

현재 문제는 성과가 아니라 제작 품질의 불일치다. 핵심 메시지를 유지하고 타깃·채널·검토 기준을 고정한 뒤 다음 4건에서 수정률 변화를 측정한다.
`,
      screen: {
        title: "캠페인 보고서 블라인드 심사",
        subtitle: "근거 없는 성과와 효능 표현을 제거하고 채널 실행안을 보완",
        columns: [
          ["초안 A", "전환 +18%", "숙면 표현", "브랜드 위반"],
          ["초안 B", "사실 보존", "채널 모호", "구체화 필요"],
          ["초안 C", "근거 충실", "채널 적합", "측정표 보완"],
        ],
        footer: "오전 경영지원 실습과 다른 결과: 캠페인 개선안 + 채널별 실행표",
        slug: "practice-campaign-blind-review.svg",
      },
    },
  },
};

function ensureDir(relativePath) {
  fs.mkdirSync(path.dirname(path.join(ROOT, relativePath)), { recursive: true });
}

function write(relativePath, content) {
  ensureDir(relativePath);
  fs.writeFileSync(path.join(ROOT, relativePath), `${content.trim()}\n`, "utf8");
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
    if (candidate.length <= maxChars || !current) {
      current = candidate;
    } else {
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
      ${textLines([item], 210, y + 58, { size: 30, weight: 650 })}`;
  }).join("\n");
  return svgFrame(`
    <rect x="64" y="54" width="1472" height="792" rx="34" fill="#FFFFFF" stroke="#C9D7EC" stroke-width="3"/>
    <rect x="64" y="54" width="1472" height="160" rx="34" fill="#0B1F44"/>
    <rect x="108" y="94" width="248" height="58" rx="29" fill="#FF6B57"/>
    ${textLines(["최신 업데이트 카드"], 232, 133, { size: 27, weight: 750, fill: "#FFFFFF", anchor: "middle" })}
    ${textLines([update.date], 1490, 132, { size: 24, weight: 600, fill: "#D8E5FF", anchor: "end" })}
    ${textLines([update.title], 104, 275, { size: 48, weight: 800, fill: "#0B1F44" })}
    ${cards}
    <rect x="105" y="684" width="900" height="136" rx="22" fill="#EAF2FF"/>
    ${textLines(["수업 반영", ...wrapText(update.impact, 34)], 137, 714, { size: 20, weight: 650, fill: "#155EEF", gap: 27 })}
    <rect x="1030" y="684" width="465" height="136" rx="22" fill="#FFF1E8"/>
    ${textLines(["확인", ...wrapText(update.caution, 18)], 1060, 714, { size: 19, weight: 650, fill: "#9A3412", gap: 25 })}
    ${textLines(["교육용 요약 · 실제 메뉴와 제공 범위는 계정에서 확인"], 800, 842, { size: 18, weight: 500, fill: "#667085", anchor: "middle" })}
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
    ${textLines([screen.title], 101, 240, { size: 46, weight: 800, fill: "#0B1F44" })}
    ${textLines([screen.subtitle], 1498, 232, { size: 24, weight: 550, fill: "#52627A", anchor: "end" })}
    ${columns}
    <path d="M544 500 H580" stroke="#8FA6C7" stroke-width="8" stroke-linecap="round"/><path d="M1070 500 H1106" stroke="#8FA6C7" stroke-width="8" stroke-linecap="round"/>
    <rect x="98" y="742" width="1404" height="76" rx="20" fill="#0B1F44"/>
    ${textLines([screen.footer], 800, 790, { size: 27, weight: 700, fill: "#FFFFFF", anchor: "middle" })}
  `);
}

function csvEscape(value) {
  return `"${String(value).replaceAll('"', '""')}"`;
}

function buildCsv(header, rows) {
  return [header, ...rows].map((row) => row.map(csvEscape).join(",")).join("\n");
}

function promptPack(dayId, roleKey, pack) {
  const role = roles[roleKey];
  const sourcePath = `downloads/guide-resources/${roleKey}/${dayId}/starter/${pack.sourceName}`;
  return `# ${dayId} ${role.label} 프롬프트 모음

기준일: ${AS_OF}
원자료: ${sourcePath}

## 프롬프트 1 · 원자료 범위 고정

\`\`\`text
너는 ${role.label} 실습 도우미다.
제공한 교육용 원자료만 사용한다.
입력에 없는 사실·수치·인물·성과를 추가하지 않는다.
근거가 없거나 충돌하면 '확인 필요'로 표시한다.
이번 실습의 사람 검증 기준은 ${role.verify}다.

먼저 다음을 출력한다.
1. 사용할 수 있는 사실
2. 사용할 수 없는 주장
3. 충돌 또는 불명확 항목
4. 추가 확인 질문
\`\`\`

## 프롬프트 2 · 직무 결과물 생성

\`\`\`text
앞서 확인한 원자료만 사용해 다음 결과물을 작성해줘.
${pack.outputs.map((output, index) => `${index + 1}. ${output}`).join("\n")}

각 핵심 문장에는 원문 위치·출처 ID·발언 시간을 표시한다.
${role.verify}를 별도 체크리스트로 끝에 붙인다.
\`\`\`

## 프롬프트 3 · 위험 문장 찾기

\`\`\`text
초안에서 다음을 찾아 표로 정리해줘.
- 원자료에 없는 사실·수치·성과
- 확정과 제안 또는 사실과 해석이 섞인 문장
- 담당·기한·승인 또는 목표·타깃·채널이 빠진 문장
- 실제 공유 전에 사람이 확인해야 할 문장

열: 원문 문장 | 문제 유형 | 근거 | 수정안 | 최종 확인 역할
\`\`\`

## 프롬프트 4 · 재현 테스트

\`\`\`text
같은 지침을 정상 입력, 모호 입력, 정보 누락 입력에 적용해줘.
각 테스트마다 기대 행동, 실제 결과, 실패 이유, 지침 수정안을 기록해줘.
자료에 없는 답을 만들어야만 완료되는 요청은 거절해줘.
\`\`\`
`;
}

function starter(dayId, roleKey, pack) {
  const role = roles[roleKey];
  return `# ${dayId} ${role.label} 실습 시작 파일

> 기준일: ${AS_OF}
> 단독 수강: 이 파일과 원자료만으로 시작 가능
> 오전·오후 중복 수강: 다른 직무의 원자료·산출물을 재사용하지 않음

## 오늘의 직무 문제

${pack.title}

${pack.unique}

## 사용할 파일

- 원자료: \`${pack.sourceName}\`
- 샘플 CSV
- 실습 템플릿
- 프롬프트 모음
- 완성 예시

## 시작 전 확인

- [ ] 실제 개인정보·기관 내부자료 없음
- [ ] 원자료 버전 또는 발언 위치 확인
- [ ] 현재 계정에서 사용할 수 있는 기능 확인
- [ ] 기능이 없을 때 문서형 대체 실습으로 전환 가능

## 1차시 · 원자료 읽기

- 사용할 수 있는 사실:
- 사용할 수 없는 주장:
- 충돌·모호 항목:
- 추가 질문:

## 2차시 · 첫 결과 만들기

${pack.outputs.slice(0, 2).map((output) => `- ${output}:`).join("\n")}

## 3차시 · 원문 대조

- 삭제한 문장:
- 수정한 문장:
- 확인 필요로 바꾼 문장:
- 근거 위치:

## 4차시 · 반복 테스트와 완료

${pack.outputs.slice(2).map((output) => `- ${output}:`).join("\n")}

## 사람의 최종 확인

- ${role.verify}
- [ ] 파일 저장 위치와 공유 범위
- [ ] 다른 직무 실습 결과를 복사하지 않음
`;
}

function practiceTemplate(dayId, roleKey, pack) {
  const role = roles[roleKey];
  return `# ${dayId} ${role.label} 실습 템플릿

## A. 원자료 경계

| 확인 항목 | 내용 | 근거 위치 |
|---|---|---|
| 확인된 사실 |  |  |
| 제안·가설 |  |  |
| 충돌 |  |  |
| 자료에 없음 |  |  |

## B. 직무 결과물

${pack.outputs.map((output) => `### ${output}\n\n`).join("\n")}

## C. 검증 기록

| 초안 문장 | 문제 | 수정 | 근거 | 확인 역할 |
|---|---|---|---|---|
|  |  |  |  |  |

## D. 중복 수강 신규성 확인

- [ ] 다른 직무와 원자료가 다르다.
- [ ] 다른 직무와 핵심 판단이 다르다.
- [ ] 다른 직무와 산출물 구조가 다르다.
- [ ] 다른 직무의 완성 예시를 복사하지 않았다.

## E. 최종 체크

- [ ] ${role.verify}
- [ ] 확인되지 않은 기능·요금·한도를 단정하지 않음
- [ ] 실제 개인정보·내부자료 없음
`;
}

function readme(dayId, roleKey, pack) {
  const role = roles[roleKey];
  const slug = `${dayId.toLowerCase()}-${roleKey}`;
  return `# ${dayId} ${role.label} 실습자료

기준일: ${AS_OF}

## 핵심 원칙

- 이 과정만 수강해도 실습할 수 있도록 원자료·프롬프트·템플릿·완성 예시를 모두 포함합니다.
- 오전·오후를 모두 수강해도 다른 직무의 원자료와 결과를 반복하지 않습니다.
- ${pack.unique}

## 파일 목록

- \`starter/${slug}-starter.md\`: 시작 파일
- \`starter/${pack.sourceName}\`: 실제 실습용 교육 원자료
- \`samples/${slug}-samples.csv\`: 원자료 검증용 표 데이터
- \`templates/${slug}-practice-template.md\`: 빈 실습 템플릿
- \`templates/${slug}-prompt-pack.txt\`: 복사 가능한 프롬프트
- \`solutions/${slug}-complete-example.md\`: 직무형 완성 예시

## 권장 순서

1. 원자료를 먼저 읽고 사실·제안·충돌을 표시합니다.
2. 샘플 CSV 한 건으로 출력 구조를 확인합니다.
3. 첫 결과를 만든 뒤 원자료와 대조합니다.
4. 정상·모호·누락 입력으로 반복 테스트합니다.
5. 완성 예시는 마지막에 구조와 검증 방식만 비교합니다.

## 보안

- 교육용 가상 자료만 사용합니다.
- 실제 인명·연락처·기관 내부 수치·운영 자격증명은 넣지 않습니다.
- 공유 전 ${role.verify}를 사람이 확인합니다.
`;
}

function solution(dayId, roleKey, pack) {
  const role = roles[roleKey];
  return `# ${dayId} ${role.label} 완성 예시

> 교육용 가상 결과 · 유일한 정답 아님 · ${AS_OF} 검수

## 실습 구분

- 직무 문제: ${pack.title}
- 신규성: ${pack.unique}
- 사람 검증: ${role.verify}

${pack.completed.trim()}

## 반복 테스트 결과

| 테스트 | 기대 행동 | 판정 |
|---|---|---|
| 정상 입력 | 근거가 있는 구조화 결과 | 통과 |
| 모호 입력 | 확인 질문과 ‘확인 필요’ | 통과 |
| 정보 누락 | 누락 항목 표시·추측 금지 | 통과 |
| 역할 밖 요청 | 자료 범위 설명 후 거절 | 통과 |

## 최종 확인

- ${role.verify}
- 입력에 없는 사실·수치·성과 없음
- 다른 직무 완성 예시를 재사용하지 않음
`;
}

function guideInsert(dayId, roleKey) {
  const role = roles[roleKey];
  const update = dayUpdates[dayId];
  const commonImage = `assets/guide-images/common/${dayId}/${update.slug}`;
  const pack = packs[dayId]?.[roleKey];
  const lines = [
    MARKER_START,
    "",
    `### 최신 업데이트 카드 · ${AS_OF}`,
    "",
    `![${update.title}](${BASE_URL}${commonImage})`,
    "",
    `- 변경: ${update.change.join(" / ")}`,
    `- 수업 반영: ${update.impact}`,
    `- 확인: ${update.caution}`,
    "",
    "### 단독·중복 수강 운영",
    "",
    `- ${role.label} 과정만 수강해도 이론·원자료·프롬프트·완성 기준이 모두 제공된다.`,
    "- 오전·오후를 모두 수강하는 학습자는 다른 직무의 원자료·판단·산출물을 재사용하지 않는다.",
  ];
  if (pack) {
    const roleImage = `assets/guide-images/${roleKey}/${dayId}/${pack.screen.slug}`;
    const sourcePath = `downloads/guide-resources/${roleKey}/${dayId}/starter/${pack.sourceName}`;
    lines.push(
      `- 이번 직무 실습: ${pack.title}`,
      `- 신규성 기준: ${pack.unique}`,
      "",
      `![${pack.screen.title}](${BASE_URL}${roleImage})`,
      "",
      `- [직무별 실제 원자료 열기](${BASE_URL}${sourcePath})`,
    );
  } else {
    lines.push(
      `- 경영지원은 효과–난이도와 업무 책임, 마케팅은 목표–콘텐츠 역할–채널 정렬을 사용해 같은 진단 이론을 다른 판단 문제로 적용한다.`,
    );
  }
  lines.push("", MARKER_END);
  return lines.join("\n");
}

function injectGuide(relativePath, insertion) {
  const absolutePath = path.join(ROOT, relativePath);
  let text = fs.readFileSync(absolutePath, "utf8");
  const markerPattern = new RegExp(`${MARKER_START}[\\s\\S]*?${MARKER_END}\\n*`, "g");
  text = text.replace(markerPattern, "");
  const target = /^## 2\. /m;
  if (!target.test(text)) throw new Error(`Cannot find guide insertion point: ${relativePath}`);
  text = text.replace(target, `${insertion}\n\n$&`);
  fs.writeFileSync(absolutePath, text, "utf8");
}

function main() {
  for (const [dayId, update] of Object.entries(dayUpdates)) {
    write(`assets/guide-images/common/${dayId}/${update.slug}`, renderUpdateCard(update));
  }

  for (const [dayId, dayPacks] of Object.entries(packs)) {
    for (const [roleKey, pack] of Object.entries(dayPacks)) {
      const role = roles[roleKey];
      const slug = `${dayId.toLowerCase()}-${roleKey}`;
      const root = `downloads/guide-resources/${roleKey}/${dayId}`;
      write(`${root}/README.md`, readme(dayId, roleKey, pack));
      write(`${root}/starter/${slug}-starter.md`, starter(dayId, roleKey, pack));
      write(`${root}/starter/${pack.sourceName}`, pack.source);
      write(`${root}/samples/${slug}-samples.csv`, buildCsv(pack.csvHeader, pack.csvRows));
      write(`${root}/templates/${slug}-practice-template.md`, practiceTemplate(dayId, roleKey, pack));
      write(`${root}/templates/${slug}-prompt-pack.txt`, promptPack(dayId, roleKey, pack));
      write(`${root}/solutions/${slug}-complete-example.md`, solution(dayId, roleKey, pack));
      write(`assets/guide-images/${roleKey}/${dayId}/${pack.screen.slug}`, renderRoleScreen(role, pack.screen));
    }
  }

  for (const dayId of Object.keys(dayUpdates)) {
    for (const roleKey of Object.keys(roles)) {
      const insertion = guideInsert(dayId, roleKey);
      for (const audience of ["learner", "instructor"]) {
        injectGuide(`guides/notion/${roleKey}/${audience}/${dayId}.md`, insertion);
      }
    }
  }

  console.log(JSON.stringify({
    asOf: AS_OF,
    updateCards: Object.keys(dayUpdates).length,
    roleVisuals: Object.values(packs).reduce((sum, value) => sum + Object.keys(value).length, 0),
    refreshedPacks: Object.values(packs).reduce((sum, value) => sum + Object.keys(value).length, 0),
    updatedGuides: Object.keys(dayUpdates).length * Object.keys(roles).length * 2,
  }, null, 2));
}

main();
