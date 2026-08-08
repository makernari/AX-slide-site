import fs from "node:fs";
import path from "node:path";

const ROOT = path.resolve(import.meta.dirname, "..");
const files = [
  "docs/planning/01-curriculum-canonical.md",
  "docs/planning/02-slide-map-draft.md",
  "docs/planning/10_final_slide_map.md",
  "docs/planning/M06_common_track_matrix.md",
  "docs/planning/M06_backoffice_detail.md",
  "docs/planning/M06_marketing_detail.md",
  "prompts/M06/M06_prompt_index.md",
  "prompts/M06/M06_prompt_manifest.json",
  "prompts/M06/common/COMMON-M06-D02-S003.md",
  "prompts/M06/common/COMMON-M06-D02-S017.md",
  "scripts/add-image-video-vrew-pipeline.mjs",
  "scripts/refresh-m06-practice-and-guides.mjs",
];

function migrate(text) {
  return text
    .replaceAll("Vrew·Suno·CapCut은 한 제작선의 세 역할이다", "Vrew와 Suno는 한 제작선의 두 역할이다")
    .replaceAll("Vrew는 음성·자막·장면 초안, Suno는 음악, CapCut은 최종 조립과 균형 조정에 사용한다.", "Vrew는 음성·자막·장면 편집과 최종 내보내기를, Suno는 음악 제작을 담당한다.")
    .replaceAll("대본 입력; Vrew 초안; Suno 음악; CapCut 완성; 단계별 전달물", "Vrew 자막; 텍스트 편집; Suno 음악; Vrew 완성")
    .replaceAll("대본 입력 / Vrew 초안 / Suno 음악 / CapCut 완성 / 단계별 전달물", "Vrew 자막 / 텍스트 편집 / Suno 음악 / Vrew 완성")
    .replaceAll("CapCut에서는 메시지 순서대로 조립한다", "Vrew에서는 메시지 순서대로 완성한다")
    .replaceAll("Vrew·Suno·CapCut", "Vrew·Suno")
    .replaceAll("3도구 production pipeline", "2도구 production pipeline")
    .replaceAll("CapCut 또는 타임라인 보드", "Vrew 또는 타임라인 보드")
    .replaceAll("CapCut", "Vrew")
    .replaceAll("Vrew·Suno·Vrew", "Vrew·Suno")
    .replaceAll("Suno/Vrew 역할 비교", "Suno 음악 역할")
    .replaceAll("Suno·Vrew의 역할 비교", "Suno 음악 역할");
}

for (const relativePath of files) {
  const target = path.resolve(ROOT, relativePath);
  if (!target.startsWith(`${ROOT}${path.sep}`)) throw new Error(`Unsafe path: ${target}`);
  if (!fs.existsSync(target)) throw new Error(`Missing file: ${relativePath}`);
  const before = fs.readFileSync(target, "utf8");
  const after = migrate(before);
  if (after !== before) {
    fs.writeFileSync(target, after, "utf8");
    console.log(`updated_text=${relativePath}`);
  }
}
