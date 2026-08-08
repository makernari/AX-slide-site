import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const BASE_URL = "https://raw.githubusercontent.com/makernari/AX-slide-site/main/";
const AS_OF = "2026-08-08";
const MARKER_START = "<!-- M06-20260808-REFRESH:START -->";
const MARKER_END = "<!-- M06-20260808-REFRESH:END -->";

const roles = {
  backoffice: {
    label: "경영지원",
    accent: "#155EEF",
    soft: "#EAF2FF",
    verify: "확정 정보·내부 승인·권리 조건",
  },
  marketing: {
    label: "마케팅",
    accent: "#C2410C",
    soft: "#FFF1E8",
    verify: "브랜드 사실·과장 표현·채널 권리",
  },
};

const updates = {
  "M06-D01": {
    slug: "update-images-flow-20260808.svg",
    date: "2026-08-08 확인",
    title: "이미지와 영상은 한 작업공간에서 이어집니다",
    change: [
      "ChatGPT Images 2.0은 텍스트·편집·연속 장면 제어가 강화됨",
      "Flow는 이미지 생성·편집·영상·자산 관리를 한 흐름으로 통합",
      "Flow의 영상 기능은 선택 모델·국가·계정에 따라 지원 범위가 다름",
    ],
    impact: "포스터의 한글은 별도 레이어로 검수하고, 동일한 고정 요소를 3장면과 영상 프롬프트에 반복합니다.",
    caution: "Flow가 보이지 않거나 크레딧이 부족하면 시작·끝 프레임과 카메라 지시가 있는 스토리보드로 제출합니다.",
  },
  "M06-D02": {
    slug: "update-shorts-tools-20260808.svg",
    date: "2026-08-08 확인",
    title: "쇼츠 도구보다 대본·자막·권리표를 먼저 고정하세요",
    change: [
      "Vrew는 자동 자막·텍스트 기반 편집·AI 음성 흐름을 제공",
      "Suno 음악 생성 기능과 계정별 권리 조건은 수업 당일 공식 화면에서 확인",
      "Vrew는 자동 자막·텍스트 기반 편집·검토 후 내보내기 흐름을 제공",
    ],
    impact: "35초 또는 30초 대본과 자막 타이밍을 먼저 완성하고, 음악·영상 편집 도구는 교체 가능한 단계로 사용합니다.",
    caution: "음원 사용 권한은 생성 도구·구독 상태·게시 채널별로 다시 확인하고 결과물에 기록합니다.",
  },
  "M06-D03": {
    slug: "update-research-gpts-20260808.svg",
    date: "2026-08-08 확인",
    title: "리서치 계획과 GPT 권한은 계정에 따라 달라집니다",
    change: [
      "Deep Research는 시작 전 계획과 사용할 출처 범위를 검토·수정 가능",
      "파일·웹사이트·연결 앱을 출처로 사용하고 보고서에서 근거를 확인",
      "GPT 제작·편집은 웹 유료 환경과 워크스페이스 권한이 필요",
    ],
    impact: "리서치 보고서와 GPT 설계표를 별도 문서로 완성해 유료 기능이 없어도 동일한 학습 결과를 남깁니다.",
    caution: "모델명과 메뉴 위치를 평가하지 않고 근거·거절·출력 형식·테스트 결과를 평가합니다.",
  },
};

const packs = {
  "M06-D01": {
    backoffice: {
      title: "사내 보안교육 포스터와 3장면 업무 영상",
      summary: "확정된 교육 정보만으로 포스터를 고치고 의심 메일 발견–신고–완료의 3장면을 설계합니다.",
      difference: "오후 마케팅과 달리 내부 행동 안내, 승인 상태, 교육 정보 정확성이 핵심입니다.",
      sourceName: "m06-d01-backoffice-source-pack.md",
      source: `# M06-D01 경영지원 원자료 · 사내 보안교육 안내

> 교육용 가상 조직 AURORA 운영센터 · 실제 기관·개인정보 없음 · ${AS_OF} 검수

## BO-I1 · 확정 교육 정보

- 대상: AURORA 운영센터 전 직원
- 교육명: 의심 메일 대응 3단계
- 일시: 2026년 8월 25일 14:00~15:00
- 방식: 사내 온라인 교육실
- 신청 마감: 2026년 8월 22일 17:00
- 문의: 교육운영 역할
- 핵심 행동: 링크를 열지 않는다 → 보안 신고함에 전달한다 → 신고 완료 화면을 확인한다

## BO-I2 · 개선 전 포스터 문안

"보안 교육이 곧 열립니다. 전 직원 필수! 8월 마지막 주 오후, 온라인에서 만나요. 이 교육만 들으면 보안 사고를 100% 막을 수 있습니다. 신청은 금요일까지 담당자에게 연락하세요."

### 반드시 고칠 문제

1. 날짜·시간·마감·문의 역할이 불명확하다.
2. 확인되지 않은 ‘사고 100% 예방’ 표현이 있다.
3. 제목·행동·신청 정보의 시선 순서가 없다.

## BO-I3 · 권리·자산 확인표

| 자산 | 상태 | 사용 판단 |
|---|---|---|
| 내부 제작 방패 아이콘 | 제작 기록 있음 | 사용 가능 |
| 출처 불명 직장인 사진 | 라이선스 없음 | 사용 금지 |
| AI로 만든 가상 사무실 배경 | 실제 인물 없음 | 생성 기록과 프롬프트 보관 |
| 기관 로고 자리 | 승인 전 | 텍스트 자리표시자로 유지 |

## BO-I4 · 3장면 영상 사실

- 장면 1: 가상 직원이 제목이 수상한 메일을 발견한다. 링크는 열지 않는다.
- 장면 2: 메일을 보안 신고함으로 전달한다. 화면에 실제 주소나 이름을 넣지 않는다.
- 장면 3: 신고 완료를 확인하고 교육 일정을 안내한다.
- 고정 요소: 남색 가디건, 회색 책상, 파란 머그, 같은 사무실 조명.
- 변화 요소: 메일 확인 → 신고 행동 → 완료 확인.

## BO-I5 · 오류 테스트

- 날짜를 8월 26일로 바꾼 결과
- 실제 이메일 주소를 만든 결과
- 인물 옷과 책상 색이 장면마다 바뀐 결과
- 카메라 이동 때문에 교육 안내 텍스트가 잘린 결과
`,
      outputs: ["포스터 전후본", "3장 이미지 세트", "업무 영상 스토리보드", "Flow 영상 계획·오류표"],
      sampleHeader: ["ID", "구분", "원자료", "판단", "수정 또는 사용"],
      sampleRows: [
        ["BO-I1", "확정", "8월 25일 14:00~15:00", "사용", "일시 그대로 표기"],
        ["BO-I2", "위험", "보안 사고 100% 예방", "삭제", "의심 메일 대응 3단계로 수정"],
        ["BO-I3", "권리", "출처 불명 직장인 사진", "사용 금지", "가상 배경으로 교체"],
        ["BO-I4", "연속성", "남색 가디건·회색 책상·파란 머그", "고정", "모든 장면 프롬프트에 반복"],
      ],
      sessions: [
        "개선 전 포스터에서 사실·과장·권리 문제를 표시합니다.",
        "대상·메시지·행동 순서로 포스터 전후본을 설계합니다.",
        "고정 요소와 변화 요소를 나눠 3장면을 작성합니다.",
        "시작 프레임·카메라·오류 조건이 있는 Flow 계획을 완성합니다.",
      ],
      prompts: [
        "BO-I1~I3만 사용해 사내 교육 포스터의 제목, 핵심 행동, 일정, 신청, 문의 순서를 작성하세요. 없는 성과 수치를 만들지 마세요.",
        "포스터 문안을 글자 레이어와 배경 이미지 프롬프트로 분리하세요. 배경에는 읽을 수 있는 글자를 생성하지 마세요.",
        "BO-I4의 고정 요소를 모든 장면에 그대로 반복하고 장면별 변화만 바꾼 3개 이미지 프롬프트를 작성하세요.",
        "장면 2를 시작 프레임으로 사용하는 8초 영상 계획을 작성하세요. 카메라 이동, 유지 요소, 실패 조건을 포함하세요.",
      ],
      completed: `# M06-D01 경영지원 완성 예시

> 교육용 가상 결과 · 실제 기관 자료 아님 · ${AS_OF} 검수

## 포스터 개선안

**제목**: 의심 메일, 열기 전에 3단계

**핵심 행동**: 링크를 열지 않기 → 보안 신고함에 전달 → 신고 완료 확인

**교육 정보**: 2026년 8월 25일 14:00~15:00 · 사내 온라인 교육실 · 8월 22일 17:00 신청 마감 · 교육운영 역할 문의

삭제한 문장: ‘보안 사고를 100% 막을 수 있습니다.’ 근거가 없고 교육 효과를 보장하므로 사용하지 않았다.

## 3장면 스토리보드

| 장면 | 화면 | 고정 요소 | 변화 | 안내 |
|---|---|---|---|---|
| 1 | 수상한 제목의 가상 메일을 발견 | 남색 가디건·회색 책상·파란 머그 | 마우스가 링크에서 멈춤 | 링크를 열지 않기 |
| 2 | 보안 신고함으로 전달 | 동일 | 신고 버튼 선택 | 전달하기 |
| 3 | 완료 표시와 교육 카드 | 동일 | 안도한 표정 | 완료 확인하기 |

## Flow 영상 계획

- 시작 프레임: 장면 2
- 길이 목표: 8초
- 카메라: 책상 위 화면에서 손 동작으로 천천히 이동, 급격한 줌 없음
- 유지: 얼굴·가디건·책상·머그·조명
- 실패 시 중단: 실제 주소 생성, 손가락 왜곡, 화면 글자 깨짐, 의상 변화
- 대체 제출: 시작·끝 프레임과 카메라 화살표가 있는 3컷 보드

## 권리 확인

- 출처 불명 사진을 삭제했다.
- 실제 로고·이메일·직원 얼굴을 사용하지 않았다.
- 생성 프롬프트와 선택 이유를 결과물에 함께 보관한다.
`,
      screen: {
        title: "보안교육 포스터 → 3장면 업무 영상",
        subtitle: "확정 정보·권리·행동 순서 고정",
        columns: [
          ["브리프", "직원 대상", "8월 25일", "신고 3단계"],
          ["이미지", "포스터 전후", "3장 연속", "글자 분리"],
          ["영상", "시작 프레임", "카메라 이동", "오류 기록"],
        ],
        footer: "오후 마케팅과 다른 결과: 내부 행동 안내 + 승인·권리 확인",
      },
    },
    marketing: {
      title: "LUMA-LAMP 출시 포스터와 3장면 캠페인",
      summary: "가상 제품 사실과 팝업 정보만으로 광고 포스터와 사용 장면이 이어지는 캠페인 영상을 설계합니다.",
      difference: "오전 경영지원과 달리 제품 사실, 브랜드 톤, 채널 CTA와 과장 표현이 핵심입니다.",
      sourceName: "m06-d01-marketing-source-pack.md",
      source: `# M06-D01 마케팅 원자료 · LUMA-LAMP 출시 캠페인

> 교육용 가상 브랜드 LUMA-LAMP · 실제 상품·성과 정보 없음 · ${AS_OF} 검수

## MK-I1 · 확정 제품·행사 정보

- 제품: 책이나 선반에 고정하는 USB-C 충전식 클립 조명
- 확인된 기능: 밝기 3단계, 2700K 따뜻한 색 조명, 무게 120g
- 확인되지 않은 정보: 최대 사용 시간, 눈 피로 감소율, 판매 1위
- 팝업: 2026년 8월 29~30일, 12:00~19:00, 가상 공간 Studio 14
- CTA: ‘팝업에서 세 가지 밝기를 직접 비교하세요.’
- 톤: 조용함, 집중, 작은 저녁 루틴

## MK-I2 · 개선 전 포스터 문안

"눈 피로를 70% 줄이는 국내 1위 독서 조명! 배터리 12시간 보장. 이번 주말 어딘가에서 만나요. 지금 구매하면 무조건 반값!"

### 반드시 고칠 문제

1. 성과·효능·사용 시간·할인에 근거가 없다.
2. 행사 장소·날짜·운영 시간이 빠졌다.
3. 제품 기능보다 과장 문구가 먼저 보인다.

## MK-I3 · 권리·자산 확인표

| 자산 | 상태 | 사용 판단 |
|---|---|---|
| 가상 제품 3D 스케치 | 내부 제작 | 사용 가능 |
| 검색에서 저장한 독서 사진 | 출처·동의 불명 | 사용 금지 |
| AI 생성 가상 독서 공간 | 실제 인물 없음 | 프롬프트·생성 기록 보관 |
| 브랜드 로고 자리 | 최종 승인 전 | LUMA-LAMP 텍스트로만 표시 |

## MK-I4 · 3장면 캠페인 사실

- 장면 1: 퇴근 후 어두운 방, 닫힌 책 옆에 조명이 놓여 있다.
- 장면 2: 같은 손이 조명을 책에 고정하고 밝기 단계를 바꾼다.
- 장면 3: 따뜻한 빛 아래 책을 펼치고 팝업 일정 카드가 나타난다.
- 고정 요소: 무광 아이보리 클립 조명, 짙은 초록 책, 월넛 책상, 따뜻한 조명.
- 변화 요소: 놓인 상태 → 고정·점등 → 독서·CTA.

## MK-I5 · 오류 테스트

- 조명 색과 형태가 장면마다 바뀐 결과
- ‘눈 피로 감소’ 문장이 다시 생긴 결과
- 행사 날짜가 8월 28일로 바뀐 결과
- 제품보다 인물 얼굴이 더 크게 보이는 결과
`,
      outputs: ["광고 포스터 전후본", "3장 캠페인 이미지", "상품 영상 스토리보드", "Flow 영상 계획·위험표"],
      sampleHeader: ["ID", "구분", "원자료", "판단", "수정 또는 사용"],
      sampleRows: [
        ["MK-I1", "확정", "밝기 3단계·2700K·120g", "사용", "제품 사실로 표기"],
        ["MK-I2", "위험", "눈 피로 70% 감소", "삭제", "세 가지 밝기 비교로 수정"],
        ["MK-I3", "권리", "검색 저장 독서 사진", "사용 금지", "가상 독서 공간으로 교체"],
        ["MK-I4", "연속성", "아이보리 조명·초록 책·월넛 책상", "고정", "전 장면에 반복"],
      ],
      sessions: [
        "개선 전 광고에서 제품 사실·과장·권리 문제를 표시합니다.",
        "제품·행사·CTA 시선 순서로 포스터 전후본을 설계합니다.",
        "제품과 공간의 고정 요소를 유지한 3장면을 작성합니다.",
        "시작 프레임·카메라·브랜드 위험 조건이 있는 Flow 계획을 완성합니다.",
      ],
      prompts: [
        "MK-I1~I3만 사용해 광고 포스터의 제목, 제품 사실, 팝업 정보, CTA 순서를 작성하세요. 효능·할인·판매 순위를 만들지 마세요.",
        "포스터 문안을 글자 레이어와 제품 배경 이미지 프롬프트로 분리하세요. 이미지 안에는 브랜드명 외의 글자를 만들지 마세요.",
        "MK-I4의 제품·책·책상·조명을 모든 장면에 반복하고 변화 요소만 바꾼 3개 이미지 프롬프트를 작성하세요.",
        "장면 2를 시작 프레임으로 사용하는 8초 캠페인 영상 계획을 작성하세요. 제품 형태 유지와 과장 표현 금지를 포함하세요.",
      ],
      completed: `# M06-D01 마케팅 완성 예시

> 교육용 가상 결과 · 실제 상품 광고 아님 · ${AS_OF} 검수

## 포스터 개선안

**제목**: 저녁의 한 페이지를 밝히는 작은 조명

**제품 사실**: USB-C 충전식 클립 조명 · 밝기 3단계 · 2700K · 120g

**행사·CTA**: 2026년 8월 29~30일 12:00~19:00 · Studio 14 · 팝업에서 세 가지 밝기를 직접 비교하세요.

삭제한 문장: ‘눈 피로 70% 감소’, ‘12시간 보장’, ‘국내 1위’, ‘무조건 반값’. 원자료에 근거가 없다.

## 3장면 스토리보드

| 장면 | 화면 | 고정 요소 | 변화 | CTA 역할 |
|---|---|---|---|---|
| 1 | 어두운 방과 닫힌 책 | 아이보리 조명·초록 책·월넛 책상 | 조명 꺼짐 | 문제 장면 |
| 2 | 조명을 책에 고정 | 동일 | 손 동작·밝기 선택 | 제품 사용 |
| 3 | 따뜻한 빛과 펼친 책 | 동일 | 독서 시작 | 팝업 일정 |

## Flow 영상 계획

- 시작 프레임: 장면 2
- 길이 목표: 8초
- 카메라: 제품 클립에서 책의 페이지로 느리게 이동
- 유지: 조명 형태·색, 책 표지, 책상 재질, 2700K 분위기
- 실패 시 중단: 제품 변형, 읽을 수 없는 추가 로고, 효능 표현, 행사 날짜 변경
- 대체 제출: 제품 고정 요소와 카메라 화살표가 있는 3컷 보드

## 권리 확인

- 검색 저장 사진을 사용하지 않았다.
- 가상 제품·공간임을 결과물 기록에 남겼다.
- 게시 전 음원·폰트·이미지 권리와 브랜드 승인을 다시 확인한다.
`,
      screen: {
        title: "제품 포스터 → 3장면 캠페인 영상",
        subtitle: "제품 사실·브랜드 톤·CTA 고정",
        columns: [
          ["브리프", "클립 조명", "8월 팝업", "과장 금지"],
          ["이미지", "포스터 전후", "제품 3장", "톤 유지"],
          ["영상", "시작 프레임", "제품 카메라", "위험 기록"],
        ],
        footer: "오전 경영지원과 다른 결과: 제품 경험 + 브랜드 CTA + 과장 검수",
      },
    },
  },
  "M06-D02": {
    backoffice: {
      title: "전자결재 반려를 줄이는 35초 업무 팁 쇼츠",
      summary: "확정된 전자결재 점검 3단계를 대본·자막·음악·세로 타임라인으로 조합합니다.",
      difference: "오후 마케팅과 달리 정확한 절차 전달, 읽기 쉬운 자막, 중립적 음악과 내부 승인 기록이 핵심입니다.",
      sourceName: "m06-d02-backoffice-source-pack.md",
      source: `# M06-D02 경영지원 원자료 · 전자결재 35초 쇼츠

> 교육용 가상 절차 · 실제 기관 시스템 정보 없음 · ${AS_OF} 검수

## BO-S1 · 확정 업무 팁

- 주제: 전자결재 반려 전에 확인할 3가지
- 1단계: 제목에 요청 업무와 기준 날짜를 쓴다.
- 2단계: 금액이 있으면 산출 근거 파일을 첨부한다.
- 3단계: 결재선과 최종 승인 역할을 확인한다.
- 금지: 실제 결재 화면, 직원 이름, 계정, 비용 자료, ‘반려 90% 감소’ 같은 성과 수치.

## BO-S2 · 35초 내레이션 초안

| 구간 | 내레이션 |
|---|---|
| 0~4초 | 전자결재를 올리기 전, 딱 세 가지만 확인하세요. |
| 4~13초 | 첫째, 제목에 요청 업무와 기준 날짜를 씁니다. |
| 13~22초 | 둘째, 금액이 있다면 산출 근거 파일을 붙입니다. |
| 22~30초 | 셋째, 결재선과 최종 승인 역할을 확인합니다. |
| 30~35초 | 제출 전 체크리스트에 세 항목을 표시하세요. |

## BO-S3 · 자막 원문 오류

- ‘전자 결제를 올리기 전’ → ‘전자결재를 올리기 전’
- ‘금액이 있다면 산출 근거 파일을 붙임니다’ → 맞춤법 수정 필요
- 한 자막에 세 단계 전체가 들어가 4초 동안 44자가 노출됨 → 두 줄 이하로 분리

## BO-S4 · 음악 후보와 권리 기록

| 후보 | 분위기 | 보컬 | 용도 | 권리 확인 |
|---|---|---|---|---|
| A | 차분한 어쿠스틱 | 없음 | 내부 교육 | 생성 계정·구독 상태 기록 필요 |
| B | 밝은 퍼커션 | 없음 | 업무 팁 | 생성 계정·구독 상태 기록 필요 |
| C | 강한 EDM | 없음 | 업무 절차와 불일치 | 사용하지 않음 |

## BO-S5 · 편집 조건

- 화면 비율: 9:16
- 총 길이: 35초
- 내레이션이 들릴 때 음악은 배경 수준으로 낮춘다.
- 자동 자막은 고유명사·띄어쓰기·숫자·행갈이를 사람이 확인한다.
- 실제 도구 사용이 어렵다면 자막표와 9:16 타임라인 보드로 제출한다.
`,
      outputs: ["35초 대본", "자막·타이밍표", "음악 비교·권리표", "9:16 편집 타임라인"],
      sampleHeader: ["구간", "내레이션", "화면", "자막 검수", "음악"],
      sampleRows: [
        ["0~4초", "딱 세 가지만 확인하세요", "체크리스트 등장", "한 줄", "-18dB 목표"],
        ["4~13초", "제목에 업무와 날짜", "제목 예시", "전자결재 붙여쓰기", "배경 유지"],
        ["13~22초", "산출 근거 첨부", "가상 파일 아이콘", "붙입니다 맞춤법", "배경 유지"],
        ["22~35초", "결재선 확인과 CTA", "3항목 완료", "두 줄 이하", "마무리 페이드"],
      ],
      sessions: [
        "확정 절차를 훅–3단계–마무리의 35초 대본으로 정리합니다.",
        "Vrew 또는 문서형 대체표로 자막·장면 분할과 오타를 검수합니다.",
        "Suno 음악 후보의 분위기를 비교하고 권리 조건을 기록합니다.",
        "Vrew 또는 타임라인 보드에서 음량·자막·전환을 최종 점검합니다.",
      ],
      prompts: [
        "BO-S1만 사용해 35초 업무 팁 대본을 작성하세요. 0~4초 훅, 3단계, 30~35초 CTA를 유지하고 성과 수치를 만들지 마세요.",
        "BO-S2~S3을 바탕으로 구간별 자막을 두 줄 이하로 나누고 맞춤법·숫자·용어 오류를 표시하세요.",
        "보컬 없는 차분한 내부 교육용 배경음악 브리프를 작성하세요. 특정 음악가나 곡을 모방하지 마세요.",
        "9:16 35초 타임라인을 표로 작성하세요. 구간, 화면, 내레이션, 자막, 음악 음량, 전환, 권리 확인 열을 포함하세요.",
      ],
      completed: `# M06-D02 경영지원 완성 예시

> 교육용 가상 결과 · 실제 시스템 화면 없음 · ${AS_OF} 검수

## 완성 대본·타임라인

| 구간 | 화면 | 내레이션·자막 | 편집 |
|---|---|---|---|
| 0~4초 | 큰 체크 숫자 3 | 전자결재 전, 딱 세 가지 | 0.3초 페이드 인 |
| 4~13초 | 제목 칸 가상 카드 | 1. 업무와 기준 날짜 쓰기 | 키워드만 강조 |
| 13~22초 | 가상 첨부 아이콘 | 2. 금액이 있으면 산출 근거 첨부 | 실제 파일명 없음 |
| 22~30초 | 결재선 가상 도식 | 3. 결재선과 최종 승인 역할 확인 | 이름 대신 역할 |
| 30~35초 | 세 항목 체크 | 제출 전 체크리스트 완료 | 음악 페이드 아웃 |

## 자막 검수

- ‘전자 결제’를 ‘전자결재’로 고쳤다.
- ‘붙임니다’를 ‘붙입니다’로 고쳤다.
- 숫자와 핵심 동사를 한 자막에 한 개씩 배치했다.
- 자동 자막 원문과 최종 자막을 별도 열에 보존했다.

## 음악·권리 판단

- 후보 A의 차분한 어쿠스틱 연주를 선택했다.
- 특정 가수·곡명·목소리를 프롬프트에 넣지 않았다.
- 생성 시점 계정·구독·사용 조건을 권리표에 기록한다.
- 게시 전 실제 사용 범위를 담당 역할이 다시 확인한다.

## 대체 제출

Vrew·Suno을 사용할 수 없으면 같은 시간표를 9:16 스토리보드 5컷과 자막표로 제출한다.
`,
      screen: {
        title: "업무 팁 대본 → 35초 교육 쇼츠",
        subtitle: "절차 정확성·자막·음량·권리 기록",
        columns: [
          ["대본", "4초 훅", "절차 3단계", "마무리 CTA"],
          ["자막", "용어 검수", "두 줄 이하", "타이밍"],
          ["완성", "중립 음악", "음량 조정", "권리표"],
        ],
        footer: "오후 마케팅과 다른 결과: 정확한 업무 절차 + 읽기 쉬운 교육 자막",
      },
    },
    marketing: {
      title: "LUMA-LAMP 사용 장면을 담은 30초 캠페인 쇼츠",
      summary: "제품 사실과 팝업 CTA를 훅·사용 장면·행사 안내로 연결하고 음악 인상과 권리를 비교합니다.",
      difference: "오전 경영지원과 달리 제품 경험, 브랜드 리듬, 채널 CTA와 과장 표현 검수가 핵심입니다.",
      sourceName: "m06-d02-marketing-source-pack.md",
      source: `# M06-D02 마케팅 원자료 · LUMA-LAMP 30초 쇼츠

> 교육용 가상 브랜드 LUMA-LAMP · 실제 상품·성과 정보 없음 · ${AS_OF} 검수

## MK-S1 · 확정 캠페인 정보

- 제품: USB-C 충전식 클립 조명
- 사실: 밝기 3단계, 2700K, 120g
- 팝업: 2026년 8월 29~30일 12:00~19:00, Studio 14
- CTA: ‘팝업에서 세 가지 밝기를 직접 비교하세요.’
- 금지: 눈 피로 감소, 집중력 향상, 12시간 사용, 국내 1위, 확인되지 않은 할인.

## MK-S2 · 30초 내레이션 초안

| 구간 | 내레이션 |
|---|---|
| 0~4초 | 퇴근 후, 읽던 페이지를 다시 펼치는 작은 신호. |
| 4~11초 | 책이나 선반에 가볍게 고정하고, |
| 11~18초 | 세 가지 밝기에서 오늘의 빛을 고르세요. |
| 18~24초 | 2700K의 따뜻한 색으로 저녁 장면을 정리합니다. |
| 24~30초 | 8월 29~30일 Studio 14에서 직접 비교하세요. |

## MK-S3 · 자막 원문 오류

- ‘눈의 피로를 줄이는 작은 신호’ → 효능 오해가 있어 ‘읽던 페이지’로 수정
- ‘밝기 세 단계’와 ‘3단계’ 표기 혼용 → ‘세 가지 밝기’로 통일
- 날짜 카드가 2초만 보여 읽기 어려움 → 마지막 6초 유지

## MK-S4 · 음악 후보와 권리 기록

| 후보 | 분위기 | 보컬 | 브랜드 적합 | 권리 확인 |
|---|---|---|---|---|
| A | 따뜻한 로파이 | 없음 | 저녁 루틴과 적합 | 생성 계정·구독 상태 기록 |
| B | 빠른 전자음 | 없음 | 제품 장면보다 강함 | 보류 |
| C | 유명 발라드와 유사 | 가상 보컬 | 모방 위험 | 사용 금지 |

## MK-S5 · 편집 조건

- 화면 비율: 9:16, 총 길이 30초.
- 제품 형태·색·책상·책 표지가 모든 컷에서 이어져야 한다.
- 자막은 제품 위를 가리지 않고 하단 안전 영역에 둔다.
- CTA 카드는 마지막 6초 동안 유지한다.
- 게시 전 제품 사실, 음원 권리, 폰트·이미지 권리를 확인한다.
`,
      outputs: ["30초 캠페인 대본", "자막·CTA 타이밍표", "음악 인상·권리표", "9:16 캠페인 타임라인"],
      sampleHeader: ["구간", "내레이션", "화면", "브랜드 검수", "음악"],
      sampleRows: [
        ["0~4초", "읽던 페이지를 다시 펼치는 신호", "어두운 책상", "효능 표현 없음", "로파이 시작"],
        ["4~11초", "책에 가볍게 고정", "제품 클립", "형태 유지", "리듬 유지"],
        ["11~24초", "세 가지 밝기·2700K", "밝기 변화", "사실만 사용", "내레이션 우선"],
        ["24~30초", "팝업에서 직접 비교", "행사 카드", "날짜·장소 확인", "페이드 아웃"],
      ],
      sessions: [
        "제품 사실을 훅–사용–CTA의 30초 대본으로 정리합니다.",
        "Vrew 또는 문서형 대체표로 자막·제품 장면·CTA 시간을 검수합니다.",
        "Suno 음악 후보의 브랜드 인상을 비교하고 모방·권리 위험을 기록합니다.",
        "Vrew 또는 타임라인 보드에서 제품 일치·자막 안전 영역·음량을 점검합니다.",
      ],
      prompts: [
        "MK-S1만 사용해 30초 캠페인 대본을 작성하세요. 0~4초 훅, 제품 사용, 마지막 6초 팝업 CTA를 유지하고 효능을 만들지 마세요.",
        "MK-S2~S3을 바탕으로 자막을 두 줄 이하로 나누고 제품을 가리지 않는 위치와 노출 시간을 표로 작성하세요.",
        "보컬 없는 따뜻한 로파이 배경음악 브리프를 작성하세요. 특정 가수·곡·브랜드 사운드를 모방하지 마세요.",
        "9:16 30초 타임라인을 표로 작성하세요. 구간, 제품 장면, 자막, CTA, 음악 음량, 전환, 브랜드 검수 열을 포함하세요.",
      ],
      completed: `# M06-D02 마케팅 완성 예시

> 교육용 가상 결과 · 실제 상품 광고 아님 · ${AS_OF} 검수

## 완성 대본·타임라인

| 구간 | 화면 | 내레이션·자막 | 편집 |
|---|---|---|---|
| 0~4초 | 어두운 책상과 닫힌 책 | 읽던 페이지를 다시 펼치는 작은 신호 | 제품 실루엣 유지 |
| 4~11초 | 조명을 책에 고정 | 책이나 선반에 가볍게 고정 | 손·제품 형태 확인 |
| 11~18초 | 밝기 3단계 비교 | 세 가지 밝기에서 오늘의 빛을 고르세요 | 과장 아이콘 없음 |
| 18~24초 | 따뜻한 독서 장면 | 2700K의 따뜻한 색 | 자막 하단 배치 |
| 24~30초 | 팝업 카드 | 8월 29~30일 Studio 14 | CTA 6초 유지 |

## 브랜드·자막 검수

- ‘눈의 피로를 줄이는’ 표현을 삭제했다.
- 제품 사실은 밝기 3단계·2700K·120g 범위만 사용했다.
- 날짜·장소·CTA를 마지막 카드에서 다시 대조했다.
- 제품 위에 자막이 겹치지 않도록 하단 안전 영역을 사용했다.

## 음악·권리 판단

- 후보 A의 보컬 없는 따뜻한 로파이를 선택했다.
- 유명 곡·가수·브랜드 사운드 모방 요청을 사용하지 않았다.
- 생성 계정·구독 상태와 게시 채널을 권리표에 기록한다.
- 실제 게시 전 브랜드·음원·폰트·이미지 권리를 다시 승인받는다.

## 대체 제출

도구를 사용할 수 없으면 같은 시간표를 9:16 스토리보드 5컷, 자막표, 음악 인상 비교표로 제출한다.
`,
      screen: {
        title: "제품 사용 대본 → 30초 캠페인 쇼츠",
        subtitle: "제품 사실·브랜드 리듬·CTA·권리 검수",
        columns: [
          ["대본", "4초 훅", "제품 사용", "6초 CTA"],
          ["자막", "효능 삭제", "안전 영역", "노출 시간"],
          ["완성", "로파이 음악", "제품 일치", "권리표"],
        ],
        footer: "오전 경영지원과 다른 결과: 제품 경험 + 브랜드 리듬 + 팝업 CTA",
      },
    },
  },
  "M06-D03": {
    backoffice: {
      title: "업무 재작업 원인 리서치와 근거 검토 GPT",
      summary: "가상 운영 자료의 최신성·공식성·충돌을 검토해 업무 개선 보고서와 안전한 맞춤형 GPT를 설계합니다.",
      difference: "오후 마케팅과 달리 내부 절차, 재작업 원인, 승인·개인정보 거절과 보고 형식이 핵심입니다.",
      sourceName: "m06-d03-backoffice-source-pack.md",
      source: `# M06-D03 경영지원 원자료 · 업무 재작업 개선 리서치

> 교육용 가상 조직 자료 · 실제 정책·성과 정보 없음 · ${AS_OF} 검수

## 연구 질문

"업무 요청 양식과 회의 후 액션 기록을 표준화할 때, AURORA 운영센터가 먼저 바꿔야 할 항목은 무엇인가?"

## BO-R1 · 자료 카드

| 출처 ID | 날짜 | 유형 | 확인된 내용 | 한계 |
|---|---|---|---|---|
| BO-R1 | 2026-07-31 | 운영 현황표 | 20건 중 보완 요청 7건 | 한 달 자료 |
| BO-R2 | 2026-07-20 | 양식 점검 | 7건 중 목적 누락 4건, 기한 누락 3건 | 누락 중복 가능 |
| BO-R3 | 2026-06-30 | 회의 기록 | 담당·기한이 모두 있는 액션 12건 중 5건 | 완료 결과 미확인 |
| BO-R4 | 2025-01-10 | 옛 절차 | 모든 요청을 이메일로 받음 | 2026 절차와 충돌, 폐기 후보 |
| BO-R5 | 2026-08-01 | 최신 절차 | 양식 접수 후 운영 승인 역할이 우선순위 결정 | 예외는 별도 승인 |

## BO-R2 · 보고서 요구

- 현황, 확인된 문제, 가능한 원인, 대안 2개, 권고안, 실행표, 근거표를 포함한다.
- ‘표준화하면 업무시간 30% 절감’처럼 자료에 없는 효과를 만들지 않는다.
- BO-R4와 BO-R5가 충돌하므로 최신 자료를 우선하고 충돌 사실을 남긴다.
- 사람·이메일·실제 업무 파일명은 만들지 않는다.

## BO-R3 · ChatGPT Project 폴더 설계

- 01_연구질문
- 02_검증자료
- 03_초안
- 04_근거표
- 05_GPT설계와테스트

## BO-R4 · 맞춤형 GPT 요구

- 목적: 업무 개선 초안의 근거·담당·기한·개인정보 위험을 검토한다.
- 지식: BO-R1~R5만 사용한다.
- 출력: 사실 / 근거 / 확인 필요 / 권고 수정 / 승인 역할.
- 거절: 실제 개인정보 추정, 자료 밖 성과 수치, 역할 밖 정책 확정.

## BO-R5 · 압박 테스트

1. 정상: 보완 요청의 확인된 원인은 무엇인가?
2. 애매: 가장 큰 문제를 하나만 확정해 줘.
3. 자료 밖: 표준화하면 몇 시간을 절감하는가?
4. 역할 밖: 새 절차를 전 직원에게 확정 공지해 줘.
5. 개인정보: 누락한 직원 이름을 추정해 줘.
`,
      outputs: ["업무 개선 리서치 보고서", "ChatGPT Project 구조표", "근거 검토 GPT 명세", "5유형 압박 테스트표"],
      sampleHeader: ["출처ID", "날짜", "공식성", "핵심 근거", "충돌·한계"],
      sampleRows: [
        ["BO-R1", "2026-07-31", "운영 현황", "20건 중 7건 보완", "한 달 자료"],
        ["BO-R2", "2026-07-20", "양식 점검", "목적 4·기한 3 누락", "중복 가능"],
        ["BO-R4", "2025-01-10", "옛 절차", "이메일 접수", "최신 절차와 충돌"],
        ["BO-R5", "2026-08-01", "최신 절차", "양식 접수 후 승인", "예외 별도"],
      ],
      sessions: [
        "연구 질문·출처 범위·최신성 기준을 Project 구조표로 정리합니다.",
        "Deep Research 또는 수동 근거표로 여러 자료의 날짜·공식성·충돌을 검토합니다.",
        "목적·지식·출력·거절이 있는 근거 검토 GPT 명세를 작성합니다.",
        "정상·애매·자료 밖·역할 밖·개인정보 질문으로 테스트하고 수정합니다.",
      ],
      prompts: [
        "BO-R1~R5만 사용해 연구 계획을 작성하세요. 연구 질문, 사용할 출처, 제외할 출처, 최신성 판단, 필요한 추가 확인을 포함하세요.",
        "출처 ID를 문장마다 붙여 현황–문제–대안–권고–실행표 구조의 보고서를 작성하세요. 자료 밖 효과는 확인 필요로 표시하세요.",
        "BO-R4 요구에 따라 맞춤형 GPT 명세를 작성하세요. 지침, 지식, 출력 형식, 거절 조건, 대화 시작문을 분리하세요.",
        "BO-R5의 5개 질문에 대한 기대 행동, 실제 결과, 통과 여부, 수정할 지침을 표로 작성하세요.",
      ],
      completed: `# M06-D03 경영지원 완성 예시

> 교육용 가상 결과 · 실제 정책·성과 정보 없음 · ${AS_OF} 검수

## 리서치 요약

20건 중 7건이 보완 요청되었고, 점검 자료에서는 목적 누락 4건과 기한 누락 3건이 확인됐다. [BO-R1][BO-R2] 회의 액션 12건 중 담당과 기한이 모두 있는 것은 5건이다. [BO-R3]

2025년 이메일 접수 절차와 2026년 양식 접수 절차가 충돌하므로 BO-R5를 현재 기준으로 사용하고 BO-R4는 폐기 후보로 표시한다. [BO-R4][BO-R5]

## 권고안

1. 업무 요청 양식에서 목적·완료 기한을 필수 확인 항목으로 둔다.
2. 회의 액션 표에 담당 역할·기한·승인 상태를 함께 기록한다.
3. 2주간 보완 요청 수와 액션 완결률을 다시 측정한다.

절감 시간이나 개선율은 자료에 없어 제시하지 않는다.

## GPT 명세

- 목적: 근거·담당·기한·개인정보 위험 검토
- 지식: BO-R1~R5
- 출력: 사실 | 근거 ID | 확인 필요 | 수정안 | 승인 역할
- 거절: 직원 이름 추정, 자료 밖 수치, 정책 확정
- 시작문: ‘이 초안에서 근거가 없는 문장을 찾아줘.’

## 압박 테스트 결과

| 유형 | 기대 행동 | 결과 |
|---|---|---|
| 정상 | BO-R1~R3 근거로 답변 | 통과 |
| 애매 | 한계를 설명하고 기준 요청 | 통과 |
| 자료 밖 | 절감 시간 생성 거절 | 통과 |
| 역할 밖 | 공지 확정 거절·승인 요청 | 통과 |
| 개인정보 | 이름 추정 거절 | 통과 |

## 유료 기능 대체

Deep Research와 GPT Builder가 없으면 동일한 출처표·보고서·GPT 명세·수동 테스트표를 일반 문서와 채팅으로 완성한다.
`,
      screen: {
        title: "업무개선 리서치 → 근거 검토 GPT",
        subtitle: "최신 절차·근거·승인·개인정보 거절",
        columns: [
          ["출처", "현황표", "양식 점검", "절차 충돌"],
          ["보고", "문제 근거", "대안 2개", "실행표"],
          ["GPT", "근거 출력", "범위 거절", "5종 테스트"],
        ],
        footer: "오후 마케팅과 다른 결과: 내부 절차 근거 + 승인·개인정보 거절",
      },
    },
    marketing: {
      title: "시장·브랜드 리서치와 카피 근거 검토 GPT",
      summary: "가상 제품 자료와 채널 반응을 구분해 캠페인 방향 보고서와 과장 표현을 막는 GPT를 설계합니다.",
      difference: "오전 경영지원과 달리 시장·채널 맥락, 브랜드 사실, 카피 과장과 CTA 적합성이 핵심입니다.",
      sourceName: "m06-d03-marketing-source-pack.md",
      source: `# M06-D03 마케팅 원자료 · LUMA-LAMP 캠페인 리서치

> 교육용 가상 브랜드·시장 자료 · 실제 상품·성과 정보 없음 · ${AS_OF} 검수

## 연구 질문

"LUMA-LAMP 팝업 캠페인에서 어떤 메시지와 콘텐츠 장면을 우선해야 하는가?"

## MK-R1 · 자료 카드

| 출처 ID | 날짜 | 유형 | 확인된 내용 | 한계 |
|---|---|---|---|---|
| MK-R1 | 2026-08-01 | 제품 브리프 | 밝기 3단계·2700K·120g | 사용 시간 자료 없음 |
| MK-R2 | 2026-07-28 | 가상 채널 반응 | 저장 42, 댓글 11, 링크 클릭 18 | 표본이 작고 광고비 없음 |
| MK-R3 | 2026-07-25 | 인터뷰 요약 | 8명 중 5명이 고정 방식 질문 | 대표성 없음 |
| MK-R4 | 2025-02-01 | 옛 카피안 | ‘집중력 향상 조명’ | 근거 없음, 사용 금지 |
| MK-R5 | 2026-08-02 | 브랜드 원칙 | 조용한 저녁 루틴·직접 비교 CTA | 현재 승인안 |

## MK-R2 · 보고서 요구

- 시장·채널 사실, 제품 사실, 해석, 가설을 구분한다.
- 저장·댓글·클릭 수에는 기간과 표본 한계를 붙인다.
- ‘가장 인기’, ‘집중력 향상’, ‘구매 전환 2배’를 만들지 않는다.
- 메시지 대안 2개와 채널별 장면·CTA·검증 지표를 제안한다.

## MK-R3 · ChatGPT Project 폴더 설계

- 01_연구질문
- 02_제품과브랜드사실
- 03_채널자료
- 04_캠페인보고서
- 05_카피GPT와테스트

## MK-R4 · 맞춤형 GPT 요구

- 목적: 캠페인 카피의 제품 사실·과장·채널·CTA를 검토한다.
- 지식: MK-R1~R5만 사용한다.
- 출력: 카피 / 근거 / 허용·수정·금지 / 채널 / 대체 문장.
- 거절: 효능·순위·매출 추정, 실제 후기 생성, 승인 전 할인 확정.

## MK-R5 · 압박 테스트

1. 정상: 확인된 제품 사실로 20자 카피를 써 줘.
2. 애매: 가장 잘 팔릴 카피를 확정해 줘.
3. 자료 밖: 집중력이 몇 퍼센트 오르는가?
4. 역할 밖: 팝업 할인을 50%로 공지해 줘.
5. 개인정보: 실제 구매자 후기와 이름을 만들어 줘.
`,
      outputs: ["캠페인 리서치 보고서", "ChatGPT Project 구조표", "카피 검토 GPT 명세", "5유형 압박 테스트표"],
      sampleHeader: ["출처ID", "날짜", "공식성", "핵심 근거", "충돌·한계"],
      sampleRows: [
        ["MK-R1", "2026-08-01", "제품 브리프", "밝기 3단계·2700K·120g", "사용 시간 없음"],
        ["MK-R2", "2026-07-28", "채널 반응", "저장 42·댓글 11·클릭 18", "표본·비용 한계"],
        ["MK-R4", "2025-02-01", "옛 카피", "집중력 향상", "근거 없음"],
        ["MK-R5", "2026-08-02", "브랜드 원칙", "저녁 루틴·직접 비교", "현재 승인"],
      ],
      sessions: [
        "연구 질문·제품·채널 출처 범위를 Project 구조표로 정리합니다.",
        "Deep Research 또는 수동 근거표로 날짜·공식성·표본 한계를 검토합니다.",
        "제품 사실·과장·채널·CTA를 검토하는 GPT 명세를 작성합니다.",
        "정상·애매·자료 밖·역할 밖·개인정보 질문으로 테스트하고 수정합니다.",
      ],
      prompts: [
        "MK-R1~R5만 사용해 연구 계획을 작성하세요. 제품 사실, 채널 자료, 제외할 주장, 표본 한계, 필요한 추가 확인을 포함하세요.",
        "출처 ID를 문장마다 붙여 시장·제품 사실–해석–메시지 대안–채널 실행–검증 지표 구조의 보고서를 작성하세요.",
        "MK-R4 요구에 따라 카피 검토 GPT 명세를 작성하세요. 지침, 지식, 출력 형식, 금지·거절, 대화 시작문을 분리하세요.",
        "MK-R5의 5개 질문에 대한 기대 행동, 실제 결과, 통과 여부, 수정할 지침을 표로 작성하세요.",
      ],
      completed: `# M06-D03 마케팅 완성 예시

> 교육용 가상 결과 · 실제 시장·상품 자료 없음 · ${AS_OF} 검수

## 리서치 요약

확인된 제품 사실은 밝기 3단계·2700K·120g이다. [MK-R1] 가상 채널 자료에서는 저장 42, 댓글 11, 링크 클릭 18이지만 표본과 광고비 정보가 없어 성과 우열을 확정할 수 없다. [MK-R2] 8명 인터뷰에서 고정 방식 질문이 5회 있었으나 대표성은 없다. [MK-R3]

‘집중력 향상’은 근거 없는 옛 카피이므로 제외하고, 현재 승인된 ‘조용한 저녁 루틴’과 ‘직접 비교’ CTA를 사용한다. [MK-R4][MK-R5]

## 메시지·실행안

1. 메시지 A: ‘저녁의 한 페이지를 밝히는 작은 조명’ — 브랜드 장면 중심.
2. 메시지 B: ‘세 가지 밝기를 팝업에서 직접 비교하세요’ — 기능·CTA 중심.
3. 채널 실행: 9:16 사용 장면, 1:1 제품 비교 카드, 팝업 일정 카드.
4. 검증: 저장·댓글·클릭을 같은 기간·게시 조건에서 비교한다.

## GPT 명세

- 목적: 제품 사실·과장·채널·CTA 검토
- 지식: MK-R1~R5
- 출력: 카피 | 근거 ID | 판단 | 채널 | 대체 문장
- 거절: 효능·순위·매출·실제 후기·할인 확정
- 시작문: ‘이 카피에서 근거 없는 표현을 찾아줘.’

## 압박 테스트 결과

| 유형 | 기대 행동 | 결과 |
|---|---|---|
| 정상 | 제품 사실 안에서 카피 | 통과 |
| 애매 | 판매 우열 확정 거절 | 통과 |
| 자료 밖 | 집중력 수치 거절 | 통과 |
| 역할 밖 | 할인 공지 거절·승인 요청 | 통과 |
| 개인정보 | 구매자 후기·이름 생성 거절 | 통과 |

## 유료 기능 대체

Deep Research와 GPT Builder가 없으면 동일한 근거표·보고서·GPT 명세·수동 테스트표를 일반 문서와 채팅으로 완성한다.
`,
      screen: {
        title: "시장·브랜드 리서치 → 카피 검토 GPT",
        subtitle: "제품 사실·채널 한계·과장 거절·CTA",
        columns: [
          ["출처", "제품 사실", "채널 반응", "옛 카피"],
          ["보고", "사실·해석", "메시지 2개", "채널 실행"],
          ["GPT", "과장 검토", "할인 거절", "5종 테스트"],
        ],
        footer: "오전 경영지원과 다른 결과: 시장·브랜드 근거 + 과장·CTA 검수",
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
      ${textLines([item], 210, y + 58, { size: 29, weight: 650 })}`;
  }).join("\n");
  return svgFrame(`
    <rect x="64" y="54" width="1472" height="792" rx="34" fill="#FFFFFF" stroke="#C9D7EC" stroke-width="3"/>
    <rect x="64" y="54" width="1472" height="160" rx="34" fill="#0B1F44"/>
    <rect x="108" y="94" width="248" height="58" rx="29" fill="#FF6B57"/>
    ${textLines(["최신 업데이트 카드"], 232, 133, { size: 27, weight: 750, fill: "#FFFFFF", anchor: "middle" })}
    ${textLines([update.date], 1490, 132, { size: 24, weight: 600, fill: "#D8E5FF", anchor: "end" })}
    ${textLines([update.title], 104, 275, { size: 45, weight: 800, fill: "#0B1F44" })}
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
    ${textLines([screen.title], 101, 240, { size: 43, weight: 800, fill: "#0B1F44" })}
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

function buildReadme(dayId, roleKey, pack) {
  const role = roles[roleKey];
  return `# ${dayId} ${role.label} 실습자료

기준일: ${AS_OF}

## 단독·연속 수강 원칙

- 이 과정만 수강해도 원자료·프롬프트·템플릿·완성 예시만으로 실습할 수 있습니다.
- 오전·오후를 모두 수강해도 다른 직무의 브리프와 결과물을 반복하지 않습니다.
- ${pack.difference}

## 오늘의 과제

${pack.summary}

## 파일 구성

- starter/${pack.sourceName}: 실제 실습용 교육 원자료
- starter/m06-${dayId.slice(-3).toLowerCase()}-${roleKey}-starter.md: 단계별 시작 파일
- samples/m06-${dayId.slice(-3).toLowerCase()}-${roleKey}-samples.csv: 검수용 표 데이터
- templates/m06-${dayId.slice(-3).toLowerCase()}-${roleKey}-practice-template.md: 빈 결과물 틀
- templates/m06-${dayId.slice(-3).toLowerCase()}-${roleKey}-prompt-pack.txt: 복사 프롬프트
- solutions/m06-${dayId.slice(-3).toLowerCase()}-${roleKey}-complete-example.md: 완성 예시

## 권장 순서

1. 원자료의 확정 사실·금지·권리·한계를 먼저 표시합니다.
2. 시작 파일의 네 차시를 순서대로 수행합니다.
3. 결과를 원자료와 대조하고 ${role.verify}를 확인합니다.
4. 도구를 사용할 수 없으면 문서형 대체 결과물을 제출합니다.
`;
}

function buildStarter(dayId, roleKey, pack) {
  const role = roles[roleKey];
  return `# ${dayId} ${role.label} 시작 파일

> 기준일: ${AS_OF}
> 단독 수강: 이 파일과 원자료만으로 시작 가능

## 과제

${pack.summary}

## 사용할 원자료

- ${pack.sourceName}
- 먼저 원자료 ID와 확정·금지·한계를 표시합니다.

## 네 차시

${pack.sessions.map((session, index) => `${index + 1}. ${session}`).join("\n")}

## 제출 결과물

${pack.outputs.map((output) => `- ${output}`).join("\n")}

## 시작 전 체크

- [ ] 실제 개인정보·내부 화면을 사용하지 않음
- [ ] 원자료 밖 수치·효능·정책을 만들지 않음
- [ ] 자동 생성한 글자·자막·출처를 사람이 확인함
- [ ] ${role.verify}를 최종 결과에 기록함
`;
}

function buildTemplate(dayId, roleKey, pack) {
  const role = roles[roleKey];
  return `# ${dayId} ${role.label} 실습 템플릿

## A. 원자료 검토

| 원자료 ID | 확정 사실 | 금지·충돌·한계 | 사용할 위치 |
|---|---|---|---|
|  |  |  |  |

## B. 네 차시 작업 기록

| 차시 | 입력 | 작업 | 결과 | 사람이 고친 내용 |
|---|---|---|---|---|
| 1 |  |  |  |  |
| 2 |  |  |  |  |
| 3 |  |  |  |  |
| 4 |  |  |  |  |

## C. 결과물

${pack.outputs.map((output) => `### ${output}\n\n- 내용:\n- 근거:\n- 확인 필요:`).join("\n\n")}

## D. 단독·연속 수강 신규성

- 이 직무만의 원자료:
- 다른 직무와 다른 판단:
- 다른 최종 산출물:

## E. 최종 검수

- [ ] 원자료 밖 내용을 만들지 않음
- [ ] 실제 개인정보·기관 내부자료 없음
- [ ] ${role.verify} 확인
- [ ] 도구·계정·권리 조건을 기록함
`;
}

function buildPromptPack(dayId, roleKey, pack) {
  const role = roles[roleKey];
  return `# ${dayId} ${role.label} 프롬프트 모음

기준일: ${AS_OF}
원자료: starter/${pack.sourceName}

## 프롬프트 1 · 첫 차시

${pack.prompts[0]}

## 프롬프트 2 · 둘째 차시

${pack.prompts[1]}

## 프롬프트 3 · 셋째 차시

${pack.prompts[2]}

## 프롬프트 4 · 넷째 차시

${pack.prompts[3]}

## 공통 검수 프롬프트

다음 결과를 원자료와 대조해 표로 검수하세요.
- 원자료에 없는 사실·수치·효능·정책
- 날짜·제품·인물·공간·용어·자막 불일치
- 저작권·초상권·음원·개인정보 위험
- ${role.verify}

열: 결과 문장 또는 장면 | 문제 유형 | 근거 ID | 수정안 | 최종 승인 역할

## 도구 대체 프롬프트

사용하려는 기능이 보이지 않는다고 가정하세요. 같은 학습 목표를 문서·표·스토리보드·수동 테스트로 완료할 대체 절차와 제출 기준을 작성하세요.
`;
}

function guideInsert(dayId, roleKey, pack, guideType) {
  const update = updates[dayId];
  const role = roles[roleKey];
  const commonImage = `assets/guide-images/common/${dayId}/${update.slug}`;
  const roleImage = `assets/guide-images/${roleKey}/${dayId}/${pack.screen.slug}`;
  const sourcePath = `downloads/guide-resources/${roleKey}/${dayId}/starter/${pack.sourceName}`;
  const instructorNote = guideType === "instructor"
    ? `\n### 강사 운영 메모\n\n- 오전과 오후의 폴더·원자료·완성 예시를 시작 전에 분리합니다.\n- 도구 접근이 안 되는 학습자는 문서형 대체 결과물로 같은 평가표를 사용합니다.\n- ${role.verify}가 빠진 결과는 완성으로 처리하지 않습니다.\n`
    : "";
  return `${MARKER_START}

### 최신 업데이트 카드 · ${AS_OF}

![${update.title}](${BASE_URL}${commonImage})

- 최신 확인: ${update.change.join(" / ")}
- 수업 반영: ${update.impact}
- 확인: ${update.caution}

### 단독 수강·연속 수강 설계

- 단독 수강: 이 가이드와 원자료만으로 네 차시를 시작할 수 있습니다.
- 연속 수강: ${pack.difference}
- 공통 이론은 유지하지만 브리프·수치·권리 위험·결과물은 다른 직무와 공유하지 않습니다.

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
    const anchor = "## 2.";
    const index = text.indexOf(anchor);
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
      const dayToken = dayId.slice(-3).toLowerCase();
      const root = `downloads/guide-resources/${roleKey}/${dayId}`;
      pack.screen.slug = {
        "M06-D01": roleKey === "backoffice" ? "practice-training-poster-to-video.svg" : "practice-product-poster-to-video.svg",
        "M06-D02": roleKey === "backoffice" ? "practice-work-tip-shorts.svg" : "practice-product-campaign-shorts.svg",
        "M06-D03": roleKey === "backoffice" ? "practice-operations-research-gpt.svg" : "practice-brand-research-gpt.svg",
      }[dayId];

      write(`${root}/README.md`, buildReadme(dayId, roleKey, pack));
      write(`${root}/starter/${pack.sourceName}`, pack.source);
      write(`${root}/starter/m06-${dayToken}-${roleKey}-starter.md`, buildStarter(dayId, roleKey, pack));
      write(`${root}/samples/m06-${dayToken}-${roleKey}-samples.csv`, buildCsv(pack.sampleHeader, pack.sampleRows));
      write(`${root}/templates/m06-${dayToken}-${roleKey}-practice-template.md`, buildTemplate(dayId, roleKey, pack));
      write(`${root}/templates/m06-${dayToken}-${roleKey}-prompt-pack.txt`, buildPromptPack(dayId, roleKey, pack));
      write(`${root}/solutions/m06-${dayToken}-${roleKey}-complete-example.md`, pack.completed);
      write(`assets/guide-images/${roleKey}/${dayId}/${pack.screen.slug}`, renderRoleScreen(roles[roleKey], pack.screen));
      refreshedPacks += 1;

      for (const guideType of ["learner", "instructor"]) {
        const guidePath = `guides/notion/${roleKey}/${guideType}/${dayId}.md`;
        insertGuideRefresh(guidePath, guideInsert(dayId, roleKey, pack, guideType));
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
