#!/usr/bin/env bash
# Rend la couverture animée d'un article : WebM (VP9), MP4 (H.264) et affiche JPG
# dans apps/web/public/articles/<slug>.{webm,mp4,jpg}.
# Usage : scripts/render-cover.sh <slug> [--concurrency=N]
set -euo pipefail
slug="$1"; shift || true
out="../web/public/articles/$slug"
id="cover-$slug"
npx remotion render "$id" "$out.webm" --codec=vp9 --crf=42 --image-format=png --muted "$@"
npx remotion render "$id" "$out.mp4" --codec=h264 --crf=30 --image-format=png --pixel-format=yuv420p --muted "$@"
npx remotion still "$id" "$out.jpg" --frame=0 --image-format=jpeg --jpeg-quality=85 "$@"
