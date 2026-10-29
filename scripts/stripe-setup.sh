#!/usr/bin/env bash
set -euo pipefail

RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
CYAN='\033[0;36m'
NC='\033[0m'

METADATA_KEY="toko_plan"

declare -A PRODUCT_NAME=(
  [famille]="Tokō Famille"
  [formation]="Tokō Formation"
)
declare -A PRODUCT_DESC=(
  [famille]="Plan Famille — accès complet"
  [formation]="Formation Barkley — achat unique, accès à vie"
)

PRICES=(
  "famille|toko_famille_monthly|499|month|4,99€/mois"
  "famille|toko_famille_annual|3900|year|39€/an"
  "formation|toko_formation_oneshot|8900|once|89€ paiement unique (à vie)"
)

echo -e "${CYAN}🔧 Tokō — Stripe Product Setup${NC}"
echo ""

if ! command -v stripe &> /dev/null; then
  echo -e "${RED}❌ Stripe CLI non trouvé.${NC}"
  echo ""
  echo "Installation :"
  echo "  macOS  : brew install stripe/stripe-cli/stripe"
  echo "  Linux  : https://docs.stripe.com/stripe-cli#install"
  echo "  Windows: scoop install stripe"
  echo ""
  echo "Puis authentifiez-vous : stripe login"
  exit 1
fi

if ! stripe config --list &> /dev/null 2>&1; then
  echo -e "${YELLOW}⚠️  Stripe CLI non authentifié. Lancez : stripe login${NC}"
  exit 1
fi

if [[ -n "${STRIPE_SECRET_KEY:-}" ]]; then
  if [[ "$STRIPE_SECRET_KEY" == sk_live_* ]]; then
    echo -e "${RED}❌ STRIPE_SECRET_KEY est une clé LIVE. Ce script ne fonctionne qu'en mode test.${NC}"
    echo "   Utilisez une clé sk_test_... dans votre .env"
    exit 1
  fi
fi

declare -A PRODUCT_ID_CACHE=()
ENSURED_PRODUCT_ID=""

ensure_product() {
  local key="$1"
  ENSURED_PRODUCT_ID=""

  if [[ -n "${PRODUCT_ID_CACHE[$key]:-}" ]]; then
    ENSURED_PRODUCT_ID="${PRODUCT_ID_CACHE[$key]}"
    return 0
  fi

  local name="${PRODUCT_NAME[$key]}"
  local desc="${PRODUCT_DESC[$key]}"
  local pid=""

  echo -e "${CYAN}📦 Produit \"${name}\" — recherche (metadata['${METADATA_KEY}']='${key}')...${NC}"
  local existing
  existing=$(stripe products search --query "active:'true' AND metadata['${METADATA_KEY}']:'${key}'" --limit 1 2>/dev/null || echo "")

  if echo "$existing" | grep -q '"id":'; then
    pid=$(echo "$existing" | grep '"id":' | head -1 | sed 's/.*"id": "\([^"]*\)".*/\1/')
    echo -e "${GREEN}✅ Produit existant : ${pid}${NC}"
  else
    echo -e "${YELLOW}📦 Création du produit \"${name}\"...${NC}"
    local out
    out=$(stripe products create \
      --name "${name}" \
      --description "${desc}" \
      -d "metadata[${METADATA_KEY}]=${key}" \
      2>/dev/null)
    pid=$(echo "$out" | grep '"id":' | head -1 | sed 's/.*"id": "\([^"]*\)".*/\1/')
    if [[ -z "$pid" ]]; then
      echo -e "${RED}❌ Échec de la création du produit \"${name}\".${NC}"
      echo "$out"
      return 1
    fi
    echo -e "${GREEN}✅ Produit créé : ${pid}${NC}"
  fi

  PRODUCT_ID_CACHE[$key]="$pid"
  ENSURED_PRODUCT_ID="$pid"
}

declare -a SUMMARY_LINES=()

for entry in "${PRICES[@]}"; do
  IFS='|' read -r PKEY LOOKUP_KEY AMOUNT INTERVAL LABEL <<< "$entry"

  ensure_product "$PKEY" || exit 1
  PRODUCT_ID="$ENSURED_PRODUCT_ID"

  echo ""
  echo -e "${CYAN}🔎 ${LABEL} — recherche d'un prix avec lookup_key=\"${LOOKUP_KEY}\"...${NC}"

  EXISTING_BY_LOOKUP=$(stripe prices list \
    -d "lookup_keys[]=${LOOKUP_KEY}" \
    -d "active=true" \
    -d "limit=1" \
    2>/dev/null || echo "")

  PRICE_ID=""
  if echo "$EXISTING_BY_LOOKUP" | grep -q '"id":'; then
    PRICE_ID=$(echo "$EXISTING_BY_LOOKUP" | grep '"id":' | head -1 | sed 's/.*"id": "\([^"]*\)".*/\1/')
    echo -e "${GREEN}✅ Prix existant trouvé : ${PRICE_ID}${NC}"
  else
    echo -e "${YELLOW}💰 Création du prix (${LABEL}) avec lookup_key=\"${LOOKUP_KEY}\"...${NC}"

    PRICE_ARGS=(
      --product "${PRODUCT_ID}"
      --unit-amount "${AMOUNT}"
      --currency eur
      --lookup-key "${LOOKUP_KEY}"
    )
    if [[ "$INTERVAL" == "once" ]]; then
      :
    else
      PRICE_ARGS+=(-d "recurring[interval]=${INTERVAL}")
    fi

    PRICE_OUTPUT=$(stripe prices create "${PRICE_ARGS[@]}" 2>/dev/null)
    PRICE_ID=$(echo "$PRICE_OUTPUT" | grep '"id":' | head -1 | sed 's/.*"id": "\([^"]*\)".*/\1/')

    if [[ -z "$PRICE_ID" ]]; then
      echo -e "${RED}❌ Échec de la création du prix (${LABEL}).${NC}"
      echo "$PRICE_OUTPUT"
      exit 1
    fi

    echo -e "${GREEN}✅ Prix créé : ${PRICE_ID}${NC}"
  fi

  SUMMARY_LINES+=("  ${PRODUCT_NAME[$PKEY]} — ${LABEL}\t lookup_key=${LOOKUP_KEY}\t price=${PRICE_ID}")
done

echo ""
echo -e "${GREEN}══════════════════════════════════════════════════${NC}"
echo -e "${GREEN}  ✅ Configuration Stripe terminée !${NC}"
echo -e "${GREEN}══════════════════════════════════════════════════${NC}"
echo ""
for line in "${SUMMARY_LINES[@]}"; do
  echo -e "${line}"
done
echo ""
echo -e "${YELLOW}Aucune variable d'environnement à copier — l'app résout les prix au runtime.${NC}"
echo ""
echo -e "${YELLOW}Pour le webhook local, lancez dans un autre terminal :${NC}"
echo ""
echo -e "  ${CYAN}pnpm stripe:listen${NC}"
echo ""
echo -e "Puis copiez le ${CYAN}whsec_...${NC} affiché dans votre .env :"
echo ""
echo -e "  ${CYAN}STRIPE_WEBHOOK_SECRET=whsec_...${NC}"
echo ""
