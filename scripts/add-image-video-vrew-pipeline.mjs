import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const AS_OF = "2026-08-08";
const BASE = "https://raw.githubusercontent.com/makernari/AX-slide-site/main/";
const RESOURCE_BASE = "https://makernari.github.io/AX-slide-site/";

const MARKERS = {
  learnerD01: ["<!-- M06-IMAGE-VIDEO-PIPELINE-20260808:START -->", "<!-- M06-IMAGE-VIDEO-PIPELINE-20260808:END -->"],
  instructorD01: ["<!-- INSTRUCTOR-M06-IMAGE-VIDEO-PIPELINE-20260808:START -->", "<!-- INSTRUCTOR-M06-IMAGE-VIDEO-PIPELINE-20260808:END -->"],
  learnerD02: ["<!-- M06-VREW-FINISH-20260808:START -->", "<!-- M06-VREW-FINISH-20260808:END -->"],
  instructorD02: ["<!-- INSTRUCTOR-M06-VREW-FINISH-20260808:START -->", "<!-- INSTRUCTOR-M06-VREW-FINISH-20260808:END -->"],
  readme: ["<!-- M06-MEDIA-PIPELINE-20260808:START -->", "<!-- M06-MEDIA-PIPELINE-20260808:END -->"],
};

const roles = {
  backoffice: {
    label: "경영지원",
    course: "스마트 경영지원",
    accent: "#155EEF",
    dark: "#0B3B8F",
    soft: "#EAF2FF",
    caseTitle: "가상 사내 안전교육 안내 영상",
    characterId: "BO-HANGYEOL-01",
    characterName: "가상 교육 진행자 한결",
    characterFixed: "30대 가상 성인, 짧은 검정 머리, 타원형 얼굴, 네이비 셔츠, 로고 없는 주황 안전 조끼, 중립적 표정",
    characterVariable: "표정 강도, 손동작, 카메라 거리",
    objectFixed: "파란 안내 보드, 노란 안전 표식, 로고·기관명 없음",
    scene1: "복도 위험 요소를 발견하고 멈춰 선다",
    scene2: "안내 보드를 가리키며 안전 행동 하나를 설명한다",
    scene3: "표식을 확인하고 엄지손가락으로 완료를 알린다",
    caption1: "잠깐, 통로를 먼저 확인하세요",
    caption2: "표식 안쪽으로 이동합니다",
    caption3: "확인 후 업무를 시작합니다",
    cta: "오늘의 안전 행동을 한 가지 확인하세요",
    bgm: "차분하고 신뢰감 있는 교육용 배경음",
    target: "신입 구성원",
  },
  marketing: {
    label: "마케팅",
    course: "마케팅·SNS 콘텐츠 기획·브랜딩",
    accent: "#C2410C",
    dark: "#8A2D0B",
    soft: "#FFF1E8",
    caseTitle: "NOVA-TEA 가상 출시 캠페인 영상",
    characterId: "MK-RIA-01",
    characterName: "가상 캠페인 모델 리아",
    characterFixed: "20대 후반 가상 성인, 어깨 길이 짙은 갈색 웨이브, 둥근 얼굴, 크림색 블라우스, 코랄 스카프, 자연스러운 미소",
    characterVariable: "표정, 시선, 손동작, 카메라 거리",
    objectFixed: "호박색 가상 허브티 병, 크림색 무지 라벨, 코랄 뚜껑, 실제 브랜드 로고 없음",
    scene1: "테이블 위 제품을 발견하고 시선을 둔다",
    scene2: "제품을 들어 향을 경험하고 미소 짓는다",
    scene3: "제품을 프레임 앞에 보여 주며 저장 행동을 유도한다",
    caption1: "오늘의 향을 발견하다",
    caption2: "가볍게 즐기는 허브 블렌드",
    caption3: "출시 소식을 저장하세요",
    cta: "가상 캠페인 교육용 예시",
    bgm: "맑고 리드미컬한 브랜드 캠페인 배경음",
    target: "20~30대 가상 SNS 이용자",
  },
};

function lines(values) {
  return values.join("\n");
}

function escapeHtml(value) {
  return String(value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;");
}

function csv(rows) {
  return rows.map((row) => row.map((value) => `"${String(value).replaceAll('"', '""')}"`).join(",")).join("\n");
}

function write(relative, content) {
  const absolute = path.join(ROOT, relative);
  fs.mkdirSync(path.dirname(absolute), { recursive: true });
  fs.writeFileSync(absolute, String(content).trimEnd() + "\n", "utf8");
}

function replaceOrInsert(text, markers, block, anchor) {
  const [start, end] = markers;
  const pattern = new RegExp(start.replace(/[.*+?^${}()|[\]\\]/g, "\\$&") + "[\\s\\S]*?" + end.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"), "g");
  if (pattern.test(text)) return text.replace(pattern, block);
  const index = text.indexOf(anchor);
  if (index < 0) throw new Error(`Missing anchor: ${anchor}`);
  return text.slice(0, index).trimEnd() + "\n\n" + block + "\n\n" + text.slice(index).trimStart();
}

function d01Tasks(role) {
  return [
    {
      name: "제작 브리프·권리·출력 규격 잠그기", minutes: 10,
      prep: `${role.caseTitle} 가상 브리프`,
      actions: [
        `대상은 ${role.target}, 목적은 ${role.cta}로 한 줄씩 적습니다.`,
        "실존 인물·실제 회사·고객 자료가 없는지 확인하고 9:16, 3개 장면, 장면당 짧은 클립으로 범위를 고정합니다.",
        "완료 파일명을 `role_scene_version_status` 규칙으로 먼저 예약합니다.",
      ],
      prompt: `다음 교육용 가상 영상의 제작 브리프를 표로 바꿔 줘. 주제: ${role.caseTitle}. 대상: ${role.target}. 목적: ${role.cta}. 출력: 9:16 세로형, 3장면. 사실처럼 보일 수 있는 실제 기관명·성과·로고는 사용하지 마.`,
      output: "목적·대상·권리·비율·장면 수가 잠긴 브리프",
      check: "목표가 하나이고 실제 개인정보·상표·내부 수치가 없는가?",
      fallback: "production-brief.md를 직접 채웁니다.",
    },
    {
      name: "캐릭터 시트 작성", minutes: 20,
      prep: `${role.characterName} 설정 카드`,
      actions: [
        `캐릭터 ID를 ${role.characterId}로 정하고 고정 요소와 장면별 변경 요소를 분리합니다.`,
        "정면·좌측 3/4·우측 3/4·전신·표정 세 가지가 한 장에 보이는 16:9 시트를 설계합니다.",
        "얼굴·머리·의상·소품 색을 HEX 또는 짧은 말로 고정하고 새 로고·장신구 추가 금지를 적습니다.",
      ],
      prompt: `16:9 캐릭터 기준 시트를 만들어 줘. 캐릭터 ID: ${role.characterId}. 이름: ${role.characterName}. 고정: ${role.characterFixed}. 정면 얼굴｜좌측 3/4｜우측 3/4｜전신｜중립·설명·완료 표정을 같은 사람으로 배치해 줘. 배경은 연한 회색, 실제 로고와 글자는 넣지 마.`,
      output: "한 장으로 다시 참조할 수 있는 캐릭터 시트",
      check: "모든 뷰에서 얼굴·머리·의상·체형이 같은가?",
      fallback: "character-sheet-template.md와 제공 HTML 캐릭터 시트를 사용합니다.",
    },
    {
      name: "고정·가변 분리 이미지 프롬프트 작성", minutes: 15,
      prep: "캐릭터 시트와 장면 카드",
      actions: [
        "프롬프트를 목적·고정 요소·이번 장면·카메라·조명·비율·금지 요소 순으로 나눕니다.",
        `매 장면에 ${role.characterId}와 고정 소품 문장을 그대로 반복합니다.`,
        "한 번에 바꾸는 것은 행동·표정·카메라 중 최대 두 개로 제한합니다.",
      ],
      prompt: `이미지 프롬프트 템플릿을 채워 줘. [고정] ${role.characterFixed}; ${role.objectFixed}. [장면] ${role.scene1}. [카메라] 아이 레벨 웨스트 샷. [조명] 부드러운 자연광. [출력] 9:16. [금지] 새 인물, 실제 로고, 읽을 수 없는 한글, 손가락 왜곡, 의상·제품 색 변경.`,
      output: "고정 블록이 반복되는 장면별 이미지 프롬프트 3개",
      check: "세 프롬프트의 고정 블록이 글자 단위로 같은가?",
      fallback: "image-prompt-template.md의 괄호만 채웁니다.",
    },
    {
      name: "ChatGPT Images 2.0으로 기준 이미지 생성", minutes: 20,
      prep: "캐릭터 시트 프롬프트와 장면 1 프롬프트",
      actions: [
        "ChatGPT 이미지 화면에서 실제 표시명이 ChatGPT Images 2.0인지 확인하고, 다르면 보이는 이름을 기록합니다.",
        "캐릭터 시트와 장면 1을 각각 생성하고 첫 결과를 수정 없이 저장합니다.",
        "얼굴·머리·의상·소품·구도·한글을 체크한 뒤 오류 한 개만 지정해 수정합니다.",
      ],
      prompt: `첨부한 ${role.characterId} 캐릭터 시트를 기준으로 장면 1 이미지를 만들어 줘. ${role.scene1}. ${role.characterFixed}. ${role.objectFixed}. 9:16, 아이 레벨 웨스트 샷, 부드러운 자연광. 캐릭터와 소품의 고정 요소를 바꾸지 마.`,
      output: "첫 결과·수정 결과·오류 기록이 있는 기준 이미지",
      check: "표시 모델명을 추측하지 않았고 첫 결과와 수정본을 함께 남겼는가?",
      fallback: "제공 캐릭터 HTML을 기준 이미지로 사용하고 프롬프트만 평가합니다.",
    },
    {
      name: "Flow·Nano Banana Pro로 이미지 생성·비교", minutes: 20,
      prep: "같은 캐릭터 시트와 같은 장면 1 프롬프트",
      actions: [
        "Flow 새 프로젝트에서 모델 이름을 열어 Nano Banana Pro가 실제 표시되는지 확인합니다.",
        "캐릭터 시트를 참조 이미지 또는 프로젝트 자산으로 추가하고 같은 장면 프롬프트를 실행합니다.",
        "두 도구 결과를 얼굴·의상·소품·한글·구도 다섯 기준으로 비교해 이후 기준 이미지를 한 장 선택합니다.",
      ],
      prompt: `참조 이미지의 ${role.characterId}를 그대로 유지해 장면 1을 생성해 줘. ${role.scene1}. ${role.objectFixed}. 9:16, 아이 레벨 웨스트 샷. 얼굴·머리·의상 색·소품 형태를 바꾸거나 새 로고를 추가하지 마.`,
      output: "GPT 결과·Flow 결과 비교표와 선택 기준 이미지",
      check: "같은 입력과 같은 루브릭으로 비교했으며 도구 우열을 한 장만 보고 단정하지 않았는가?",
      fallback: "제공 A·B HTML 예시를 같은 비교표로 채점합니다.",
    },
    {
      name: "3장면 스토리보드·샷 리스트", minutes: 20,
      prep: "선택한 기준 이미지와 캐릭터 시트",
      actions: [
        `장면 1: ${role.scene1} / 장면 2: ${role.scene2} / 장면 3: ${role.scene3}. 세 장면을 한 행씩 적습니다.`,
        "장면마다 행동 하나·카메라 움직임 하나·유지 요소 세 개·금지 요소를 적습니다.",
        "연결 컷에서 손 위치·시선·소품 위치가 갑자기 바뀌지 않는지 화살표로 표시합니다.",
      ],
      prompt: `다음 3장면을 영상 샷 리스트로 만들어 줘. 1) ${role.scene1}, 2) ${role.scene2}, 3) ${role.scene3}. 각 행에 시작 상태｜한 가지 행동｜카메라 움직임｜끝 상태｜유지 요소｜오류 위험을 넣어 줘.`,
      output: "3장면·행동·카메라·연결 상태가 있는 샷 리스트",
      check: "장면마다 핵심 행동과 메시지가 하나뿐인가?",
      fallback: "scene-shot-list.csv에 직접 적습니다.",
    },
    {
      name: "Flow 캐릭터·Ingredients·Frames 준비", minutes: 15,
      prep: "캐릭터 시트, 기준 이미지, 소품·배경 기준 이미지",
      actions: [
        "Flow에서 Characters가 실제 보이면 캐릭터를 만들고, 보이지 않으면 캐릭터 시트를 Ingredients 참조로 사용합니다.",
        "캐릭터·소품·배경 자산을 분리해 이름을 붙이고 여분 인물이 없는 깨끗한 참조 이미지만 사용합니다.",
        "각 장면에 시작 프레임 또는 Ingredients 중 실제 지원되는 방식을 선택하고 자산 대응표를 저장합니다.",
      ],
      prompt: `이 프로젝트 자산의 사용 지시를 정리해 줘. @${role.characterId}=항상 같은 얼굴·머리·의상, @OBJECT=같은 색·형태·개수, @BACKGROUND=같은 공간 구조. 장면별 행동만 바뀌고 새 인물·새 로고·새 소품은 추가하지 마.`,
      output: "이름이 지정된 캐릭터·소품·배경 자산 대응표",
      check: "텍스트 프롬프트와 참조 이미지가 서로 충돌하지 않는가?",
      fallback: "Flow 업로드 없이 asset-naming.csv와 HTML 자산 카드로 대응만 설계합니다.",
    },
    {
      name: "Flow·Veo 3.1로 장면별 클립 생성", minutes: 25,
      prep: "장면별 프롬프트와 참조 자산",
      actions: [
        "Flow에서 Video를 선택하고 실제 표시되는 Veo 3.1 계열 모델과 지원 길이·비율을 기록합니다.",
        "한 번에 세 장면을 만들지 않고 장면별로 생성해 캐릭터·소품·카메라 오류를 즉시 확인합니다.",
        "좋은 버전만 프로젝트에 저장하고, 다음 장면에는 같은 Ingredients 또는 저장 프레임을 다시 사용합니다.",
      ],
      prompt: `@${role.characterId}가 ${role.scene2}. 9:16 세로형 짧은 클립. 시작은 웨스트 샷, 카메라는 매우 느리게 앞으로 이동, 동작은 하나만 자연스럽게 수행한다. ${role.characterFixed}. ${role.objectFixed}. 얼굴·의상·소품·배경 구조를 유지하고 새 인물·자막·로고를 추가하지 마.`,
      output: "장면별 선택 클립 3개와 실제 모델·길이 기록",
      check: "각 클립이 한 동작만 수행하고 시작·끝 상태가 다음 장면과 연결되는가?",
      fallback: "영상 생성 없이 시작·끝 프레임과 카메라 화살표가 있는 스토리보드를 제출합니다.",
    },
    {
      name: "일관성 검수·Scenebuilder·Vrew 인계", minutes: 15,
      prep: "선택 클립 3개와 연속성 체크리스트",
      actions: [
        "얼굴·머리·의상·소품·공간·손·텍스트·왜곡을 장면별로 점검합니다.",
        "Scenebuilder가 보이면 장면 순서와 앞뒤만 거칠게 정리하고, 최종 자막·음악·음량 편집은 하지 않습니다.",
        "클립을 다운로드해 파일명·장면 번호·버전·권리 상태를 확인한 뒤 Vrew 인계 폴더에 복사합니다.",
      ],
      prompt: "세 클립의 연속성 오류를 얼굴｜머리｜의상｜소품｜배경｜손｜카메라｜텍스트로 나눠 검수표를 만들어 줘. 오류가 있는 장면은 재생성 우선순위와 수정 프롬프트 한 줄을 제안해 줘.",
      output: "선택 클립 3개·연속성 검수표·Vrew 인계 폴더",
      check: "초안과 선택본이 구분되고 장면 순서가 파일명에 들어갔는가?",
      fallback: "제공 클립 카드와 continuity-checklist.md로 인계 묶음을 만듭니다.",
    },
  ];
}

function d02Tasks(role) {
  return [
    {
      name: "Flow 인계 폴더 검수", minutes: 10,
      prep: "M06-D01 선택 클립 3개·캐릭터 시트·권리 기록",
      actions: ["파일명이 01·02·03 순서인지 확인합니다.", "각 클립을 끝까지 재생해 검은 프레임·왜곡·음성 유무를 기록합니다.", "Vrew에는 선택본만 가져오고 생성 실패본은 별도 폴더로 옮깁니다."],
      prompt: "이 파일 목록을 장면 번호｜파일명｜길이｜비율｜음성 유무｜권리 상태｜Vrew 사용 여부 표로 정리해 줘.",
      output: "편집에 사용할 클립 3개와 인계 체크표",
      check: "초안·실패본·선택본이 섞이지 않았는가?", fallback: "handoff-checklist.md에서 파일명만 검수합니다.",
    },
    {
      name: "30초 대본·자막 문장 확정", minutes: 15,
      prep: "장면 3개와 핵심 메시지",
      actions: ["훅·핵심·마무리 세 구간에 한 문장씩 배치합니다.", "한 자막을 두 줄 이하, 한 줄을 짧게 줄이고 화면에 없는 사실을 삭제합니다.", "읽는 시간과 화면 행동이 맞는지 소리 내어 읽습니다."],
      prompt: `다음 세 문장을 30초 세로 영상 자막으로 다듬어 줘. 1) ${role.caption1}, 2) ${role.caption2}, 3) ${role.caption3}. 한 자막은 두 줄 이하, 한 줄은 짧게, 마지막에 ${role.cta}를 넣어 줘. 입력에 없는 성과·수치·효능은 추가하지 마.`,
      output: "훅·핵심·마무리와 장면 번호가 연결된 대본",
      check: "자막만 읽어도 메시지가 이해되고 과장 문구가 없는가?", fallback: "shorts-script-template.md의 세 칸을 직접 채웁니다.",
    },
    {
      name: "Vrew 프로젝트 생성·클립 불러오기", minutes: 15,
      prep: "선택 클립 3개와 대본",
      actions: ["Vrew에서 새 프로젝트 또는 영상 파일 불러오기가 실제로 보이는지 확인합니다.", "클립 01·02·03을 불러오고 프로젝트를 9:16 세로형으로 설정할 수 있는지 확인합니다.", "자동 음성 인식 언어를 한국어로 확인하되 무음 클립이면 대본 기반 자막 또는 음성을 선택합니다."],
      prompt: "Vrew 편집 시작 체크리스트를 프로젝트명｜비율｜클립 순서｜인식 언어｜음성 방식｜저장 위치 순서로 만들어 줘.",
      output: "9:16 프로젝트와 순서대로 놓인 클립 3개",
      check: "프로젝트 비율과 클립 순서가 제출 규격과 같은가?", fallback: "vrew-edit-plan.csv에서 타임라인만 설계합니다.",
    },
    {
      name: "텍스트처럼 장면 순서·길이 편집", minutes: 20,
      prep: "Vrew 프로젝트와 30초 대본",
      actions: ["자동 분할된 텍스트·장면 블록과 원본 영상을 나란히 봅니다.", "중복 말·긴 정지·불필요한 앞뒤를 텍스트 또는 클립 경계로 줄입니다.", "장면 전환마다 행동이 끝난 뒤 다음 장면이 시작되는지 미리보기합니다."],
      prompt: "이 30초 편집표에서 각 장면의 시작·끝·핵심 행동·유지할 자막·삭제할 침묵을 표로 만들어 줘. 총길이는 30초 안팎으로 맞춰 줘.",
      output: "불필요한 구간이 제거된 3장면 타임라인",
      check: "삭제로 문맥이 끊기거나 캐릭터 행동이 잘리지 않았는가?", fallback: "HTML 타임라인에서 삭제 블록을 표시합니다.",
    },
    {
      name: "내레이션 또는 AI 음성 배치", minutes: 15,
      prep: "확정 대본과 권리 확인된 음성 방식",
      actions: ["직접 녹음 또는 현재 계정에서 허용되는 AI 음성 중 하나를 선택하고 선택 이유를 적습니다.", "장면별 문장을 한 번에 길게 읽지 않고 세 구간으로 나눕니다.", "음성 시작을 장면보다 약간 늦게 두고 말 끝이 다음 장면을 침범하지 않는지 듣습니다."],
      prompt: `다음 ${role.label} 영상 대본의 읽기 지시를 써 줘. 톤: 명확하고 자연스럽게. 속도: 보통. 강조할 말: ${role.caption2}. 문장 사이 0.3초 쉬기. 감정·효능·성과를 과장하지 마.`,
      output: "장면과 길이가 맞는 내레이션 트랙",
      check: "목소리 사용 권한과 AI 음성 여부를 기록했는가?", fallback: "무음 영상과 자막만으로 완성합니다.",
    },
    {
      name: "자동 자막 생성·텍스트 편집", minutes: 20,
      prep: "내레이션이 있는 타임라인",
      actions: ["Vrew의 음성 인식 또는 대본 기반 자막 기능 중 실제 보이는 방식을 실행합니다.", "자막 블록을 읽으며 고유명사·숫자·띄어쓰기·문장 분할을 직접 수정합니다.", "두 줄 이하·안전 여백·배경 대비를 확인하고 캐릭터 얼굴·제품을 가리지 않게 옮깁니다."],
      prompt: `다음 자막을 맞춤법만 교정하고 의미를 바꾸지 마. ${role.caption1} / ${role.caption2} / ${role.caption3} / ${role.cta}. 수정 전후와 수정 이유를 표로 보여 줘.`,
      output: "오탈자와 타이밍이 검수된 자막본",
      check: "자동 인식 결과를 그대로 두지 않고 원문과 대조했는가?", fallback: "caption-checklist.md와 SRT 구조 예시를 직접 채웁니다.",
    },
    {
      name: "배경음악 선택·권리 기록", minutes: 15,
      prep: "Vrew 무료 자산 또는 사용 권리가 확인된 실습 음원",
      actions: ["Vrew에서 현재 사용 가능한 무료 음악 또는 본인이 권리를 확인한 파일만 선택합니다.", `같은 10초 구간에 ${role.bgm} 후보를 적용하고 내레이션을 방해하지 않는지 비교합니다.`, "출처·플랜·확인일·게시 범위를 권리 로그에 적고 불명확한 음원은 사용하지 않습니다."],
      prompt: `이 영상에 맞는 배경음악 선택 기준을 분위기｜속도｜악기｜보컬 유무｜내레이션 방해｜권리 확인으로 만들어 줘. 목적: ${role.cta}.`,
      output: "선택 음악 한 개와 권리·선택 이유 기록",
      check: "무료라는 이유만으로 게시 권리를 추측하지 않았는가?", fallback: "무음 또는 강사가 제공한 권리 확인 음원으로 완성합니다.",
    },
    {
      name: "음량·전환·화면 안전 영역 조정", minutes: 15,
      prep: "영상·내레이션·자막·음악이 있는 타임라인",
      actions: ["내레이션이 있는 동안 음악을 낮추고 시작·끝에 짧은 페이드를 적용할 수 있는지 확인합니다.", "과도한 전환을 쓰지 않고 장면 변화가 필요한 두 곳에만 같은 전환을 적용합니다.", "9:16 미리보기에서 제목·자막·CTA가 상하 UI 예상 영역과 겹치지 않는지 봅니다."],
      prompt: "30초 세로 영상의 검수 순서를 음성 명료도｜음악 음량｜전환 일관성｜자막 대비｜상하 안전 여백｜마지막 CTA 순으로 체크리스트로 만들어 줘.",
      output: "음성 우선의 최종 타임라인",
      check: "음악·전환이 메시지보다 눈에 띄지 않는가?", fallback: "전환 없이 컷 편집과 일정 음량만 사용합니다.",
    },
    {
      name: "제목 카드·AI 생성 표시·최종 미리보기", minutes: 10,
      prep: "완성 타임라인과 권리 기록",
      actions: ["첫 화면에 주제 하나와 교육용 가상 예시 표시를 짧게 넣습니다.", "AI 생성 클립임을 숨기거나 SynthID를 제거하지 않고 필요한 고지 문구를 확인합니다.", "소리 켬·끔 두 번 재생해 자막만으로도 이해되는지 확인합니다."],
      prompt: `첫 화면 제목과 마지막 CTA를 각각 12자 안팎으로 제안해 줘. 주제: ${role.caseTitle}. 반드시 ‘교육용 가상 예시’를 포함하고 실제 성과처럼 보이는 표현은 제외해 줘.`,
      output: "가상 예시·AI 생성 여부가 구분되는 최종 미리보기",
      check: "실제 공지·광고·성과 증거로 오해할 요소가 없는가?", fallback: "HTML 결과 예시에서 제목과 고지 위치만 검수합니다.",
    },
    {
      name: "MP4·자막·편집 기록 내보내기", minutes: 15,
      prep: "최종 검수된 Vrew 프로젝트",
      actions: ["현재 무료 플랜 화면에 실제 표시되는 내보내기 규격을 확인하고 MP4를 저장합니다.", "SRT 또는 텍스트 내보내기가 보이면 함께 저장하고, 없으면 검수 대본을 TXT로 보관합니다.", "MP4를 폴더 밖에서 다시 재생해 화면·소리·자막·길이를 확인하고 제출 체크를 완료합니다."],
      prompt: "최종 제출 목록을 MP4｜자막 파일 또는 검수 대본｜캐릭터 시트｜프롬프트｜권리 로그｜사람 수정 기록 순서로 만들어 줘.",
      output: "재생 확인된 MP4와 자막·프롬프트·권리 기록 묶음",
      check: "내보낸 파일을 다시 열었고 무료 플랜 범위를 추측하지 않았는가?", fallback: "프로젝트 화면 캡처·검수 대본·타임라인 HTML로 제출합니다.",
    },
  ];
}

function detailedMarkdown(roleKey, day, tasks) {
  const role = roles[roleKey];
  const title = day === "M06-D01" ? "이미지→캐릭터 시트→Flow·Veo 3.1 제작 실습" : "Flow 클립→Vrew 최종 편집 실습";
  const sections = tasks.flatMap((task, index) => [
    `## 실습 ${index + 1}. ${task.name}`, "",
    `- 권장 시간: ${task.minutes}분`, `- 준비: ${task.prep}`, `- 완료 결과: ${task.output}`, "",
    "### 초보자 화면 행동", "",
    ...task.actions.map((action, actionIndex) => `${actionIndex + 1}. ${action}`),
    `${task.actions.length + 1}. 첫 결과를 저장하고 원본·기준표와 대조해 오류 한 개만 수정합니다.`,
    `${task.actions.length + 2}. 개인 Notion에 입력 요약·첫 결과·수정 이유·최종 캡처·파일 링크만 남깁니다.`, "",
    "### 복사해서 쓰는 프롬프트", "", "```text", task.prompt, "```", "",
    "### 완료 확인", "", `- [ ] ${task.check}`, `- [ ] 완료 결과를 다시 열 수 있음: **${task.output}**`, "- [ ] 실제 개인정보·내부자료·권리 불명 자료·API 키가 없음", "",
    "### 막힐 때", "", task.fallback, "",
  ]);
  return lines([
    `# [${day}] ${role.label} ${title}`, "", `기준일: ${AS_OF}`, "",
    day === "M06-D01"
      ? "> 필수 제작 흐름 보강. ChatGPT Images 2.0 또는 Flow·Nano Banana Pro로 기준 이미지를 만들고, 캐릭터 시트·Ingredients/Frames를 거쳐 Flow의 현재 Veo 3.1 계열로 장면별 클립을 생성합니다."
      : "> 운영 업데이트. Flow 클립의 최종 편집·자동 자막·음량·내보내기를 Vrew에서 완료합니다. 계정·지역별 제공 범위는 수업 당일 공식 화면에서 확인합니다.",
    "", "## 최신 확인 카드", "",
    day === "M06-D01"
      ? "- ChatGPT 제품명: ChatGPT Images 2.0 / API 모델명: `gpt-image-2`. 이 수업은 ChatGPT 화면을 사용하므로 API 키가 필요하지 않습니다."
      : "- Vrew는 영상 불러오기→자동 전사/자막→텍스트 기반 편집→내보내기 흐름을 사용합니다. 무료 플랜의 현재 표시 범위만 사용합니다.",
    day === "M06-D01"
      ? "- Flow 이미지: Nano Banana Pro가 기본으로 보일 수 있으나 실제 선택 모델을 확인합니다. Flow 영상: 현재 Veo 3.1 계열의 지원 길이·비율·Ingredients/Frames 범위를 확인합니다."
      : "- Vrew는 영상 불러오기→자동 자막→텍스트 기반 편집→내보내기 순서로 사용합니다.",
    "- 화면에 기능이 없거나 크레딧이 부족하면 HTML 예시·캐릭터 시트·스토리보드·타임라인으로 같은 완료 상태를 만듭니다.",
    "", "## 공통 안전선", "",
    "- 실존 인물은 본인 또는 명시적 동의가 있을 때만 사용하며 기본 실습은 가상 인물입니다.",
    "- 실제 회사·기관·고객 정보, 성과 수치, 로고, 자격증명, API 키를 넣지 않습니다.",
    "- AI 결과의 얼굴·손·텍스트·제품 수·장면 연결을 사람이 확인합니다.",
    "- 생성 결과를 실제 사건·제품 성능·착용감·업무 완료의 증거로 사용하지 않습니다.",
    "", ...sections,
    "## 전체 완료표", "", "| 순서 | 실습 | 시간 | 완료 결과 | 완료 |", "|---:|---|---:|---|:---:|",
    ...tasks.map((task, index) => `| ${index + 1} | ${task.name} | ${task.minutes}분 | ${task.output} | □ |`), "",
  ]);
}

function pipelineHtml(roleKey) {
  const role = roles[roleKey];
  const stages = [
    ["1", "브리프", "목적·대상·9:16·권리"], ["2", "캐릭터 시트", `${role.characterId} 고정`],
    ["3", "이미지 프롬프트", "고정·가변·금지 분리"], ["4A", "ChatGPT Images 2.0", "기준 이미지·수정 1회"],
    ["4B", "Flow·Nano Banana Pro", "동일 입력 비교"], ["5", "3장면 샷 리스트", "행동 1·카메라 1"],
    ["6", "Flow·Veo 3.1", "Ingredients/Frames·클립 3개"], ["7", "Vrew 인계", "선택본·권리·오류표"],
  ];
  const cards = stages.map(([n, title, text]) => `<article><span>${n}</span><h2>${escapeHtml(title)}</h2><p>${escapeHtml(text)}</p></article>`).join("");
  return `<!doctype html><html lang="ko"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>${escapeHtml(role.label)} 이미지→영상 제작 파이프라인</title><style>
  :root{font-family:Arial,'Noto Sans KR',sans-serif;--a:${role.accent};--d:${role.dark};--s:${role.soft};color:#13213c;background:#edf3f9}*{box-sizing:border-box}body{margin:0}.page{height:900px;padding:28px 48px;display:grid;grid-template-rows:150px 1fr 126px;gap:18px}header{background:var(--d);color:white;border-radius:28px;padding:26px 34px;display:flex;justify-content:space-between;align-items:center}.eyebrow{font-weight:900;letter-spacing:.08em;color:#d9e7ff}.title{font-size:35px;margin:8px 0}.case{font-size:16px;color:#d9e7ff}.badge{background:white;color:var(--d);padding:13px 18px;border-radius:999px;font-weight:900}.grid{display:grid;grid-template-columns:repeat(4,1fr);grid-template-rows:repeat(2,1fr);gap:14px}article{background:white;border:2px solid #cfdbeb;border-top:7px solid var(--a);border-radius:22px;padding:20px;position:relative}article span{display:inline-grid;place-items:center;width:42px;height:42px;border-radius:50%;background:var(--s);color:var(--d);font-weight:900}h2{font-size:21px;margin:22px 0 12px;color:#0b1f44}article p{color:var(--a);font-weight:800;line-height:1.45}.handoff{background:white;border:2px solid #cfdbeb;border-radius:22px;padding:18px 24px;display:grid;grid-template-columns:1fr 1fr 1fr;gap:18px}.item{border-left:5px solid var(--a);padding-left:14px}.item b{display:block;color:var(--d);margin-bottom:6px}.item small{color:#52627a}@media(max-width:760px){.page{height:auto;padding:14px;grid-template-rows:auto auto auto}header{align-items:flex-start;flex-direction:column;gap:14px}.title{font-size:27px}.grid{grid-template-columns:1fr;grid-template-rows:none}.handoff{grid-template-columns:1fr}}
  </style></head><body data-media-ready="true"><main class="page"><header><div><div class="eyebrow">M06-D01 · PRODUCTION PIPELINE</div><h1 class="title">이미지 한 장을 일관된 영상으로</h1><div class="case">${escapeHtml(role.caseTitle)}</div></div><div class="badge">${escapeHtml(role.course)} · ${AS_OF}</div></header><section class="grid">${cards}</section><footer class="handoff"><div class="item"><b>고정</b><small>얼굴·머리·의상·제품·공간</small></div><div class="item"><b>장면별 변경</b><small>행동·표정·카메라 최대 2개</small></div><div class="item"><b>완료</b><small>클립 3개·오류표·Vrew 인계 폴더</small></div></footer></main><script>document.documentElement.dataset.mediaReady='true'</script></body></html>`;
}

function characterHtml(roleKey) {
  const role = roles[roleKey];
  const isBackoffice = roleKey === "backoffice";
  const poses = ["정면", "좌측 3/4", "우측 3/4", "전신"];
  const figures = poses.map((pose, index) => `<div class="pose"><div class="figure f${index}"><div class="hair"></div><div class="head"><i></i><i></i><b></b></div><div class="neck"></div><div class="body"><span></span></div></div><strong>${pose}</strong></div>`).join("");
  return `<!doctype html><html lang="ko"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>${escapeHtml(role.characterName)} 캐릭터 시트</title><style>
  :root{font-family:Arial,'Noto Sans KR',sans-serif;--a:${role.accent};--d:${role.dark};--s:${role.soft};--hair:${isBackoffice ? "#17191f" : "#3a241f"};--shirt:${isBackoffice ? "#17345f" : "#f4e8d9"};--accent:${isBackoffice ? "#f0802b" : "#ef806a"};background:#eef3f9;color:#14233d}*{box-sizing:border-box}body{margin:0}.page{height:900px;padding:28px 46px;display:grid;grid-template-rows:138px 1fr 170px;gap:18px}header{background:var(--d);color:#fff;border-radius:28px;padding:24px 30px;display:flex;justify-content:space-between;align-items:center}h1{font-size:34px;margin:6px 0}.id{background:#fff;color:var(--d);border-radius:999px;padding:12px 18px;font-weight:900}.sheet{background:#fff;border:2px solid #d1ddec;border-radius:26px;padding:22px;display:grid;grid-template-columns:repeat(4,1fr);gap:14px}.pose{display:grid;place-items:center;background:#f6f8fb;border-radius:20px;padding:14px}.pose strong{color:var(--d);margin-top:8px}.figure{height:300px;width:190px;position:relative;display:flex;flex-direction:column;align-items:center}.head{margin-top:28px;width:92px;height:112px;background:#e7bd9b;border-radius:45% 45% 48% 48%;position:relative;z-index:2}.head:before{content:'';position:absolute;left:8px;right:8px;top:0;height:28px;background:var(--hair);border-radius:60% 60% 32% 32%}.head i{position:absolute;top:52px;width:8px;height:5px;border-radius:50%;background:#25304a}.head i:first-child{left:24px}.head i:nth-child(2){right:24px}.head b{position:absolute;bottom:24px;left:38px;width:18px;height:7px;border-bottom:3px solid #934e4b;border-radius:50%}.hair{position:absolute;top:12px;width:${isBackoffice ? "100px" : "118px"};height:${isBackoffice ? "60px" : "135px"};background:var(--hair);border-radius:55% 55% 36% 36%;z-index:1;${isBackoffice ? "" : "box-shadow:-18px 62px 0 -7px var(--hair),18px 62px 0 -7px var(--hair);"}}.neck{width:28px;height:22px;background:#e7bd9b;z-index:2}.body{width:150px;height:145px;background:var(--shirt);border-radius:38px 38px 12px 12px;position:relative;z-index:2}.body:after{content:'';position:absolute;inset:18px 38px;background:var(--accent);border-radius:12px;opacity:${isBackoffice ? ".95" : ".85"}}.body span{position:absolute;z-index:2;width:22px;height:22px;border-radius:50%;background:#fff;left:64px;top:54px}.f1 .head{transform:translateX(-7px) rotate(-2deg)}.f1 .head i:first-child{left:19px}.f1 .head i:nth-child(2){right:29px}.f2 .head{transform:translateX(7px) rotate(2deg)}.f2 .head i:first-child{left:29px}.f2 .head i:nth-child(2){right:19px}.f3 .body{height:165px}.specs{display:grid;grid-template-columns:1.4fr 1fr 1fr;gap:14px}.box{background:#fff;border:2px solid #d1ddec;border-radius:20px;padding:17px 20px;border-top:6px solid var(--a)}.box b{display:block;color:var(--d);margin-bottom:7px}.box span{font-size:14px;line-height:1.45;color:#52627a}.palette i{display:inline-block;width:28px;height:28px;border-radius:50%;margin:8px 7px 0 0;border:2px solid #fff;box-shadow:0 0 0 1px #bdc9d8}.palette i:nth-child(2){background:var(--hair)}.palette i:nth-child(3){background:#e7bd9b}.palette i:nth-child(4){background:var(--shirt)}.palette i:nth-child(5){background:var(--accent)}@media(max-width:760px){.page{height:auto;padding:12px;grid-template-rows:auto auto auto}header{flex-direction:column;align-items:flex-start}.sheet{grid-template-columns:1fr}.specs{grid-template-columns:1fr}}
  </style></head><body data-media-ready="true"><main class="page"><header><div><div>CHARACTER CONSISTENCY SHEET · M06-D01</div><h1>${escapeHtml(role.characterName)}</h1></div><div class="id">${escapeHtml(role.characterId)}</div></header><section class="sheet">${figures}</section><footer class="specs"><div class="box"><b>항상 고정</b><span>${escapeHtml(role.characterFixed)}</span></div><div class="box"><b>장면별 변경 가능</b><span>${escapeHtml(role.characterVariable)}</span></div><div class="box palette"><b>색상 기준</b><i></i><i></i><i></i><i></i></div></footer></main><script>document.documentElement.dataset.mediaReady='true'</script></body></html>`;
}

function vrewHtml(roleKey) {
  const role = roles[roleKey];
  return `<!doctype html><html lang="ko"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>${escapeHtml(role.label)} Vrew 편집 타임라인</title><style>
  :root{font-family:Arial,'Noto Sans KR',sans-serif;--a:${role.accent};--d:${role.dark};--s:${role.soft};background:#eef3f9;color:#13213c}*{box-sizing:border-box}body{margin:0}.page{height:900px;padding:24px 42px;display:grid;grid-template-rows:126px 1fr 156px;gap:16px}header{background:var(--d);color:#fff;border-radius:26px;padding:22px 28px;display:flex;justify-content:space-between;align-items:center}h1{font-size:32px;margin:6px 0}.badge{background:#fff;color:var(--d);border-radius:999px;padding:11px 16px;font-weight:900}.work{display:grid;grid-template-columns:420px 1fr;gap:16px}.preview{background:#101827;border-radius:24px;padding:18px;display:grid;place-items:center}.phone{height:440px;width:248px;border:8px solid #fff;border-radius:28px;background:linear-gradient(150deg,var(--a),var(--d));display:flex;flex-direction:column;justify-content:flex-end;padding:24px;color:#fff;box-shadow:0 18px 45px #0005}.phone small{background:#fff2;color:#fff;padding:7px 10px;border-radius:999px;align-self:flex-start}.phone h2{font-size:25px;line-height:1.28;margin:14px 0}.phone p{font-size:15px;margin:0}.editor{background:#fff;border:2px solid #d1ddec;border-radius:24px;padding:18px;display:grid;grid-template-rows:52px repeat(4,1fr);gap:10px}.toolbar{display:flex;gap:8px;align-items:center}.toolbar span{background:var(--s);color:var(--d);padding:8px 12px;border-radius:999px;font-weight:800;font-size:13px}.track{display:grid;grid-template-columns:100px repeat(3,1fr);gap:8px;align-items:stretch}.track b{display:grid;place-items:center;color:var(--d);background:#f3f6fa;border-radius:12px}.clip{border-radius:12px;padding:11px;background:var(--s);border-left:5px solid var(--a);font-size:13px;line-height:1.35}.caption{background:#fff4cc;border-left-color:#e0a400}.voice{background:#e9f8ef;border-left-color:#2d9d62}.music{background:#f3eaff;border-left-color:#7b4bc1}.checks{background:#fff;border:2px solid #d1ddec;border-radius:22px;padding:18px 22px;display:grid;grid-template-columns:repeat(4,1fr);gap:12px}.check{border-left:4px solid var(--a);padding-left:12px}.check b{display:block;color:var(--d);margin-bottom:7px}.check span{font-size:13px;color:#52627a}@media(max-width:760px){.page{height:auto;padding:12px;grid-template-rows:auto auto auto}header{flex-direction:column;align-items:flex-start}.work{grid-template-columns:1fr}.track{grid-template-columns:72px repeat(3,180px);overflow:auto}.checks{grid-template-columns:1fr}}
  </style></head><body data-media-ready="true"><main class="page"><header><div><div>M06-D02 · VREW FINAL EDIT</div><h1>Flow 클립을 30초 쇼츠로 완성</h1></div><div class="badge">${escapeHtml(role.course)} · ${AS_OF}</div></header><section class="work"><div class="preview"><div class="phone"><small>교육용 가상 예시</small><h2>${escapeHtml(role.caption2)}</h2><p>${escapeHtml(role.cta)}</p></div></div><div class="editor"><div class="toolbar"><span>9:16</span><span>30초</span><span>클립 3개</span><span>자막 검수</span><span>MP4</span></div><div class="track"><b>영상</b><div class="clip">01 발견<br>${escapeHtml(role.scene1)}</div><div class="clip">02 핵심<br>${escapeHtml(role.scene2)}</div><div class="clip">03 마무리<br>${escapeHtml(role.scene3)}</div></div><div class="track"><b>자막</b><div class="clip caption">${escapeHtml(role.caption1)}</div><div class="clip caption">${escapeHtml(role.caption2)}</div><div class="clip caption">${escapeHtml(role.caption3)}</div></div><div class="track"><b>음성</b><div class="clip voice">훅·0~8초</div><div class="clip voice">핵심·8~21초</div><div class="clip voice">CTA·21~30초</div></div><div class="track"><b>음악</b><div class="clip music">페이드 인</div><div class="clip music">내레이션 아래로</div><div class="clip music">페이드 아웃</div></div></div></section><footer class="checks"><div class="check"><b>텍스트 편집</b><span>오탈자·분할·침묵 삭제</span></div><div class="check"><b>화면 검수</b><span>두 줄 자막·상하 안전 여백</span></div><div class="check"><b>권리 기록</b><span>음성·음악·영상 확인일</span></div><div class="check"><b>내보내기</b><span>MP4·SRT/TXT·재생 확인</span></div></footer></main><script>document.documentElement.dataset.mediaReady='true'</script></body></html>`;
}

function writeTemplates(roleKey, day) {
  const role = roles[roleKey];
  const base = `downloads/guide-resources/${roleKey}/${day}`;
  if (day === "M06-D01") {
    write(`${base}/templates/production-brief.md`, lines([`# ${role.label} 이미지→영상 제작 브리프`, "", `- 사례: ${role.caseTitle}`, `- 대상: ${role.target}`, `- 목적: ${role.cta}`, "- 비율: 9:16", "- 장면: 3", "- 실존 인물·로고·개인정보: 사용 안 함", "- 최종 확인자:", ""]));
    write(`${base}/templates/character-sheet-template.md`, lines([`# ${role.characterName} 캐릭터 시트`, "", `- ID: ${role.characterId}`, `- 고정: ${role.characterFixed}`, `- 변경 가능: ${role.characterVariable}`, `- 고정 소품: ${role.objectFixed}`, "- 정면:", "- 좌측 3/4:", "- 우측 3/4:", "- 전신:", "- 표정 3종:", "- 금지 요소: 새 인물·실제 로고·의상/제품 색 변경", ""]));
    write(`${base}/templates/image-prompt-template.md`, lines(["# 이미지 프롬프트 템플릿", "", "[목적]", "[캐릭터 ID와 고정 요소]", "[고정 소품·배경]", "[이번 장면 행동]", "[카메라 거리·앵글]", "[조명·스타일]", "[비율]", "[금지 요소]", "[첫 결과 오류]", "[수정 프롬프트]", ""]));
    write(`${base}/templates/flow-video-prompt-template.md`, lines(["# Flow 영상 프롬프트 템플릿", "", "[사용할 Character/Ingredients/Frame]", "[시작 상태]", "[한 가지 행동]", "[카메라 움직임]", "[끝 상태]", "[항상 고정]", "[금지 요소]", "[실제 표시 모델·길이·비율]", ""]));
    write(`${base}/templates/continuity-checklist.md`, lines([`# ${role.label} 장면 일관성 체크`, "", "| 장면 | 얼굴 | 머리 | 의상 | 소품 수·색 | 배경 | 손 | 카메라 | 텍스트 | 수정 |", "|---|:---:|:---:|:---:|:---:|:---:|:---:|:---:|:---:|---|", "| 01 |  |  |  |  |  |  |  |  |  |", "| 02 |  |  |  |  |  |  |  |  |  |", "| 03 |  |  |  |  |  |  |  |  |  |", ""]));
    write(`${base}/templates/scene-shot-list.csv`, csv([
      ["scene", "story", "start_state", "single_action", "camera", "end_state", "locked_elements", "risk", "selected_file"],
      ["01", role.scene1, "", "", "", "", `${role.characterId}; ${role.objectFixed}`, "", ""],
      ["02", role.scene2, "", "", "", "", `${role.characterId}; ${role.objectFixed}`, "", ""],
      ["03", role.scene3, "", "", "", "", `${role.characterId}; ${role.objectFixed}`, "", ""],
    ]));
    write(`${base}/templates/asset-naming.csv`, csv([
      ["asset_id", "type", "filename", "use", "rights", "status"],
      [role.characterId, "character", `${roleKey}_character_sheet_v01.png`, "all scenes", "training synthetic", "ready"],
      ["OBJECT-01", "object", `${roleKey}_object_v01.png`, "all scenes", "training synthetic", "ready"],
      ["SCENE-01", "video", `${roleKey}_scene01_v01_selected.mp4`, "Vrew handoff", "AI-generated training example", "check"],
    ]));
  } else {
    write(`${base}/templates/handoff-checklist.md`, lines([`# ${role.label} Flow→Vrew 인계`, "", "| 장면 | 파일명 | 길이 | 비율 | 음성 | 권리 | 선택본 |", "|---|---|---:|---|---|---|:---:|", "| 01 |  |  |  |  |  |  |", "| 02 |  |  |  |  |  |  |", "| 03 |  |  |  |  |  |  |", ""]));
    write(`${base}/templates/shorts-script-template.md`, lines([`# ${role.label} 30초 쇼츠 대본`, "", "| 구간 | 장면 | 화면 행동 | 내레이션 | 자막 | 근거/확인 |", "|---|---|---|---|---|---|", `| 0~8초 | 01 | ${role.scene1} |  | ${role.caption1} |  |`, `| 8~21초 | 02 | ${role.scene2} |  | ${role.caption2} |  |`, `| 21~30초 | 03 | ${role.scene3} |  | ${role.caption3} |  |`, ""]));
    write(`${base}/templates/vrew-edit-plan.csv`, csv([
      ["track", "scene_01", "scene_02", "scene_03", "check"],
      ["video", role.scene1, role.scene2, role.scene3, "order/trim"],
      ["caption", role.caption1, role.caption2, role.caption3, "spelling/two lines"],
      ["voice", "hook", "core", "CTA", "timing/rights"],
      ["music", "fade in", "lower under voice", "fade out", "source/rights"],
    ]));
    write(`${base}/templates/caption-checklist.md`, lines([`# ${role.label} Vrew 자막 검수`, "", "- [ ] 자동 인식 언어 확인", "- [ ] 고유명사·숫자·띄어쓰기 원문 대조", "- [ ] 한 자막 두 줄 이하", "- [ ] 얼굴·제품·CTA를 가리지 않음", "- [ ] 상하 플랫폼 UI 예상 영역 회피", "- [ ] 소리 없이도 핵심 이해", ""]));
    write(`${base}/templates/audio-rights-log.csv`, csv([
      ["asset", "source", "plan_or_license_seen", "checked_at", "allowed_use", "credit", "final_use"],
      ["narration", "self-recorded or displayed Vrew voice", "", AS_OF, "training output", "", ""],
      ["music", "displayed free asset or instructor-provided", "", AS_OF, "verify before publishing", "", ""],
    ]));
    write(`${base}/templates/export-checklist.md`, lines([`# ${role.label} Vrew 내보내기 체크`, "", "- [ ] 9:16", "- [ ] 30초 안팎", "- [ ] MP4 다시 재생", "- [ ] 화면·음성·음악·자막 정상", "- [ ] SRT 또는 검수 대본 보관", "- [ ] 캐릭터 시트·프롬프트·권리 로그 함께 보관", "- [ ] 무료 플랜에서 실제 표시된 내보내기 규격 기록", ""]));
  }
}

function learnerBlock(roleKey, day, paths) {
  const role = roles[roleKey];
  const isD01 = day === "M06-D01";
  const markers = isD01 ? MARKERS.learnerD01 : MARKERS.learnerD02;
  return lines([
    markers[0], "", `### 7-Y. ${isD01 ? "이미지→캐릭터 시트→Flow·Veo 3.1" : "Flow 클립→Vrew 최종 편집"} · 필수 실습`, "",
    isD01
      ? `> **제작 흐름 업데이트 · ${AS_OF}** — ChatGPT Images 2.0 또는 Flow·Nano Banana Pro로 기준 이미지를 만들고, ${role.characterName} 시트와 참조 자산을 이용해 Flow의 현재 Veo 3.1 계열로 3개 클립을 만듭니다.`
      : `> **운영 업데이트 · ${AS_OF}** — Vrew의 계정·지역별 제공 범위를 공식 화면에서 확인하고, Flow 클립의 최종 편집·자동 자막·음량·내보내기를 Vrew에서 완료합니다.`,
    "", `![${role.label} ${isD01 ? "이미지 영상 제작 파이프라인" : "Vrew 편집 타임라인"}](${BASE}${paths.image})`,
    ...(isD01 ? ["", `![${role.characterName} 캐릭터 시트 예시](${BASE}${paths.characterImage})`] : []),
    "", `- [초보자용 전체 실습팩](${RESOURCE_BASE}${paths.markdown})`, `- [한 화면 결과 예시](${RESOURCE_BASE}${paths.html})`,
    ...(isD01 ? [`- [캐릭터 시트 HTML 예시](${RESOURCE_BASE}${paths.characterHtml})`] : []),
    "", isD01 ? "필수 완료: 캐릭터 시트｜장면 이미지 3개｜클립 3개｜일관성 오류표｜Vrew 인계 폴더" : "필수 완료: 9:16 Vrew 프로젝트｜검수 자막｜음성·음악 권리 기록｜재생 확인 MP4｜SRT 또는 검수 대본",
    "", "- 기능·모델·무료 범위는 현재 화면에 실제 표시된 내용만 기록합니다.", "- 개인 Notion에는 입력 요약·첫 결과·수정 이유·최종 캡처·파일 링크만 남깁니다.", "", markers[1],
  ]);
}

function instructorBlock(roleKey, day, paths, tasks) {
  const role = roles[roleKey];
  const isD01 = day === "M06-D01";
  const markers = isD01 ? MARKERS.instructorD01 : MARKERS.instructorD02;
  return lines([
    markers[0], "", `### 5-Y. ${isD01 ? "이미지→Flow·Veo 3.1 제작" : "Vrew 최종 편집"} · 강사 운영팩`, "",
    isD01
      ? `> **필수 제작 흐름 · ${AS_OF}** — ${role.caseTitle} 사례로 브리프→캐릭터 시트→두 이미지 경로 비교→3장면→Veo 3.1 클립→Vrew 인계를 운영합니다.`
      : `> **운영 변경 · ${AS_OF}** — Vrew에서 자동 자막을 검수하고 장면 길이와 음량을 조정해 최종 쇼츠를 완성합니다.`,
    "", `![${role.label} ${isD01 ? "제작 파이프라인" : "Vrew 편집 타임라인"}](${BASE}${paths.image})`,
    ...(isD01 ? ["", `![${role.characterName} 캐릭터 시트](${BASE}${paths.characterImage})`] : []),
    "", `- [강사가 그대로 따라 하는 상세 실습팩](${RESOURCE_BASE}${paths.markdown})`, `- [브라우저 결과 예시](${RESOURCE_BASE}${paths.html})`,
    ...(isD01 ? [`- [캐릭터 시트 결과 예시](${RESOURCE_BASE}${paths.characterHtml})`] : []),
    "", "#### 시작 전 확인", "", "- [ ] 수업 계정·지역에서 실제 표시되는 모델·기능·크레딧 확인", "- [ ] 가상 인물·가상 제품·권리 확인 자산만 준비", "- [ ] 생성 불가 학습자용 HTML·CSV·Markdown 대체 실습 열기", "- [ ] 강사 생성 결과를 정답으로 강요하지 않고 동일 루브릭으로 평가", "",
    "#### 권장 시간", "", "| 실습 | 시간 | 완료 결과 |", "|---|---:|---|", ...tasks.map((task) => `| ${task.name} | ${task.minutes}분 | ${task.output} |`), "",
    "강의 팁:", "", isD01 ? "> 캐릭터 일관성은 ‘멋진 프롬프트’보다 고정 요소를 반복하고 장면마다 바꾸는 요소를 줄이는 훈련으로 설명합니다. 한 번에 세 장면을 생성하지 말고 한 장면씩 검수합니다." : "> Vrew에서는 자동 자막을 만드는 속도보다 잘못 인식된 한 단어를 원문으로 고치는 시연이 중요합니다. 내보내기 전에 소리 켬·끔 두 번 재생합니다.", "", markers[1],
  ]);
}

function pathsFor(roleKey, day) {
  const base = `downloads/guide-resources/${roleKey}/${day}`;
  if (day === "M06-D01") return {
    markdown: `${base}/supplements/m06-d01-${roleKey}-image-to-video-pipeline.md`,
    html: `${base}/examples/m06-d01-${roleKey}-production-pipeline.html`,
    characterHtml: `${base}/examples/m06-d01-${roleKey}-character-sheet.html`,
    image: `assets/guide-images/${roleKey}/M06-D01/image-to-video-pipeline-20260808.png`,
    characterImage: `assets/guide-images/${roleKey}/M06-D01/character-sheet-example-20260808.png`,
  };
  return {
    markdown: `${base}/supplements/m06-d02-${roleKey}-vrew-editing-practice.md`,
    html: `${base}/examples/m06-d02-${roleKey}-vrew-edit-timeline.html`,
    image: `assets/guide-images/${roleKey}/M06-D02/vrew-edit-timeline-20260808.png`,
  };
}

function updateReadme(roleKey, day, paths) {
  const readme = path.join(ROOT, "downloads", "guide-resources", roleKey, day, "README.md");
  const current = fs.readFileSync(readme, "utf8");
  const role = roles[roleKey];
  const block = lines([
    MARKERS.readme[0], "", `## ${AS_OF} 이미지·영상·Vrew 상세 제작팩`, "",
    `- 상세 절차: [${path.basename(paths.markdown)}](${path.relative(path.dirname(readme), path.join(ROOT, paths.markdown)).replaceAll("\\", "/")})`,
    `- HTML 예시: [${path.basename(paths.html)}](${path.relative(path.dirname(readme), path.join(ROOT, paths.html)).replaceAll("\\", "/")})`,
    ...(day === "M06-D01" ? [`- 캐릭터 시트: [${path.basename(paths.characterHtml)}](${path.relative(path.dirname(readme), path.join(ROOT, paths.characterHtml)).replaceAll("\\", "/")})`] : []),
    `- 과정: ${role.label}`, "- API 키: 필요 없음", "", MARKERS.readme[1],
  ]);
  fs.writeFileSync(readme, replaceOrInsert(current, MARKERS.readme, block, "\n## "), "utf8");
}

function modernizeD02(text) {
  return text
    .replaceAll("Vrew 중심 제작 흐름과 Suno 음악 역할", "Vrew 중심 제작 흐름·Suno 음악 역할")
    .replaceAll("Vrew·Suno의 역할", "Vrew 중심 제작 흐름·Suno 음악 역할")
    .replaceAll("Vrew에서 영상·이미지·음악·자막·전환·음량을 조정해 쇼츠 완성, 권리 조건 기록", "Vrew에서 Flow 영상·이미지·음악·자막·장면 길이·음량을 조정해 쇼츠 완성, 권리 조건 기록")
    .replaceAll("Vrew 자동 자막은 Web·Desktop·Mobile에서 가능하나 세부 기능은 다름", "Vrew는 영상 불러오기·자동 자막·텍스트 기반 편집·내보내기 흐름을 제공")
    .replaceAll("- Vrew\n", "- Vrew: 자동 자막·텍스트 기반 편집·최종 내보내기에 사용\n");
}

const audit = [];
for (const roleKey of Object.keys(roles)) {
  for (const day of ["M06-D01", "M06-D02"]) {
    const role = roles[roleKey];
    const tasks = day === "M06-D01" ? d01Tasks(role) : d02Tasks(role);
    const paths = pathsFor(roleKey, day);
    write(paths.markdown, detailedMarkdown(roleKey, day, tasks));
    write(paths.html, day === "M06-D01" ? pipelineHtml(roleKey) : vrewHtml(roleKey));
    if (day === "M06-D01") write(paths.characterHtml, characterHtml(roleKey));
    writeTemplates(roleKey, day);
    updateReadme(roleKey, day, paths);

    const learnerPath = path.join(ROOT, "guides", "notion", roleKey, "learner", `${day}.md`);
    const instructorPath = path.join(ROOT, "guides", "notion", roleKey, "instructor", `${day}.md`);
    let learner = fs.readFileSync(learnerPath, "utf8");
    let instructor = fs.readFileSync(instructorPath, "utf8");
    if (day === "M06-D02") {
      learner = modernizeD02(learner);
      instructor = modernizeD02(instructor);
    }
    learner = replaceOrInsert(learner, day === "M06-D01" ? MARKERS.learnerD01 : MARKERS.learnerD02, learnerBlock(roleKey, day, paths), "## 8.");
    instructor = replaceOrInsert(instructor, day === "M06-D01" ? MARKERS.instructorD01 : MARKERS.instructorD02, instructorBlock(roleKey, day, paths, tasks), "## 6.");
    fs.writeFileSync(learnerPath, learner.trimEnd() + "\n", "utf8");
    fs.writeFileSync(instructorPath, instructor.trimEnd() + "\n", "utf8");

    if (day === "M06-D02") {
      const resourceRoot = path.join(ROOT, "downloads", "guide-resources", roleKey, day);
      for (const file of fs.readdirSync(path.join(resourceRoot, "solutions"))) {
        const absolute = path.join(resourceRoot, "solutions", file);
        if (fs.statSync(absolute).isFile() && /\.(md|html)$/i.test(file)) fs.writeFileSync(absolute, modernizeD02(fs.readFileSync(absolute, "utf8")), "utf8");
      }
      const starter = path.join(resourceRoot, "starter", `m06-d02-${roleKey}-starter.md`);
      fs.writeFileSync(starter, modernizeD02(fs.readFileSync(starter, "utf8")), "utf8");
    }
    audit.push({ role: role.label, day, tasks: tasks.length, minutes: tasks.reduce((sum, task) => sum + task.minutes, 0) });
  }
}

for (const reviewName of ["M06-D02-image-plan.md", "M06-D02-resource-plan.md", "M06-D02-review.md"]) {
  const reviewPath = path.join(ROOT, "guides", "notion", "reviews", reviewName);
  fs.writeFileSync(reviewPath, modernizeD02(fs.readFileSync(reviewPath, "utf8")), "utf8");
}

write("downloads/guide-resources/m06-image-video-vrew-pipeline-audit-2026-08-08.md", lines([
  "# M06 이미지→Flow·Veo 3.1→Vrew 상세 실습 감사표", "", `기준일: ${AS_OF}`, "",
  "- 최종 Excel의 M06-D01 이미지·Flow 영상과 M06-D02 Vrew·Suno 역할 구조를 유지합니다.",
  "- 최종 편집 도구는 Vrew로 통일하고 자동 자막·텍스트 기반 편집·내보내기 흐름을 사용합니다.",
  "- ChatGPT Images 2.0은 ChatGPT 화면에서 사용하므로 API 키가 필요하지 않습니다.",
  "- 실제 이미지·영상 생성은 계정·지역·크레딧이 준비된 수업 시간에 수행하며 저장소에는 키를 기록하지 않습니다.",
  "", "| 과정 | 일자 | 세부 실습 | 권장 실습 시간 |", "|---|---|---:|---:|",
  ...audit.map((row) => `| ${row.role} | ${row.day} | ${row.tasks}개 | ${row.minutes}분 |`), "",
  "## 공식 확인", "",
  "- OpenAI: https://openai.com/index/introducing-chatgpt-images-2-0/",
  "- Google Flow 모델: https://support.google.com/flow/answer/16352836?hl=en",
  "- Google Flow 생성: https://support.google.com/flow/answer/16353334?co=GENIE.Platform%3DDesktop&hl=en",
  "- Google Flow 자산·캐릭터: https://support.google.com/flow/answer/16935308?hl=en",
  "- Vrew 텍스트 기반 편집: https://usertest.vrew.ai/en/feature/text-based-video-editing/", "",
]));

console.log(JSON.stringify({ asOf: AS_OF, guidePairs: audit.length, detailedTasks: audit.reduce((sum, row) => sum + row.tasks, 0), htmlExamples: 6, pngTargets: 6, apiKeyRequired: false }, null, 2));
