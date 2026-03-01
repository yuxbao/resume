const fs = require("fs-extra");
const { execFileSync } = require("child_process");
const { join } = require("path");
const puppeteer = require("puppeteer");

const cacheDir = join(__dirname, "..", ".cache", "puppeteer");

function getExecutablePath() {
  try {
    return puppeteer.executablePath();
  } catch (error) {
    return null;
  }
}

function hasChrome() {
  const executablePath = getExecutablePath();
  return executablePath && fs.existsSync(executablePath);
}

function installChrome() {
  const cliPath = require.resolve("puppeteer/lib/cjs/puppeteer/node/cli.js");
  execFileSync(process.execPath, [cliPath, "browsers", "install", "chrome"], {
    stdio: "inherit",
    env: process.env,
  });
}

function ensureChrome() {
  if (hasChrome()) {
    console.log(`Chrome already available: ${getExecutablePath()}`);
    return;
  }

  console.log("Chrome not found, installing Puppeteer's bundled Chrome...");

  try {
    installChrome();
  } catch (error) {
    console.warn("Chrome installation failed, clearing Puppeteer cache and retrying once...");
    fs.removeSync(cacheDir);
    installChrome();
  }

  if (!hasChrome()) {
    throw new Error("Chrome installation completed but executable is still missing.");
  }

  console.log(`Chrome ready: ${getExecutablePath()}`);
}

ensureChrome();
