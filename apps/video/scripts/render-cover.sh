#!/usr/bin/env bash
set -euo pipefail
slug="$1"; shift || true
out="../web/public/articles/$slug"
id="cover-$slug"
npx remotion render "$id" "$out.webm" --codec=vp9 --crf=42 --image-format=png --muted "$@"
npx remotion render "$id" "$out.mp4" --codec=h264 --crf=30 --image-format=png --pixel-format=yuv420p --muted "$@"
npx remotion still "$id" "$out.jpg" --frame=0 --image-format=jpeg --jpeg-quality=85 "$@"
