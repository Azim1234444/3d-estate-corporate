import { chromium, expect } from "@playwright/test";
import fs from "node:fs";
const url = process.env.TEST_URL || "http://127.0.0.1:5174/";
const browser = await chromium.launch({
  channel: "msedge",
  headless: true,
  args: [
    "--enable-webgl",
    "--use-angle=swiftshader",
    "--enable-unsafe-swiftshader",
  ],
});
const page = await browser.newPage({ viewport: { width: 1440, height: 960 } });
const errors = [];
page.on("pageerror", (e) => errors.push(e.message));
await page.goto(url, { waitUntil: "networkidle" });
await page.evaluate(() => document.fonts.ready);
await expect(page.locator("h1")).toHaveText(
  /3-Storey Semi-D.*Corporate.*Estates/s,
);
const links = await page
  .getByRole("link", { name: "Message Syafiqah" })
  .all();
expect(links.length).toBe(2);
for (const link of links)
  expect(await link.getAttribute("href")).toContain("wa.me/60182425963?text=");
async function progress(p) {
  await page.evaluate((p) => {
    const el = document.querySelector("#experience");
    window.scrollTo({
      top:
        el.getBoundingClientRect().top +
        window.scrollY +
        (el.offsetHeight - window.innerHeight) * p,
      behavior: "instant",
    });
  }, p);
  await page.waitForTimeout(350);
}
await progress(0.08);
await expect(page.locator(".scene-ready")).toBeVisible({ timeout: 30000 });
await page.waitForTimeout(1200);
const first = await page.screenshot();
fs.writeFileSync("test-results/stationary-first.png", first);
await page.waitForTimeout(500);
const second = await page.screenshot();
fs.writeFileSync("test-results/stationary-second.png", second);
expect(second.equals(first)).toBeTruthy();
await progress(0.2);
expect((await page.screenshot()).equals(first)).toBeFalsy();
await progress(0.08);
expect((await page.screenshot()).equals(first)).toBeTruthy();
for (const [p, name] of [
  [0, "overview"],
  [0.5, "facade"],
  [1, "aerial"],
]) {
  await progress(p);
  await page.screenshot({ path: `test-results/tour-${name}.png` });
}
await page.getByRole("button", { name: "Pause 3D animation" }).click();
await expect(page.locator(".tour-static")).toBeVisible();
await expect(page.locator("canvas")).toHaveCount(0);
await page.getByRole("button", { name: "Enable 3D animation" }).click();
await expect(page.locator("canvas")).toHaveCount(1);
await page.locator("#specifications").scrollIntoViewIfNeeded();
for (const details of await page.locator(".spec-list details").all()) {
  await details.locator("summary").click();
  await expect(details).toHaveAttribute("open", "");
  await expect(details.locator("dl")).toBeVisible();
  await details.locator("summary").click();
}
await page
  .getByRole("button", { name: "Enlarge master plan", exact: true })
  .first()
  .click();
await expect(page.getByRole("dialog")).toBeVisible();
await page.getByRole("button", { name: "Zoom in", exact: true }).click();
await expect(page.locator(".dialog-image")).toHaveClass(/zoomed/);
await page.keyboard.press("Escape");
await expect(page.getByRole("dialog")).not.toBeVisible();
await expect.poll(() => page.evaluate(() => document.body.style.overflow)).toBe("");
for (const id of [
  "spaces",
  "masterplan",
  "specifications",
  "location",
  "terms",
  "contact",
]) {
  await page.locator(`#${id}`).scrollIntoViewIfNeeded();
  await page.waitForTimeout(150);
  await page.screenshot({ path: `test-results/section-${id}.png` });
}
for (const width of [360, 390, 768, 1024, 1440]) {
  await page.setViewportSize({ width, height: 844 });
  expect(
    await page.evaluate(
      () => document.documentElement.scrollWidth <= window.innerWidth,
    ),
  ).toBeTruthy();
}
await page.setViewportSize({ width: 390, height: 844 });
await page.evaluate(() => window.scrollTo({ top: 0, behavior: "instant" }));
await page.getByRole("button", { name: "Open menu" }).click();
await expect(page.locator(".main-nav")).toBeVisible();
await page.getByRole("link", { name: "The spaces", exact: true }).click();
await expect(page.locator(".main-nav")).not.toBeVisible();
await page.waitForTimeout(800);
await expect(page.locator("#spaces")).toBeInViewport();
await page.emulateMedia({ reducedMotion: "reduce" });
await page.reload({ waitUntil: "networkidle" });
await expect(page.locator("canvas")).toHaveCount(0);
await page.locator("#experience").scrollIntoViewIfNeeded();
await expect(page.getByText("Reduced motion · Static preview")).toBeVisible();
await page.screenshot({ path: "test-results/reduced-motion.png" });
await page.getByRole("button", { name: "Enable 3D animation" }).click();
await progress(0.08);
await expect(page.locator(".scene-ready canvas")).toBeVisible({ timeout: 30000 });
await expect(page.locator("#experience")).not.toHaveClass(/tour-static/);
await page.waitForTimeout(500);
const optedInStart = await page.locator("canvas").screenshot();
await progress(0.2);
expect((await page.locator("canvas").screenshot()).equals(optedInStart)).toBeFalsy();
await progress(0.08);
expect((await page.locator("canvas").screenshot()).equals(optedInStart)).toBeTruthy();
await page.screenshot({ path: "test-results/reduced-motion-enabled.png" });
await page.getByRole("button", { name: "Pause 3D animation" }).click();
await expect(page.locator("canvas")).toHaveCount(0);
console.log("PASS: reduced-motion mobile manual opt-in, forward/reverse animation and pause.");
expect(errors).toEqual([]);
console.log(
  "PASS: deterministic scroll/reverse/stationary renders, viewpoints, pause/resume, all disclosures, dialog zoom/Escape, enquiry links, 5 viewport widths, mobile menu, reduced motion, no runtime errors.",
);
// Failed asset must retain a usable poster and all content.
const failed = await browser.newPage({
  viewport: { width: 1280, height: 800 },
});
await failed.route("**/estate-web.glb", (r) => r.abort());
await failed.goto(url, { waitUntil: "networkidle" });
await failed.locator("#experience").scrollIntoViewIfNeeded();
await expect(failed.getByText("3D unavailable · Static preview")).toBeVisible({
  timeout: 30000,
});
await expect(failed.locator(".scene-poster")).toBeVisible();
await expect(failed.locator("#spaces")).toBeAttached();
console.log("PASS: model-load failure shows static fallback.");
const noGl = await browser.newPage({ viewport: { width: 1280, height: 800 } });
await noGl.addInitScript(() => {
  const original = HTMLCanvasElement.prototype.getContext;
  HTMLCanvasElement.prototype.getContext = function (type, ...args) {
    if (type === "webgl2" || type === "webgl" || type === "experimental-webgl")
      return null;
    return original.call(this, type, ...args);
  };
});
await noGl.goto(url, { waitUntil: "networkidle" });
await noGl.locator("#experience").scrollIntoViewIfNeeded();
await expect(noGl.getByText("3D unavailable · Static preview")).toBeVisible({
  timeout: 30000,
});
console.log("PASS: unavailable WebGL shows static fallback.");
await browser.close();
