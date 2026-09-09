import { chromium } from "@playwright/test";
import fs from "node:fs";
fs.mkdirSync("test-results", { recursive: true });
const browser = await chromium.launch({
  channel: "msedge",
  headless: true,
  args: [
    "--enable-webgl",
    "--use-angle=swiftshader",
    "--enable-unsafe-swiftshader",
  ],
});
const page = await browser.newPage({
  viewport: { width: 1440, height: 960 },
  deviceScaleFactor: 1,
});
const errors = [];
page.on("pageerror", (e) => errors.push(e.message));
page.on("console", (m) => {
  if (m.type() === "error") errors.push(m.text());
});
await page.goto("http://127.0.0.1:5174/", { waitUntil: "networkidle" });
await page.waitForTimeout(1200);
await page.screenshot({ path: "test-results/desktop-hero.png" });
await page.locator("#experience").scrollIntoViewIfNeeded();
await page.waitForTimeout(2500);
await page.screenshot({ path: "test-results/desktop-tour.png" });
console.log(
  JSON.stringify({
    errors,
    canvas: await page.locator("canvas").count(),
    ready: await page.locator(".scene-ready").count(),
    overflow: await page.evaluate(
      () => document.documentElement.scrollWidth > window.innerWidth,
    ),
  }),
);
await page.screenshot({
  path: "test-results/desktop-full.png",
  fullPage: true,
});
await page.setViewportSize({ width: 390, height: 844 });
await page.evaluate(() => window.scrollTo({ top: 0, behavior: "instant" }));
await page.waitForTimeout(300);
await page.screenshot({ path: "test-results/mobile-hero.png" });
await page.locator("#experience").scrollIntoViewIfNeeded();
await page.waitForTimeout(800);
await page.screenshot({ path: "test-results/mobile-tour.png" });
console.log(
  JSON.stringify({
    mobileOverflow: await page.evaluate(
      () => document.documentElement.scrollWidth > window.innerWidth,
    ),
    errors,
  }),
);
await browser.close();
