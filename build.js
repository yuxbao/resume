const fs = require("fs-extra");
const axios = require("axios");
const { execFileSync } = require("child_process");
const puppeteer = require("puppeteer");
const puppeteerCore = require("puppeteer-core");
const chromium = require("@sparticuz/chromium");

const gist = "yuxbao/50e74b48f2bc188fe549a2aef7ba82ce";

function isVercelBuild() {
  return process.env.VERCEL === "1";
}

function safeExecutablePath() {
  try {
    return puppeteer.executablePath();
  } catch (error) {
    return null;
  }
}

function getChromeCandidates() {
  return [
    process.env.PUPPETEER_EXECUTABLE_PATH,
    process.env.CHROME_BIN,
    process.env.GOOGLE_CHROME_BIN,
    safeExecutablePath(),
    process.platform === "darwin"
      ? "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome"
      : null,
    process.platform === "darwin"
      ? "/Applications/Google Chrome for Testing.app/Contents/MacOS/Google Chrome for Testing"
      : null,
    process.platform === "linux" ? "/usr/bin/google-chrome-stable" : null,
    process.platform === "linux" ? "/usr/bin/google-chrome" : null,
    process.platform === "linux" ? "/usr/bin/chromium-browser" : null,
    process.platform === "linux" ? "/usr/bin/chromium" : null,
  ].filter(Boolean);
}

function findChromeExecutable() {
  return getChromeCandidates().find((candidate) => fs.existsSync(candidate));
}

function installBundledChrome() {
  const cliPath = require.resolve("puppeteer/lib/cjs/puppeteer/node/cli.js");
  console.log("Chrome executable not found, installing Puppeteer's bundled Chrome...");
  execFileSync(process.execPath, [cliPath, "browsers", "install", "chrome"], {
    stdio: "inherit",
    env: process.env,
  });
}

function resolveChromeExecutable() {
  let executablePath = findChromeExecutable();

  if (!executablePath) {
    installBundledChrome();
    executablePath = findChromeExecutable();
  }

  if (!executablePath) {
    throw new Error(
      "Could not locate a Chrome executable for Puppeteer. " +
        "On Vercel, keep install scripts enabled and do not set PUPPETEER_SKIP_DOWNLOAD=true.",
    );
  }

  console.log(`Using Chrome executable: ${executablePath}`);
  return executablePath;
}

function getLaunchOptions() {
  const options = {
    headless: true,
    executablePath: resolveChromeExecutable(),
  };

  if (process.platform === "linux") {
    options.args = [
      "--no-sandbox",
      "--disable-setuid-sandbox",
      "--disable-dev-shm-usage",
    ];
  }

  return options;
}

async function getBrowserConfig() {
  if (isVercelBuild()) {
    chromium.setGraphicsMode = false;

    return {
      launcher: puppeteerCore,
      launchOptions: {
        args: puppeteerCore.defaultArgs({
          args: chromium.args,
          headless: "shell",
        }),
        defaultViewport: chromium.defaultViewport,
        executablePath: await chromium.executablePath(),
        headless: "shell",
      },
    };
  }

  return {
    launcher: puppeteer,
    launchOptions: getLaunchOptions(),
  };
}

async function buildHTML() {
  await fs.remove("./dist");
  await fs.ensureDir("./dist");

  let resume;
  if (fs.existsSync("./resume.json")) {
    console.log(`Loading from locale "resume.json"`);
    resume = JSON.parse(fs.readFileSync("./resume.json", "utf-8"));
  } else {
    console.log(`Downloading resume... [${gist}]`);
    const { data } = await axios.get(
      `https://gist.githubusercontent.com/${gist}/raw/resume.json`,
    );
    resume = data;
  }
  console.log("Rendering...");
  const html = await require("./index.js").render(resume);
  console.log("Saving file...");
  fs.writeFileSync("./dist/index.html", html, "utf-8");
  console.log("Done");
  return html;
}

async function buildPDF(html) {
  console.log("Opening puppeteer...");
  const { launcher, launchOptions } = await getBrowserConfig();
  console.log(`Launch mode: ${isVercelBuild() ? "vercel-chromium" : "local-chrome"}`);
  const browser = await launcher.launch(launchOptions);
  const page = await browser.newPage();
  await page.setContent(html, { waitUntil: "networkidle0" });
  console.log("Generating PDF...");
  const pdf = await page.pdf({
    format: "A4",
    displayHeaderFooter: false,
    printBackground: true,
    margin: {
      top: "0.4in",
      bottom: "0.4in",
      left: "0.4in",
      right: "0.4in",
    },
  });
  await browser.close();
  console.log("Saving file...");
  fs.writeFileSync("./dist/resume.pdf", pdf);
  console.log("Done");
  return pdf;
}

async function buildAll() {
  const html = await buildHTML();
  await buildPDF(html);
}

buildAll().catch((e) => {
  console.error(e);
  process.exit(1);
});
