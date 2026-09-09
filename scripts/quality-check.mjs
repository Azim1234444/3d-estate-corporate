import { chromium } from "@playwright/test";
import AxeBuilder from "@axe-core/playwright";
import lighthouse from "lighthouse";
import * as chromeLauncher from "chrome-launcher";
import fs from "node:fs";
import path from "node:path";
const url = "http://127.0.0.1:4180/";
fs.mkdirSync("test-results", { recursive: true });
const browser = await chromium.launch({ channel: "msedge", headless: true });
try {
  const context = await browser.newContext({
    viewport: { width: 1440, height: 960 },
    reducedMotion: "reduce",
  });
  const page = await context.newPage();
  await page.goto(url, { waitUntil: "networkidle" });
  const report = await new AxeBuilder({ page })
    .withTags(["wcag2a", "wcag2aa", "wcag21aa"])
    .analyze();
  fs.writeFileSync(
    "test-results/accessibility.json",
    JSON.stringify(report, null, 2),
  );
  console.log(
    "Accessibility violations:",
    JSON.stringify(
      report.violations.map((v) => ({
        id: v.id,
        impact: v.impact,
        description: v.description,
        nodes: v.nodes.map((n) => ({
          target: n.target,
          summary: n.failureSummary,
        })),
      })),
      null,
      2,
    ),
  );
} finally {
  await browser.close();
}
fs.mkdirSync("test-results/lighthouse-profile", { recursive: true });
const chrome = await chromeLauncher.launch({
  userDataDir: path.resolve("test-results/lighthouse-profile"),
  chromePath:
    "C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe",
  chromeFlags: ["--headless", "--no-sandbox", "--disable-dev-shm-usage"],
});
try {
  const report = await lighthouse(
    url,
    {
      port: chrome.port,
      output: "json",
      logLevel: "error",
      onlyCategories: ["performance", "accessibility", "best-practices", "seo"],
    },
    {
      extends: "lighthouse:default",
      settings: {
        formFactor: "desktop",
        screenEmulation: {
          mobile: false,
          width: 1440,
          height: 960,
          deviceScaleFactor: 1,
          disabled: false,
        },
        throttlingMethod: "provided",
      },
    },
  );
  fs.writeFileSync(
    "test-results/lighthouse.json",
    JSON.stringify(report.lhr, null, 2),
  );
  console.log(
    "Lighthouse desktop (local, unthrottled):",
    Object.fromEntries(
      Object.entries(report.lhr.categories).map(([key, value]) => [
        key,
        value.score,
      ]),
    ),
  );
  console.log(
    "Metrics:",
    Object.fromEntries(
      [
        "first-contentful-paint",
        "largest-contentful-paint",
        "total-blocking-time",
        "cumulative-layout-shift",
      ].map((key) => [key, report.lhr.audits[key].displayValue]),
    ),
  );
  console.log(
    "Actionable audits:",
    Object.values(report.lhr.audits)
      .filter((a) => a.score !== null && a.score < 0.9)
      .map((a) => ({ id: a.id, title: a.title, details: a.displayValue })),
  );
} finally {
  await chrome.kill();
}
