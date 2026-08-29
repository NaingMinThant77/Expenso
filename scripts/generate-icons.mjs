import sharp from "sharp";
import { mkdir } from "node:fs/promises";
import { fileURLToPath } from "node:url";
import path from "node:path";

const root = fileURLToPath(new URL("..", import.meta.url));
const source = path.join(root, "public", "icon-source.svg");
const outDir = path.join(root, "public", "icons");

async function main() {
  await mkdir(outDir, { recursive: true });

  await sharp(source).resize(192, 192).png().toFile(path.join(outDir, "icon-192.png"));
  await sharp(source).resize(512, 512).png().toFile(path.join(outDir, "icon-512.png"));
  await sharp(source).resize(512, 512).png().toFile(path.join(outDir, "icon-512-maskable.png"));
  await sharp(source).resize(180, 180).flatten({ background: "#16a34a" }).png().toFile(
    path.join(outDir, "apple-touch-icon.png")
  );

  console.log("Generated PWA icons in public/icons/");
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
