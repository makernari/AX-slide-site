"use strict";

const fs = require("node:fs");
const path = require("node:path");

const ROOT = path.resolve(__dirname, "..");
const MANIFEST_PATH = path.join(ROOT, "data", "slide-manifest.json");
const SLIDE_DIR = path.join(ROOT, "assets", "slides");
const REQUIRE_IMAGES = process.argv.includes("--require-images");

const REQUIRED_FIELDS = [
  "id",
  "course",
  "module",
  "day",
  "lesson",
  "order",
  "title",
  "purpose",
  "key_message",
  "required_content",
  "visual_type",
  "content_type",
  "image_filename",
  "prompt_status",
  "image_status",
  "review_status",
];

const OPTIONAL_FIELDS = ["day_title"];

const EXPECTED_MODULE_DAYS = {
  M05: 4,
  M06: 3,
  M07: 3,
  M08: 4,
  M09: 1,
};

const ALLOWED_STATUS = {
  prompt_status: new Set(["pending", "drafted", "approved"]),
  image_status: new Set(["missing", "generated", "revision", "approved"]),
  review_status: new Set(["pending", "approved"]),
};

const COURSE_ASSET_FOLDER = {
  COMMON: "common",
  BACKOFFICE: "backoffice",
  MARKETING: "marketing",
};

const errors = [];
const warnings = [];

function fail(message) {
  errors.push(message);
}

function warn(message) {
  warnings.push(message);
}

function readManifest() {
  try {
    return JSON.parse(fs.readFileSync(MANIFEST_PATH, "utf8"));
  } catch (error) {
    fail(`manifest를 읽을 수 없습니다: ${error.message}`);
    return null;
  }
}

function key(module, day, order) {
  return `${module}/${day}/${String(order).padStart(3, "0")}`;
}

function moduleNumber(module) {
  return Number(module.slice(1));
}

function dayNumber(day) {
  return Number(day.slice(1));
}

function listPngFiles(directory) {
  if (!fs.existsSync(directory)) return [];
  const result = [];
  for (const entry of fs.readdirSync(directory, { withFileTypes: true })) {
    const target = path.join(directory, entry.name);
    if (entry.isDirectory()) {
      result.push(...listPngFiles(target));
    } else if (entry.isFile() && entry.name.toLowerCase().endsWith(".png")) {
      result.push(target);
    }
  }
  return result;
}

function inspectPng(filePath) {
  const buffer = Buffer.alloc(24);
  const handle = fs.openSync(filePath, "r");
  try {
    const bytes = fs.readSync(handle, buffer, 0, buffer.length, 0);
    const signature = Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]);
    if (bytes < 24 || !buffer.subarray(0, 8).equals(signature)) {
      return { valid: false, width: null, height: null };
    }
    return {
      valid: true,
      width: buffer.readUInt32BE(16),
      height: buffer.readUInt32BE(20),
    };
  } finally {
    fs.closeSync(handle);
  }
}

function slideImagePath(slide) {
  const folder = COURSE_ASSET_FOLDER[slide.course];
  return path.join(
    SLIDE_DIR,
    slide.module,
    folder ?? "unknown-course",
    slide.image_filename,
  );
}

function validateRecord(slide, index, seenIds, seenImages) {
  const label = `slides[${index}]`;
  for (const field of REQUIRED_FIELDS) {
    if (!(field in slide)) fail(`${label}: 필드 누락 - ${field}`);
    if (slide[field] === "") fail(`${label}: 빈 필드 - ${field}`);
  }
  const extras = Object.keys(slide).filter(
    (field) =>
      !REQUIRED_FIELDS.includes(field) && !OPTIONAL_FIELDS.includes(field),
  );
  if (extras.length) warn(`${label}: 정의되지 않은 추가 필드 - ${extras.join(", ")}`);
  if ("day_title" in slide && !String(slide.day_title).trim()) {
    fail(`${label}: 빈 선택 필드 - day_title`);
  }

  if (seenIds.has(slide.id)) fail(`${label}: 중복 ID - ${slide.id}`);
  seenIds.add(slide.id);
  if (seenImages.has(slide.image_filename)) {
    fail(`${label}: 중복 이미지 파일명 - ${slide.image_filename}`);
  }
  seenImages.add(slide.image_filename);

  const match =
    /^(COMMON|BACKOFFICE|MARKETING)-(M0[5-9])-(D\d{2})-S(\d{3})$/.exec(
      slide.id,
    );
  if (!match) {
    fail(`${label}: 잘못된 슬라이드 ID - ${slide.id}`);
  } else {
    const [, prefix, module, day, orderText] = match;
    if (prefix !== slide.course) {
      fail(`${slide.id}: ID 접두사와 course 불일치`);
    }
    if (module !== slide.module || day !== slide.day) {
      fail(`${slide.id}: ID의 module/day와 필드 불일치`);
    }
    if (Number(orderText) !== slide.order) {
      fail(`${slide.id}: ID의 슬라이드 번호와 order 불일치`);
    }
  }

  if (!/^M0[5-9]$/.test(slide.module)) {
    fail(`${slide.id}: 허용되지 않은 모듈 - ${slide.module}`);
  }
  if (!/^D\d{2}$/.test(slide.day)) {
    fail(`${slide.id}: 잘못된 day - ${slide.day}`);
  }
  if (!Number.isInteger(slide.lesson) || slide.lesson < 1 || slide.lesson > 4) {
    fail(`${slide.id}: lesson은 1~4 정수여야 합니다`);
  }
  if (!Number.isInteger(slide.order) || slide.order < 1) {
    fail(`${slide.id}: order는 1 이상의 정수여야 합니다`);
  }

  const expectedFilename = `${slide.id}.png`;
  if (slide.image_filename !== expectedFilename) {
    fail(
      `${slide.id}: 이미지 파일명 불일치 - ${slide.image_filename} (기대: ${expectedFilename})`,
    );
  }

  if (slide.content_type === "COMMON" && slide.course !== "COMMON") {
    fail(`${slide.id}: COMMON은 course도 COMMON이어야 합니다`);
  }
  if (
    slide.content_type === "SHARED_STRUCTURE" &&
    !["BACKOFFICE", "MARKETING"].includes(slide.course)
  ) {
    fail(`${slide.id}: SHARED_STRUCTURE의 course가 잘못되었습니다`);
  }
  if (
    slide.content_type === "BACKOFFICE_ONLY" &&
    slide.course !== "BACKOFFICE"
  ) {
    fail(`${slide.id}: BACKOFFICE_ONLY의 course가 잘못되었습니다`);
  }
  if (
    slide.content_type === "MARKETING_ONLY" &&
    slide.course !== "MARKETING"
  ) {
    fail(`${slide.id}: MARKETING_ONLY의 course가 잘못되었습니다`);
  }
  if (
    ![
      "COMMON",
      "SHARED_STRUCTURE",
      "BACKOFFICE_ONLY",
      "MARKETING_ONLY",
    ].includes(slide.content_type)
  ) {
    fail(`${slide.id}: 잘못된 content_type - ${slide.content_type}`);
  }

  for (const [field, allowed] of Object.entries(ALLOWED_STATUS)) {
    if (!allowed.has(slide[field])) {
      fail(`${slide.id}: 잘못된 ${field} - ${slide[field]}`);
    }
  }
}

function validatePairs(slides) {
  const slots = new Map();
  for (const slide of slides) {
    const slot = key(slide.module, slide.day, slide.order);
    if (!slots.has(slot)) slots.set(slot, []);
    slots.get(slot).push(slide);
  }

  for (const [slot, records] of slots) {
    const common = records.filter((record) => record.course === "COMMON");
    const backoffice = records.filter(
      (record) => record.course === "BACKOFFICE",
    );
    const marketing = records.filter(
      (record) => record.course === "MARKETING",
    );
    if (common.length) {
      if (
        common.length !== 1 ||
        backoffice.length !== 0 ||
        marketing.length !== 0
      ) {
        fail(`${slot}: COMMON 위치에는 공통 레코드 한 개만 있어야 합니다`);
      }
      continue;
    }
    if (backoffice.length !== 1 || marketing.length !== 1) {
      fail(`${slot}: 과정별 위치에는 경영지원·마케팅 레코드가 각각 한 개 필요합니다`);
      continue;
    }
    const boType = backoffice[0].content_type;
    const mkType = marketing[0].content_type;
    const sharedPair =
      boType === "SHARED_STRUCTURE" && mkType === "SHARED_STRUCTURE";
    const exclusivePair =
      boType === "BACKOFFICE_ONLY" && mkType === "MARKETING_ONLY";
    if (!sharedPair && !exclusivePair) {
      fail(`${slot}: 과정별 content_type 쌍이 맞지 않습니다 (${boType}/${mkType})`);
    }
  }
}

function validateDeck(slides, course) {
  const selected = slides.filter(
    (slide) => slide.course === "COMMON" || slide.course === course,
  );
  const dayGroups = new Map();
  for (const slide of selected) {
    const groupKey = `${slide.module}/${slide.day}`;
    if (!dayGroups.has(groupKey)) dayGroups.set(groupKey, []);
    dayGroups.get(groupKey).push(slide);
  }

  if (selected.length !== 392) {
    fail(`${course}: 과정별 슬라이드는 392장이어야 합니다 (실제 ${selected.length})`);
  }
  if (dayGroups.size !== 15) {
    fail(`${course}: 일자는 15개여야 합니다 (실제 ${dayGroups.size})`);
  }

  const moduleDays = new Map();
  for (const [groupKey, daySlides] of dayGroups) {
    const [module, day] = groupKey.split("/");
    if (!moduleDays.has(module)) moduleDays.set(module, new Set());
    moduleDays.get(module).add(day);

    const orderCounts = new Map();
    for (const slide of daySlides) {
      orderCounts.set(slide.order, (orderCounts.get(slide.order) || 0) + 1);
    }
    const duplicateOrders = [...orderCounts.entries()].filter(
      ([, count]) => count !== 1,
    );
    if (duplicateOrders.length) {
      fail(
        `${course} ${groupKey}: 같은 순서가 중복되었습니다 - ${duplicateOrders
          .map(([order]) => order)
          .join(", ")}`,
      );
    }
    const orders = [...orderCounts.keys()].sort((a, b) => a - b);
    const expected = Array.from({ length: orders.at(-1) || 0 }, (_, i) => i + 1);
    if (orders.join(",") !== expected.join(",")) {
      fail(`${course} ${groupKey}: 슬라이드 순서가 연속적이지 않습니다`);
    }
    const lessons = [...new Set(daySlides.map((slide) => slide.lesson))].sort();
    if (lessons.join(",") !== "1,2,3,4") {
      fail(`${course} ${groupKey}: 4개 차시가 모두 존재하지 않습니다`);
    }
  }

  for (const [module, expectedDays] of Object.entries(EXPECTED_MODULE_DAYS)) {
    const days = moduleDays.get(module) || new Set();
    if (days.size !== expectedDays) {
      fail(
        `${course} ${module}: 일자는 ${expectedDays}개여야 합니다 (실제 ${days.size})`,
      );
    }
    const sortedDays = [...days].sort((a, b) => dayNumber(a) - dayNumber(b));
    const expected = Array.from(
      { length: expectedDays },
      (_, i) => `D${String(i + 1).padStart(2, "0")}`,
    );
    if (sortedDays.join(",") !== expected.join(",")) {
      fail(`${course} ${module}: 일자 순서가 D01부터 연속적이지 않습니다`);
    }
  }
}

function validateImages(slides) {
  let expectedMissing = 0;
  let existing = 0;
  const manifestFiles = new Set(
    slides.map((slide) => path.resolve(slideImagePath(slide)).toLowerCase()),
  );

  for (const slide of slides) {
    const filePath = slideImagePath(slide);
    const exists = fs.existsSync(filePath);
    if (!exists) {
      if (slide.image_status === "missing") {
        expectedMissing += 1;
        if (REQUIRE_IMAGES) {
          fail(`${slide.id}: 최종 이미지가 없습니다`);
        }
      } else {
        fail(
          `${slide.id}: image_status=${slide.image_status}이지만 이미지 파일이 없습니다`,
        );
      }
      continue;
    }

    existing += 1;
    const stats = fs.statSync(filePath);
    if (stats.size === 0) fail(`${slide.id}: 이미지 파일이 0바이트입니다`);
    const png = inspectPng(filePath);
    if (!png.valid) {
      fail(`${slide.id}: 파일 확장자는 PNG지만 PNG 서명이 없습니다`);
    } else if (png.width * 9 !== png.height * 16) {
      fail(
        `${slide.id}: 이미지가 정확한 16:9가 아닙니다 - ${png.width}x${png.height}`,
      );
    }
    if (slide.image_status === "missing") {
      warn(`${slide.id}: 이미지 파일은 있지만 image_status가 missing입니다`);
    }
  }

  for (const filePath of listPngFiles(SLIDE_DIR)) {
    if (!manifestFiles.has(path.resolve(filePath).toLowerCase())) {
      fail(`manifest에 없는 이미지 파일: ${path.relative(ROOT, filePath)}`);
    }
  }

  return { expectedMissing, existing };
}

function main() {
  const manifest = readManifest();
  if (!manifest) return finish();
  if (!Array.isArray(manifest.slides)) {
    fail("manifest.slides가 배열이 아닙니다");
    return finish();
  }

  const slides = manifest.slides;
  const seenIds = new Set();
  const seenImages = new Set();
  slides.forEach((slide, index) =>
    validateRecord(slide, index, seenIds, seenImages),
  );
  validatePairs(slides);
  validateDeck(slides, "BACKOFFICE");
  validateDeck(slides, "MARKETING");
  const imageSummary = validateImages(slides);

  const modules = [...new Set(slides.map((slide) => slide.module))].sort(
    (a, b) => moduleNumber(a) - moduleNumber(b),
  );
  const courseCounts = slides.reduce((counts, slide) => {
    counts[slide.course] = (counts[slide.course] || 0) + 1;
    return counts;
  }, {});

  console.log("Manifest validation");
  console.log(`- records: ${slides.length}`);
  console.log(`- modules: ${modules.join(", ")}`);
  console.log(
    `- course assets: COMMON ${courseCounts.COMMON || 0}, BACKOFFICE ${courseCounts.BACKOFFICE || 0}, MARKETING ${courseCounts.MARKETING || 0}`,
  );
  console.log(`- existing images: ${imageSummary.existing}`);
  console.log(`- expected placeholder images: ${imageSummary.expectedMissing}`);
  finish();
}

function finish() {
  if (warnings.length) {
    console.log(`Warnings (${warnings.length})`);
    warnings.forEach((message) => console.log(`- ${message}`));
  }
  if (errors.length) {
    console.error(`Errors (${errors.length})`);
    errors.forEach((message) => console.error(`- ${message}`));
    process.exitCode = 1;
    return;
  }
  console.log(
    REQUIRE_IMAGES
      ? "VALIDATION PASSED (images required)"
      : "VALIDATION PASSED (placeholder mode)",
  );
}

main();
