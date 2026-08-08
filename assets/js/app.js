(() => {
  "use strict";

  const APP_ROOT = new URL(
    document.documentElement.dataset.appRoot || "./",
    document.baseURI,
  );
  const MANIFEST_URL = new URL("data/slide-manifest.json", APP_ROOT).href;
  const SLIDE_ASSET_ROOT = new URL("assets/slides/", APP_ROOT).href;
  const STORAGE_KEY = "ax-slide-site-course";

  const COURSE_META = {
    backoffice: {
      dataValue: "BACKOFFICE",
      label: "스마트 경영지원",
      fullLabel: "스마트 경영지원",
      description:
        "문서·회의·자동화·데이터·업무 앱을 하나의 실무 흐름으로 연결하는 강의교안",
      className: "backoffice",
    },
    marketing: {
      dataValue: "MARKETING",
      label: "마케팅·SNS",
      fullLabel: "마케팅·SNS 콘텐츠 기획·브랜딩",
      description:
        "리서치·콘텐츠 제작·브랜딩·자동화·콘텐츠 앱을 연결하는 강의교안",
      className: "marketing",
    },
  };

  const configuredCourseLock = document.documentElement.dataset.courseLock
    ?.trim()
    .toLowerCase();
  const LOCKED_COURSE = COURSE_META[configuredCourseLock]
    ? configuredCourseLock
    : null;

  const COURSE_ASSET_FOLDER = {
    COMMON: "common",
    BACKOFFICE: "backoffice",
    MARKETING: "marketing",
  };

  const MODULE_META = {
    M05: "AI 업무환경과 자료 활용",
    M06: "이미지·영상 제작과 편집",
    M07: "자동화·데이터 분석",
    M08: "바이브 코딩·RAG·AI 에이전트",
    M09: "재직자 2시간 수업 설계",
  };

  const state = {
    slides: [],
    manifest: null,
    currentViewer: null,
  };

  const app = document.querySelector("#app");

  function escapeHtml(value) {
    return String(value)
      .replaceAll("&", "&amp;")
      .replaceAll("<", "&lt;")
      .replaceAll(">", "&gt;")
      .replaceAll('"', "&quot;")
      .replaceAll("'", "&#039;");
  }

  function moduleNumber(module) {
    return Number.parseInt(module.replace("M", ""), 10);
  }

  function dayNumber(day) {
    return Number.parseInt(day.replace("D", ""), 10);
  }

  function slideSort(a, b) {
    return (
      moduleNumber(a.module) - moduleNumber(b.module) ||
      dayNumber(a.day) - dayNumber(b.day) ||
      a.order - b.order
    );
  }

  function courseSlides(courseKey) {
    const course = COURSE_META[courseKey]?.dataValue;
    if (!course) return [];
    return state.slides
      .filter((slide) => slide.course === "COMMON" || slide.course === course)
      .sort(slideSort);
  }

  function modulesForCourse(courseKey) {
    return [...new Set(courseSlides(courseKey).map((slide) => slide.module))].sort(
      (a, b) => moduleNumber(a) - moduleNumber(b),
    );
  }

  function daysForModule(courseKey, module) {
    return [
      ...new Set(
        courseSlides(courseKey)
          .filter((slide) => slide.module === module)
          .map((slide) => slide.day),
      ),
    ].sort((a, b) => dayNumber(a) - dayNumber(b));
  }

  function slidesForDay(courseKey, module, day) {
    return courseSlides(courseKey)
      .filter((slide) => slide.module === module && slide.day === day)
      .sort((a, b) => a.order - b.order);
  }

  function route(...segments) {
    return `#/${segments.map((segment) => encodeURIComponent(segment)).join("/")}`;
  }

  function navigate(target) {
    if (window.location.hash === target) {
      renderRoute();
      return;
    }
    window.location.hash = target;
  }

  function parseRoute() {
    const raw = window.location.hash.replace(/^#\/?/, "");
    if (!raw) {
      return LOCKED_COURSE
        ? { screen: "course", course: LOCKED_COURSE }
        : { screen: "select" };
    }
    const segments = raw
      .split("/")
      .filter(Boolean)
      .map((segment) => decodeURIComponent(segment));
    if (segments[0] === "select") {
      return LOCKED_COURSE
        ? { screen: "course", course: LOCKED_COURSE }
        : { screen: "select" };
    }
    const [course, module, day, order] = segments;
    if (LOCKED_COURSE && course !== LOCKED_COURSE) {
      return { screen: "course", course: LOCKED_COURSE };
    }
    if (!COURSE_META[course]) return { screen: "not-found" };
    if (!module) return { screen: "course", course };
    if (!day) return { screen: "module", course, module };
    if (!order) return { screen: "day", course, module, day };
    return { screen: "viewer", course, module, day, order };
  }

  function saveCourse(courseKey) {
    try {
      window.localStorage.setItem(STORAGE_KEY, courseKey);
    } catch {
      // Storage is optional; routing remains fully functional without it.
    }
  }

  function loadCourse() {
    try {
      const saved = window.localStorage.getItem(STORAGE_KEY);
      return COURSE_META[saved] ? saved : null;
    } catch {
      return null;
    }
  }

  function siteHeader(courseKey = null) {
    const courseActions = courseKey && !LOCKED_COURSE
      ? `
        <button class="text-button" type="button" data-route="${route("select")}">과정 변경</button>
      `
      : "";
    return `
      <header class="site-header">
        <button class="brand-button" type="button" data-route="${courseKey ? route(courseKey) : route("select")}" aria-label="강의교안 홈">
          <span class="brand-mark" aria-hidden="true">AX</span>
          <span class="brand-label">전문강사 과정 · 강의교안</span>
        </button>
        <div class="header-actions">${courseActions}</div>
      </header>
    `;
  }

  function courseBadge(courseKey) {
    const meta = COURSE_META[courseKey];
    return `<span class="course-badge ${meta.className}">${escapeHtml(meta.fullLabel)}</span>`;
  }

  function renderSelect() {
    const recent = loadCourse();
    const recentCopy = recent
      ? `<p class="page-intro">최근 선택: ${escapeHtml(COURSE_META[recent].fullLabel)}. 아래에서 같은 과정이나 다른 과정을 선택할 수 있습니다.</p>`
      : `<p class="page-intro">강의할 과정을 선택하면 모듈 05~09의 일자별 강의교안으로 이동합니다.</p>`;
    app.innerHTML = `
      <div class="site-shell">
        ${siteHeader()}
        <main class="page" aria-labelledby="select-title">
          <p class="eyebrow">COURSE SELECT</p>
          <h1 class="page-title" id="select-title">어떤 과정의 강의교안을 열까요?</h1>
          ${recentCopy}
          <div class="course-grid">
            ${Object.entries(COURSE_META)
              .map(
                ([key, meta]) => `
                  <button class="course-card ${meta.className}" type="button" data-course="${key}">
                    <span class="course-code">${key === "backoffice" ? "COURSE A" : "COURSE B"}</span>
                    <h2>${escapeHtml(meta.fullLabel)}</h2>
                    <p>${escapeHtml(meta.description)}</p>
                    <span class="card-action">강의교안 열기</span>
                  </button>
                `,
              )
              .join("")}
          </div>
        </main>
      </div>
    `;
  }

  function renderCourseHome(courseKey) {
    const meta = COURSE_META[courseKey];
    const modules = modulesForCourse(courseKey);
    if (!modules.length) {
      renderError("과정 데이터를 찾을 수 없습니다.", "manifest의 course 분류를 확인해 주세요.");
      return;
    }
    const moduleCards = modules
      .map((module) => {
        const days = daysForModule(courseKey, module);
        const count = courseSlides(courseKey).filter(
          (slide) => slide.module === module,
        ).length;
        return `
          <button class="module-card" type="button" data-route="${route(courseKey, module)}">
            <span class="module-number">${escapeHtml(module)}</span>
            <h2>${escapeHtml(MODULE_META[module] ?? module)}</h2>
            <p>${days.length}일 · ${days.length * 4}시간 강의교안</p>
            <div class="module-meta">
              <span class="meta-chip">${count}장</span>
              <span class="meta-chip">4차시/일</span>
            </div>
            <span class="card-action">일자 보기</span>
          </button>
        `;
      })
      .join("");

    app.innerHTML = `
      <div class="site-shell">
        ${siteHeader(courseKey)}
        <main class="page" aria-labelledby="course-title">
          ${courseBadge(courseKey)}
          <h1 class="page-title" id="course-title">모듈 05~09 강의교안</h1>
          <p class="page-intro">${escapeHtml(meta.description)} 모듈을 선택해 일자별 교안을 확인하세요.</p>
          <div class="module-grid">${moduleCards}</div>
        </main>
      </div>
    `;
  }

  function breadcrumb(courseKey, module = null, day = null) {
    const pieces = [
      `<button type="button" data-route="${route(courseKey)}">${escapeHtml(COURSE_META[courseKey].label)}</button>`,
    ];
    if (module) {
      pieces.push(
        `<span class="breadcrumb-separator" aria-hidden="true">/</span>`,
        `<button type="button" data-route="${route(courseKey, module)}">${escapeHtml(module)}</button>`,
      );
    }
    if (day) {
      pieces.push(
        `<span class="breadcrumb-separator" aria-hidden="true">/</span>`,
        `<span aria-current="page">${escapeHtml(day)}</span>`,
      );
    }
    return `<nav class="breadcrumb" aria-label="현재 위치">${pieces.join("")}</nav>`;
  }

  function dayTitle(slides) {
    return slides[0]?.title ?? "강의교안";
  }

  function renderModule(courseKey, module) {
    const modules = modulesForCourse(courseKey);
    if (!modules.includes(module)) {
      renderNotFound(courseKey);
      return;
    }
    const days = daysForModule(courseKey, module);
    const cards = days
      .map((day) => {
        const slides = slidesForDay(courseKey, module, day);
        const lessons = new Set(slides.map((slide) => slide.lesson)).size;
        return `
          <button class="day-card" type="button" data-route="${route(courseKey, module, day)}">
            <span class="day-id">${escapeHtml(day)}</span>
            <h2>${escapeHtml(dayTitle(slides))}</h2>
            <p>4시간 · ${lessons}차시</p>
            <div class="day-meta">
              <span class="meta-chip">${slides.length}장</span>
              <span class="meta-chip">16:9 교안</span>
            </div>
            <span class="card-action">일자 교안 보기</span>
          </button>
        `;
      })
      .join("");

    app.innerHTML = `
      <div class="site-shell">
        ${siteHeader(courseKey)}
        <main class="page page-narrow" aria-labelledby="module-title">
          ${breadcrumb(courseKey)}
          ${courseBadge(courseKey)}
          <div class="page-heading-row">
            <div>
              <p class="eyebrow">${escapeHtml(module)}</p>
              <h1 class="page-title" id="module-title">${escapeHtml(MODULE_META[module] ?? module)}</h1>
            </div>
          </div>
          <p class="page-intro">${days.length}개 일자 중 강의할 일자를 선택하세요.</p>
          <div class="day-grid">${cards}</div>
        </main>
      </div>
    `;
  }

  function renderDay(courseKey, module, day) {
    const slides = slidesForDay(courseKey, module, day);
    if (!slides.length) {
      renderNotFound(courseKey);
      return;
    }
    const lessonCounts = [...new Set(slides.map((slide) => slide.lesson))]
      .sort((a, b) => a - b)
      .map((lesson) => ({
        lesson,
        count: slides.filter((slide) => slide.lesson === lesson).length,
      }));

    app.innerHTML = `
      <div class="site-shell">
        ${siteHeader(courseKey)}
        <main class="page page-narrow" aria-labelledby="day-title">
          ${breadcrumb(courseKey, module, day)}
          ${courseBadge(courseKey)}
          <p class="eyebrow">${escapeHtml(module)} · ${escapeHtml(day)}</p>
          <h1 class="page-title" id="day-title">${escapeHtml(dayTitle(slides))}</h1>
          <p class="page-intro">4시간·4차시 강의교안입니다. 슬라이드 본문은 16:9 이미지 한 장으로 표시됩니다.</p>
          <div class="day-overview">
            <section class="overview-panel" aria-labelledby="overview-title">
              <h2 id="overview-title">교안 구성</h2>
              <p>총 ${slides.length}장의 슬라이드가 차시 순서대로 이어집니다. 이미지가 준비되지 않은 슬라이드는 ID와 제목이 있는 플레이스홀더로 표시됩니다.</p>
              <div class="button-row">
                <button class="primary-button" type="button" data-route="${route(courseKey, module, day, "001")}">교안 시작</button>
                <button class="secondary-button" type="button" data-route="${route(courseKey, module)}">다른 일자 보기</button>
              </div>
            </section>
            <section class="lesson-panel" aria-labelledby="lesson-title">
              <h2 id="lesson-title">차시 구성</h2>
              <ul class="lesson-list">
                ${lessonCounts
                  .map(
                    ({ lesson, count }) => `
                      <li>
                        <strong>${lesson}차시</strong>
                        <span class="lesson-count">${count}장</span>
                      </li>
                    `,
                  )
                  .join("")}
              </ul>
            </section>
          </div>
        </main>
      </div>
    `;
  }

  function imagePath(slide) {
    const courseFolder = COURSE_ASSET_FOLDER[slide.course];
    return `${SLIDE_ASSET_ROOT}${encodeURIComponent(slide.module)}/${courseFolder}/${encodeURIComponent(slide.image_filename)}`;
  }

  function hasApprovedImage(slide) {
    const expectedFilename = `${slide.id}.png`;
    return (
      slide.review_status === "approved" &&
      ["generated", "approved"].includes(slide.image_status) &&
      slide.image_filename === expectedFilename &&
      Boolean(COURSE_ASSET_FOLDER[slide.course])
    );
  }

  function placeholderMarkup(slide, hidden = false) {
    return `
      <div class="slide-placeholder" data-slide-placeholder ${hidden ? "hidden" : ""}>
        <div class="placeholder-copy">
          <span class="placeholder-label">INFOGRAPHIC PLACEHOLDER</span>
          <span class="placeholder-id">${escapeHtml(slide.id)}</span>
          <h1 class="placeholder-title">${escapeHtml(slide.title)}</h1>
        </div>
      </div>
    `;
  }

  function tocMarkup(courseKey, module, day, slide) {
    const modules = modulesForCourse(courseKey);
    const daySlides = slidesForDay(courseKey, module, day);
    const moduleList = modules
      .map((itemModule) => {
        const dayLinks = daysForModule(courseKey, itemModule)
          .map((itemDay) => {
            const itemSlides = slidesForDay(courseKey, itemModule, itemDay);
            const active = itemModule === module && itemDay === day;
            return `
              <button
                class="toc-link"
                type="button"
                data-route="${route(courseKey, itemModule, itemDay, "001")}"
                ${active ? 'aria-current="page"' : ""}
              >
                ${escapeHtml(itemDay)} · ${escapeHtml(dayTitle(itemSlides))}
              </button>
            `;
          })
          .join("");
        return `
          <section class="toc-module">
            <h3 class="toc-module-title">${escapeHtml(itemModule)} · ${escapeHtml(MODULE_META[itemModule] ?? itemModule)}</h3>
            ${dayLinks}
          </section>
        `;
      })
      .join("");
    const slideList = daySlides
      .map(
        (item) => `
          <li>
            <button
              class="slide-toc-button"
              type="button"
              data-route="${route(courseKey, module, day, String(item.order).padStart(3, "0"))}"
              ${item.id === slide.id ? 'aria-current="true"' : ""}
            >
              <span class="slide-toc-number">${String(item.order).padStart(2, "0")}</span>
              <span>${escapeHtml(item.title)}</span>
            </button>
          </li>
        `,
      )
      .join("");
    return `
      <dialog class="toc-dialog" id="toc-dialog" aria-labelledby="toc-title">
        <div class="toc-header">
          <h2 id="toc-title">모듈·일자 목차</h2>
          <button class="icon-button" type="button" data-action="close-toc" aria-label="목차 닫기">닫기</button>
        </div>
        <div class="toc-body">
          <nav class="toc-days" aria-label="모듈과 일자">${moduleList}</nav>
          <section class="toc-slides" aria-labelledby="slide-list-title">
            <h3 id="slide-list-title">${escapeHtml(module)} · ${escapeHtml(day)} 슬라이드</h3>
            <ol class="slide-toc-list">${slideList}</ol>
          </section>
        </div>
      </dialog>
    `;
  }

  function renderViewer(courseKey, module, day, orderValue) {
    const slides = slidesForDay(courseKey, module, day);
    const order = Number.parseInt(orderValue, 10);
    const index = slides.findIndex((slide) => slide.order === order);
    if (!slides.length || !Number.isInteger(order) || index < 0) {
      renderNotFound(courseKey);
      return;
    }
    const slide = slides[index];
    const modules = modulesForCourse(courseKey);
    const days = daysForModule(courseKey, module);
    const previous = index > 0 ? slides[index - 1] : null;
    const next = index < slides.length - 1 ? slides[index + 1] : null;
    const useApprovedImage = hasApprovedImage(slide);
    const moduleOptions = modules
      .map(
        (item) =>
          `<option value="${escapeHtml(item)}" ${item === module ? "selected" : ""}>${escapeHtml(item)}</option>`,
      )
      .join("");
    const dayOptions = days
      .map(
        (item) =>
          `<option value="${escapeHtml(item)}" ${item === day ? "selected" : ""}>${escapeHtml(item)}</option>`,
      )
      .join("");
    const image = useApprovedImage
      ? `
        <img
          class="slide-image"
          data-slide-image
          src="${escapeHtml(imagePath(slide))}"
          alt="${escapeHtml(`${slide.title}. ${slide.key_message}`)}"
          loading="eager"
          decoding="async"
          hidden
        >
        ${placeholderMarkup(slide)}
      `
      : placeholderMarkup(slide);
    const courseChangeAction = LOCKED_COURSE
      ? ""
      : `
        <button class="text-button" type="button" data-route="${route("select")}">
          <span class="change-label">과정 변경</span>
          <span aria-hidden="true">↺</span>
        </button>
      `;

    state.currentViewer = {
      courseKey,
      module,
      day,
      slides,
      index,
    };

    app.innerHTML = `
      <main class="viewer" id="viewer" aria-label="${escapeHtml(dayTitle(slides))} 슬라이드 뷰어">
        <header class="viewer-header">
          <button class="brand-button" type="button" data-route="${route(courseKey)}" aria-label="선택한 과정 홈">
            <span class="brand-mark" aria-hidden="true">AX</span>
            <span class="brand-label">${escapeHtml(COURSE_META[courseKey].label)}</span>
          </button>
          <div class="route-context">
            <label class="sr-only" for="module-select">모듈 이동</label>
            <select class="viewer-select" id="module-select" data-jump="module">${moduleOptions}</select>
            <label class="sr-only" for="day-select">일자 이동</label>
            <select class="viewer-select" id="day-select" data-jump="day">${dayOptions}</select>
          </div>
          <div class="viewer-actions">
            <button class="icon-button" type="button" data-action="open-toc" aria-label="모듈과 일자 목차 열기">목차</button>
            <button class="icon-button" type="button" data-action="fullscreen" aria-label="전체 화면 발표 시작">
              <span class="fullscreen-label">전체 화면</span>
              <span aria-hidden="true">⛶</span>
            </button>
            ${courseChangeAction}
          </div>
        </header>
        <section class="viewer-stage-area" aria-label="현재 슬라이드">
          <div class="slide-frame">${image}</div>
        </section>
        <footer class="viewer-footer">
          <span class="keyboard-hint">← → 이동 · Home 처음 · End 마지막 · F 전체 화면</span>
          <div class="position-status" id="slide-status" aria-live="polite">
            ${index + 1} / ${slides.length}
          </div>
          <nav class="viewer-navigation" aria-label="슬라이드 이동">
            <button class="icon-button" type="button" data-action="previous" ${previous ? "" : "disabled"} aria-label="이전 슬라이드">← 이전</button>
            <button class="icon-button" type="button" data-action="next" ${next ? "" : "disabled"} aria-label="다음 슬라이드">다음 →</button>
          </nav>
        </footer>
        ${tocMarkup(courseKey, module, day, slide)}
      </main>
    `;

    setupViewerImage();
    preloadAdjacent([previous, next].filter(Boolean));
    updateFullscreenLabel();
  }

  function setupViewerImage() {
    const image = document.querySelector("[data-slide-image]");
    const placeholder = document.querySelector("[data-slide-placeholder]");
    if (!image || !placeholder) return;
    const showImage = () => {
      image.hidden = false;
      placeholder.hidden = true;
    };
    const showPlaceholder = () => {
      image.hidden = true;
      placeholder.hidden = false;
    };
    image.addEventListener("load", showImage, { once: true });
    image.addEventListener("error", showPlaceholder, { once: true });
    if (image.complete) {
      if (image.naturalWidth > 0) showImage();
      else showPlaceholder();
    }
  }

  function preloadAdjacent(slides) {
    slides
      .filter(hasApprovedImage)
      .forEach((slide) => {
        const image = new Image();
        image.decoding = "async";
        image.src = imagePath(slide);
      });
  }

  function renderNotFound(courseKey = null) {
    const target = courseKey && COURSE_META[courseKey] ? route(courseKey) : route("select");
    app.innerHTML = `
      <main class="error-card">
        <p class="eyebrow">ROUTE CHECK</p>
        <h1>요청한 강의교안을 찾을 수 없습니다.</h1>
        <p>과정·모듈·일자·슬라이드 번호가 manifest에 있는지 확인해 주세요.</p>
        <button class="primary-button" type="button" data-route="${target}">목록으로 돌아가기</button>
      </main>
    `;
    state.currentViewer = null;
  }

  function renderError(title, detail) {
    app.innerHTML = `
      <main class="error-card" role="alert">
        <p class="eyebrow">DATA ERROR</p>
        <h1>${escapeHtml(title)}</h1>
        <p>${escapeHtml(detail)}</p>
        <button class="primary-button" type="button" data-action="reload">다시 불러오기</button>
      </main>
    `;
    state.currentViewer = null;
  }

  function renderRoute() {
    if (!state.slides.length) return;
    const current = parseRoute();
    state.currentViewer = null;
    switch (current.screen) {
      case "select":
        renderSelect();
        break;
      case "course":
        renderCourseHome(current.course);
        break;
      case "module":
        renderModule(current.course, current.module);
        break;
      case "day":
        renderDay(current.course, current.module, current.day);
        break;
      case "viewer":
        renderViewer(
          current.course,
          current.module,
          current.day,
          current.order,
        );
        break;
      default:
        renderNotFound(LOCKED_COURSE);
    }
    window.requestAnimationFrame(() => app.focus({ preventScroll: true }));
  }

  function goToViewerIndex(index) {
    const current = state.currentViewer;
    if (!current || index < 0 || index >= current.slides.length) return;
    const slide = current.slides[index];
    navigate(
      route(
        current.courseKey,
        current.module,
        current.day,
        String(slide.order).padStart(3, "0"),
      ),
    );
  }

  async function toggleFullscreen() {
    if (!document.querySelector("#viewer")) return;
    try {
      if (document.fullscreenElement) {
        await document.exitFullscreen();
      } else {
        await app.requestFullscreen();
      }
    } catch {
      // Browsers may deny fullscreen unless the action is user initiated.
    }
  }

  function updateFullscreenLabel() {
    const button = document.querySelector('[data-action="fullscreen"]');
    if (!button) return;
    const label = button.querySelector(".fullscreen-label");
    const active = Boolean(document.fullscreenElement);
    if (label) label.textContent = active ? "전체 화면 종료" : "전체 화면";
    button.setAttribute(
      "aria-label",
      active ? "전체 화면 발표 종료" : "전체 화면 발표 시작",
    );
  }

  function openToc() {
    const dialog = document.querySelector("#toc-dialog");
    if (!dialog) return;
    if (typeof dialog.showModal === "function") dialog.showModal();
    else dialog.setAttribute("open", "");
  }

  function closeToc() {
    const dialog = document.querySelector("#toc-dialog");
    if (!dialog) return;
    if (typeof dialog.close === "function") dialog.close();
    else dialog.removeAttribute("open");
  }

  app.addEventListener("click", (event) => {
    const routeTarget = event.target.closest("[data-route]");
    if (routeTarget) {
      const dialog = routeTarget.closest("dialog");
      if (dialog?.open) closeToc();
      navigate(routeTarget.dataset.route);
      return;
    }

    const courseTarget = event.target.closest("[data-course]");
    if (courseTarget) {
      const course = courseTarget.dataset.course;
      if (COURSE_META[course]) {
        saveCourse(course);
        navigate(route(course));
      }
      return;
    }

    const actionTarget = event.target.closest("[data-action]");
    if (!actionTarget) return;
    switch (actionTarget.dataset.action) {
      case "previous":
        goToViewerIndex(state.currentViewer?.index - 1);
        break;
      case "next":
        goToViewerIndex(state.currentViewer?.index + 1);
        break;
      case "fullscreen":
        toggleFullscreen();
        break;
      case "open-toc":
        openToc();
        break;
      case "close-toc":
        closeToc();
        break;
      case "reload":
        window.location.reload();
        break;
      default:
        break;
    }
  });

  app.addEventListener("change", (event) => {
    const target = event.target.closest("[data-jump]");
    const current = state.currentViewer;
    if (!target || !current) return;
    if (target.dataset.jump === "module") {
      const module = target.value;
      const day = daysForModule(current.courseKey, module)[0];
      if (day) navigate(route(current.courseKey, module, day, "001"));
    }
    if (target.dataset.jump === "day") {
      navigate(route(current.courseKey, current.module, target.value, "001"));
    }
  });

  window.addEventListener("keydown", (event) => {
    const current = state.currentViewer;
    if (!current) return;
    const dialog = document.querySelector("#toc-dialog");
    if (dialog?.open) {
      if (event.key === "Escape") closeToc();
      return;
    }
    const activeTag = document.activeElement?.tagName;
    if (["INPUT", "TEXTAREA", "SELECT"].includes(activeTag)) {
      return;
    }
    if (activeTag === "BUTTON" && [" ", "Enter"].includes(event.key)) {
      return;
    }

    const actions = {
      ArrowRight: () => goToViewerIndex(current.index + 1),
      PageDown: () => goToViewerIndex(current.index + 1),
      " ": () => goToViewerIndex(current.index + 1),
      ArrowLeft: () => goToViewerIndex(current.index - 1),
      PageUp: () => goToViewerIndex(current.index - 1),
      Home: () => goToViewerIndex(0),
      End: () => goToViewerIndex(current.slides.length - 1),
      f: () => toggleFullscreen(),
      F: () => toggleFullscreen(),
      Escape: () => {
        if (document.fullscreenElement) document.exitFullscreen();
      },
    };
    const action = actions[event.key];
    if (!action) return;
    event.preventDefault();
    action();
  });

  window.addEventListener("hashchange", renderRoute);
  document.addEventListener("fullscreenchange", updateFullscreenLabel);

  async function initialize() {
    try {
      const response = await fetch(MANIFEST_URL, { cache: "no-store" });
      if (!response.ok) {
        throw new Error(`manifest request failed: ${response.status}`);
      }
      const manifest = await response.json();
      if (!manifest || !Array.isArray(manifest.slides)) {
        throw new Error("manifest.slides is not an array");
      }
      state.manifest = manifest;
      state.slides = manifest.slides;
      renderRoute();
    } catch (error) {
      console.error(error);
      renderError(
        "슬라이드 데이터를 불러오지 못했습니다.",
        "로컬 웹 서버로 실행했는지, data/slide-manifest.json 경로가 올바른지 확인해 주세요.",
      );
    }
  }

  initialize();
})();
