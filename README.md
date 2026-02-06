# Chrome ToS Summarizer Extension

A Chrome extension that uses Claude AI to summarize Terms of Service documents on any website.

## Features

- 🔍 Automatically detects Terms of Service text on web pages
- 🤖 Uses Claude AI to generate clear, concise summaries
- 📋 Easy copy-to-clipboard functionality
- 🎨 Clean, modern UI with gradient design
- 🔒 Secure API key storage
- ⚡ Fast analysis with Manifest V3

## Installation

### 1. Get a Claude API Key

1. Visit [console.anthropic.com](https://console.anthropic.com/)
2. Sign up or log in
3. Navigate to API Keys section
4. Create a new API key and copy it

### 2. Add Extension Icons

Create an `icons` folder in the extension directory and add icons in the following sizes:
- icon16.png (16x16 pixels)
- icon32.png (32x32 pixels)
- icon48.png (48x48 pixels)
- icon128.png (128x128 pixels)

You can use any icon generator or create simple icons with a text editor or design tool.

Quick option: Create solid color PNG files with a document or contract emoji/symbol.

### 3. Load the Extension in Chrome

1. Open Chrome and navigate to `chrome://extensions/`
2. Enable "Developer mode" (toggle in top-right corner)
3. Click "Load unpacked"
4. Select the extension directory
5. The extension icon should appear in your toolbar

### 4. Configure API Key

1. Click the extension icon in your toolbar
2. Enter your Claude API key
3. Click "Save Key"

## Usage

1. Navigate to any Terms of Service or Privacy Policy page
2. Click the extension icon in your toolbar
3. Click "Analyze Terms of Service"
4. Wait for Claude to analyze and summarize the content
5. Read the summary or click "Copy" to copy it to clipboard

## How It Works

### Architecture

- **popup.html/js**: User interface and interaction
- **background.js**: Service worker handling Claude API calls
- **content.js**: Detects ToS content on pages
- **manifest.json**: Extension configuration (Manifest V3)

### ToS Detection

The extension detects Terms of Service content by:
1. Checking page titles and content for ToS keywords
2. Looking for common ToS-related HTML elements (class/id attributes)
3. Extracting and cleaning text content
4. Limiting text to 100k characters to respect API limits

### Summarization

The extension uses Claude 3.5 Sonnet to provide summaries focusing on:
- Key rights and obligations
- Important limitations or restrictions
- Privacy and data usage practices
- Concerning or unusual clauses
- Cancellation policies

## Files Structure

```
chrome-tos-summarizer/
├── manifest.json          # Extension manifest (Manifest V3)
├── popup.html            # Extension popup UI
├── popup.js              # Popup logic and interaction
├── background.js         # Service worker for API calls
├── content.js            # Content script (minimal)
├── styles.css            # UI styling
├── README.md            # This file
└── icons/               # Extension icons (you need to add these)
    ├── icon16.png
    ├── icon32.png
    ├── icon48.png
    └── icon128.png
```

## Security Notes

**IMPORTANT SECURITY WARNING**: This extension makes direct API calls from the browser to Claude API. While the API key is stored locally, it can potentially be extracted by someone with access to your Chrome extensions. This approach is acceptable for personal use but is not recommended for production applications.

**For personal use:**
- ✅ API keys are stored locally using Chrome's storage API
- ✅ API calls are made from the background service worker
- ✅ No data is sent to third parties except Claude API
- ✅ The extension requires `activeTab` permission only when you use it

**Security recommendations:**
- Use this extension only on your personal computer
- Do not share the extension with others (they would have access to view your API key)
- Monitor your API usage at console.anthropic.com
- Set usage limits on your API key in the Anthropic console
- Rotate your API key periodically

**For production use:**
- ❌ Do not use this architecture for public extensions
- ✅ Instead, create a backend server that proxies API requests
- ✅ Keep API keys on the server, never in client code

## Troubleshooting

### "No terms of service text found"
- Make sure you're on a page that actually contains ToS content
- Try scrolling through the page to load all content
- Some pages use lazy loading; wait for content to load

### API Errors
- Verify your API key is correct
- Check your API key has sufficient credits at console.anthropic.com
- Make sure you have internet connectivity

### Extension Not Loading
- Ensure all files are in the correct directory
- Check for JavaScript errors in Chrome DevTools
- Reload the extension from chrome://extensions

## Cost Considerations

This extension uses the Claude API which has associated costs:
- Claude 3.5 Sonnet: ~$3 per million input tokens, ~$15 per million output tokens
- A typical ToS summary costs less than $0.01
- Monitor usage at console.anthropic.com

## Privacy

- Your API key never leaves your browser
- ToS text is only sent to Claude API for summarization
- No browsing data is collected or stored
- No analytics or tracking

## License

MIT License - feel free to modify and distribute

## Contributing

Contributions are welcome! Feel free to:
- Report bugs
- Suggest features
- Submit pull requests
- Improve documentation

## Limitations

- Requires active Claude API key with credits
- Limited to 100k characters of input text
- Works best on standard ToS/Privacy Policy pages
- May not work on pages with complex JavaScript rendering

## Future Enhancements

Potential features for future versions:
- Highlight concerning clauses
- Compare ToS versions over time
- Export summaries as PDF
- Support for multiple languages
- Batch analysis of multiple ToS documents
- Risk scoring system
