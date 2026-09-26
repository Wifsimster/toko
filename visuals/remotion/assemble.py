"""Assemble des PNG en WebP animé en boucle (Pillow minimise les différences entre images).
method=4 : même poids que 6 à 1 % près, mais 16 fois plus rapide.
Usage : assemble.py DOSSIER_PNG FPS SORTIE.webp"""
import sys, glob
from PIL import Image

src, fps, out = sys.argv[1], int(sys.argv[2]), sys.argv[3]
frames = [Image.open(p).convert('RGBA') for p in sorted(glob.glob(f'{src}/f*.png'))]
frames[0].save(out, save_all=True, append_images=frames[1:], duration=round(1000 / fps), loop=0,
               lossless=True, method=4, minimize_size=True, allow_mixed=True)
