#!/bin/bash

# Create new app from template
echo "🚀 Setting up new app from template..."

# 1. Copy template folder to new-app in root directory
echo "📁 Copying template to new-app..."
cp -r template new-app

# 2. Navigate to new-app and setup environment file
cd new-app
echo "📋 Setting up environment file..."
cp .env.example .env

echo "✅ Setup complete!"
echo "📌 New app created at: new-app/"
echo "📝 Remember to update the .env file with your configuration"
echo ""
echo "To get started:"
echo "  cd new-app"
echo "  npm install"
echo "  npm run dev"