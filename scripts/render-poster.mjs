import { chromium, expect } from "@playwright/test";
import sharp from "sharp";
const browser = await chromium.launch({
  channel: "msedge",
  headless: true,
  args: [
    "--enable-webgl",
    "--use-angle=swiftshader",
    "--enable-unsafe-swiftshader",
  ],
});
try {
  const page = await browser.newPage({
    viewport: { width: 1400, height: 900 },
    deviceScaleFactor: 1,
  });
  await page.goto("http://127.0.0.1:5174/", { waitUntil: "networkidle" });
  await page.evaluate(() => {
    const el = document.querySelector("#experience");
    window.scrollTo({
      top: el.getBoundingClientRect().top + window.scrollY,
      behavior: "instant",
    });
  });
  await expect(page.locator(".scene-ready")).toBeVisible({ timeout: 30000 });
  await page.addStyleTag({
    content:
      ".tour-topline,.tour-copy,.tour-bottom,.tour-progress,.scene-poster,.skip-link{display:none!important}.scene-wrap{position:fixed!important;inset:0!important;width:100vw!important;height:100vh!important;background:#f4f2ed!important}.scene-wrap>div{opacity:1!important;transition:none!important}",
  });
  await page.waitForTimeout(1500);
  await sharp(await page.screenshot())
    .webp({ quality: 90 })
    .toFile("public/assets/estate-poster.webp");
  console.log("Rendered static poster from the actual web scene.");
} finally {
  await browser.close();
}
