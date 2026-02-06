# Valid Claude Model IDs

This document lists the correct Claude model IDs you can use in the extension.

## Current Model

The extension is currently set to use: **`claude-3-5-sonnet-20241022`**

## All Valid Model IDs

### Claude 3.5 Models (Newest)

**Claude 3.5 Sonnet** (Best balance of intelligence and speed)
- `claude-3-5-sonnet-20241022` ← **RECOMMENDED** (October 2024 - Latest)
- `claude-3-5-sonnet-20240620` (June 2024)

**Claude 3.5 Haiku** (Fast and affordable)
- `claude-3-5-haiku-20241022` (October 2024)

### Claude 3 Models (Previous Generation)

**Claude 3 Opus** (Highest intelligence, slower, most expensive)
- `claude-3-opus-20240229`

**Claude 3 Sonnet** (Good balance)
- `claude-3-sonnet-20240229`

**Claude 3 Haiku** (Fastest, cheapest)
- `claude-3-haiku-20240307`

## Pricing (Approximate)

| Model | Input | Output | Best For |
|-------|-------|--------|----------|
| Claude 3.5 Sonnet | $3/M tokens | $15/M tokens | Most use cases (recommended) |
| Claude 3.5 Haiku | $1/M tokens | $5/M tokens | High volume, simpler tasks |
| Claude 3 Opus | $15/M tokens | $75/M tokens | Complex analysis |
| Claude 3 Haiku | $0.25/M tokens | $1.25/M tokens | Budget option |

*M = Million tokens*

## How to Change the Model

1. Open `background.js`
2. Find line 34: `model: 'claude-3-5-sonnet-20241022',`
3. Replace with one of the model IDs above
4. Save the file
5. Reload the extension in chrome://extensions

## Common Mistakes

❌ **Wrong:** `claude-3-5-haiku-20240307` (This model doesn't exist!)
✅ **Right:** `claude-3-haiku-20240307` (Claude 3 Haiku)
✅ **Right:** `claude-3-5-haiku-20241022` (Claude 3.5 Haiku)

❌ **Wrong:** `claude-sonnet-3.5` (Wrong format)
✅ **Right:** `claude-3-5-sonnet-20241022` (Correct format)

## If You Still Get 404 Errors

If you're getting 404 errors with valid model IDs, check:

1. **API Key Validity**: Make sure your API key is active at console.anthropic.com
2. **Account Access**: Verify your account has access to Claude 3.5 models
3. **Credits Available**: Ensure you have credits available
4. **API Key Permissions**: Check if your API key has restrictions

## Testing Different Models

To test which models work with your API key:

1. Start with `claude-3-5-sonnet-20241022` (most common)
2. If that fails, try `claude-3-haiku-20240307` (most likely to work)
3. Check console.anthropic.com for your account's model access

## Model Recommendations for ToS Summarization

- **Best Quality**: `claude-3-5-sonnet-20241022` (~$0.01 per summary)
- **Budget Option**: `claude-3-haiku-20240307` (~$0.001 per summary)
- **Speed**: `claude-3-5-haiku-20241022` (fast and good quality)

For most users, **Claude 3.5 Sonnet** provides the best balance of quality and cost for ToS summarization.
