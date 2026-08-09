import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { spawn } from "node:child_process";
import { fileURLToPath, pathToFileURL } from "node:url";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const EDGE = "C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe";
const OUTPUT = path.join(ROOT, ".tmp-guide-visual-audit-20260809");
const PROFILE = path.join(os.tmpdir(), `ax-guide-visual-audit-${process.pid}-${Date.now()}`);
const DEBUG_PORT = 9880 + (process.pid % 80);
const BATCH_SIZE = 20;
const WIDTH = 1800;
const HEIGHT = 1480;

const delay = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

function walk(directory) {
  return fs.readdirSync(directory, { withFileTypes: true }).flatMap((entry) => {
    const absolute = path.join(directory, entry.name);
    return entry.isDirectory() ? walk(absolute) : [absolute];
  });
}

function safeResetOutput() {
  const resolved = path.resolve(OUTPUT);
  if (!resolved.startsWith(`${ROOT}${path.sep}`) || path.basename(resolved) !== ".tmp-guide-visual-audit-20260809") {
    throw new Error(`Unsafe output path: ${resolved}`);
  }
  if (fs.existsSync(resolved)) fs.rmSync(resolved, { recursive: true, force: true });
  fs.mkdirSync(resolved, { recursive: true });
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
      const timer = setTimeout(() => reject(new Error(`CDP timeout: ${method}`)), 15000);
      this.pending.set(id, {
        resolve: (value) => { clearTimeout(timer); resolve(value); },
        reject: (error) => { clearTimeout(timer); reject(error); },
      });
      this.socket.send(JSON.stringify({ id, method, params }));
    });
  }
  close() { this.socket.close(); }
}

async function evaluate(cdp, expression) {
  const result = await cdp.send("Runtime.evaluate", { expression, awaitPromise: true, returnByValue: true });
  if (result.exceptionDetails) throw new Error(result.exceptionDetails.exception?.description || result.exceptionDetails.text);
  return result.result?.value;
}

function pageHtml(files, pageNumber, pageCount) {
  const cards = files.map((file) => {
    const relative = path.relative(ROOT, file).split(path.sep).join("/");
    return `<article><div class="image"><img src="${pathToFileURL(file).href}" alt="${relative}"></div><p>${relative}</p></article>`;
  }).join("\n");
  return `<!doctype html><html lang="ko"><head><meta charset="utf-8"><style>*{box-sizing:border-box}body{margin:0;background:#dde6f1;font-family:Arial,'Noto Sans KR',sans-serif;color:#172b4d}.page{width:${WIDTH}px;height:${HEIGHT}px;padding:20px;display:grid;grid-template-rows:50px 1fr;gap:12px}header{display:flex;align-items:center;justify-content:space-between;background:#0b3b8f;color:#fff;border-radius:14px;padding:0 18px;font-weight:800}.grid{display:grid;grid-template-columns:repeat(4,1fr);grid-template-rows:repeat(5,1fr);gap:10px}article{background:#fff;border:1px solid #c3d1e2;border-radius:10px;padding:8px;display:grid;grid-template-rows:1fr 32px;min-height:0}.image{min-height:0;display:grid;place-items:center;background:#f5f7fa;border-radius:7px;overflow:hidden}.image img{width:100%;height:100%;object-fit:contain;display:block}p{font-size:10px;line-height:1.25;margin:7px 2px 0;overflow-wrap:anywhere}</style></head><body data-audit-ready="true"><main class="page"><header><span>GUIDE IMAGE CONTACT SHEET</span><span>${pageNumber}/${pageCount}</span></header><section class="grid">${cards}</section></main></body></html>`;
}

async function main() {
  safeResetOutput();
  const images = walk(path.join(ROOT, "assets", "guide-images"))
    .filter((file) => /\.(?:png|svg)$/i.test(file))
    .sort();
  if (images.length !== 163) throw new Error(`Expected 163 guide images, found ${images.length}`);
  const batches = [];
  for (let index = 0; index < images.length; index += BATCH_SIZE) batches.push(images.slice(index, index + BATCH_SIZE));
  fs.mkdirSync(PROFILE, { recursive: true });
  const edge = spawn(EDGE, [
    "--headless=new", "--disable-gpu", "--hide-scrollbars", "--no-first-run", "--no-default-browser-check",
    `--remote-debugging-port=${DEBUG_PORT}`, `--user-data-dir=${PROFILE}`, `--window-size=${WIDTH},${HEIGHT}`, "about:blank",
  ], { stdio: "ignore", windowsHide: true });
  let cdp;
  try {
    const target = await debugTarget();
    cdp = new Cdp(target.webSocketDebuggerUrl);
    await cdp.send("Page.enable");
    await cdp.send("Runtime.enable");
    await cdp.send("Emulation.setDeviceMetricsOverride", { width: WIDTH, height: HEIGHT, deviceScaleFactor: 1, mobile: false, screenWidth: WIDTH, screenHeight: HEIGHT });
    for (let index = 0; index < batches.length; index += 1) {
      const htmlPath = path.join(OUTPUT, `contact-${String(index + 1).padStart(2, "0")}.html`);
      fs.writeFileSync(htmlPath, pageHtml(batches[index], index + 1, batches.length), "utf8");
      await cdp.send("Page.navigate", { url: pathToFileURL(htmlPath).href });
      for (let attempt = 0; attempt < 100; attempt += 1) {
        const ready = await evaluate(cdp, "document.readyState==='complete' && [...document.images].every((image)=>image.complete && image.naturalWidth>0)");
        if (ready) break;
        if (attempt === 99) throw new Error(`Images did not load for contact sheet ${index + 1}`);
        await delay(80);
      }
      await evaluate(cdp, "document.fonts.ready.then(()=>new Promise((resolve)=>requestAnimationFrame(()=>requestAnimationFrame(resolve))))");
      const screenshot = await cdp.send("Page.captureScreenshot", { format: "png", fromSurface: true, captureBeyondViewport: false });
      fs.writeFileSync(path.join(OUTPUT, `contact-${String(index + 1).padStart(2, "0")}.png`), Buffer.from(screenshot.data, "base64"));
      console.log(`contact=${index + 1}/${batches.length}`);
    }
    console.log(JSON.stringify({ images: images.length, contactSheets: batches.length, output: path.relative(ROOT, OUTPUT) }, null, 2));
  } finally {
    if (cdp) cdp.close();
    edge.kill("SIGKILL");
    edge.unref();
    const tempRoot = path.resolve(os.tmpdir());
    const profile = path.resolve(PROFILE);
    if (profile.startsWith(`${tempRoot}${path.sep}`) && path.basename(profile).startsWith("ax-guide-visual-audit-")) {
      for (let attempt = 0; attempt < 20; attempt += 1) {
        try { fs.rmSync(profile, { recursive: true, force: true }); break; } catch { await delay(200); }
      }
    }
  }
}

main().catch((error) => { console.error(error); process.exitCode = 1; });
