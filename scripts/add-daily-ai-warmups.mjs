import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const AS_OF = "2026-08-08";
const BASE_URL = "https://raw.githubusercontent.com/makernari/AX-slide-site/main/";
const RESOURCE_URL = "https://makernari.github.io/AX-slide-site/";
const LEARNER_START = "<!-- DAILY-AI-WARMUP-20260808:START -->";
const LEARNER_END = "<!-- DAILY-AI-WARMUP-20260808:END -->";
const INSTRUCTOR_START = "<!-- INSTRUCTOR-DAILY-AI-WARMUP-20260808:START -->";
const INSTRUCTOR_END = "<!-- INSTRUCTOR-DAILY-AI-WARMUP-20260808:END -->";
const README_START = "<!-- DAILY-AI-WARMUP-HTML-20260808:START -->";
const README_END = "<!-- DAILY-AI-WARMUP-HTML-20260808:END -->";

const roles = {
  backoffice: {
    label: "경영지원",
    course: "스마트 경영지원",
    accent: "#155EEF",
    dark: "#0B3B8F",
    soft: "#EAF2FF",
    avoid: "마케팅 과정의 사진·카피·채널 결과를 재사용하지 않습니다.",
  },
  marketing: {
    label: "마케팅",
    course: "마케팅·SNS 콘텐츠 기획·브랜딩",
    accent: "#C2410C",
    dark: "#8A2D0B",
    soft: "#FFF1E8",
    avoid: "경영지원 과정의 회의·승인·내부업무 결과를 재사용하지 않습니다.",
  },
};

const entries = [
  {
    day: "M05-D01", role: "backoffice", tag: "QUICK WIN", kind: "memo",
    title: "손글씨 메모를 오늘의 할 일 카드로",
    purpose: "이미지 입력을 구조화된 업무 목록으로 바꾸는 첫 경험",
    prep: "강사가 제공한 교육용 가상 손글씨 메모 사진 1장",
    prompt: "첨부한 가상 손글씨 메모에서 할 일을 찾아 ‘할 일｜담당 역할｜기한｜확인 필요’ 표로 정리해 줘. 읽기 어려운 부분은 추측하지 말고 [판독 필요]로 표시해 줘.",
    complete: "할 일 3건과 [판독 필요] 표시 1건이 있는 카드",
    teaching: "글자를 모두 맞히는 것보다 추측하지 않는 표시가 더 좋은 결과라는 점을 보여 줍니다.",
    caution: "실제 회의 메모·이름·전화번호가 보이는 사진은 사용하지 않습니다.",
    fallback: "HTML 예시를 보고 누락된 완료 기준 한 가지를 찾습니다.",
    input: "가상 메모 사진", output: "할 일 카드",
  },
  {
    day: "M05-D01", role: "marketing", tag: "HOT", kind: "scrapbook",
    title: "사진에 손글씨 말풍선·감성 메모 더하기",
    purpose: "사진의 핵심 피사체는 유지하면서 감성 메시지를 시각 요소로 추가",
    prep: "강사가 제공한 가상 카페·제품 사진 1장",
    prompt: "첨부 사진의 피사체와 배경은 그대로 유지해 줘. 빈 공간에 손으로 그린 듯한 말풍선 2개, 작은 별·하트 낙서, ‘오늘의 작은 발견’이라는 감성 메모를 추가해 줘. 원본 로고와 얼굴은 바꾸지 마.",
    complete: "원본 유지 항목과 추가 요소를 구분해 설명할 수 있는 감성 메모 이미지",
    teaching: "‘바꿀 것’보다 ‘유지할 것’을 먼저 말하면 편집 지시가 선명해짐을 보여 줍니다.",
    caution: "타인 얼굴·상표가 있는 사진 대신 교육용 가상 사진을 사용합니다.",
    fallback: "HTML 예시에서 유지 요소 2개와 추가 요소 3개를 표시합니다.",
    input: "가상 카페 사진", output: "감성 메모 이미지",
  },
  {
    day: "M05-D02", role: "backoffice", tag: "QUICK WIN", kind: "voice",
    title: "30초 음성으로 회의 후속조치 3줄 만들기",
    purpose: "말로 남긴 비정형 입력을 확인 가능한 후속조치로 변환",
    prep: "가상 회의 상황을 말한 30초 음성 또는 제공 대본",
    prompt: "이 가상 회의 음성에서 결정된 내용, 담당 역할, 기한 후보를 각각 찾아 줘. 확정되지 않은 내용은 ‘확인 필요’로 표시하고 후속조치 3줄로 정리해 줘.",
    complete: "결정·담당 역할·기한·확인 필요가 구분된 3줄",
    teaching: "음성 인식 결과와 업무 사실의 확정 여부는 별개라고 강조합니다.",
    caution: "실제 직원 이름과 내부 회의 녹음은 사용하지 않습니다.",
    fallback: "제공 대본을 복사해 같은 표를 만듭니다.",
    input: "30초 가상 음성", output: "후속조치 3줄",
  },
  {
    day: "M05-D02", role: "marketing", tag: "QUICK WIN", kind: "hooks",
    title: "음성 아이디어를 3초 훅 3개로",
    purpose: "말로 떠올린 아이디어를 짧은 콘텐츠 시작 문장으로 변환",
    prep: "가상 상품 아이디어를 말한 20초 음성 또는 제공 대본",
    prompt: "이 음성의 핵심 상품 사실만 사용해 3초 안에 읽히는 훅 3개를 만들어 줘. 호기심형·문제형·반전형으로 나누고, 근거 없는 최고·유일 표현은 쓰지 마.",
    complete: "서로 다른 구조의 훅 3개와 사용한 상품 사실 1개",
    teaching: "짧은 문장보다 사실을 보존한 짧은 문장이 목표라고 안내합니다.",
    caution: "실제 고객 음성·미공개 제품 정보는 사용하지 않습니다.",
    fallback: "제공 대본에서 사실 한 문장을 골라 훅 3개를 직접 적습니다.",
    input: "20초 아이디어", output: "3초 훅 3개",
  },
  {
    day: "M05-D03", role: "backoffice", tag: "QUICK WIN", kind: "sources",
    title: "두 자료의 공통점·충돌을 한 번에 찾기",
    purpose: "요약보다 먼저 출처 간 일치와 충돌을 확인",
    prep: "서로 일부 내용이 다른 교육용 안내문 2개",
    prompt: "자료 A와 B를 비교해 공통 내용, 서로 충돌하는 내용, 추가 확인할 내용을 세 칸 표로 정리해 줘. 각 항목 끝에 A 또는 B 근거를 표시해 줘.",
    complete: "공통·충돌·확인 필요가 분리된 출처 비교표",
    teaching: "한 자료를 요약하는 것과 두 자료를 검증하는 것은 다른 작업임을 보여 줍니다.",
    caution: "기관 내부 규정 대신 공개용 가상 안내문을 사용합니다.",
    fallback: "문장 네 개를 색으로 나눠 공통·충돌을 직접 표시합니다.",
    input: "가상 안내문 A·B", output: "출처 비교표",
  },
  {
    day: "M05-D03", role: "marketing", tag: "QUICK WIN", kind: "thumbnail",
    title: "긴 자료를 썸네일 문구 3개로 압축하기",
    purpose: "자료의 핵심을 보존하면서 시선을 끄는 짧은 문구 설계",
    prep: "강사가 제공한 가상 콘텐츠 요약문 1개",
    prompt: "이 요약문의 사실만 사용해 썸네일 문구 3개를 만들어 줘. 각 문구는 12자 안팎으로 하고 ‘결과 약속형·질문형·숫자형’으로 구분해 줘. 과장된 수치는 만들지 마.",
    complete: "유형이 다른 썸네일 문구 3개와 선택 근거 1줄",
    teaching: "짧게 줄이는 과정에서도 원문에 없는 숫자를 만들지 않는지 확인합니다.",
    caution: "실제 브랜드 성과 수치 대신 가상 수치를 사용합니다.",
    fallback: "예시 문구 3개 중 원문 근거가 약한 한 개를 찾습니다.",
    input: "가상 콘텐츠 요약", output: "썸네일 3안",
  },
  {
    day: "M05-D04", role: "backoffice", tag: "QUICK WIN", kind: "redline",
    title: "슬라이드 스크린샷에 빨간펜 검수 메모",
    purpose: "보고 화면의 정보 위계와 누락을 시각적으로 검수",
    prep: "가상 업무 브리핑 슬라이드 이미지 1장",
    prompt: "이 가상 슬라이드의 레이아웃은 유지하고, 제목·핵심 수치·담당 역할·기한에서 확인할 곳에 빨간펜 원과 짧은 손글씨 메모를 추가해 줘. 원문 내용은 바꾸지 마.",
    complete: "검수 위치 4곳과 수정 이유가 보이는 빨간펜 이미지",
    teaching: "다시 디자인하기 전에 무엇을 검수할지 시각화하는 활동입니다.",
    caution: "실제 내부 보고서 화면은 업로드하지 않습니다.",
    fallback: "HTML 예시를 캡처해 로컬 주석 도구로 원 2개를 그립니다.",
    input: "가상 업무 슬라이드", output: "빨간펜 검수본",
  },
  {
    day: "M05-D04", role: "marketing", tag: "QUICK WIN", kind: "carousel",
    title: "게시물 한 줄을 4장 캐러셀로",
    purpose: "하나의 메시지를 순서가 있는 시각 스토리로 확장",
    prep: "가상 캠페인 핵심 문장 1개",
    prompt: "이 핵심 문장을 4장 캐러셀로 나눠 줘. 1장 문제, 2장 발견, 3장 해결, 4장 행동 문구로 구성하고 각 장은 제목 1줄과 시각 요소 1개만 제안해 줘.",
    complete: "역할이 겹치지 않는 4장 캐러셀 스토리보드",
    teaching: "한 장에 하나의 메시지만 둔다는 교안 원칙과 연결합니다.",
    caution: "실제 캠페인 미공개 문구는 사용하지 않습니다.",
    fallback: "네 칸 템플릿에 문제–발견–해결–행동만 직접 적습니다.",
    input: "가상 핵심 문장", output: "4장 캐러셀",
  },
  {
    day: "M06-D01", role: "backoffice", tag: "QUICK WIN", kind: "sticker",
    title: "업무 사진에 손글씨 안전 안내 스티커",
    purpose: "사진을 유지하면서 필요한 안내를 친근한 시각 언어로 추가",
    prep: "강사가 제공한 가상 사무공간 사진 1장",
    prompt: "사진의 공간과 물체는 그대로 유지해 줘. 위험하거나 확인이 필요한 위치 세 곳에 손으로 그린 화살표와 짧은 안내 스티커를 추가해 줘. 실제 규정처럼 단정하지 말고 ‘교육용 예시’라고 표시해 줘.",
    complete: "원본이 유지되고 안내 위치 3곳이 구분된 교육용 이미지",
    teaching: "정확한 규정 안내가 아니라 관찰 포인트를 만드는 활동이라고 선을 긋습니다.",
    caution: "실제 사업장 보안구역이나 직원이 찍힌 사진은 사용하지 않습니다.",
    fallback: "가상 사진 인쇄물에 포스트잇 위치만 표시합니다.",
    input: "가상 사무공간", output: "안내 스티커 이미지",
  },
  {
    day: "M06-D01", role: "marketing", tag: "HOT", kind: "doodle",
    title: "사진을 일부러 서툰 MS Paint 낙서로",
    purpose: "완벽함 대신 의도적인 서투름을 스타일 지시로 표현",
    prep: "강사가 제공한 단순한 가상 인물·제품 사진 1장",
    prompt: "이 사진의 구도와 주요 피사체는 알아볼 수 있게 유지하면서, 마우스로 급하게 그린 1990년대 MS Paint 낙서처럼 다시 표현해 줘. 삐뚤한 선, 덜 채운 색, 단순한 형태를 사용하고 새 로고나 문구는 추가하지 마.",
    complete: "원본 구조는 남고 의도적 서투름이 보이는 낙서 이미지",
    teaching: "‘예쁘게’ 대신 선·채색·형태의 구체적 특성을 말하는 프롬프트 연습입니다.",
    caution: "타인 얼굴과 상표가 있는 사진은 사용하지 않습니다.",
    fallback: "HTML 예시에서 원본 유지 요소와 스타일 변화 요소를 나눕니다.",
    input: "가상 제품 사진", output: "MS Paint 낙서",
  },
  {
    day: "M06-D02", role: "backoffice", tag: "QUICK WIN", kind: "comic",
    title: "복잡한 절차를 3컷 업무 만화로",
    purpose: "절차의 시작·판단·완료를 짧은 시각 설명으로 변환",
    prep: "교육용 가상 신청 절차 3단계",
    prompt: "이 가상 신청 절차를 직장인이 이해하기 쉬운 3컷 교육 만화로 구성해 줘. 1컷 입력, 2컷 사람 확인, 3컷 완료 상태를 보여 주고 말풍선은 각 12자 안팎으로 써 줘.",
    complete: "입력–사람 확인–완료가 구분된 3컷 구성안",
    teaching: "절차를 줄일 때 사람 확인 단계가 사라지지 않는지 봅니다.",
    caution: "실제 기관 절차와 혼동되지 않게 ‘가상 예시’를 표시합니다.",
    fallback: "세 칸 템플릿에 장면과 말풍선만 적습니다.",
    input: "가상 신청 절차", output: "3컷 업무 만화",
  },
  {
    day: "M06-D02", role: "marketing", tag: "QUICK WIN", kind: "character",
    title: "같은 캐릭터로 3장면 스토리 만들기",
    purpose: "채널 콘텐츠에서 인물·제품·공간의 연속성 조건 연습",
    prep: "강사가 제공한 가상 캐릭터 기준 카드",
    prompt: "이 가상 캐릭터의 머리 모양, 옷 색, 가방, 얼굴 특징을 세 장면 모두 유지해 줘. 장면은 발견–체험–추천 순서이며 카메라 거리만 바꿔 줘. 새 로고와 새 인물은 추가하지 마.",
    complete: "고정 요소 4개와 변화 요소 1개가 설명되는 3장면",
    teaching: "생성 전 고정 요소와 변화 요소를 분리하면 연속성을 검수하기 쉽습니다.",
    caution: "실존 인물 대신 가상 캐릭터를 사용합니다.",
    fallback: "세 장면 카드에 고정 요소를 같은 색으로 표시합니다.",
    input: "가상 캐릭터 카드", output: "연속 3장면",
  },
  {
    day: "M06-D03", role: "backoffice", tag: "QUICK WIN", kind: "ladder",
    title: "막연한 질문을 검증 가능한 리서치 사다리로",
    purpose: "넓은 질문을 정의·범위·근거·비교·결론 순서로 좁힘",
    prep: "‘업무 효율을 높이는 방법’ 같은 가상 질문 1개",
    prompt: "이 질문을 바로 답하지 말고 조사 사다리 5단계로 바꿔 줘. 용어 정의, 대상 범위, 필요한 근거, 비교 기준, 결론 조건 순서로 질문을 한 개씩 만들어 줘.",
    complete: "각 단계의 역할이 다른 리서치 질문 5개",
    teaching: "AI에게 답을 요구하기 전에 좋은 조사 순서를 설계하는 팁입니다.",
    caution: "법률·인사 판단은 교육용 질문 설계까지만 진행합니다.",
    fallback: "제공 질문 카드를 올바른 순서로 배열합니다.",
    input: "막연한 업무 질문", output: "질문 사다리",
  },
  {
    day: "M06-D03", role: "marketing", tag: "QUICK WIN", kind: "evidence",
    title: "유행 주장에 근거·확신도 카드 붙이기",
    purpose: "트렌드 문장과 검증된 사실을 분리",
    prep: "출처가 다른 가상 트렌드 문장 3개",
    prompt: "이 세 문장을 ‘근거 있음·일부 근거·확인 필요’로 나누고, 판단 이유와 추가로 확인할 출처 유형을 한 줄씩 적어 줘. 인기나 조회수를 임의로 만들지 마.",
    complete: "주장 3개의 근거 상태와 다음 확인 행동",
    teaching: "‘핫하다’는 표현 자체가 검증 대상이라는 점을 보여 줍니다.",
    caution: "실제 캠페인 의사결정에 바로 사용하지 않습니다.",
    fallback: "가상 문장을 세 가지 상태 카드에 직접 붙입니다.",
    input: "가상 트렌드 주장", output: "근거·확신도 카드",
  },
  {
    day: "M07-D01", role: "backoffice", tag: "QUICK WIN", kind: "form",
    title: "신청 폼 화면을 초보자 관점으로 점검",
    purpose: "입력 화면의 모호함·누락·오류 복구를 발견",
    prep: "강사가 제공한 가상 신청 폼 스크린샷",
    prompt: "이 가상 폼을 처음 보는 사람 관점에서 모호한 질문, 필수 여부, 입력 예시, 오류 복구 안내를 점검해 줘. 화면에 없는 기능은 추측하지 말고 수정 문구만 제안해 줘.",
    complete: "문제 위치 3곳과 더 쉬운 수정 문구 3개",
    teaching: "기능 추가가 아니라 현재 화면의 이해 가능성을 검수합니다.",
    caution: "실제 신청자 정보가 있는 화면은 사용하지 않습니다.",
    fallback: "HTML 예시의 입력칸 세 개에 필요한 도움말을 적습니다.",
    input: "가상 신청 폼", output: "초보자 점검표",
  },
  {
    day: "M07-D01", role: "marketing", tag: "QUICK WIN", kind: "comments",
    title: "댓글 캡처에서 고객 언어 3개 찾기",
    purpose: "고객 표현을 임의로 다듬기 전에 원문 언어를 보존",
    prep: "개인정보를 제거한 가상 댓글 카드 5개",
    prompt: "이 가상 댓글에서 고객이 반복해 쓰는 표현 3개를 원문 그대로 뽑고, 각 표현이 말하는 기대나 불편을 한 줄로 해석해 줘. 사람의 성향은 추정하지 마.",
    complete: "원문 표현 3개와 과도하지 않은 해석 3개",
    teaching: "고객 말투를 마케팅 문구로 바꾸기 전에 원문을 따로 보존합니다.",
    caution: "계정명·얼굴·실제 댓글은 사용하지 않습니다.",
    fallback: "가상 댓글 카드에서 반복 단어에 밑줄을 긋습니다.",
    input: "가상 댓글 5개", output: "고객 언어 카드",
  },
  {
    day: "M07-D02", role: "backoffice", tag: "QUICK WIN", kind: "workflow",
    title: "승인 절차를 지하철 노선도로",
    purpose: "입력·검토·승인·기록의 순서와 분기 시각화",
    prep: "교육용 가상 승인 절차 4단계",
    prompt: "이 가상 승인 절차를 지하철 노선도처럼 표현할 구성안을 만들어 줘. 입력–검토–사람 승인–기록을 역으로 두고, 반려 시 돌아가는 분기선을 표시해 줘.",
    complete: "사람 승인과 반려 분기가 보이는 노선도 구성",
    teaching: "자동화 흐름에서 사람이 멈추고 판단하는 역을 눈에 띄게 합니다.",
    caution: "실제 기관 결재 규정으로 오해하지 않게 가상 예시라고 표시합니다.",
    fallback: "네 개 역과 반려 화살표를 종이에 직접 그립니다.",
    input: "가상 승인 절차", output: "승인 노선도",
  },
  {
    day: "M07-D02", role: "marketing", tag: "QUICK WIN", kind: "pipeline",
    title: "콘텐츠 요청을 제작 파이프라인 보드로",
    purpose: "요청부터 게시 전 검토까지 상태를 한눈에 배치",
    prep: "가상 콘텐츠 요청 카드 4개",
    prompt: "이 요청 카드를 아이디어–제작–검토–게시 준비 네 열에 배치해 줘. 각 카드에 채널, 담당 역할, 마감, 확인 필요를 표시하고 자동 게시 단계는 만들지 마.",
    complete: "상태·담당 역할·마감이 보이는 4열 보드",
    teaching: "자동화 목표를 ‘게시’가 아니라 ‘검토 가능한 상태 만들기’로 둡니다.",
    caution: "실제 고객 요청이나 미공개 캠페인은 사용하지 않습니다.",
    fallback: "가상 카드 네 장을 보드 열에 직접 배치합니다.",
    input: "가상 요청 카드", output: "콘텐츠 보드",
  },
  {
    day: "M07-D03", role: "backoffice", tag: "QUICK WIN", kind: "chart",
    title: "표 한 장을 한 문장·한 차트로",
    purpose: "수치의 핵심과 한계를 동시에 설명",
    prep: "강사가 제공한 가상 업무 현황 표",
    prompt: "이 표에서 가장 중요한 변화 한 가지만 골라 차트 유형 1개와 해석 문장 1개를 제안해 줘. 표에 없는 원인은 추정하지 말고 확인할 질문 1개를 붙여 줘.",
    complete: "차트 1개·해석 1문장·확인 질문 1개",
    teaching: "차트보다 ‘표에서 확인되는 말’과 ‘아직 모르는 말’을 나눕니다.",
    caution: "실제 예산·인사 데이터는 사용하지 않습니다.",
    fallback: "제공 표에서 가장 큰 변화에 동그라미를 치고 한 문장을 씁니다.",
    input: "가상 업무 표", output: "한 문장·한 차트",
  },
  {
    day: "M07-D03", role: "marketing", tag: "QUICK WIN", kind: "scorecard",
    title: "성과표를 한 장 캠페인 스코어카드로",
    purpose: "서로 다른 지표를 목표와 함께 읽는 시각 요약",
    prep: "가상 채널 성과 표 1개",
    prompt: "이 가상 성과표를 목표–지표–결과–해석–다음 실험 순서의 스코어카드로 정리해 줘. 결과가 좋아 보이는 이유를 임의로 만들지 말고 데이터로 확인되는 것만 써 줘.",
    complete: "목표와 다음 실험이 연결된 1페이지 스코어카드",
    teaching: "조회수만 강조하지 않고 목표와 연결된 지표를 먼저 찾습니다.",
    caution: "실제 광고비·고객 식별 데이터는 사용하지 않습니다.",
    fallback: "가상 표에서 목표와 직접 연결된 지표 하나를 표시합니다.",
    input: "가상 채널 성과", output: "캠페인 스코어카드",
  },
  {
    day: "M08-D01", role: "backoffice", tag: "QUICK WIN", kind: "wireframe",
    title: "화이트보드 스케치를 업무 앱 와이어프레임으로",
    purpose: "손그림의 입력·버튼·결과 영역을 앱 화면 구조로 변환",
    prep: "강사가 제공한 교육용 앱 손그림 스케치",
    prompt: "이 손그림의 입력칸, 실행 버튼, 결과 영역을 유지해 단순한 업무 앱 와이어프레임으로 정리해 줘. 새 기능은 추가하지 말고 빈 입력과 오류 메시지 위치를 표시해 줘.",
    complete: "입력–실행–결과–오류 위치가 보이는 와이어프레임",
    teaching: "예쁜 화면보다 요구사항과 완료 조건을 먼저 고정합니다.",
    caution: "실제 업무 시스템 화면을 업로드하지 않습니다.",
    fallback: "HTML 예시에서 입력·실행·결과 영역을 세 색으로 표시합니다.",
    input: "가상 앱 손그림", output: "업무 앱 와이어프레임",
  },
  {
    day: "M08-D01", role: "marketing", tag: "QUICK WIN", kind: "landing",
    title: "제품 사진을 랜딩페이지 와이어프레임으로",
    purpose: "제품 사진과 사실 정보를 첫 화면 구조로 연결",
    prep: "가상 제품 사진과 사실 카드",
    prompt: "이 가상 제품 사진과 사실 카드만 사용해 모바일 랜딩 첫 화면 와이어프레임을 구성해 줘. 제품명, 사실 기반 한 줄 가치, 이미지, 행동 버튼, 확인 필요 영역만 배치해 줘.",
    complete: "사실과 확인 필요가 분리된 랜딩 첫 화면",
    teaching: "사진만 보고 제품 효능을 추정하지 않도록 사실 카드를 함께 제공합니다.",
    caution: "실제 브랜드 미공개 제품 사진은 사용하지 않습니다.",
    fallback: "다섯 개 블록을 모바일 화면 템플릿에 직접 배치합니다.",
    input: "가상 제품 사진", output: "랜딩 와이어프레임",
  },
  {
    day: "M08-D02", role: "backoffice", tag: "QUICK WIN", kind: "bug",
    title: "오류 화면을 비개발자용 설명서로",
    purpose: "오류 메시지를 현재 상태·원인 후보·다음 확인으로 분해",
    prep: "강사가 제공한 가상 앱 오류 스크린샷",
    prompt: "이 가상 오류 화면을 비개발자도 이해하도록 ‘현재 보이는 현상｜확인할 입력｜가능한 원인 후보｜안전한 다음 행동’으로 설명해 줘. 화면에 없는 원인은 확정하지 마.",
    complete: "확정 사실과 원인 후보가 구분된 오류 설명 카드",
    teaching: "오류 문구를 바로 고치려 하지 말고 관찰과 가설을 나눕니다.",
    caution: "API 키·내부 경로·사용자 정보가 보이는 화면은 사용하지 않습니다.",
    fallback: "오류 예시에서 사실 문장과 추정 문장을 분류합니다.",
    input: "가상 오류 화면", output: "오류 설명 카드",
  },
  {
    day: "M08-D02", role: "marketing", tag: "QUICK WIN", kind: "ab",
    title: "카피 A/B 변형을 변경 기록과 함께",
    purpose: "무작위 문구 생성 대신 바꾼 요소와 가설을 추적",
    prep: "가상 광고 카피 A안 1개",
    prompt: "A안의 브랜드 사실은 유지하고 첫 문장 구조만 바꾼 B안을 만들어 줘. 무엇을 바꿨는지, 어떤 반응을 기대하는지, 결과로 판단할 지표를 각각 한 줄로 기록해 줘.",
    complete: "A/B 카피와 변경 요소·가설·판정 지표",
    teaching: "다른 문구 두 개가 아니라 한 변수만 바꾼 비교를 만듭니다.",
    caution: "실제 집행 전 브랜드·법무 검토가 필요하다고 안내합니다.",
    fallback: "A안에서 첫 문장만 손으로 바꾸고 변경 이유를 적습니다.",
    input: "가상 카피 A안", output: "A/B 변경 기록",
  },
  {
    day: "M08-D03", role: "backoffice", tag: "QUICK WIN", kind: "qa",
    title: "규정 답변에 근거 문장 붙이기",
    purpose: "그럴듯한 답보다 제공 문서에 근거한 답변 만들기",
    prep: "교육용 가상 규정 한 페이지와 질문 1개",
    prompt: "이 질문에 제공한 가상 규정만 근거로 답해 줘. 답변 아래에 근거 문장을 짧게 표시하고, 문서에 없으면 ‘근거 없음’이라고 답해 줘.",
    complete: "답변·근거 문장·근거 없음 상태가 구분된 카드",
    teaching: "답이 짧아도 출처가 붙은 결과가 더 완성된 결과임을 보여 줍니다.",
    caution: "실제 법률·인사 규정 상담에 사용하지 않습니다.",
    fallback: "가상 규정에서 질문과 관련된 문장을 직접 찾습니다.",
    input: "가상 규정 1쪽", output: "근거 답변 카드",
  },
  {
    day: "M08-D03", role: "marketing", tag: "QUICK WIN", kind: "brandqa",
    title: "브랜드 가이드 근거 카피 Q&A",
    purpose: "브랜드 톤과 금지 표현을 근거로 카피를 판정",
    prep: "가상 브랜드 가이드 한 페이지와 카피 2개",
    prompt: "이 두 카피를 제공한 가상 브랜드 가이드만으로 검토해 줘. 적합·수정 필요를 판정하고 근거 문장과 수정안을 붙여 줘. 가이드에 없는 기준은 만들지 마.",
    complete: "카피 2개의 판정·근거·수정안",
    teaching: "취향 평가가 아니라 문서 근거 평가로 바꾸는 팁입니다.",
    caution: "실제 비공개 브랜드 가이드는 사용하지 않습니다.",
    fallback: "가상 가이드의 허용·금지 표현을 카피에 직접 표시합니다.",
    input: "가상 브랜드 가이드", output: "근거 카피 Q&A",
  },
  {
    day: "M08-D04", role: "backoffice", tag: "QUICK WIN", kind: "risk",
    title: "에이전트 권한을 신호등 위험 카드로",
    purpose: "조회·초안·승인·실행 권한을 색으로 구분",
    prep: "가상 에이전트 행동 카드 6개",
    prompt: "이 행동을 초록 ‘자동 가능’, 노랑 ‘사람 확인 후’, 빨강 ‘실습 금지’로 나눠 줘. 조회·초안·메일 발송·공개 공유·삭제·기록 각각의 판단 이유를 한 줄로 적어 줘.",
    complete: "행동 6개의 신호등 분류와 사람 승인 위치",
    teaching: "기술적으로 가능하다는 말과 수업에서 허용한다는 말을 분리합니다.",
    caution: "발송·공개 공유·삭제는 실제 실행하지 않습니다.",
    fallback: "행동 카드 여섯 장을 신호등 판에 직접 분류합니다.",
    input: "가상 행동 카드", output: "권한 신호등",
  },
  {
    day: "M08-D04", role: "marketing", tag: "QUICK WIN", kind: "preflight",
    title: "게시 전 검수를 탑승권 카드로",
    purpose: "콘텐츠가 게시 단계로 넘어가기 전 필수 확인을 시각화",
    prep: "가상 게시물 초안과 확인 항목 5개",
    prompt: "이 가상 게시물의 게시 전 확인을 탑승권 카드처럼 정리해 줘. 브랜드 사실, 과장 표현, 저작권, 채널 규격, 사람 승인을 각각 통과·확인 필요로 표시하고 자동 게시하지 마.",
    complete: "다섯 항목과 최종 사람 승인이 보이는 검수 카드",
    teaching: "에이전트의 마지막 단계는 게시가 아니라 승인 가능한 상태 만들기입니다.",
    caution: "실제 계정 게시·예약은 실행하지 않습니다.",
    fallback: "가상 게시물에 다섯 항목 체크만 직접 표시합니다.",
    input: "가상 게시물 초안", output: "게시 전 탑승권",
  },
  {
    day: "M09-D01", role: "backoffice", tag: "HOT", kind: "mirror",
    title: "AI와 일하는 내 모습을 작업대 이미지로",
    purpose: "15일 동안의 지시·검증·수정 습관을 재미있게 돌아보기",
    prep: "개인정보를 제외한 학습 기록 키워드 4개",
    prompt: "내 학습 기록의 키워드를 바탕으로, 내가 AI와 일하는 방식을 하나의 상징적인 작업대 장면으로 표현해 줘. AI가 실제 감정이나 인격을 가진 것처럼 단정하지 말고, 지시·검증·수정·협업 습관을 사물과 배치로만 보여 줘.",
    complete: "나의 AI 활용 습관 2개를 설명할 수 있는 상징 이미지",
    teaching: "유행 프롬프트를 AI 감정 해석이 아니라 자신의 작업 습관 성찰로 바꿉니다.",
    caution: "이미지를 성격·심리 진단처럼 해석하지 않습니다.",
    fallback: "작업대 템플릿에 나를 상징하는 도구 4개를 직접 배치합니다.",
    input: "학습 키워드 4개", output: "업무 작업대 거울",
  },
  {
    day: "M09-D01", role: "marketing", tag: "HOT", kind: "collage",
    title: "AI와 브랜드를 만드는 관계를 콜라주로",
    purpose: "15일 동안의 기획·생성·검수 역할을 시각적 메타포로 정리",
    prep: "가상 브랜드 작업 키워드 4개와 결과물 썸네일",
    prompt: "이 키워드와 가상 결과물을 바탕으로, 내가 AI와 브랜드 콘텐츠를 만드는 방식을 잡지 콜라주 한 장으로 표현해 줘. AI의 감정을 추정하지 말고, 내가 맡은 목표·선택·검수와 AI가 도운 초안·변형을 서로 다른 색과 사물로 구분해 줘.",
    complete: "사람과 AI의 역할 차이를 설명할 수 있는 브랜드 콜라주",
    teaching: "같은 관계 거울 유행을 마케팅에서는 역할 분담과 브랜드 책임 회고로 바꿉니다.",
    caution: "실제 고객·비공개 캠페인 이미지는 사용하지 않습니다.",
    fallback: "콜라주 템플릿에 사람 역할 2개와 AI 역할 2개를 붙입니다.",
    input: "브랜드 키워드 4개", output: "공동창작 콜라주",
  },
];

if (entries.length !== 30) throw new Error(`Expected 30 warmups, got ${entries.length}`);

function lines(items) {
  return items.join("\n");
}

function escapeHtml(value) {
  return String(value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;");
}

function replaceOrInsert(text, start, end, block, anchor) {
  const pattern = new RegExp(start + "[\\s\\S]*?" + end, "g");
  if (pattern.test(text)) return text.replace(pattern, block);
  const index = text.indexOf(anchor);
  if (index < 0) throw new Error(`Insertion anchor not found: ${anchor}`);
  return text.slice(0, index).trimEnd() + "\n\n" + block + "\n\n" + text.slice(index).trimStart();
}

function pathsFor(entry) {
  const stem = `${entry.day.toLowerCase()}-${entry.role}-ai-warmup`;
  return {
    html: `downloads/guide-resources/${entry.role}/${entry.day}/warmups/${stem}.html`,
    image: `assets/guide-images/${entry.role}/${entry.day}/ai-warmup-20260808.png`,
    readme: `downloads/guide-resources/${entry.role}/${entry.day}/README.md`,
  };
}

function learnerBlock(entry, pair, assetPaths) {
  const role = roles[entry.role];
  return lines([
    LEARNER_START,
    "",
    `### 최신 AI 활용 카드 · 수업 전 선택 5분 · ${AS_OF}`,
    "",
    `![${entry.day} ${role.label} AI 워밍업 ${entry.title}](${BASE_URL}${assetPaths.image})`,
    "",
    `- **오늘의 팁:** ${entry.title}`,
    `- **준비:** ${entry.prep}`,
    `- **할 일:** 입력을 확인하고 아래 문장을 실행한 뒤 결과를 한 번만 수정합니다.`,
    "",
    "```text",
    entry.prompt,
    "```",
    "",
    `- **완료:** ${entry.complete}`,
    `- **계정·기능이 다르면:** [브라우저 예시를 열고](${RESOURCE_URL}${assetPaths.html}) 완료 기준 한 가지를 찾습니다.`,
    `- **개인 Notion:** 새 페이지 제목을 \`[${entry.day}] ${entry.title}\`로 만들고, 입력 요약·첫 결과·한 번 수정·최종 캡처만 기록합니다.`,
    `- **중복 수강:** 다른 과정은 별도 활동 ‘${pair.title}’입니다. 현재 사진·문장·결과를 넘겨 쓰지 않습니다.`,
    "- 이 선택 활동은 정규 4차시·240분과 필수 제출물에 포함되지 않습니다.",
    "",
    LEARNER_END,
  ]);
}

function instructorBlock(entry, pair, assetPaths) {
  const role = roles[entry.role];
  const status = entry.tag === "HOT"
    ? "2026년 공개 게시물에서 반복 확인된 이미지 활용 패턴을 수업용으로 안전하게 변형"
    : "최근 멀티모달 활용 방식에서 바로 써먹기 좋은 짧은 퀵윈";
  return lines([
    INSTRUCTOR_START,
    "",
    `### 1-0. 수업 전 선택 5분 · 오늘의 AI 활용 팁`,
    "",
    `> **${entry.tag} · ${AS_OF} 확인** — ${status}. 정규 4차시·240분을 시작하기 전에만 운영하며 필수 결과물로 평가하지 않습니다.`,
    "",
    `![${entry.day} ${role.label} AI 워밍업 ${entry.title}](${BASE_URL}${assetPaths.image})`,
    "",
    `- 브라우저 완성 예시: [${entry.title}](${RESOURCE_URL}${assetPaths.html})`,
    `- 오늘의 목적: ${entry.purpose}`,
    `- 준비물: ${entry.prep}`,
    `- 완료 상태: ${entry.complete}`,
    `- 같은 날 다른 과정: **${pair.title}** — ${role.avoid}`,
    "",
    "#### 강사가 그대로 따라 하는 5분 순서",
    "",
    "| 시간 | 강사 행동 | 수강생 행동 |",
    "|---|---|---|",
    `| 0~1분 | HTML 예시에서 입력과 완성 결과만 보여 주며 “오늘의 워밍업: ${entry.title}”라고 말합니다. | 바뀐 것과 유지된 것을 한 가지씩 찾습니다. |`,
    `| 1~2분 | 준비물의 가상·비식별 상태를 확인하고 아래 프롬프트를 그대로 읽습니다. | 자신의 입력을 선택하거나 제공 예시를 엽니다. |`,
    "| 2~4분 | 첫 결과를 만든 뒤 ‘유지할 것 하나·고칠 것 하나’만 질문합니다. | 수정 지시를 한 번만 추가합니다. |",
    `| 4~5분 | 완료 기준을 읽고 개인 Notion 기록 위치를 안내합니다. | 최종 캡처와 수정 이유 한 줄을 개인 Notion에 남깁니다. |`,
    "",
    "#### 시연용 프롬프트",
    "",
    "```text",
    entry.prompt,
    "```",
    "",
    `강의 팁: ${entry.teaching}`,
    "",
    `안전선: ${entry.caution}`,
    "",
    `도구·계정 대체 경로: ${entry.fallback}`,
    "",
    "마무리 멘트:",
    "",
    `> “결과가 재미있어도 오늘의 완성 기준은 ‘${entry.complete}’입니다. 긴 이론은 가이드에 옮기지 않고, 입력·첫 결과·한 번 수정·최종 캡처는 개인 Notion에 이어서 정리해 주세요.”`,
    "",
    INSTRUCTOR_END,
  ]);
}

function scene(kind, entry) {
  const labelIn = escapeHtml(entry.input);
  const labelOut = escapeHtml(entry.output);
  const photoKinds = new Set(["memo", "scrapbook", "redline", "sticker", "doodle", "character", "comments", "landing"]);
  const flowKinds = new Set(["comic", "carousel", "ladder", "workflow", "pipeline", "risk", "preflight"]);
  const dataKinds = new Set(["sources", "evidence", "chart", "scorecard", "qa", "brandqa", "ab", "bug", "form"]);

  let inputMarkup = "";
  let outputMarkup = "";
  if (photoKinds.has(kind)) {
    inputMarkup = `<div class="photo"><div class="sun"></div><div class="subject"></div><div class="table"></div><span>${labelIn}</span></div>`;
    outputMarkup = `<div class="photo edited ${kind}"><div class="sun"></div><div class="subject"></div><div class="table"></div><i class="bubble">핵심!</i><i class="arrow">↗</i><i class="star">✦</i><span>${labelOut}</span></div>`;
  } else if (kind === "voice" || kind === "hooks") {
    inputMarkup = `<div class="voice"><div class="mic">●</div><div class="wave">▂▅▃▇▄▆▂▅▃</div><span>${labelIn}</span></div>`;
    outputMarkup = `<div class="stack"><b>01</b><p>${labelOut}</p><b>02</b><p>확인 필요 표시</p><b>03</b><p>한 번 수정</p></div>`;
  } else if (kind === "wireframe") {
    inputMarkup = `<div class="sketch"><span>${labelIn}</span><div></div><div></div><button>실행</button></div>`;
    outputMarkup = `<div class="app"><header></header><input aria-label="가상 입력"><button>실행</button><section>${labelOut}</section></div>`;
  } else if (kind === "mirror" || kind === "collage") {
    inputMarkup = `<div class="keywords"><span>지시</span><span>검증</span><span>수정</span><span>선택</span><small>${labelIn}</small></div>`;
    outputMarkup = `<div class="mirror"><div class="human">사람</div><div class="desk">✓</div><div class="ai">AI</div><p>${labelOut}</p></div>`;
  } else if (flowKinds.has(kind)) {
    inputMarkup = `<div class="notes"><span>${labelIn}</span><p>입력</p><p>확인</p><p>완료</p></div>`;
    outputMarkup = `<div class="flow"><span>1</span><i></i><span>2</span><i></i><span>3</span><i></i><span>✓</span><p>${labelOut}</p></div>`;
  } else if (dataKinds.has(kind)) {
    inputMarkup = `<div class="document"><b>${labelIn}</b><p></p><p></p><p></p><p></p></div>`;
    outputMarkup = `<div class="dashboard"><header>${labelOut}</header><div class="bars"><i></i><i></i><i></i><i></i></div><p>근거 있음</p><p>확인 필요</p></div>`;
  } else {
    inputMarkup = `<div class="notes"><span>${labelIn}</span><p>핵심 내용</p><p>사실 확인</p><p>수정 기록</p></div>`;
    outputMarkup = `<div class="cards"><article>1</article><article>2</article><article>3</article><p>${labelOut}</p></div>`;
  }
  return { inputMarkup, outputMarkup };
}

function buildHtml(entry) {
  const role = roles[entry.role];
  const { inputMarkup, outputMarkup } = scene(entry.kind, entry);
  return lines([
    "<!doctype html>",
    "<html lang=\"ko\">",
    "<head>",
    "  <meta charset=\"utf-8\">",
    "  <meta name=\"viewport\" content=\"width=device-width,initial-scale=1\">",
    `  <title>${escapeHtml(entry.day)} · ${escapeHtml(entry.title)} · AI 워밍업 예시</title>`,
    "  <style>",
    `    :root{font-family:Arial,'Noto Sans KR',system-ui,sans-serif;color:#172b4d;background:#edf3f9;--accent:${role.accent};--dark:${role.dark};--soft:${role.soft}}`,
    "    *{box-sizing:border-box}body{margin:0;min-width:320px}.page{width:min(1540px,100%);height:900px;margin:0 auto;padding:24px;display:grid;grid-template-rows:132px 1fr 154px;gap:16px}",
    "    header{border-radius:28px;background:var(--dark);color:#fff;padding:24px 32px;display:flex;align-items:center;justify-content:space-between;gap:24px}.eyebrow{margin:0 0 8px;color:#dbe8ff;font-size:15px;font-weight:800;letter-spacing:.08em}.title{font-size:36px;line-height:1.14;margin:0}.meta{text-align:right}.tag{display:inline-block;background:#fff;color:var(--dark);font-weight:850;border-radius:999px;padding:9px 16px}.meta p{margin:10px 0 0;color:#dbe8ff;font-size:14px}",
    "    .work{display:grid;grid-template-columns:1fr 170px 1fr;gap:16px;min-height:0}.panel{background:#fff;border:2px solid #d6e1ef;border-radius:26px;padding:20px;display:grid;grid-template-rows:46px 1fr;min-width:0}.panel h2{font-size:20px;margin:0;color:var(--dark)}.panel h2 span{display:inline-block;background:var(--soft);padding:7px 12px;border-radius:999px;margin-right:8px}.preview{background:#f7f9fc;border:1px solid #d7e1ef;border-radius:20px;display:grid;place-items:center;overflow:hidden;position:relative}.bridge{display:flex;flex-direction:column;align-items:center;justify-content:center;text-align:center}.bridge .arrow{width:80px;height:80px;border-radius:50%;display:grid;place-items:center;background:var(--accent);color:#fff;font-size:42px;font-weight:900}.bridge b{font-size:15px;color:var(--dark);margin-top:14px}.bridge p{font-size:13px;line-height:1.45;color:#52627a}",
    "    .footer{background:#fff;border:2px solid #d6e1ef;border-radius:24px;padding:17px 22px;display:grid;grid-template-columns:1.35fr 1fr;gap:20px}.steps{display:grid;grid-template-columns:repeat(3,1fr);gap:10px}.step{background:var(--soft);border-radius:16px;padding:13px}.step b{display:block;color:var(--accent);font-size:13px;margin-bottom:5px}.step span{font-size:14px;line-height:1.35;font-weight:700}.notion{border-left:3px solid var(--accent);padding-left:18px}.notion b{color:var(--dark)}.notion p{font-size:14px;line-height:1.45;margin:7px 0}.notion small{color:#52627a}",
    "    .photo{width:78%;height:75%;border-radius:22px;background:linear-gradient(145deg,#dcecff,#fff0df);position:relative;overflow:hidden;box-shadow:0 12px 24px #1024471f}.photo .sun{position:absolute;width:74px;height:74px;border-radius:50%;background:#ffd36a;right:34px;top:30px}.photo .subject{position:absolute;width:120px;height:180px;border-radius:70px 70px 24px 24px;background:var(--accent);left:42%;bottom:52px}.photo .table{position:absolute;left:10%;right:10%;height:54px;background:#9b6b47;bottom:22px;border-radius:8px}.photo span{position:absolute;left:18px;bottom:14px;background:#fff;padding:7px 10px;border-radius:9px;font-weight:750}.photo.edited .bubble{position:absolute;right:24px;top:32px;background:#fff;border:3px solid var(--accent);border-radius:50%;padding:15px;font-style:normal;font-weight:850;transform:rotate(5deg)}.photo.edited .arrow{position:absolute;left:24px;top:40px;color:var(--accent);font-size:52px;font-style:normal;font-weight:900}.photo.edited .star{position:absolute;right:38px;bottom:80px;color:#f59e0b;font-size:48px;font-style:normal}.photo.doodle{filter:saturate(.7);outline:8px dashed var(--accent);outline-offset:-18px}.photo.scrapbook:before{content:'오늘의 작은 발견';position:absolute;left:22px;top:20px;background:#fff4b8;padding:10px 14px;transform:rotate(-5deg);font-weight:850;z-index:2}",
    "    .voice{width:80%;height:62%;border-radius:24px;background:#0f172a;color:#fff;padding:34px;text-align:center}.mic{width:74px;height:74px;border-radius:50%;background:var(--accent);margin:auto;display:grid;place-items:center}.wave{font-size:32px;letter-spacing:7px;color:#7dd3fc;margin:32px 0}.voice span{font-weight:750}.stack{width:82%;display:grid;grid-template-columns:48px 1fr;gap:13px;align-items:center}.stack b{width:46px;height:46px;border-radius:50%;display:grid;place-items:center;background:var(--accent);color:#fff}.stack p{margin:0;background:#fff;padding:15px;border-radius:13px;border:1px solid #cfdaea;font-weight:700}",
    "    .notes,.document,.sketch,.keywords{width:80%;padding:28px;border-radius:20px;background:#fff;border:2px solid #cdd9e9;box-shadow:0 10px 20px #10244714}.notes span,.document b,.sketch span{font-size:19px;color:var(--dark)}.notes p,.document p{height:17px;background:#dfe7f2;border-radius:8px}.notes p:nth-of-type(2),.document p:nth-of-type(2){width:82%}.notes p:nth-of-type(3),.document p:nth-of-type(3){width:64%}.flow{width:88%;display:flex;align-items:center;justify-content:center;gap:10px;position:relative}.flow span{width:58px;height:58px;border-radius:18px;display:grid;place-items:center;background:var(--accent);color:#fff;font-size:20px;font-weight:850}.flow i{width:34px;height:5px;background:#9db0ca;border-radius:4px}.flow p{position:absolute;top:86px;font-size:18px;font-weight:850;color:var(--dark)}",
    "    .dashboard{width:82%;height:72%;border-radius:20px;background:#fff;border:2px solid #cdd9e9;padding:22px}.dashboard header{height:42px;padding:0 15px;border-radius:12px;font-weight:800}.bars{height:150px;display:flex;align-items:end;gap:18px;padding:20px 24px}.bars i{flex:1;background:var(--accent);border-radius:8px 8px 3px 3px}.bars i:nth-child(1){height:36%}.bars i:nth-child(2){height:68%}.bars i:nth-child(3){height:48%}.bars i:nth-child(4){height:86%}.dashboard p{display:inline-block;background:var(--soft);padding:8px 12px;border-radius:10px;margin:4px}.sketch div{height:46px;border:3px dashed #a8b8cc;border-radius:10px;margin:16px 0}.sketch button,.app button{border:0;background:var(--accent);color:#fff;border-radius:10px;padding:12px 22px}.app{width:82%;background:#fff;border:2px solid #cdd9e9;border-radius:20px;padding:20px}.app header{height:38px;padding:0;border-radius:10px;margin-bottom:18px}.app input{width:100%;height:44px;border:2px solid #cdd9e9;border-radius:10px;margin-bottom:12px}.app section{margin-top:14px;background:var(--soft);padding:28px;border-radius:12px;font-weight:800}",
    "    .keywords{display:grid;grid-template-columns:1fr 1fr;gap:13px;text-align:center}.keywords span{background:var(--soft);padding:18px;border-radius:14px;font-weight:850;color:var(--dark)}.keywords small{grid-column:1/-1}.mirror{width:86%;height:70%;position:relative;display:flex;align-items:center;justify-content:center;gap:18px}.human,.ai{width:110px;height:150px;border-radius:58px 58px 20px 20px;display:grid;place-items:center;background:var(--accent);color:#fff;font-weight:850}.ai{background:var(--dark)}.desk{width:150px;height:78px;background:#a06c42;border-radius:14px;display:grid;place-items:center;color:#fff;font-size:34px}.mirror p{position:absolute;bottom:-18px;font-size:18px;font-weight:850;color:var(--dark)}",
    "    @media(max-width:760px){.page{height:auto;min-height:100vh;padding:12px;grid-template-rows:auto auto auto}header{align-items:flex-start;flex-direction:column}.title{font-size:27px}.meta{text-align:left}.work{grid-template-columns:1fr}.bridge{min-height:150px}.bridge .arrow{transform:rotate(90deg)}.panel{min-height:480px}.footer{grid-template-columns:1fr}.steps{grid-template-columns:1fr}.notion{border-left:0;border-top:3px solid var(--accent);padding:14px 0 0}}",
    "  </style>",
    "</head>",
    "<body data-warmup-ready=\"true\">",
    "  <main class=\"page\">",
    "    <header>",
    `      <div><p class="eyebrow">DAILY AI WARM-UP · ${escapeHtml(entry.day)}</p><h1 class="title">${escapeHtml(entry.title)}</h1></div>`,
    `      <div class="meta"><span class="tag">${escapeHtml(entry.tag)} · ${escapeHtml(role.course)}</span><p>교육용 가상 예시 · ${AS_OF}</p></div>`,
    "    </header>",
    "    <section class=\"work\">",
    `      <article class="panel"><h2><span>INPUT</span>${escapeHtml(entry.input)}</h2><div class="preview">${inputMarkup}</div></article>`,
    `      <div class="bridge"><div class="arrow">→</div><b>한 번 실행</b><p>유지할 것 1개<br>고칠 것 1개<br>한 번만 수정</p></div>`,
    `      <article class="panel"><h2><span>RESULT</span>${escapeHtml(entry.output)}</h2><div class="preview">${outputMarkup}</div></article>`,
    "    </section>",
    "    <footer class=\"footer\">",
    "      <div class=\"steps\"><div class=\"step\"><b>1 · 입력</b><span>가상·비식별 자료인지 확인</span></div><div class=\"step\"><b>2 · 수정</b><span>유지 1개·수정 1개만 지시</span></div><div class=\"step\"><b>3 · 완료</b><span>완료 기준과 안전선 확인</span></div></div>",
    `      <div class="notion"><b>개인 Notion 기록</b><p>${escapeHtml(entry.complete)}</p><small>입력 요약 · 첫 결과 · 한 번 수정 · 최종 캡처</small></div>`,
    "    </footer>",
    "  </main>",
    "  <script>document.documentElement.dataset.warmupReady = 'true';</script>",
    "</body>",
    "</html>",
  ]);
}

function updateReadme(entry, assetPaths) {
  const absolute = path.join(ROOT, assetPaths.readme);
  const text = fs.readFileSync(absolute, "utf8");
  const block = lines([
    README_START,
    "",
    "## 수업 전 선택 5분 AI 워밍업",
    "",
    `- 오늘의 팁: ${entry.title}`,
    `- [브라우저 예시 열기](${RESOURCE_URL}${assetPaths.html})`,
    "- 정규 4차시·240분과 필수 제출물에는 포함하지 않습니다.",
    "",
    README_END,
  ]);
  const pattern = new RegExp(README_START + "[\\s\\S]*?" + README_END, "g");
  const next = pattern.test(text) ? text.replace(pattern, block) : text.trimEnd() + "\n\n" + block + "\n";
  fs.writeFileSync(absolute, next, "utf8");
}

for (const entry of entries) {
  const pair = entries.find((candidate) => candidate.day === entry.day && candidate.role !== entry.role);
  if (!pair) throw new Error(`Missing counterpart for ${entry.day} ${entry.role}`);
  const assetPaths = pathsFor(entry);

  const learnerPath = path.join(ROOT, "guides", "notion", entry.role, "learner", `${entry.day}.md`);
  const instructorPath = path.join(ROOT, "guides", "notion", entry.role, "instructor", `${entry.day}.md`);
  let learner = fs.readFileSync(learnerPath, "utf8");
  let instructor = fs.readFileSync(instructorPath, "utf8");
  learner = replaceOrInsert(learner, LEARNER_START, LEARNER_END, learnerBlock(entry, pair, assetPaths), "\n## 2.");
  const instructorAnchor = instructor.includes("\n<!-- INSTRUCTOR-BEGINNER-RUNBOOK-20260808:START -->")
    ? "\n<!-- INSTRUCTOR-BEGINNER-RUNBOOK-20260808:START -->"
    : "\n## 2.";
  instructor = replaceOrInsert(instructor, INSTRUCTOR_START, INSTRUCTOR_END, instructorBlock(entry, pair, assetPaths), instructorAnchor);
  fs.writeFileSync(learnerPath, learner.trimEnd() + "\n", "utf8");
  fs.writeFileSync(instructorPath, instructor.trimEnd() + "\n", "utf8");

  const htmlAbsolute = path.join(ROOT, assetPaths.html);
  fs.mkdirSync(path.dirname(htmlAbsolute), { recursive: true });
  fs.writeFileSync(htmlAbsolute, buildHtml(entry), "utf8");
  updateReadme(entry, assetPaths);
}

const auditPath = path.join(ROOT, "downloads", "guide-resources", `daily-ai-warmup-audit-${AS_OF}.md`);
const rows = entries.map((entry) => `| ${entry.day} | ${roles[entry.role].label} | ${entry.tag} | ${entry.title} | ${entry.complete} |`);
fs.writeFileSync(auditPath, lines([
  "# 15일 AI 워밍업 편성표",
  "",
  `기준일: ${AS_OF}`,
  "",
  "- 정규 4차시·240분 밖의 선택형 5분 활동",
  "- 경영지원 15개·마케팅 15개, 같은 날 입력·판단·결과물 중복 없음",
  "- 수강생 가이드에는 목적·준비·프롬프트·완료·개인 Notion 기록만 제공",
  "- 강사용 가이드에는 5분 운영 순서·안전선·대체 경로·강의 팁 제공",
  "- 실제 개인정보·기관 내부자료·고객자료를 사용하지 않음",
  "- 이미지 생성 API 없이 HTML/CSS 기반 가상 완성 예시 제공",
  "",
  "| 일자 | 과정 | 유형 | 오늘의 팁 | 완료 상태 |",
  "|---|---|---|---|---|",
  ...rows,
  "",
]), "utf8");

console.log(JSON.stringify({
  asOf: AS_OF,
  learnerCards: entries.length,
  instructorCards: entries.length,
  htmlExamples: entries.length,
  hot: entries.filter((entry) => entry.tag === "HOT").length,
  quickWin: entries.filter((entry) => entry.tag === "QUICK WIN").length,
}, null, 2));
