#!/usr/bin/env bash
set -euo pipefail

# =============================================================================
# Tokō — Configuration automatique du produit Stripe via Stripe CLI
#
# Usage : pnpm stripe:setup
#
# Ce script crée le produit "Tokō Famille" et son prix (4,99€/mois) dans
# votre compte Stripe test. Il est idempotent : si le produit existe déjà,
# il réutilise l'existant.
# =============================================================================

RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
CYAN='\033[0;36m'
NC='\033[0m' # No Color

PRODUCT_NAME="Tokō Famille"
PRODUCT_DESCRIPTION="Plan Famille — 3 profils enfants"
METADATA_KEY="toko_plan"
METADATA_VALUE="famille"
PRICE_AMOUNT=499  # in cents
PRICE_CURRENCY="eur"
PRICE_INTERVAL="month"

# ---------------------------------------------------------------------------
# Pre-flight checks
# ---------------------------------------------------------------------------

echo -e "${CYAN}🔧 Tokō — Stripe Product Setup${NC}"
echo ""

# Check Stripe CLI is installed
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

# Check Stripe CLI is authenticated
if ! stripe config --list &> /dev/null 2>&1; then
  echo -e "${YELLOW}⚠️  Stripe CLI non authentifié. Lancez : stripe login${NC}"
  exit 1
fi

# Check for live key guard — only allow test mode
if [[ -n "${STRIPE_SECRET_KEY:-}" ]]; then
  if [[ "$STRIPE_SECRET_KEY" == sk_live_* ]]; then
    echo -e "${RED}❌ STRIPE_SECRET_KEY est une clé LIVE. Ce script ne fonctionne qu'en mode test.${NC}"
    echo "   Utilisez une clé sk_test_... dans votre .env"
    exit 1
  fi
fi

# ---------------------------------------------------------------------------
# Step 1: Find or create the product
# ---------------------------------------------------------------------------

echo -e "${CYAN}📦 Recherche du produit existant...${NC}"

PRODUCT_ID=""

# Search for existing product by metadata
EXISTING_PRODUCTS=$(stripe products search --query "metadata['${METADATA_KEY}']:'${METADATA_VALUE}'" --limit 1 2>/dev/null || echo "")

if echo "$EXISTING_PRODUCTS" | grep -q '"id":'; then
  PRODUCT_ID=$(echo "$EXISTING_PRODUCTS" | grep '"id":' | head -1 | sed 's/.*"id": "\([^"]*\)".*/\1/')
  echo -e "${GREEN}✅ Produit existant trouvé : ${PRODUCT_ID}${NC}"
else
  echo -e "${YELLOW}📦 Création du produit \"${PRODUCT_NAME}\"...${NC}"
  CREATE_OUTPUT=$(stripe products create \
    --name "${PRODUCT_NAME}" \
    --description "${PRODUCT_DESCRIPTION}" \
    --metadata["${METADATA_KEY}"]="${METADATA_VALUE}" \
    2>/dev/null)

  PRODUCT_ID=$(echo "$CREATE_OUTPUT" | grep '"id":' | head -1 | sed 's/.*"id": "\([^"]*\)".*/\1/')

  if [[ -z "$PRODUCT_ID" ]]; then
    echo -e "${RED}❌ Échec de la création du produit.${NC}"
    echo "$CREATE_OUTPUT"
    exit 1
  fi

  echo -e "${GREEN}✅ Produit créé : ${PRODUCT_ID}${NC}"
fi

# ---------------------------------------------------------------------------
# Step 2: Find or create the price
# ---------------------------------------------------------------------------

echo -e "${CYAN}💰 Recherche du prix existant...${NC}"

PRICE_ID=""

# List active prices for this product
EXISTING_PRICES=$(stripe prices list \
  --product "${PRODUCT_ID}" \
  --active true \
  --limit 10 \
  2>/dev/null || echo "")

# Check for a matching price (499 EUR monthly)
if echo "$EXISTING_PRICES" | grep -q '"unit_amount": 499'; then
  PRICE_ID=$(echo "$EXISTING_PRICES" | grep -B5 '"unit_amount": 499' | grep '"id":' | head -1 | sed 's/.*"id": "\([^"]*\)".*/\1/')
fi

if [[ -n "$PRICE_ID" ]]; then
  echo -e "${GREEN}✅ Prix existant trouvé : ${PRICE_ID}${NC}"
else
  echo -e "${YELLOW}💰 Création du prix (4,99€/mois)...${NC}"
  PRICE_OUTPUT=$(stripe prices create \
    --product "${PRODUCT_ID}" \
    --unit-amount ${PRICE_AMOUNT} \
    --currency ${PRICE_CURRENCY} \
    -d "recurring[interval]=${PRICE_INTERVAL}" \
    2>/dev/null)

  PRICE_ID=$(echo "$PRICE_OUTPUT" | grep '"id":' | head -1 | sed 's/.*"id": "\([^"]*\)".*/\1/')

  if [[ -z "$PRICE_ID" ]]; then
    echo -e "${RED}❌ Échec de la création du prix.${NC}"
    echo "$PRICE_OUTPUT"
    exit 1
  fi

  echo -e "${GREEN}✅ Prix créé : ${PRICE_ID}${NC}"
fi

# ---------------------------------------------------------------------------
# Summary
# ---------------------------------------------------------------------------

echo ""
echo -e "${GREEN}══════════════════════════════════════════════════${NC}"
echo -e "${GREEN}  ✅ Configuration Stripe terminée !${NC}"
echo -e "${GREEN}══════════════════════════════════════════════════${NC}"
echo ""
echo -e "  Produit : ${CYAN}${PRODUCT_NAME}${NC} (${PRODUCT_ID})"
echo -e "  Prix    : ${CYAN}4,99€/mois${NC} (${PRICE_ID})"
echo ""
echo -e "${YELLOW}Ajoutez cette ligne dans votre .env :${NC}"
echo ""
echo -e "  ${CYAN}STRIPE_PRICE_ID=${PRICE_ID}${NC}"
echo ""
echo -e "${YELLOW}Pour le webhook local, lancez dans un autre terminal :${NC}"
echo ""
echo -e "  ${CYAN}pnpm stripe:listen${NC}"
echo ""
echo -e "Puis copiez le ${CYAN}whsec_...${NC} affiché dans votre .env :"
echo ""
echo -e "  ${CYAN}STRIPE_WEBHOOK_SECRET=whsec_...${NC}"
echo ""
