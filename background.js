// Background service worker for handling API calls

chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === 'analyze') {
    analyzeText(request.text)
      .then(result => sendResponse(result))
      .catch(error => sendResponse({ error: error.message }));
    return true;
  }

  if (request.action === 'askQuestion') {
    answerQuestion(request.question, request.context)
      .then(answer => sendResponse({ answer }))
      .catch(error => sendResponse({ error: error.message }));
    return true;
  }

  // Legacy support for old 'summarize' action
  if (request.action === 'summarize') {
    analyzeText(request.text)
      .then(result => sendResponse({ summary: result.summary }))
      .catch(error => sendResponse({ error: error.message }));
    return true;
  }
});

async function analyzeText(text) {
  const { apiKey } = await chrome.storage.local.get('apiKey');

  if (!apiKey) {
    throw new Error('API key not found. Please configure your API key.');
  }

  // Call Claude API for comprehensive analysis
  // Note: The 'anthropic-dangerous-direct-browser-access' header is required for browser-based API calls.
  // WARNING: This approach exposes your API key in the extension code. For personal use only.
  // For production apps, use a backend proxy server to keep API keys secure.
  const response = await fetch('https://api.anthropic.com/v1/messages', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-api-key': apiKey,
      'anthropic-version': '2023-06-01',
      'anthropic-dangerous-direct-browser-access': 'true'
    },
    body: JSON.stringify({
      model: 'claude-3-haiku-20240307',
      max_tokens: 2000,
      messages: [{
        role: 'user',
        content: `Analyze the following Terms of Service document and provide a clear, comprehensive summary in English.

Your summary should cover:
- Key rights and obligations of users
- Important limitations or restrictions
- Privacy and data usage practices
- Cancellation or termination policies
- Any concerning or unusual terms
- What users are agreeing to

Make the summary conversational and easy to understand. Focus on what users need to know before agreeing to these terms.

Terms of Service:
${text}`
      }]
    })
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    const errorMessage = errorData.error?.message || errorData.message || JSON.stringify(errorData);
    throw new Error(`API Error (${response.status}): ${errorMessage}`);
  }

  const data = await response.json();

  if (!data.content || !data.content[0] || !data.content[0].text) {
    throw new Error('Invalid API response format');
  }

  // Return the summary text directly
  return data.content[0].text.trim();
}

async function answerQuestion(question, context) {
  const { apiKey } = await chrome.storage.local.get('apiKey');

  if (!apiKey) {
    throw new Error('API key not found. Please configure your API key.');
  }

  // Truncate context if too long
  let truncatedContext = context;
  if (context.length > 50000) {
    truncatedContext = context.substring(0, 50000) + '\n\n[Context truncated due to length...]';
  }

  const response = await fetch('https://api.anthropic.com/v1/messages', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-api-key': apiKey,
      'anthropic-version': '2023-06-01',
      'anthropic-dangerous-direct-browser-access': 'true'
    },
    body: JSON.stringify({
      model: 'claude-3-haiku-20240307',
      max_tokens: 1024,
      messages: [{
        role: 'user',
        content: `You are a helpful assistant analyzing Terms of Service. Answer the following question based on the provided ToS document.

Question: ${question}

Terms of Service Context:
${truncatedContext}

Provide a clear, concise answer based only on the information in the ToS. If the answer isn't found in the ToS, say so.`
      }]
    })
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    const errorMessage = errorData.error?.message || errorData.message || JSON.stringify(errorData);
    throw new Error(`API Error (${response.status}): ${errorMessage}`);
  }

  const data = await response.json();

  if (!data.content || !data.content[0] || !data.content[0].text) {
    throw new Error('Invalid API response format');
  }

  return data.content[0].text;
}
