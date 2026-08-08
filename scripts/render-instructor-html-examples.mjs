import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { spawn } from "node:child_process";
import { fileURLToPath, pathToFileURL } from "node:url";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const EDGE = "C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe";
const DEBUG_PORT = 9450 + (process.pid % 200);
const PROFILE = path.join(os.tmpdir(), "ax-instructor-examples-edge-" + process.pid + "-" + Date.now());

function delay(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function debugTarget() {
  let lastError;
  for (let attempt = 0; attempt < 100; attempt += 1) {
    try {
      const response = await fetch("http://127.0.0.1:" + DEBUG_PORT + "/json/list");
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
        reject(new Error("CDP command timed out: " + method));
      }, 12000);
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
  if (result.exceptionDetails) throw new Error("Evaluation failed");
  return result.result?.value;
}

async function waitReady(cdp) {
  for (let attempt = 0; attempt < 100; attempt += 1) {
    const ready = await evaluate(cdp, "document.readyState === 'complete' && document.body?.dataset.exampleReady === 'true' && document.querySelectorAll('.session-card').length === 4");
    if (ready) {
      await evaluate(cdp, "document.fonts.ready.then(() => new Promise((resolve) => requestAnimationFrame(() => requestAnimationFrame(resolve))))");
      return;
    }
    await delay(80);
  }
  throw new Error("HTML example did not become ready");
}

function examples() {
  const result = [];
  for (const roleKey of ["backoffice", "marketing"]) {
    const roleRoot = path.join(ROOT, "downloads", "guide-resources", roleKey);
    for (const dayId of fs.readdirSync(roleRoot).filter((name) => /^M\d\d-D\d\d$/.test(name)).sort()) {
      const solutionDir = path.join(roleRoot, dayId, "solutions");
      const expected = dayId.toLowerCase() + "-" + roleKey + "-complete-example.html";
      const source = path.join(solutionDir, expected);
      if (!fs.existsSync(source)) throw new Error("Missing HTML example: " + source);
      const target = path.join(ROOT, "assets", "guide-images", roleKey, dayId, "complete-example-overview.png");
      result.push({ roleKey, dayId, source, target });
    }
  }
  return result;
}

async function main() {
  if (!fs.existsSync(EDGE)) throw new Error("Microsoft Edge not found");
  const jobs = examples();
  if (jobs.length !== 30) throw new Error("Expected 30 HTML examples, found " + jobs.length);
  fs.mkdirSync(PROFILE, { recursive: true });

  const edge = spawn(EDGE, [
    "--headless=new",
    "--disable-gpu",
    "--hide-scrollbars",
    "--no-first-run",
    "--no-default-browser-check",
    "--remote-debugging-port=" + DEBUG_PORT,
    "--user-data-dir=" + PROFILE,
    "--window-size=1600,900",
    "about:blank",
  ], { stdio: "ignore", windowsHide: true });

  let cdp;
  try {
    const target = await debugTarget();
    cdp = new Cdp(target.webSocketDebuggerUrl);
    await cdp.send("Page.enable");
    await cdp.send("Runtime.enable");
    await cdp.send("Emulation.setDeviceMetricsOverride", {
      width: 1600,
      height: 900,
      deviceScaleFactor: 1,
      mobile: false,
      screenWidth: 1600,
      screenHeight: 900,
    });

    for (let index = 0; index < jobs.length; index += 1) {
      const job = jobs[index];
      fs.mkdirSync(path.dirname(job.target), { recursive: true });
      await cdp.send("Page.navigate", { url: pathToFileURL(job.source).href });
      await waitReady(cdp);
      const state = await evaluate(cdp, "({title:document.title,cards:document.querySelectorAll('.session-card').length,overflow:document.documentElement.scrollWidth-innerWidth,height:document.documentElement.scrollHeight})");
      if (state.cards !== 4 || state.overflow > 2 || state.height > 905) {
        throw new Error("Layout validation failed for " + job.dayId + " " + job.roleKey + ": " + JSON.stringify(state));
      }
      const screenshot = await cdp.send("Page.captureScreenshot", {
        format: "png",
        fromSurface: true,
        captureBeyondViewport: false,
      });
      fs.writeFileSync(job.target, Buffer.from(screenshot.data, "base64"));
      if ((index + 1) % 5 === 0 || index + 1 === jobs.length) {
        console.log("rendered=" + (index + 1) + "/" + jobs.length);
      }
    }

    await cdp.send("Emulation.setDeviceMetricsOverride", {
      width: 390,
      height: 844,
      deviceScaleFactor: 1,
      mobile: true,
      screenWidth: 390,
      screenHeight: 844,
    });
    for (const job of [jobs[0], jobs[jobs.length - 1]]) {
      await cdp.send("Page.navigate", { url: pathToFileURL(job.source).href });
      await waitReady(cdp);
      const mobileState = await evaluate(cdp, "({cards:document.querySelectorAll('.session-card').length,overflow:document.documentElement.scrollWidth-innerWidth,columns:getComputedStyle(document.querySelector('.grid')).gridTemplateColumns})");
      if (mobileState.cards !== 4 || mobileState.overflow > 2 || mobileState.columns.trim().split(/\s+/).length !== 1) {
        throw new Error("Mobile layout validation failed for " + job.dayId + " " + job.roleKey + ": " + JSON.stringify(mobileState));
      }
    }

    console.log(JSON.stringify({
      rendered: jobs.length,
      width: 1600,
      height: 900,
      mobileValidated: 2,
      outputPattern: "assets/guide-images/{role}/{day}/complete-example-overview.png",
    }, null, 2));
  } finally {
    if (cdp) cdp.close();
    edge.kill("SIGKILL");
    edge.unref();
    const tempRoot = path.resolve(os.tmpdir());
    const profile = path.resolve(PROFILE);
    if (profile.startsWith(tempRoot + path.sep) && path.basename(profile).startsWith("ax-instructor-examples-edge-")) {
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
