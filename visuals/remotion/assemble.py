"""Assemble des PNG en WebP animé en boucle (Pillow minimise les différences entre images).
Usage : assemble.py DOSSIER_PNG FPS SORTIE.webp"""
import sys, glob
from PIL import Image

src, fps, out = sys.argv[1], int(sys.argv[2]), sys.argv[3]
frames = [Image.open(p).convert('RGBA') for p in sorted(glob.glob(f'{src}/f*.png'))]
frames[0].save(out, save_all=True, append_images=frames[1:], duration=round(1000 / fps), loop=0,
               lossless=True, method=6, minimize_size=True, allow_mixed=True)
