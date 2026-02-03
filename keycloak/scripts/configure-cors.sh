#!/bin/bash
# Script to configure Keycloak CORS settings for the built-in account client
# This runs after Keycloak has started to update the account client via Admin API

KEYCLOAK_URL="${KEYCLOAK_URL:-http://localhost:8080}"
KEYCLOAK_ADMIN="${KEYCLOAK_ADMIN:-admin}"
KEYCLOAK_ADMIN_PASSWORD="${KEYCLOAK_ADMIN_PASSWORD:-admin}"
REALM="${KEYCLOAK_REALM:-lt-budget-realm}"

echo "Waiting for Keycloak to be ready..."
until curl -sf "${KEYCLOAK_URL}/health/ready" > /dev/null 2>&1; do
  echo "Keycloak not ready yet, waiting..."
  sleep 5
done
echo "Keycloak is ready!"

# Get admin token
echo "Getting admin token..."
TOKEN=$(curl -s -X POST "${KEYCLOAK_URL}/realms/master/protocol/openid-connect/token" \
  -H "Content-Type: application/x-www-form-urlencoded" \
  -d "username=${KEYCLOAK_ADMIN}" \
  -d "password=${KEYCLOAK_ADMIN_PASSWORD}" \
  -d "grant_type=password" \
  -d "client_id=admin-cli" | grep -o '"access_token":"[^"]*"' | cut -d'"' -f4)

if [ -z "$TOKEN" ]; then
  echo "Failed to get admin token"
  exit 1
fi
echo "Got admin token"

# Get the account client ID
echo "Getting account client..."
ACCOUNT_CLIENT=$(curl -s "${KEYCLOAK_URL}/admin/realms/${REALM}/clients?clientId=account" \
  -H "Authorization: Bearer ${TOKEN}")

CLIENT_UUID=$(echo "$ACCOUNT_CLIENT" | grep -o '"id":"[^"]*"' | head -1 | cut -d'"' -f4)

if [ -z "$CLIENT_UUID" ]; then
  echo "Failed to find account client"
  exit 1
fi
echo "Found account client: ${CLIENT_UUID}"

# Update the account client with CORS settings
echo "Updating account client CORS settings..."
UPDATE_RESULT=$(curl -s -w "%{http_code}" -o /dev/null -X PUT "${KEYCLOAK_URL}/admin/realms/${REALM}/clients/${CLIENT_UUID}" \
  -H "Authorization: Bearer ${TOKEN}" \
  -H "Content-Type: application/json" \
  -d '{
    "id": "'"${CLIENT_UUID}"'",
    "clientId": "account",
    "enabled": true,
    "publicClient": true,
    "standardFlowEnabled": true,
    "redirectUris": [
      "http://localhost:4200/*",
      "http://localhost:3000/*",
      "/realms/lt-budget-realm/account/*"
    ],
    "webOrigins": [
      "http://localhost:4200",
      "http://localhost:3000",
      "https://ltbudget.company.com"
    ]
  }')

if [ "$UPDATE_RESULT" = "204" ]; then
  echo "Successfully updated account client CORS settings!"
else
  echo "Failed to update account client. HTTP status: ${UPDATE_RESULT}"
  exit 1
fi

echo "Keycloak CORS configuration complete!"
