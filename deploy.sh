#!/bin/bash
# Script de deployment para EBPB4 en /ebpb path

set -e  # Exit on error

echo "=== EBPB4 Deployment Script ==="
echo ""

# Configuración
PROJECT_DIR="/opt/ebpb4"
FRONTEND_DIR="$PROJECT_DIR/frontend"
WEB_DIR="/var/www/ebpb"
BASE_PATH="/ebpb/"

echo "1. Updating from git..."
cd "$PROJECT_DIR"
git pull origin prod

echo ""
echo "2. Building frontend..."
cd "$FRONTEND_DIR"
npm install
# VITE_BASE: para rutas del router y assets (/ebpb/)
# VITE_API_BASE: base path para requests del API (/ebpb)
# Las rutas ya incluyen /api/, entonces /api/login se convierte en /ebpb/api/login
VITE_BASE="$BASE_PATH" VITE_API_BASE="/ebpb" npm run build

echo ""
echo "3. Deploying frontend to $WEB_DIR..."
sudo rm -rf "$WEB_DIR"/*
sudo cp -r dist/* "$WEB_DIR/"
sudo chown -R www-data:www-data "$WEB_DIR"

echo ""
echo "4. Checking backend configuration..."
if ! grep -q "ROOT_PATH=/ebpb" "$PROJECT_DIR/.env"; then
    echo "⚠️  WARNING: ROOT_PATH not set in .env"
    echo "   Add this line to $PROJECT_DIR/.env:"
    echo "   ROOT_PATH=/ebpb"
else
    echo "✓ ROOT_PATH configured"
fi

echo ""
echo "5. Restarting backend service..."
sudo systemctl restart ebpb-api
sleep 2
sudo systemctl status ebpb-api --no-pager -l

echo ""
echo "=== Deployment complete! ==="
echo "Frontend: https://huayca.crub.uncoma.edu.ar/ebpb/"
echo "API Docs: https://huayca.crub.uncoma.edu.ar/ebpb/api/docs"
echo ""
echo "To check logs: sudo journalctl -u ebpb-api -f"
