# Quick Setup Guide

Follow these steps to get your ToS Summarizer extension running in Chrome.

## ⚠️ Security Notice

**This extension is designed for personal use only.** The extension makes direct API calls to Claude from your browser, which means:

- Your API key is stored locally in Chrome
- Someone with access to your Chrome extensions could potentially extract your API key
- This is safe for personal use on your own computer
- Do not distribute this extension with your API key to others

**Recommendations:**
- Use only on your personal computer
- Set usage limits on your API key at console.anthropic.com
- Monitor API usage regularly

## Step 1: Get Your Claude API Key

1. Go to [https://console.anthropic.com/](https://console.anthropic.com/)
2. Sign in or create an account
3. Click on "API Keys" in the left sidebar
4. Click "Create Key"
5. Copy your new API key (starts with "sk-ant-")
6. Keep this key safe - you'll need it in Step 4

## Step 2: Add Extension Icons

The extension needs 4 icon files. Choose one option:

### Option A: Quick Placeholder (For Testing)
Download any small PNG image and copy it 4 times with these names:
- `icons/icon16.png`
- `icons/icon32.png`
- `icons/icon48.png`
- `icons/icon128.png`

### Option B: Proper Icons
1. Visit [https://favicon.io/emoji-favicons/memo/](https://favicon.io/emoji-favicons/memo/)
2. Download the favicon package
3. Extract and copy the PNG files to the `icons/` folder
4. Rename them to match the required names above

## Step 3: Load Extension in Chrome

1. Open Google Chrome
2. Type `chrome://extensions/` in the address bar and press Enter
3. Toggle on "Developer mode" (top-right corner)
4. Click "Load unpacked" button
5. Navigate to and select this folder: `chrome-tos-summarizer`
6. The extension should now appear in your extensions list
7. Pin the extension by clicking the puzzle icon in Chrome toolbar, then the pin icon next to "ToS Summarizer"

## Step 4: Configure Your API Key

1. Click the ToS Summarizer icon in your Chrome toolbar
2. In the popup, paste your Claude API key from Step 1
3. Click "Save Key"

## Step 5: Test the Extension

1. Visit a Terms of Service page, for example:
   - https://www.google.com/policies/terms/
   - https://www.reddit.com/policies/user-agreement
   - https://twitter.com/en/tos

2. Click the ToS Summarizer extension icon
3. Click "Analyze Terms of Service"
4. Wait a few seconds for the summary to appear
5. Read the summary or click "Copy" to copy it

## Troubleshooting

### Extension won't load
- Make sure all files are in the chrome-tos-summarizer folder
- Check that manifest.json is at the root level
- Try refreshing the extension from chrome://extensions

### "No terms of service text found"
- Make sure you're on a page with actual ToS/Privacy Policy content
- Try scrolling down to ensure all content is loaded
- The page might use the keywords: "Terms of Service", "Privacy Policy", "User Agreement", etc.

### API errors
- Double-check your API key is correct (should start with "sk-ant-")
- Verify you have credits available at console.anthropic.com
- Check your internet connection

### Extension icon shows as gray/default
- You need to add the icon files (see Step 2)
- The extension will still work, just without a custom icon

## What's Next?

- Try summarizing different ToS documents
- Use the copy feature to save summaries
- Monitor your API usage at console.anthropic.com
- Each summary typically costs less than $0.01

## Need Help?

Check the main README.md for more detailed documentation, including:
- How the extension works
- Security information
- Privacy details
- Cost considerations
- Future enhancement ideas

Enjoy having ToS documents explained in plain language!
