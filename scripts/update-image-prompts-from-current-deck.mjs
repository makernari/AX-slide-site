import crypto from "node:crypto";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const MANIFEST_REL = "data/slide-manifest.json";
const STYLE_REL = "docs/design/image_style_guide.md";
const MANIFEST_PATH = path.join(ROOT, MANIFEST_REL);
const STYLE_PATH = path.join(ROOT, STYLE_REL);
const AS_OF = "2026-08-09";
const MODULES = ["M05", "M06", "M07", "M08", "M09"];
const COURSES = ["COMMON", "BACKOFFICE", "MARKETING"];

const COURSE_META = {
  COMMON: {
    label: "공통",
    course: "두 과정 공통",
    palette: "Porcelain #F6F7F9, Graphite #151A23, Electric Cobalt #4C6FFF, Digital Teal #14A89A",
    emphasis: "과정 중립적인 구조와 사람의 검증 지점을 명확히 보여 준다.",
    forbidden: "경영지원 전용 업무 사례와 마케팅 전용 브랜드 사례를 섞지 않는다.",
  },
  BACKOFFICE: {
    label: "경영지원",
    course: "AI 활용 스마트 경영지원 전문강사 양성과정",
    palette: "Porcelain #F6F7F9, Graphite #151A23, Cobalt #345CFF, Digital Teal #14A89A, Ice Blue #EAF0FF",
    emphasis: "업무 책임, 기한, 수치, 규정, 승인과 사람의 최종 검증을 안정적인 구조로 표현한다.",
    forbidden: "Coral·Violet·Hot Pink 중심의 캠페인 장식과 마케팅 사례를 사용하지 않는다.",
  },
  MARKETING: {
    label: "마케팅",
    course: "AI 활용 마케팅·SNS 콘텐츠 기획·브랜딩 전문강사 양성과정",
    palette: "Porcelain #F6F7F9, Graphite #201D2C, Coral #E6614F, Violet #7357C8, Soft Peach #FCEAE6",
    emphasis: "목표, 타깃, 채널 맥락, 브랜드 사실, 저작권과 사람의 검토를 역동적이되 절제된 구조로 표현한다.",
    forbidden: "경영지원 전용 행정 문서·승인선 사례와 Cobalt 단색 업무 대시보드 구성을 사용하지 않는다.",
  },
};

const HERO_ASSETS = {
  "COMMON-M06-D01-S025": "assets/generated-heroes/M06-D01/m06-d01-character-anchor-gpt-image-2.png",
  "BACKOFFICE-M06-D01-S027": "assets/generated-heroes/M06-D01/m06-d01-backoffice-continuity-gpt-image-2.png",
  "MARKETING-M06-D01-S027": "assets/generated-heroes/M06-D01/m06-d01-marketing-continuity-gpt-image-2.png",
  "BACKOFFICE-M06-D01-S028": "assets/generated-heroes/M06-D01/m06-d01-distortion-recovery-gpt-image-2.png",
  "MARKETING-M06-D01-S028": "assets/generated-heroes/M06-D01/m06-d01-marketing-distortion-recovery-gpt-image-2.png",
  "COMMON-M08-D04-S024": "assets/generated-heroes/M08-D04/m08-d04-agent-approval-gate-gpt-image-2.png",
  "COMMON-M08-D04-S025": "assets/generated-heroes/M08-D04/m08-d04-instruction-conflict-stop-gpt-image-2.png",
  "BACKOFFICE-M08-D04-S026": "assets/generated-heroes/M08-D04/m08-d04-backoffice-email-preflight-gpt-image-2.png",
  "MARKETING-M08-D04-S026": "assets/generated-heroes/M08-D04/m08-d04-marketing-publish-preflight-gpt-image-2.png",
  "COMMON-M09-D01-S023": "assets/generated-heroes/M09-D01/m09-d01-demo-fallback-gpt-image-2.png",
  "BACKOFFICE-M09-D01-S026": "assets/generated-heroes/M09-D01/m09-d01-backoffice-mini-lesson-gpt-image-2.png",
  "MARKETING-M09-D01-S026": "assets/generated-heroes/M09-D01/m09-d01-marketing-mini-pitch-gpt-image-2.png",
};

const HERO_DIRECTIONS = {
  "COMMON-M06-D01-S025": "같은 가상 인물이 같은 의상·색·소품을 유지한 채 세 개의 서로 다른 장면 프레임에 등장한다. 인물의 얼굴과 의상, 대표 색, 손에 든 소품이 장면마다 정확히 이어지는 캐릭터 연속성 시트다.",
  "BACKOFFICE-M06-D01-S027": "비식별 가상 사무직 교육 장면을 세 프레임으로 보여 준다. 동일한 인물, 책상 방향, 업무 소품과 모니터 상태가 단계별로 자연스럽게 이어지고 실제 기관 화면은 없다.",
  "MARKETING-M06-D01-S027": "가상 생활용품 브랜드의 제품 촬영 장면을 세 프레임으로 보여 준다. 동일한 제품, 비식별 인물, 브랜드 색과 카메라 진행 방향이 일관되게 이어진다.",
  "BACKOFFICE-M06-D01-S028": "가상 업무 교육 영상의 오류 장면과 복구 장면을 나란히 보여 준다. 인물 왜곡, 배경 불일치, 동작 오류 중 한 가지씩만 고쳐지는 원인별 복구 개념을 표현한다.",
  "MARKETING-M06-D01-S028": "가상 브랜드 영상의 오류 장면과 복구 장면을 나란히 보여 준다. 제품 형태, 브랜드 색, 동작 오류 중 한 가지씩만 고쳐지는 원인별 복구 개념을 표현한다.",
  "COMMON-M08-D04-S024": "하나의 가상 AI 작업 흐름을 자료 조회, 초안 작성, 사람 승인, 실행 기록의 네 구역으로 분리한다. 사람 승인 구역 앞에서 실행이 멈춰 있는 장면을 중심으로 표현한다.",
  "COMMON-M08-D04-S025": "안전한 문서 검토 장면에서 문서 안의 의심스러운 명령과 사용자의 실제 요청이 시각적으로 분리되고, 충돌 지점에서 작업이 멈추는 모습을 표현한다.",
  "BACKOFFICE-M08-D04-S026": "가상 업무 이메일의 수신자, 본문, 첨부파일을 한 화면에서 사전 점검하고 사람 승인 전에는 발송 버튼이 잠겨 있는 안전한 시뮬레이션 장면이다.",
  "MARKETING-M08-D04-S026": "가상 SNS 콘텐츠의 채널, 카피, 소재를 한 화면에서 사전 점검하고 사람 승인 전에는 게시가 잠겨 있는 안전한 시뮬레이션 장면이다.",
  "COMMON-M09-D01-S023": "강의 시연 화면이 중단된 상황에서 강사가 준비된 화면 캡처, 말로 설명하는 보드, 대체 실습 카드로 자연스럽게 전환하는 교육 현장을 표현한다.",
  "BACKOFFICE-M09-D01-S026": "비식별 강사가 작은 교육 공간에서 한 문장 목표, 한 업무 사례, 한 확인 질문으로 3분 미니 강의를 완결하는 장면이다.",
  "MARKETING-M09-D01-S026": "비식별 발표자가 작은 피치 공간에서 한 문장 목표, 한 근거, 한 다음 행동으로 3분 미니 피치를 완결하는 장면이다.",
};

const IMPORTANT_FIELDS = [
  "course", "module", "day", "lesson", "order", "title", "purpose", "key_message",
  "required_content", "visual_type", "content_type", "image_filename", "image_status", "review_status",
];

function hashFile(filePath) {
  return crypto.createHash("sha256").update(fs.readFileSync(filePath)).digest("hex");
}

function relative(filePath) {
  return path.relative(ROOT, filePath).replaceAll("\\", "/");
}

function walk(directory) {
  if (!fs.existsSync(directory)) return [];
  return fs.readdirSync(directory, { withFileTypes: true }).flatMap((entry) => {
    const absolute = path.join(directory, entry.name);
    return entry.isDirectory() ? walk(absolute) : [absolute];
  });
}

function decodeXml(text) {
  return text
    .replace(/<[^>]+>/g, "")
    .replaceAll("&amp;", "&")
    .replaceAll("&lt;", "<")
    .replaceAll("&gt;", ">")
    .replaceAll("&quot;", '"')
    .replaceAll("&apos;", "'")
    .replace(/\s+/g, " ")
    .trim();
}

function svgDisplayText(sourcePath) {
  if (!sourcePath || !fs.existsSync(sourcePath)) return [];
  const svg = fs.readFileSync(sourcePath, "utf8");
  return [...new Set([...svg.matchAll(/<text\b[^>]*>([\s\S]*?)<\/text>/gi)]
    .map((match) => decodeXml(match[1]))
    .filter(Boolean))];
}

function requiredItems(text) {
  return String(text ?? "")
    .split(/\s*(?:\/|;)\s*/)
    .map((item) => item.trim())
    .filter(Boolean);
}

function exactText(slide, sourcePath, previous = []) {
  const fromSvg = svgDisplayText(sourcePath);
  if (fromSvg.length) return fromSvg;
  if (previous.length) return previous;
  return [slide.title, ...requiredItems(slide.required_content)];
}

function promptPath(slide) {
  return `prompts/${slide.module}/${slide.course.toLowerCase()}/${slide.id}.md`;
}

function tierTitle(title) {
  const match = /^\[([^\]]+)\]\s*/.exec(title);
  return match ? `${match[1]} 자료` : "핵심 자료";
}

function plainTitle(title) {
  return title.replace(/^\[[^\]]+\]\s*/, "");
}

function layoutKind(slide) {
  const text = `${slide.visual_type} ${slide.title}`.toLowerCase();
  for (const key of ["hero", "pipeline", "compare", "quadrant", "decision", "timeline", "ladder", "orbit", "route", "flow"]) {
    if (text.includes(key)) return key;
  }
  if (/비교|대조|두 수준/.test(text)) return "compare";
  if (/단계|흐름|순서|복구/.test(text)) return "flow";
  if (/판단|승인|중지|경계/.test(text)) return "decision";
  return "flow";
}

function layoutDescription(kind) {
  const descriptions = {
    hero: "오른쪽 60~65%에 지배적인 비식별 장면 한 개를 두고, 왼쪽에는 제목과 네 개 이하의 핵심 라벨이 올라갈 깨끗한 영역을 확보한다.",
    pipeline: "왼쪽에서 오른쪽으로 이어지는 3~5단계 제작선을 사용한다. 입력·처리·검증·완료가 한 방향으로만 읽히고 화살표를 교차시키지 않는다.",
    compare: "두 개의 큰 비교 영역을 좌우로 나누고 가운데에 비교 또는 전환을 나타내는 단일 축을 둔다. 양쪽의 크기와 시각적 무게를 동일하게 유지한다.",
    quadrant: "네 요소를 2×2 구조로 배치하고 중앙에 하나의 검증 또는 결정 지점을 둔다. 네 요소가 같은 위계로 보이게 한다.",
    decision: "왼쪽의 세 판단 신호가 오른쪽의 한 최종 결정으로 모이게 한다. 마지막 결정 영역만 포인트 색으로 강조한다.",
    timeline: "네 시점을 하나의 수평 시간축 위에 배치한다. 앞뒤 관계가 명확하고 되돌림·교차 화살표는 사용하지 않는다.",
    ladder: "네 기준을 아래에서 위로 높아지는 계단 구조로 배치한다. 마지막 기준만 가장 강하게 강조한다.",
    orbit: "네 주변 요소가 중앙의 한 핵심 기준으로 모이는 구조를 사용한다. 장식용 원형 배경 대신 연결 관계가 분명한 얇은 선을 사용한다.",
    route: "상단의 한 출발 기준에서 아래의 세 대체 경로로 분기한다. 각 경로의 종료 상태가 명확하고 다시 합쳐지는 복잡한 선은 사용하지 않는다.",
    flow: "네 요소를 하나의 수평 흐름으로 배치한다. 각 노드는 같은 크기로 시작하되 마지막 검증·완료 노드만 제한적으로 강조한다.",
  };
  return descriptions[kind] ?? descriptions.flow;
}

function productionMode(slide, sourceSvg) {
  if (HERO_ASSETS[slide.id]) return "hybrid-gpt-image-2-hero";
  if (sourceSvg) return "hybrid-svg";
  return "gpt-image-2-full-slide";
}

function displayList(items) {
  return items.map((item, index) => `${index + 1}) ${item}`).join("\n");
}

function contentSpecificIcons(slide) {
  const text = `${slide.title} ${slide.required_content}`;
  const icons = [];
  if (/승인|검증|확인|검토|대조/.test(text)) icons.push("확인 체크, 돋보기, 승인 게이트");
  if (/문서|자료|메일|보고|기록/.test(text)) icons.push("문서 면, 파일 탭, 기록 로그");
  if (/영상|장면|카메라|콘텐츠|게시/.test(text)) icons.push("프레임, 타임라인, 재생 또는 게시 상태");
  if (/데이터|수치|분석|성과/.test(text)) icons.push("데이터 점, 간결한 축, 비교 막대");
  if (/사람|담당|강의|청중/.test(text)) icons.push("비식별 사람 실루엣, 역할 표식");
  if (/오류|중지|경계|금지|권한/.test(text)) icons.push("중지선, 방패, 잠금 상태");
  return (icons.length ? icons : ["문서, 연결 노드, 확인 체크"])
    .slice(0, 3)
    .join("; ");
}

function fullSlidePrompt(slide, displayText, mode, sourceSvg) {
  const meta = COURSE_META[slide.course];
  const kind = layoutKind(slide);
  const exact = displayList(displayText);
  const sourceNote = sourceSvg ? `현재 승인된 구조 참조: ${relative(sourceSvg)}.` : "";
  return [
    "2048×1152px, 정확한 16:9 비율의 한국어 기업 교육용 인포그래픽 한 장을 제작한다.",
    `슬라이드 목적: ${slide.purpose}`,
    `핵심 메시지: ${slide.key_message}`,
    `과정 맥락: ${meta.course}. ${meta.emphasis}`,
    `승인된 시각 형식: ${slide.visual_type}. ${layoutDescription(kind)}`,
    sourceNote,
    "",
    "화면에 표시할 텍스트는 아래 목록이 전부다. 글자·띄어쓰기·문장부호·영문 대소문자를 그대로 유지하고 임의 문구를 추가하지 않는다.",
    exact,
    "",
    `색상: ${meta.palette}.`,
    `아이콘과 도형: ${contentSpecificIcons(slide)}. 한 화면에서는 같은 선 굵기와 같은 시점의 기하학적 2D 스타일로 통일한다.`,
    "12열 그리드, 큰 제목, 넓은 여백, 1px Hairline을 사용한다. 제목은 64~80px 상당, 핵심 라벨은 30~36px 상당, 모든 한글은 최소 26px 상당으로 선명하게 표현한다.",
    "좌우 96px, 위 72px, 아래 64px 이상의 안전 여백을 둔다. 핵심 메시지는 화면에 긴 문장으로 반복하지 말고 정보의 순서·크기·연결 관계로 전달한다.",
    `제작 모드: ${mode}. 최종 파일명은 ${slide.image_filename}이며 파일명과 슬라이드 ID는 화면에 표시하지 않는다.`,
    "",
    `제외 요소: ${meta.forbidden} 실제 서비스·기관·업체·브랜드 로고, 실제 제품 UI 복제, 실제 개인정보·내부자료, 외부 링크, URL, QR 코드, 워터마크, 강사용 메모, 발표자 노트, 워크북 입력란, 예제 파일, 결과물 답안, 과도한 3D·네온·유리 질감·강한 그라데이션, 스톡사진식 포즈, 범용 기업교육 PPT 템플릿, 지정 문구 이외의 텍스트를 넣지 않는다.`,
  ].filter(Boolean).join("\n");
}

function heroPrompt(slide) {
  const meta = COURSE_META[slide.course];
  return [
    "정확한 16:9 비율의 한국어 강의교안용 텍스트 없는 hero 이미지를 제작한다.",
    HERO_DIRECTIONS[slide.id],
    `핵심 메시지의 시각적 방향: ${slide.key_message}`,
    `색상과 분위기: ${meta.palette}. 세련되고 프로페셔널한 에디토리얼 교육 비주얼, 실제 인물이나 기관을 특정할 수 없는 가상 장면, 자연스러운 깊이와 절제된 조명.`,
    "구도: 최종 2048×1152 슬라이드의 오른쪽 60~65%에 배치할 수 있도록 핵심 피사체를 중앙 오른쪽에 둔다. 왼쪽 35~40%는 제목과 라벨을 올릴 수 있는 단순한 음영·여백으로 비운다. 가장자리 잘림과 과도한 클로즈업을 피한다.",
    "텍스트, 문자처럼 보이는 무늬, 숫자, 로고, UI 라벨, 워터마크, URL, QR 코드, 실제 이메일 주소, 실제 기관명, 실제 브랜드 패키지, 식별 가능한 인물을 넣지 않는다.",
    "한 화면에 사건을 여러 개 콜라주하지 말고 하나의 명확한 교육 장면으로 표현한다. 손·얼굴·제품·화면·소품의 형태를 자연스럽게 유지한다.",
  ].join("\n");
}

function promptDocument(slide, displayText, mode, sourceSvg) {
  const meta = COURSE_META[slide.course];
  const kind = layoutKind(slide);
  const heroAsset = HERO_ASSETS[slide.id];
  const fullPrompt = fullSlidePrompt(slide, displayText, mode, sourceSvg);
  const production = mode === "hybrid-gpt-image-2-hero"
    ? [
        "1. 아래 `텍스트 없는 hero 생성 프롬프트`로 배경 장면만 생성합니다.",
        `2. 생성 자산은 \`${heroAsset}\`에 두고 16:9인지 확인합니다.`,
        `3. \`${relative(sourceSvg)}\`의 결정론적 SVG에서 한글 제목·라벨·검증 구조를 올립니다.`,
        `4. 최종 2048×1152 PNG를 \`${slide.image_filename}\`으로 렌더링합니다.`,
      ]
    : mode === "hybrid-svg"
      ? [
          "1. 현재 승인본은 결정론적 SVG를 기준으로 하며 GPT Image 2 호출이 필수는 아닙니다.",
          `2. \`${relative(sourceSvg)}\`에서 한글과 도형을 정확하게 렌더링합니다.`,
          "3. 아래 전체 슬라이드 프롬프트는 비주얼 탐색 또는 향후 재생성용으로 사용합니다.",
          "4. 한글 오류가 한 번이라도 보이면 생성 이미지의 텍스트를 사용하지 않고 승인된 SVG 텍스트 레이어를 유지합니다.",
        ]
      : [
          "1. 전체 슬라이드 프롬프트로 16:9 PNG를 생성합니다.",
          "2. 지정 문구를 대조하고 한글 오류가 있으면 수정 요청을 한 번 수행합니다.",
          "3. 오류가 반복되면 배경·장면만 생성하고 한글은 결정론적 SVG 텍스트 레이어로 합성합니다.",
        ];
  const correction = [
    "기존 이미지의 16:9 비율, 레이아웃, 색상, 아이콘, 도형과 여백은 그대로 유지한다.",
    "잘못된 글자와 임의로 추가된 모든 텍스트를 제거하고 아래 문구만 정확하게 표시한다.",
    displayList(displayText),
    "글자·띄어쓰기·문장부호·영문 대소문자를 바꾸지 않는다. 모든 한글은 최소 26px 상당으로 선명하게 표현한다.",
    "같은 오류가 반복되면 글자 영역을 깨끗한 단색 면으로 비운 텍스트 없는 버전을 만들고 임의 글자로 대체하지 않는다.",
  ].join("\n");
  return [
    `# ${slide.id} · 현재 교안 기준 이미지 프롬프트`,
    "",
    `> 업데이트 기준일: ${AS_OF}  `,
    `> 기준: \`${MANIFEST_REL}\`의 승인된 현재 슬라이드  `,
    "> 이 문서는 프롬프트만 정의하며 실제 이미지를 생성하지 않습니다.",
    "",
    "## 1. 슬라이드 메타데이터",
    "",
    "| 항목 | 값 |",
    "|---|---|",
    `| 슬라이드 ID | \`${slide.id}\` |`,
    `| 과정 | ${meta.course} |`,
    `| 모듈·일자·차시 | ${slide.module} · ${slide.day} · ${slide.lesson}차시 |`,
    `| 슬라이드 순서 | ${slide.order} |`,
    `| 최종 이미지 | \`${slide.image_filename}\` |`,
    `| 제작 방식 | \`${mode}\` |`,
    `| 승인 상태 | \`${slide.review_status}\` |`,
    ...(sourceSvg ? [`| 승인된 SVG 구조 | \`${relative(sourceSvg)}\` |`] : []),
    ...(heroAsset ? [`| GPT Image 2 hero 자산 | \`${heroAsset}\` |`] : []),
    "",
    "## 2. 슬라이드 메시지",
    "",
    `- 제목: ${plainTitle(slide.title)}`,
    `- 자료 단계: ${tierTitle(slide.title)}`,
    `- 목적: ${slide.purpose}`,
    `- 핵심 메시지: ${slide.key_message}`,
    `- 필수 내용: ${slide.required_content}`,
    `- 시각 형식: ${slide.visual_type}`,
    "",
    "## 3. 화면에 정확히 표시할 문구",
    "",
    "```text",
    displayText.join("\n"),
    "```",
    "",
    "위 목록은 현재 승인된 교안에서 추출한 화면 문구입니다. 슬라이드 ID와 파일 경로는 화면에 표시하지 않습니다.",
    "",
    "## 4. 제작 방식과 조합 순서",
    "",
    ...production,
    "",
    "## 5. 레이아웃·스타일 기준",
    "",
    `- 레이아웃: ${layoutDescription(kind)}`,
    `- 색상: ${meta.palette}`,
    `- 과정 구분: ${meta.emphasis}`,
    `- 아이콘·도형: ${contentSpecificIcons(slide)}`,
    "- 캔버스: 2048×1152px, 정확한 16:9, 좌우 96px·위 72px·아래 64px 이상 안전 여백",
    "- 타이포그래피: 현대적 고딕 산세리프, 제목 64~80px 상당, 라벨 30~36px 상당, 최소 26px 상당",
    "- 한 슬라이드에는 지배적인 시각 요소를 하나만 두고 기본 그림자는 사용하지 않습니다.",
    "",
    ...(heroAsset ? [
      "## 6. 텍스트 없는 hero 생성 프롬프트",
      "",
      "```text",
      heroPrompt(slide),
      "```",
      "",
      "## 7. 전체 슬라이드 대체 프롬프트",
    ] : ["## 6. GPT Image 2.0 전체 슬라이드 프롬프트"]),
    "",
    "```text",
    fullPrompt,
    "```",
    "",
    `## ${heroAsset ? "8" : "7"}. 한글 오류 수정 요청`,
    "",
    "```text",
    correction,
    "```",
    "",
    `## ${heroAsset ? "9" : "8"}. 제외 요소 점검`,
    "",
    `- ${meta.forbidden}`,
    "- 실제 서비스·기관·업체·브랜드 로고 및 실제 제품 UI 복제 금지",
    "- 실제 개인정보·기관 내부자료·API 키·이메일·계정명 금지",
    "- 외부 링크·URL·QR 코드·워터마크·강사용 메모·발표자 노트 금지",
    "- 과도한 3D·네온·유리 질감·강한 그라데이션·스톡사진식 포즈 금지",
    "- 지정 문구 외 텍스트와 읽을 수 없는 가짜 한글 금지",
  ].join("\n");
}

function countsFor(slides) {
  const byCourse = Object.fromEntries(COURSES.map((course) => [course, 0]));
  const byCourseDay = Object.fromEntries(COURSES.map((course) => [course, {}]));
  for (const slide of slides) {
    byCourse[slide.course] += 1;
    byCourseDay[slide.course][slide.day] = (byCourseDay[slide.course][slide.day] ?? 0) + 1;
  }
  return { byCourse, byCourseDay };
}

function indexDocument(module, slides, stats) {
  const counts = countsFor(slides);
  const lines = [
    `# 모듈 ${module.slice(1)} · 현재 교안 기준 GPT Image 2 프롬프트 인덱스`,
    "",
    `> 업데이트 기준일: ${AS_OF}  `,
    `> 현재 교안 슬라이드: ${slides.length}장  `,
    "> 실제 이미지 생성: 수행하지 않음",
    "",
    "## 기준",
    "",
    `- 원본 데이터: \`${MANIFEST_REL}\``,
    `- 이미지 스타일: \`${STYLE_REL}\``,
    "- 최종 출력: PNG, 2048×1152px, 정확한 16:9",
    "- 한글 오류 반복 시: GPT Image 2 배경·hero + 결정론적 SVG 한글 레이어",
    `- 이번 갱신: 신규 ${stats.added}개 · 내용 변경 ${stats.refreshed}개 · 기존 일치 ${stats.preserved}개`,
    "- 프롬프트 승인 전에는 실제 이미지 생성과 대량 생성을 수행하지 않음",
    "",
    "## 전체 수량",
    "",
    "| 구분 | 프롬프트 수 |",
    "|---|---:|",
    `| COMMON | ${counts.byCourse.COMMON} |`,
    `| 스마트 경영지원 | ${counts.byCourse.BACKOFFICE} |`,
    `| 마케팅·SNS 콘텐츠 기획·브랜딩 | ${counts.byCourse.MARKETING} |`,
    `| **전체** | **${slides.length}** |`,
  ];
  for (const course of COURSES) {
    const courseSlides = slides.filter((slide) => slide.course === course);
    lines.push("", `## ${COURSE_META[course].label} — ${courseSlides.length}개`);
    for (const day of [...new Set(courseSlides.map((slide) => slide.day))].sort()) {
      const daySlides = courseSlides.filter((slide) => slide.day === day).sort((a, b) => a.order - b.order);
      lines.push("", `### ${day} — ${daySlides.length}개`, "", "| 순서 | 차시 | 슬라이드 ID | 제목 | 이미지 파일명 | 프롬프트 |", "|---:|---:|---|---|---|---|");
      for (const slide of daySlides) {
        lines.push(`| ${slide.order} | ${slide.lesson} | \`${slide.id}\` | ${slide.title.replaceAll("|", "／")} | \`${slide.image_filename}\` | [열기](./${slide.course.toLowerCase()}/${slide.id}.md) |`);
      }
    }
  }
  return `${lines.join("\n")}\n`;
}

const manifest = JSON.parse(fs.readFileSync(MANIFEST_PATH, "utf8"));
const manifestHash = hashFile(MANIFEST_PATH);
const styleHash = hashFile(STYLE_PATH);
const sourceSvgMap = new Map();
for (const root of [
  path.join(ROOT, "assets", "slide-sources", "optional"),
  path.join(ROOT, "assets", "slide-sources", "revisions"),
]) {
  for (const file of walk(root).filter((item) => item.endsWith(".svg"))) {
    sourceSvgMap.set(path.basename(file, ".svg"), file);
  }
}

const summary = { added: 0, refreshed: 0, preserved: 0, modules: {} };

for (const module of MODULES) {
  const moduleDir = path.join(ROOT, "prompts", module);
  const promptManifestPath = path.join(moduleDir, `${module}_prompt_manifest.json`);
  const oldManifest = fs.existsSync(promptManifestPath)
    ? JSON.parse(fs.readFileSync(promptManifestPath, "utf8"))
    : { prompts: [] };
  const oldById = new Map((oldManifest.prompts ?? []).map((entry) => [entry.id, entry]));
  const slides = manifest.slides.filter((slide) => slide.module === module);
  const moduleStats = { added: 0, refreshed: 0, preserved: 0 };
  const promptEntries = [];

  for (const slide of slides) {
    const old = oldById.get(slide.id);
    const fileRel = promptPath(slide);
    const filePath = path.join(ROOT, fileRel);
    const sourceSvg = sourceSvgMap.get(slide.id);
    const changed = !old || IMPORTANT_FIELDS.some((field) => JSON.stringify(old[field]) !== JSON.stringify(slide[field]));
    const missingFile = !fs.existsSync(filePath);
    const displayText = exactText(slide, sourceSvg, old?.exact_display_text ?? []);
    const mode = productionMode(slide, sourceSvg);

    if (missingFile || changed) {
      fs.mkdirSync(path.dirname(filePath), { recursive: true });
      fs.writeFileSync(filePath, `${promptDocument(slide, displayText, mode, sourceSvg).trim()}\n`, "utf8");
      if (!old || missingFile) {
        moduleStats.added += 1;
        summary.added += 1;
      } else {
        moduleStats.refreshed += 1;
        summary.refreshed += 1;
      }
    } else {
      moduleStats.preserved += 1;
      summary.preserved += 1;
    }

    promptEntries.push({
      ...slide,
      exact_display_text: displayText,
      prompt_file: fileRel,
      prompt_status: "drafted",
      source_prompt_status: slide.prompt_status,
      production_mode: mode,
      ...(sourceSvg ? { source_svg: relative(sourceSvg) } : {}),
      ...(HERO_ASSETS[slide.id] ? { hero_asset: HERO_ASSETS[slide.id] } : {}),
    });
  }

  const counts = countsFor(slides);
  const nextManifest = {
    schema_version: "2.0",
    module,
    updated_at: AS_OF,
    source_manifest: MANIFEST_REL,
    source_manifest_sha256: manifestHash,
    style_guide: STYLE_REL,
    style_guide_sha256: styleHash,
    source_manifest_unchanged: true,
    images_generated: true,
    image_generation_executed_in_this_update: false,
    prompt_status: "drafted",
    total_prompts: slides.length,
    counts_by_course: counts.byCourse,
    counts_by_course_and_day: counts.byCourseDay,
    index_filename: `${module}_prompt_index.md`,
    manifest_filename: `${module}_prompt_manifest.json`,
    image_format: { format: "PNG", width: 2048, height: 1152, aspect_ratio: "16:9" },
    update_summary: moduleStats,
    prompts: promptEntries,
  };
  fs.writeFileSync(promptManifestPath, `${JSON.stringify(nextManifest, null, 2)}\n`, "utf8");
  fs.writeFileSync(path.join(moduleDir, `${module}_prompt_index.md`), indexDocument(module, slides, moduleStats), "utf8");
  summary.modules[module] = { total: slides.length, ...moduleStats };
}

const auditLines = [
  "# 현재 교안 기준 이미지 프롬프트 갱신 보고서",
  "",
  `> 기준일: ${AS_OF}  `,
  `> 기준 매니페스트 SHA-256: \`${manifestHash}\`  `,
  "> 실제 이미지 생성: 수행하지 않음",
  "",
  "## 결과",
  "",
  `- 현재 교안 슬라이드: ${manifest.slides.length}장`,
  `- 프롬프트 전체: ${summary.added + summary.refreshed + summary.preserved}개`,
  `- 신규 작성: ${summary.added}개`,
  `- 내용 변경 재작성: ${summary.refreshed}개`,
  `- 기존 일치 보존: ${summary.preserved}개`,
  `- GPT Image 2 hero + SVG 한글 레이어: ${Object.keys(HERO_ASSETS).length}개`,
  `- 결정론적 SVG 하이브리드: ${sourceSvgMap.size - Object.keys(HERO_ASSETS).length}개`,
  "",
  "## 모듈별 수량",
  "",
  "| 모듈 | 전체 | 신규 | 재작성 | 보존 |",
  "|---|---:|---:|---:|---:|",
  ...MODULES.map((module) => {
    const item = summary.modules[module];
    return `| ${module} | ${item.total} | ${item.added} | ${item.refreshed} | ${item.preserved} |`;
  }),
  "",
  "## 적용 원칙",
  "",
  "- 현재 승인된 `data/slide-manifest.json`의 제목·목적·핵심 메시지·필수 내용을 변경하지 않음",
  "- 2048×1152px, 정확한 16:9, 과정별 색상과 사례 분리",
  "- 한글 오류가 반복되면 GPT Image 2는 텍스트 없는 배경·hero에만 사용하고 한글은 SVG로 합성",
  "- 실제 기관·개인정보·내부자료·로고·외부 링크·QR 코드·강사용 메모를 이미지에 넣지 않음",
  "- 프롬프트 승인 전 실제 이미지 생성 및 대량 생성 금지",
  "",
];
fs.writeFileSync(path.join(ROOT, "prompts", "CURRENT_DECK_PROMPT_UPDATE_20260809.md"), auditLines.join("\n"), "utf8");

const failures = [];
const allPromptFiles = MODULES.flatMap((module) =>
  walk(path.join(ROOT, "prompts", module)).filter((file) => /(?:COMMON|BACKOFFICE|MARKETING)-M\d{2}-D\d{2}-S\d{3}\.md$/.test(file)),
);
if (allPromptFiles.length !== manifest.slides.length) failures.push(`prompt file count ${allPromptFiles.length} != ${manifest.slides.length}`);
for (const slide of manifest.slides) {
  const filePath = path.join(ROOT, promptPath(slide));
  if (!fs.existsSync(filePath)) {
    failures.push(`missing prompt ${slide.id}`);
    continue;
  }
  const text = fs.readFileSync(filePath, "utf8");
  for (const token of [slide.id, slide.image_filename, "16:9"]) {
    if (!text.includes(token)) failures.push(`${slide.id}: missing ${token}`);
  }
  if (/(?:ablearn|에이블런|CapCut|캡컷)/i.test(text)) failures.push(`${slide.id}: forbidden vendor or tool name`);
}
for (const module of MODULES) {
  const promptManifest = JSON.parse(fs.readFileSync(path.join(ROOT, "prompts", module, `${module}_prompt_manifest.json`), "utf8"));
  const expected = manifest.slides.filter((slide) => slide.module === module).length;
  if (promptManifest.total_prompts !== expected) failures.push(`${module}: manifest total mismatch`);
  if (promptManifest.source_manifest_sha256 !== manifestHash) failures.push(`${module}: stale source hash`);
}

if (failures.length) {
  console.error(`Image prompt update validation failed (${failures.length})`);
  for (const failure of failures.slice(0, 100)) console.error(`- ${failure}`);
  process.exitCode = 1;
} else {
  console.log(JSON.stringify({ ...summary, total: manifest.slides.length, validation: "passed", imagesGenerated: false }, null, 2));
}
