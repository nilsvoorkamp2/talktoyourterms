#!/bin/bash
# Quick setup script for Render deployment

echo "🚀 Talk to Your Terms - Render Deployment Setup"
echo "================================================"
echo ""

# Check if git is initialized
if [ ! -d .git ]; then
  echo "📦 Initializing Git repository..."
  git init
  git add .
  git commit -m "Initial commit: Talk to Your Terms extension"
else
  echo "✅ Git repository already initialized"
fi

echo ""
echo "📋 Next steps:"
echo ""
echo "1. Push to GitHub:"
echo "   - Create a new repo at https://github.com/new"
echo "   - Replace YOUR_USERNAME in the commands below"
echo "   git remote add origin https://github.com/YOUR_USERNAME/chrome-tos-summarizer.git"
echo "   git branch -M main"
echo "   git push -u origin main"
echo ""
echo "2. Deploy to Render:"
echo "   - Go to https://render.com"
echo "   - Click 'New +' → 'Web Service'"
echo "   - Connect your GitHub repository"
echo "   - Select free plan"
echo ""
echo "3. Add Environment Variables in Render dashboard:"
echo "   - ANTHROPIC_API_KEY: (from https://console.anthropic.com)"
echo "   - JWT_SECRET: (generate with: openssl rand -hex 32)"
echo "   - NODE_ENV: production"
echo ""
echo "4. Update your extension:"
echo "   - Replace 'talk-to-your-terms-api' in manifest.json"
echo "   - Update config.js with your Render URL"
echo ""
echo "✨ Done! Your backend will be live in 2-5 minutes"
