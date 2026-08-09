import fs from "node:fs";
import http from "node:http";
import os from "node:os";
import path from "node:path";
import { spawn } from "node:child_process";
import { fileURLToPath } from "node:url";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const SITE = path.join(ROOT, ".pages-dist");
const EDGE = "C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe";
const DEBUG_PORT = 9900 + (process.pid % 90);
const HTTP_PORT = 18000 + (process.pid % 1000);
const PROFILE = path.join(os.tmpdir(), `ax-site-runtime-audit-${process.pid}-${Date.now()}`);
const REPORT = path.join(ROOT, "docs", "review", "site-runtime-audit-2026-08-09.json");
const VIEWPORTS = [
  { name: "projector", width: 1920, height: 1080, mobile: false },
  { name: "laptop", width: 1366, height: 768, mobile: false },
  { name: "mobile", width: 390, height: 844, mobile: true },
];

const delay = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

function safeSitePath(urlPath) {
  const pathname = decodeURIComponent(urlPath.split("?")[0]);
  const relative = pathname === "/" ? "index.html" : pathname.replace(/^\/+/, "");
  const candidate = path.resolve(SITE, relative);
  if (candidate !== SITE && !candidate.startsWith(`${SITE}${path.sep}`)) return null;
  if (fs.existsSync(candidate) && fs.statSync(candidate).isDirectory()) {
    const index = path.join(candidate, "index.html");
    return fs.existsSync(index) ? index : null;
  }
  return fs.existsSync(candidate) && fs.statSync(candidate).isFile() ? candidate : null;
}

function contentType(file) {
  return {
    ".css": "text/css; charset=utf-8",
    ".html": "text/html; charset=utf-8",
    ".js": "text/javascript; charset=utf-8",
    ".json": "application/json; charset=utf-8",
    ".png": "image/png",
    ".svg": "image/svg+xml; charset=utf-8",
  }[path.extname(file).toLowerCase()] || "application/octet-stream";
}

function startServer() {
  const server = http.createServer((request, response) => {
    const file = safeSitePath(request.url || "/");
    if (!file) {
      response.writeHead(404, { "content-type": "text/plain; charset=utf-8" });
      response.end("not found");
      return;
    }
    response.writeHead(200, { "content-type": contentType(file), "cache-control": "no-store" });
    fs.createReadStream(file).pipe(response);
  });
  return new Promise((resolve, reject) => {
    server.once("error", reject);
    server.listen(HTTP_PORT, "127.0.0.1", () => resolve(server));
  });
}

async function debugTarget() {
  let lastError;
  for (let attempt = 0; attempt < 100; attempt += 1) {
    try {
      const response = await fetch(`http://127.0.0.1:${DEBUG_PORT}/json/list`);
      const targets = await response.json();
      const page = targets.find((item) => item.type === "page");
      if (page?.webSocketDebuggerUrl) return page;
    } catch (error) {
      lastError = error;
    }
    await delay(200);
  }
  throw lastError || new Error("Edge debug target not available");
}

class Cdp {
  constructor(url) {
    this.id = 0;
    this.pending = new Map();
    this.socket = new WebSocket(url);
    this.opened = new Promise((resolve, reject) => {
      this.socket.addEventListener("open", resolve, { once: true });
      this.socket.addEventListener("error", reject, { once: true });
    });
    this.socket.addEventListener("message", (event) => {
      const message = JSON.parse(event.data);
      if (!message.id) return;
      const pending = this.pending.get(message.id);
      if (!pending) return;
      this.pending.delete(message.id);
      if (message.error) pending.reject(new Error(message.error.message));
      else pending.resolve(message.result || {});
    });
  }

  async send(method, params = {}) {
    await this.opened;
    const id = ++this.id;
    return new Promise((resolve, reject) => {
      const timer = setTimeout(() => {
        this.pending.delete(id);
        reject(new Error(`CDP command timed out: ${method}`));
      }, 20000);
      this.pending.set(id, {
        resolve: (value) => {
          clearTimeout(timer);
          resolve(value);
        },
        reject: (error) => {
          clearTimeout(timer);
          reject(error);
        },
      });
      this.socket.send(JSON.stringify({ id, method, params }));
    });
  }

  close() {
    this.socket.close();
  }
}

async function evaluate(cdp, expression) {
  const result = await cdp.send("Runtime.evaluate", {
    expression,
    awaitPromise: true,
    returnByValue: true,
  });
  if (result.exceptionDetails) {
    throw new Error(result.exceptionDetails.exception?.description || result.exceptionDetails.text || "Evaluation failed");
  }
  return result.result?.value;
}

async function waitForViewer(cdp) {
  for (let attempt = 0; attempt < 150; attempt += 1) {
    const ready = await evaluate(cdp, `(() => {
      const image = document.querySelector('[data-slide-image]');
      return document.readyState === 'complete' && image && image.complete;
    })()`);
    if (ready) {
      await evaluate(cdp, "document.fonts.ready.then(() => new Promise((resolve) => requestAnimationFrame(() => requestAnimationFrame(resolve))))");
      return;
    }
    await delay(80);
  }
  throw new Error("Viewer did not finish loading");
}

async function inspect(cdp, course, module, day, viewport) {
  await cdp.send("Emulation.setDeviceMetricsOverride", {
    width: viewport.width,
    height: viewport.height,
    deviceScaleFactor: 1,
    mobile: viewport.mobile,
    screenWidth: viewport.width,
    screenHeight: viewport.height,
  });
  const url = `http://127.0.0.1:${HTTP_PORT}/${course}/#/${course}/${module}/${day}/001`;
  await cdp.send("Page.navigate", { url });
  await waitForViewer(cdp);
  return evaluate(cdp, `(() => {
    const image = document.querySelector('[data-slide-image]');
    const placeholder = document.querySelector('[data-slide-placeholder]');
    const frame = document.querySelector('.slide-frame')?.getBoundingClientRect();
    const external = [...document.querySelectorAll('[src],[href]')]
      .map((node) => node.getAttribute('src') || node.getAttribute('href'))
      .filter((value) => /^https?:/i.test(value || ''))
      .filter((value) => new URL(value, location.href).origin !== location.origin);
    const text = document.body?.innerText || '';
    return {
      title: document.title,
      lang: document.documentElement.lang,
      charset: document.characterSet,
      route: location.hash,
      lockedCourse: document.documentElement.dataset.courseLock,
      imageVisible: Boolean(image && !image.hidden),
      imageComplete: Boolean(image?.complete),
      imageNaturalWidth: image?.naturalWidth || 0,
      imageNaturalHeight: image?.naturalHeight || 0,
      placeholderHidden: Boolean(placeholder?.hidden),
      horizontalOverflow: Math.max(0, document.documentElement.scrollWidth - innerWidth),
      frameInsideViewport: Boolean(frame && frame.left >= -1 && frame.right <= innerWidth + 1 && frame.top >= -1 && frame.bottom <= innerHeight + 1),
      replacementCharacters: text.split(String.fromCharCode(0xfffd)).length - 1,
      questionMarkRuns: text.split('???').length - 1,
      koreanUiPresent: document.title.includes('강의교안') && text.trim().length > 20,
      externalReferences: external,
      courseChangeControls: document.querySelectorAll('[data-action="change-course"]').length,
      viewport: { width: innerWidth, height: innerHeight },
    };
  })()`);
}

async function keyboardAudit(cdp, course) {
  const navigate = async (key) => {
    await evaluate(cdp, `window.dispatchEvent(new KeyboardEvent('keydown', { key: ${JSON.stringify(key)}, bubbles: true }))`);
    await delay(120);
    return evaluate(cdp, `({ hash: location.hash, status: document.querySelector('#slide-status')?.textContent.trim() })`);
  };
  return {
    next: await navigate("ArrowRight"),
    first: await navigate("Home"),
    last: await navigate("End"),
    course,
  };
}

async function main() {
  if (!fs.existsSync(EDGE)) throw new Error("Microsoft Edge not found");
  if (!fs.existsSync(SITE)) throw new Error("Run scripts/build-pages.mjs before this audit");
  const manifest = JSON.parse(fs.readFileSync(path.join(SITE, "data", "slide-manifest.json"), "utf8"));
  const days = [...new Set(manifest.slides.map((slide) => `${slide.module}/${slide.day}`))].sort();
  if (days.length !== 15) throw new Error(`Expected 15 module/day combinations, found ${days.length}`);

  const server = await startServer();
  fs.mkdirSync(PROFILE, { recursive: true });
  const edge = spawn(EDGE, [
    "--headless=new",
    "--disable-gpu",
    "--hide-scrollbars",
    "--no-first-run",
    "--no-default-browser-check",
    `--remote-debugging-port=${DEBUG_PORT}`,
    `--user-data-dir=${PROFILE}`,
    "--window-size=1920,1080",
    "about:blank",
  ], { stdio: "ignore", windowsHide: true });

  let cdp;
  try {
    const target = await debugTarget();
    cdp = new Cdp(target.webSocketDebuggerUrl);
    await cdp.send("Page.enable");
    await cdp.send("Runtime.enable");
    const checks = [];
    for (const course of ["backoffice", "marketing"]) {
      for (const value of days) {
        const [module, day] = value.split("/");
        for (const viewport of VIEWPORTS) {
          try {
            checks.push({ course, module, day, viewport: viewport.name, ...await inspect(cdp, course, module, day, viewport) });
          } catch (error) {
            checks.push({ course, module, day, viewport: viewport.name, auditError: String(error.message || error) });
          }
        }
      }
      console.log(`audited_course=${course}`);
    }

    await inspect(cdp, "backoffice", "M05", "D01", VIEWPORTS[1]);
    const keyboard = await keyboardAudit(cdp, "backoffice");
    const invalid = checks.filter((item) =>
      item.auditError ||
      item.charset !== "UTF-8" ||
      item.lang !== "ko" ||
      item.lockedCourse !== item.course ||
      !item.imageVisible ||
      !item.imageComplete ||
      item.imageNaturalWidth !== 2048 ||
      item.imageNaturalHeight !== 1152 ||
      !item.placeholderHidden ||
      item.horizontalOverflow > 2 ||
      !item.frameInsideViewport ||
      item.replacementCharacters > 0 ||
      item.questionMarkRuns > 0 ||
      !item.koreanUiPresent ||
      item.externalReferences.length > 0 ||
      item.courseChangeControls > 0
    );
    const keyboardValid = keyboard.next?.status?.startsWith("2 / ") && keyboard.first?.status?.startsWith("1 / ") && /\d+ \/ \d+/.test(keyboard.last?.status || "");
    const report = {
      auditedAt: new Date().toISOString(),
      routes: 30,
      viewportChecks: checks.length,
      viewports: VIEWPORTS.map(({ name, width, height }) => `${name}:${width}x${height}`),
      invalidCount: invalid.length,
      keyboardValid,
      keyboard,
      invalid,
      checks,
    };
    fs.mkdirSync(path.dirname(REPORT), { recursive: true });
    fs.writeFileSync(REPORT, `${JSON.stringify(report, null, 2)}\n`, "utf8");
    console.log(JSON.stringify({ routes: 30, viewportChecks: checks.length, invalidCount: invalid.length, keyboardValid, report: path.relative(ROOT, REPORT).replaceAll("\\", "/") }, null, 2));
    if (invalid.length || !keyboardValid) process.exitCode = 1;
  } finally {
    if (cdp) cdp.close();
    edge.kill("SIGKILL");
    edge.unref();
    await new Promise((resolve) => server.close(resolve));
    const tempRoot = path.resolve(os.tmpdir());
    const profile = path.resolve(PROFILE);
    if (profile.startsWith(`${tempRoot}${path.sep}`) && path.basename(profile).startsWith("ax-site-runtime-audit-")) {
      for (let attempt = 0; attempt < 20; attempt += 1) {
        try {
          fs.rmSync(profile, { recursive: true, force: true });
          break;
        } catch {
          await delay(200);
        }
      }
    }
  }
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
