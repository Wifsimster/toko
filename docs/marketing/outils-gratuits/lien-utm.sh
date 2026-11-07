#!/usr/bin/env bash
set -euo pipefail
slug() { echo "$1" | iconv -f utf8 -t ascii//TRANSLIT | tr 'A-Z' 'a-z' | sed -E 's/[^a-z0-9]+/-/g; s/^-|-$//g' | cut -c1-50; }
declare -A CHEMIN=(
  [outils]=/outils
  [quiz]=/quiz
  [carnet-de-sommeil]=/outils/carnet-de-sommeil
  [routine]=/outils/routine
  [fiche-enfant]=/outils/fiche-enfant
  [preparer-rendez-vous]=/outils/preparer-rendez-vous
  [mdph]=/outils/mdph
  [plan-de-crise]=/ressources/plan-de-crise
  [lexique]=/ressources/lexique
)
[ $# -eq 2 ] || { echo "usage : $0 <groupe> <outil>   (outils : ${!CHEMIN[*]})" >&2; exit 1; }
p="${CHEMIN[$2]:-}"
[ -n "$p" ] || { echo "outil inconnu : $2 (connus : ${!CHEMIN[*]})" >&2; exit 1; }
echo "https://toko.battistella.ovh${p}?utm_source=fb-$(slug "$1")&utm_medium=social&utm_campaign=$2-$(date +%Y%m)"
