import { readFile } from "node:fs/promises";
import path from "node:path";
import sharp from "sharp";

const root = process.cwd();
const manifest = JSON.parse(
  await readFile(path.join(root, "public/assets/manifest.json"), "utf8"),
);
const columns = 6;
const cellWidth = 200;
const cellHeight = 160;
const rows = Math.ceil(manifest.length / columns);
const composites = [];

for (const item of manifest) {
  const x = (item.index % columns) * cellWidth;
  const y = Math.floor(item.index / columns) * cellHeight;
  const thumbnail = await sharp(
    path.join(root, "public", item.localPath.replace(/^\//, "")),
  )
    .resize(cellWidth, 126, { fit: "cover", position: "center" })
    .jpeg({ quality: 78 })
    .toBuffer();
  const label = Buffer.from(
    `<svg width="${cellWidth}" height="34">
      <rect width="100%" height="100%" fill="#111"/>
      <text x="8" y="14" fill="#fff" font-size="11" font-family="Arial">${item.index}. ${item.title}</text>
      <text x="8" y="28" fill="#888" font-size="9" font-family="Arial">${item.sourceRef.slice(6, 18)}</text>
    </svg>`,
  );

  composites.push({ input: thumbnail, left: x, top: y });
  composites.push({ input: label, left: x, top: y + 126 });
}

await sharp({
  create: {
    width: columns * cellWidth,
    height: rows * cellHeight,
    channels: 3,
    background: "#000",
  },
})
  .composite(composites)
  .jpeg({ quality: 86 })
  .toFile(
    path.join(
      root,
      "research/design-references/assets-contact-sheet.jpg",
    ),
  );
