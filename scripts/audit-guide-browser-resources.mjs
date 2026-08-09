import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { spawn } from "node:child_process";
import { fileURLToPath, pathToFileURL } from "node:url";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const EDGE = "C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe";
const DEBUG_PORT = 9720 + (process.pid % 200);
const PROFILE = path.join(os.tmpdir(), `ax-guide-browser-audit-${process.pid}-${Date.now()}`);
const REPORT = path.join(ROOT, "docs", "review", "guide-browser-resource-audit-2026-08-09.json");

const delay = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

function walk(directory) {
  if (!fs.existsSync(directory)) return [];
  return fs.readdirSync(directory, { withFileTypes: true }).flatMap((entry) => {
    const absolute = path.join(directory, entry.name);
    return entry.isDirectory() ? walk(absolute) : [absolute];
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
      }, 15000);
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
    const detail = result.exceptionDetails.exception?.description || result.exceptionDetails.text || "Evaluation failed";
    throw new Error(detail);
  }
  return result.result?.value;
}

async function waitForDocument(cdp) {
  for (let attempt = 0; attempt < 100; attempt += 1) {
    if (await evaluate(cdp, "document.readyState === 'complete'")) {
      await evaluate(cdp, "document.fonts.ready.then(() => new Promise((resolve) => requestAnimationFrame(() => requestAnimationFrame(resolve))))");
      return;
    }
    await delay(80);
  }
  throw new Error("Document did not finish loading");
}

function relative(absolute) {
  return path.relative(ROOT, absolute).split(path.sep).join("/");
}

async function inspect(cdp, file, viewport, navigate = true) {
  await cdp.send("Emulation.setDeviceMetricsOverride", {
    width: viewport.width,
    height: viewport.height,
    deviceScaleFactor: 1,
    mobile: viewport.mobile,
    screenWidth: viewport.width,
    screenHeight: viewport.height,
  });
  if (navigate) {
    await cdp.send("Page.navigate", { url: pathToFileURL(file).href });
    await waitForDocument(cdp);
  } else {
    await evaluate(cdp, "new Promise((resolve) => requestAnimationFrame(() => requestAnimationFrame(resolve)))");
  }
  return evaluate(cdp, `(() => {
    const external = [...document.querySelectorAll('[src],[href]')]
      .map((node) => node.getAttribute('src') || node.getAttribute('href'))
      .filter((value) => /^https?:/i.test(value || ''));
    const images = [...document.images];
    const controls = [...document.querySelectorAll('button,input,select,textarea,a[href]')];
    const text = document.body?.innerText || '';
    return {
      title: document.title,
      lang: document.documentElement.lang,
      charset: document.characterSet,
      bodyTextLength: text.trim().length,
      replacementCharacters: text.split(String.fromCharCode(0xfffd)).length - 1,
      questionMarkRuns: text.split('???').length - 1,
      externalReferences: external,
      images: images.length,
      brokenImages: images.filter((image) => !image.complete || image.naturalWidth === 0).map((image) => image.getAttribute('src')),
      controls: controls.length,
      horizontalOverflow: Math.max(0, document.documentElement.scrollWidth - innerWidth),
      scrollWidth: document.documentElement.scrollWidth,
      scrollHeight: document.documentElement.scrollHeight,
      viewport: { width: innerWidth, height: innerHeight },
    };
  })()`);
}

async function main() {
  if (!fs.existsSync(EDGE)) throw new Error("Microsoft Edge not found");
  const htmlFiles = walk(path.join(ROOT, "downloads", "guide-resources"))
    .filter((file) => file.toLowerCase().endsWith(".html"))
    .sort();
  if (htmlFiles.length !== 82) throw new Error(`Expected 82 HTML files, found ${htmlFiles.length}`);

  fs.mkdirSync(PROFILE, { recursive: true });
  const edge = spawn(EDGE, [
    "--headless=new",
    "--disable-gpu",
    "--hide-scrollbars",
    "--no-first-run",
    "--no-default-browser-check",
    `--remote-debugging-port=${DEBUG_PORT}`,
    `--user-data-dir=${PROFILE}`,
    "--window-size=1600,900",
    "about:blank",
  ], { stdio: "ignore", windowsHide: true });

  let cdp;
  try {
    const target = await debugTarget();
    cdp = new Cdp(target.webSocketDebuggerUrl);
    await cdp.send("Page.enable");
    await cdp.send("Runtime.enable");

    const desktop = [];
    const mobile = [];
    for (let index = 0; index < htmlFiles.length; index += 1) {
      const file = htmlFiles[index];
      try {
        desktop.push({ file: relative(file), ...await inspect(cdp, file, { width: 1600, height: 900, mobile: false }) });
      } catch (error) {
        desktop.push({ file: relative(file), auditError: String(error.message || error) });
      }
      try {
        mobile.push({ file: relative(file), ...await inspect(cdp, file, { width: 390, height: 844, mobile: true }, false) });
      } catch (error) {
        mobile.push({ file: relative(file), auditError: String(error.message || error) });
      }
      if ((index + 1) % 10 === 0 || index + 1 === htmlFiles.length) {
        console.log(`audited=${index + 1}/${htmlFiles.length}`);
      }
    }

    const invalid = [...desktop, ...mobile].filter((item) =>
      item.auditError ||
      item.charset !== "UTF-8" ||
      item.lang !== "ko" ||
      item.bodyTextLength < 40 ||
      item.replacementCharacters > 0 ||
      item.questionMarkRuns > 0 ||
      item.externalReferences.length > 0 ||
      item.brokenImages.length > 0 ||
      item.horizontalOverflow > 2
    );
    const report = {
      auditedAt: new Date().toISOString(),
      htmlFiles: htmlFiles.length,
      desktopViewport: "1600x900",
      mobileViewport: "390x844",
      invalidCount: invalid.length,
      invalid,
      desktop,
      mobile,
    };
    fs.mkdirSync(path.dirname(REPORT), { recursive: true });
    fs.writeFileSync(REPORT, `${JSON.stringify(report, null, 2)}\n`, "utf8");
    console.log(JSON.stringify({ htmlFiles: htmlFiles.length, renderChecks: htmlFiles.length * 2, invalidCount: invalid.length, report: relative(REPORT) }, null, 2));
    if (invalid.length) process.exitCode = 1;
  } finally {
    if (cdp) cdp.close();
    edge.kill("SIGKILL");
    edge.unref();
    const tempRoot = path.resolve(os.tmpdir());
    const profile = path.resolve(PROFILE);
    if (profile.startsWith(`${tempRoot}${path.sep}`) && path.basename(profile).startsWith("ax-guide-browser-audit-")) {
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
