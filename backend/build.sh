#!/usr/bin/env bash
# Exit on error
set -o errexit

echo "Installing Python dependencies..."
pip install --upgrade pip
pip install -r requirements.txt

echo "Installing Playwright chromium browser..."
# Install the browser binary (Render's default OS image usually has the necessary OS-level dependencies)
playwright install chromium
