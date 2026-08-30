import sharp from "sharp";
import { mkdir, readFile } from "node:fs/promises";
import { fileURLToPath } from "node:url";
import path from "node:path";

const root = fileURLToPath(new URL("..", import.meta.url));
const icon = path.join(root, "public", "icons", "icon-512-maskable.png");
const outDir = path.join(root, "public", "splash");

const BACKGROUND = "#0a0a0a";
const TITLE_COLOR = "#16a34a";
const TITLE = "Expenso";

// iOS apple-touch-startup-image sizes: [css width, css height, device pixel ratio]
const DEVICES = [
  [320, 568, 2], // iPhone SE / 5
  [375, 667, 2], // iPhone 6/7/8, SE 2/3
  [414, 896, 2], // iPhone XR, 11
  [375, 812, 3], // iPhone X/XS, 11 Pro
  [390, 844, 3], // iPhone 12/13/14
  [393, 852, 3], // iPhone 14 Pro/15/16
  [414, 736, 3], // iPhone 6+/7+/8+
  [414, 896, 3], // iPhone XS Max, 11 Pro Max
  [428, 926, 3], // iPhone 12/13 Pro Max
  [430, 932, 3], // iPhone 14/15 Pro Max
  [768, 1024, 2], // iPad 9.7 / mini
  [810, 1080, 2], // iPad 10.2
  [834, 1112, 2], // iPad Pro 10.5 / Air 10.5
  [834, 1194, 2], // iPad Pro 11
  [1024, 1366, 2], // iPad Pro 12.9
];

function svgFor(width, height, iconBase64, iconSize) {
  const iconX = (width - iconSize) / 2;
  const iconY = height / 2 - iconSize / 2 - height * 0.035;
  const textY = iconY + iconSize + Math.round(width * 0.09);
  const fontSize = Math.max(28, Math.round(width * 0.075));

  return `<svg width="${width}" height="${height}" viewBox="0 0 ${width} ${height}" xmlns="http://www.w3.org/2000/svg">
  <rect width="${width}" height="${height}" fill="${BACKGROUND}"/>
  <image x="${iconX}" y="${iconY}" width="${iconSize}" height="${iconSize}" href="data:image/png;base64,${iconBase64}"/>
  <text x="${width / 2}" y="${textY}" text-anchor="middle" font-family="-apple-system, Helvetica, Arial, sans-serif" font-weight="700" font-size="${fontSize}" fill="${TITLE_COLOR}">${TITLE}</text>
</svg>`;
}

async function main() {
  await mkdir(outDir, { recursive: true });
  const iconBase64 = (await readFile(icon)).toString("base64");
  const links = [];

  for (const [cssWidth, cssHeight, ratio] of DEVICES) {
    const width = cssWidth * ratio;
    const height = cssHeight * ratio;
    const iconSize = Math.round(Math.min(width, height) * 0.32);
    const svg = svgFor(width, height, iconBase64, iconSize);
    const fileName = `apple-splash-${width}-${height}.png`;

    await sharp(Buffer.from(svg)).png().toFile(path.join(outDir, fileName));

    links.push(
      `<link rel="apple-touch-startup-image" href="/splash/${fileName}" media="(device-width: ${cssWidth}px) and (device-height: ${cssHeight}px) and (-webkit-device-pixel-ratio: ${ratio}) and (orientation: portrait)" />`
    );
  }

  console.log(`Generated ${DEVICES.length} splash screens in public/splash/\n`);
  console.log(links.join("\n"));
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
