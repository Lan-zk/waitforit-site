from __future__ import annotations

import json
import re
import time
import unicodedata
from concurrent.futures import ThreadPoolExecutor
from pathlib import Path
from typing import Any
from urllib.parse import quote

import requests

PROJECT_ID = "eoidopoq"
DATASET = "production"
API_VERSION = "2023-06-21"
QUERY = (
    '*[_type=="homepage"][0].projectsOverview.overviewItems[]{'
    '"ref": overviewImage.asset._ref,'
    '"title": overviewLink.link->title,'
    '"slug": overviewLink.link->pathname.current'
    "}"
)

ROOT = Path(__file__).resolve().parents[1]
ASSET_DIR = ROOT / "public" / "assets" / "projects"
MANIFEST_PATH = ROOT / "public" / "assets" / "manifest.json"
REF_PATTERN = re.compile(
    r"^image-([a-f0-9]+)-(\d+)x(\d+)-([a-z0-9]+)$"
)


def request_with_retry(url: str, attempts: int = 4) -> requests.Response:
    last_error: Exception | None = None
    for attempt in range(1, attempts + 1):
        try:
            response = requests.get(url, timeout=(30, 90))
            if response.ok or response.status_code < 500:
                return response
            last_error = RuntimeError(f"HTTP {response.status_code}: {url}")
        except requests.RequestException as error:
            last_error = error

        if attempt < attempts:
            time.sleep(attempt * 1.5)

    assert last_error is not None
    raise last_error


def slugify(value: str | None) -> str:
    normalized = unicodedata.normalize("NFKD", value or "project")
    ascii_value = normalized.encode("ascii", "ignore").decode("ascii")
    return re.sub(r"[^a-z0-9]+", "-", ascii_value.lower()).strip("-")


def download_one(index_and_item: tuple[int, dict[str, Any]]) -> dict[str, Any]:
    index, item = index_and_item
    match = REF_PATTERN.match(item["ref"])
    if not match:
        raise ValueError(f"Unexpected Sanity image ref: {item['ref']}")

    image_hash, width_raw, height_raw, extension = match.groups()
    width = int(width_raw)
    height = int(height_raw)
    file_name = (
        f"{index:02d}-{slugify(item.get('title'))}-"
        f"{image_hash[:8]}.webp"
    )
    source_url = (
        f"https://cdn.sanity.io/images/{PROJECT_ID}/{DATASET}/"
        f"{image_hash}-{width}x{height}.{extension}"
        "?w=700&fm=webp&q=86"
    )
    target_path = ASSET_DIR / file_name
    if not target_path.exists():
        response = request_with_retry(source_url)
        response.raise_for_status()
        target_path.write_bytes(response.content)

    return {
        "id": f"{index}-{image_hash[:10]}",
        "index": index,
        "title": item.get("title") or "Untitled project",
        "slug": item.get("slug") or "#",
        "sourceRef": item["ref"],
        "sourceUrl": source_url,
        "localPath": f"/assets/projects/{file_name}",
        "width": width,
        "height": height,
        "aspectRatio": width / height,
    }


def main() -> None:
    ASSET_DIR.mkdir(parents=True, exist_ok=True)
    query_url = (
        f"https://{PROJECT_ID}.api.sanity.io/v{API_VERSION}"
        f"/data/query/{DATASET}?query={quote(QUERY)}"
    )
    response = request_with_retry(query_url)
    response.raise_for_status()
    items = response.json()["result"]

    with ThreadPoolExecutor(max_workers=4) as pool:
        manifest = list(pool.map(download_one, enumerate(items)))

    MANIFEST_PATH.write_text(
        json.dumps(manifest, ensure_ascii=False, indent=2) + "\n",
        encoding="utf-8",
    )
    global_assets = {
        ROOT / "public" / "favicon.ico": "https://www.gabrielveres.com/favicon.ico",
        ROOT / "public" / "icon.png": "https://www.gabrielveres.com/icon.png",
        ROOT / "public" / "fonts" / "mabry-400.woff2":
            "https://www.gabrielveres.com/_next/static/media/29b1a93e4a75feaa-s.p.woff2",
        ROOT / "public" / "fonts" / "mabry-500.woff2":
            "https://www.gabrielveres.com/_next/static/media/842025f8208ee68b-s.p.woff2",
        ROOT / "public" / "fonts" / "fk-display-400.woff2":
            "https://www.gabrielveres.com/_next/static/media/f80ad73864883a33-s.p.woff2",
    }
    for target, url in global_assets.items():
        target.parent.mkdir(parents=True, exist_ok=True)
        if target.exists():
            continue
        global_response = request_with_retry(url)
        global_response.raise_for_status()
        target.write_bytes(global_response.content)

    print(f"Saved {len(manifest)} project textures to {ASSET_DIR}")


if __name__ == "__main__":
    main()
