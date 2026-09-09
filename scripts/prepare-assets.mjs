import fs from "node:fs";
import sharp from "sharp";
const names = ["exterior", "masterplan", "streetscape", "arrival"];
for (const [i, name] of names.entries()) {
  await sharp(`.source-assets/source-${i}.jpg`)
    .resize({ width: i === 1 ? 1600 : 1500, withoutEnlargement: true })
    .webp({ quality: i === 1 ? 92 : 85 })
    .toFile(`public/assets/${name}.webp`);
}
// Remove the old report title from the model's software-rendered poster.
await sharp(".source-assets/preview.png")
  .extract({ left: 0, top: 101, width: 1400, height: 899 })
  .webp({ quality: 90 })
  .toFile("public/assets/estate-poster.webp");
console.log("Prepared optimized property images and model poster.");
