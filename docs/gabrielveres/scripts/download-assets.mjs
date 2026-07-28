import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";

const projectId = "eoidopoq";
const dataset = "production";
const apiVersion = "2023-06-21";
const query =
  '*[_type=="homepage"][0].projectsOverview.overviewItems[]{' +
  '"ref": overviewImage.asset._ref,' +
  '"title": overviewLink.link->title,' +
  '"slug": overviewLink.link->pathname.current' +
  "}";

const root = process.cwd();
const assetDir = path.join(root, "public", "assets", "projects");
const manifestPath = path.join(root, "public", "assets", "manifest.json");

await mkdir(assetDir, { recursive: true });

async function fetchWithRetry(url, attempts = 4) {
  let lastError;

  for (let attempt = 1; attempt <= attempts; attempt += 1) {
    try {
      const response = await fetch(url, {
        signal: AbortSignal.timeout(45_000),
      });

      if (response.ok || response.status < 500) return response;
      lastError = new Error(`HTTP ${response.status}: ${url}`);
    } catch (error) {
      lastError = error;
    }

    if (attempt < attempts) {
      await new Promise((resolve) => setTimeout(resolve, attempt * 1_500));
    }
  }

  throw lastError;
}

const queryUrl =
  `https://${projectId}.api.sanity.io/v${apiVersion}/data/query/${dataset}` +
  `?query=${encodeURIComponent(query)}`;
const queryResponse = await fetchWithRetry(queryUrl);

if (!queryResponse.ok) {
  throw new Error(`Sanity query failed: ${queryResponse.status}`);
}

const { result } = await queryResponse.json();

function parseRef(ref) {
  const match = /^image-([a-f0-9]+)-(\d+)x(\d+)-([a-z0-9]+)$/.exec(ref);
  if (!match) throw new Error(`Unexpected Sanity image ref: ${ref}`);
  const [, hash, width, height, extension] = match;
  return {
    hash,
    width: Number(width),
    height: Number(height),
    extension,
  };
}

function slugify(value) {
  return (value || "project")
    .toLowerCase()
    .normalize("NFKD")
    .replace(/[^\w\s-]/g, "")
    .trim()
    .replace(/[\s_]+/g, "-");
}

async function downloadOne(item, index) {
  const parsed = parseRef(item.ref);
  const fileName = `${String(index).padStart(2, "0")}-${slugify(item.title)}-${parsed.hash.slice(0, 8)}.webp`;
  const sourceUrl =
    `https://cdn.sanity.io/images/${projectId}/${dataset}/` +
    `${parsed.hash}-${parsed.width}x${parsed.height}.${parsed.extension}` +
    "?w=700&fm=webp&q=86";
  const response = await fetchWithRetry(sourceUrl);

  if (!response.ok) {
    throw new Error(`Asset download failed (${response.status}): ${sourceUrl}`);
  }

  await writeFile(
    path.join(assetDir, fileName),
    Buffer.from(await response.arrayBuffer()),
  );

  return {
    id: `${index}-${parsed.hash.slice(0, 10)}`,
    index,
    title: item.title || "Untitled project",
    slug: item.slug || "#",
    sourceRef: item.ref,
    sourceUrl,
    localPath: `/assets/projects/${fileName}`,
    width: parsed.width,
    height: parsed.height,
    aspectRatio: parsed.width / parsed.height,
  };
}

const manifest = [];
const concurrency = 4;

for (let offset = 0; offset < result.length; offset += concurrency) {
  const batch = result
    .slice(offset, offset + concurrency)
    .map((item, batchIndex) => downloadOne(item, offset + batchIndex));
  manifest.push(...(await Promise.all(batch)));
  process.stdout.write(`Downloaded ${manifest.length}/${result.length}\r`);
}

await writeFile(manifestPath, `${JSON.stringify(manifest, null, 2)}\n`, "utf8");
process.stdout.write(`\nSaved ${manifest.length} project textures to ${assetDir}\n`);
