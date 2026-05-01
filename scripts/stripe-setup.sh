#!/usr/bin/env bash
set -euo pipefail

# =============================================================================
# Tokō — Configuration automatique du produit Stripe via Stripe CLI
#
# Usage : pnpm stripe:setup
#
# Ce script crée le produit "Tokō Famille" et son prix (4,99€/mois) avec
# le `lookup_key` "toko_famille_monthly" dans votre compte Stripe test.
# Il est idempotent : si un prix avec ce lookup_key existe déjà, il est
# réutilisé. L'application résout le price ID au runtime via le lookup_key,
# donc aucune variable d'environnement à copier.
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
LOOKUP_KEY="toko_famille_monthly"
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
# Step 1: Look up price by lookup_key (idempotent fast path)
# ---------------------------------------------------------------------------

echo -e "${CYAN}🔎 Recherche d'un prix avec lookup_key=\"${LOOKUP_KEY}\"...${NC}"

EXISTING_BY_LOOKUP=$(stripe prices list \
  --lookup-keys "${LOOKUP_KEY}" \
  --active true \
  --limit 1 \
  2>/dev/null || echo "")

PRICE_ID=""
if echo "$EXISTING_BY_LOOKUP" | grep -q '"id":'; then
  PRICE_ID=$(echo "$EXISTING_BY_LOOKUP" | grep '"id":' | head -1 | sed 's/.*"id": "\([^"]*\)".*/\1/')
  echo -e "${GREEN}✅ Prix existant trouvé : ${PRICE_ID}${NC}"
  echo ""
  echo -e "${GREEN}══════════════════════════════════════════════════${NC}"
  echo -e "${GREEN}  ✅ Configuration Stripe déjà à jour !${NC}"
  echo -e "${GREEN}══════════════════════════════════════════════════${NC}"
  echo ""
  echo -e "  lookup_key : ${CYAN}${LOOKUP_KEY}${NC}"
  echo -e "  Prix       : ${CYAN}${PRICE_ID}${NC}"
  echo ""
  echo -e "${YELLOW}Aucune variable d'environnement à copier — l'app résout le prix au runtime.${NC}"
  echo ""
  exit 0
fi

# ---------------------------------------------------------------------------
# Step 2: Find or create the product
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
# Step 3: Create the price with the lookup_key
# ---------------------------------------------------------------------------

echo -e "${YELLOW}💰 Création du prix (4,99€/mois) avec lookup_key=\"${LOOKUP_KEY}\"...${NC}"
PRICE_OUTPUT=$(stripe prices create \
  --product "${PRODUCT_ID}" \
  --unit-amount ${PRICE_AMOUNT} \
  --currency ${PRICE_CURRENCY} \
  --lookup-key "${LOOKUP_KEY}" \
  -d "recurring[interval]=${PRICE_INTERVAL}" \
  2>/dev/null)

PRICE_ID=$(echo "$PRICE_OUTPUT" | grep '"id":' | head -1 | sed 's/.*"id": "\([^"]*\)".*/\1/')

if [[ -z "$PRICE_ID" ]]; then
  echo -e "${RED}❌ Échec de la création du prix.${NC}"
  echo "$PRICE_OUTPUT"
  exit 1
fi

echo -e "${GREEN}✅ Prix créé : ${PRICE_ID}${NC}"

# ---------------------------------------------------------------------------
# Summary
# ---------------------------------------------------------------------------

echo ""
echo -e "${GREEN}══════════════════════════════════════════════════${NC}"
echo -e "${GREEN}  ✅ Configuration Stripe terminée !${NC}"
echo -e "${GREEN}══════════════════════════════════════════════════${NC}"
echo ""
echo -e "  Produit    : ${CYAN}${PRODUCT_NAME}${NC} (${PRODUCT_ID})"
echo -e "  Prix       : ${CYAN}4,99€/mois${NC} (${PRICE_ID})"
echo -e "  lookup_key : ${CYAN}${LOOKUP_KEY}${NC}"
echo ""
echo -e "${YELLOW}Aucune variable d'environnement à copier — l'app résout le prix au runtime.${NC}"
echo ""
echo -e "${YELLOW}Pour le webhook local, lancez dans un autre terminal :${NC}"
echo ""
echo -e "  ${CYAN}pnpm stripe:listen${NC}"
echo ""
echo -e "Puis copiez le ${CYAN}whsec_...${NC} affiché dans votre .env :"
echo ""
echo -e "  ${CYAN}STRIPE_WEBHOOK_SECRET=whsec_...${NC}"
echo ""
