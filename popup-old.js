// State management
let currentTosText = '';

// DOM elements
const apiKeySection = document.getElementById('api-key-section');
const mainSection = document.getElementById('main-section');
const apiKeyInput = document.getElementById('api-key');
const saveKeyBtn = document.getElementById('save-key');
const settingsBtn = document.getElementById('settings-btn');
const minimizeBtn = document.getElementById('minimize-btn');

const initialState = document.getElementById('initial-state');
const loadingDiv = document.getElementById('loading');
const loadingText = document.getElementById('loading-text');
const errorDiv = document.getElementById('error');
const errorMessage = document.getElementById('error-message');
const resultDiv = document.getElementById('result');

const analyzeBtn = document.getElementById('analyze-btn');
const uploadBtn = document.getElementById('upload-btn');
const fileInput = document.getElementById('file-input');
const retryBtn = document.getElementById('retry-btn');
const copyBtn = document.getElementById('copy-btn');
const newAnalysisBtn = document.getElementById('new-analysis-btn');

const summaryContent = document.getElementById('summary-content');
const qaHistory = document.getElementById('qa-history');
const questionInput = document.getElementById('question-input');
const askBtn = document.getElementById('ask-btn');

// Initialize
async function init() {
  const { apiKey, lastAnalysis } = await chrome.storage.local.get(['apiKey', 'lastAnalysis']);

  if (apiKey) {
    showMainSection();

    // Restore previous analysis if it exists
    if (lastAnalysis) {
      currentTosText = lastAnalysis.tosText || '';

      if (lastAnalysis.summary) {
        displayResults(lastAnalysis.summary);
      }
    }
  } else {
    showApiKeySection();
  }

  // Add event listeners
  saveKeyBtn.addEventListener('click', handleSaveKey);
  settingsBtn.addEventListener('click', showApiKeySection);
  minimizeBtn.addEventListener('click', handleMinimize);
  analyzeBtn.addEventListener('click', handleAnalyze);
  uploadBtn.addEventListener('click', () => fileInput.click());
  fileInput.addEventListener('change', handleFileUpload);
  retryBtn.addEventListener('click', () => {
    hideError();
    showInitial();
  });
  copyBtn.addEventListener('click', handleCopy);
  newAnalysisBtn.addEventListener('click', handleNewAnalysis);
  askBtn.addEventListener('click', handleAskQuestion);

  // Enter key to send question
  questionInput.addEventListener('keydown', (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleAskQuestion();
    }
  });
}

// Section visibility
function showApiKeySection() {
  apiKeySection.style.display = 'flex';
  mainSection.style.display = 'none';
}

function showMainSection() {
  apiKeySection.style.display = 'none';
  mainSection.style.display = 'block';
}

function showInitial() {
  initialState.style.display = 'flex';
  loadingDiv.style.display = 'none';
  errorDiv.style.display = 'none';
  resultDiv.style.display = 'none';
}

function showLoading(text = 'Analyzing terms of service...') {
  initialState.style.display = 'none';
  loadingDiv.style.display = 'flex';
  loadingText.textContent = text;
  errorDiv.style.display = 'none';
  resultDiv.style.display = 'none';
}

function showResult() {
  initialState.style.display = 'none';
  loadingDiv.style.display = 'none';
  errorDiv.style.display = 'none';
  resultDiv.style.display = 'block';
  resultDiv.classList.add('fade-in');

  // Show minimize button when results are displayed
  minimizeBtn.style.display = 'flex';
}

function showError(message) {
  initialState.style.display = 'none';
  loadingDiv.style.display = 'none';
  errorDiv.style.display = 'flex';
  errorDiv.classList.add('fade-in');
  errorMessage.textContent = message;
  resultDiv.style.display = 'none';
}

function hideError() {
  errorDiv.style.display = 'none';
}

// Handlers
async function handleSaveKey() {
  const apiKey = apiKeyInput.value.trim();

  if (!apiKey) {
    alert('Please enter an API key');
    return;
  }

  if (!apiKey.startsWith('sk-ant-')) {
    alert('Invalid API key format. Key should start with "sk-ant-"');
    return;
  }

  await chrome.storage.local.set({ apiKey });
  showMainSection();
}

async function handleAnalyze() {
  showLoading('Analyzing terms of service...');

  try {
    const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });

    // Check if it's a PDF page
    if (tab.url && tab.url.toLowerCase().endsWith('.pdf')) {
      showError('PDF pages are not directly supported. Please use the "Upload PDF" button instead.');
      return;
    }

    // Extract ToS text
    const [result] = await chrome.scripting.executeScript({
      target: { tabId: tab.id },
      func: extractTosText
    });

    currentTosText = result.result;

    if (!currentTosText) {
      showError('No terms of service text found on this page. Try navigating to a ToS or privacy policy page, or upload a PDF/TXT file.');
      return;
    }

    if (currentTosText.length < 100) {
      showError('The detected text is too short to be a terms of service document.');
      return;
    }

    // Send to background for analysis
    const response = await chrome.runtime.sendMessage({
      action: 'analyze',
      text: currentTosText
    });

    if (response.error) {
      showError(response.error);
    } else {
      displayResults(response);
    }
  } catch (error) {
    showError('An error occurred: ' + error.message);
  }
}

async function handleFileUpload(event) {
  const file = event.target.files[0];
  if (!file) return;

  showLoading(`Extracting text from ${file.name}...`);

  try {
    let text = '';

    if (file.type === 'application/pdf' || file.name.toLowerCase().endsWith('.pdf')) {
      text = await extractTextFromPDF(file);
    } else if (file.type === 'text/plain' || file.name.toLowerCase().endsWith('.txt')) {
      text = await extractTextFromTXT(file);
    } else {
      showError('Unsupported file type. Please upload a PDF or TXT file.');
      return;
    }

    if (!text || text.length < 100) {
      showError('Could not extract enough text from the file. Make sure it contains terms of service text.');
      return;
    }

    currentTosText = text;

    // Show analysis loading
    showLoading('Analyzing terms of service...');

    // Send to background for analysis
    const response = await chrome.runtime.sendMessage({
      action: 'analyze',
      text: currentTosText
    });

    if (response.error) {
      showError(response.error);
    } else {
      displayResults(response);
    }
  } catch (error) {
    showError('Error processing file: ' + error.message);
  } finally {
    // Reset file input
    fileInput.value = '';
  }
}

function displayResults(summary) {
  console.log('Summary received:', summary);

  // Display summary
  summaryContent.textContent = summary;

  // Clear Q&A history
  qaHistory.innerHTML = '';

  // Save analysis to storage for persistence
  chrome.storage.local.set({
    lastAnalysis: {
      summary: summary,
      tosText: currentTosText,
      timestamp: Date.now()
    }
  });

  showResult();
}

async function handleAskQuestion() {
  const question = questionInput.value.trim();

  if (!question) return;

  // Add user message
  addMessage('user', question);
  questionInput.value = '';

  // Disable input while processing
  questionInput.disabled = true;
  askBtn.disabled = true;

  try {
    const response = await chrome.runtime.sendMessage({
      action: 'askQuestion',
      question: question,
      context: currentTosText
    });

    if (response.error) {
      addMessage('assistant', 'Sorry, I encountered an error: ' + response.error);
    } else {
      addMessage('assistant', response.answer);
    }
  } catch (error) {
    addMessage('assistant', 'Sorry, I encountered an error: ' + error.message);
  } finally {
    questionInput.disabled = false;
    askBtn.disabled = false;
    questionInput.focus();
  }
}

function addMessage(role, content) {
  const messageGroup = document.createElement('div');
  messageGroup.className = 'message-group fade-in';

  const message = document.createElement('div');
  message.className = `message ${role}`;

  const messageContent = document.createElement('div');
  messageContent.className = 'message-content';
  messageContent.textContent = content;

  message.appendChild(messageContent);
  messageGroup.appendChild(message);
  qaHistory.appendChild(messageGroup);

  // Scroll to bottom
  qaHistory.scrollTop = qaHistory.scrollHeight;
}

async function handleCopy() {
  const text = summaryContent.textContent;
  await navigator.clipboard.writeText(text);

  const originalHTML = copyBtn.innerHTML;
  copyBtn.innerHTML = '<svg width="16" height="16" viewBox="0 0 20 20" fill="none" stroke="currentColor" stroke-width="2"><path d="M5 10l3 3 7-7"/></svg>Copied!';

  setTimeout(() => {
    copyBtn.innerHTML = originalHTML;
  }, 2000);
}

function handleNewAnalysis() {
  currentTosText = '';
  minimizeBtn.style.display = 'none';

  // Clear saved analysis
  chrome.storage.local.remove('lastAnalysis');

  showInitial();
}

function handleMinimize() {
  // Close the popup window
  window.close();
}

// Injected functions
function extractTosText() {
  const clone = document.body.cloneNode(true);
  const unwanted = clone.querySelectorAll('script, style, nav, header, footer, [hidden], [style*="display: none"]');
  unwanted.forEach(el => el.remove());

  let text = clone.textContent || '';
  text = text.replace(/\s+/g, ' ').trim();

  const tosKeywords = /terms of service|terms of use|user agreement|privacy policy|cookie policy|terms and conditions|legal/i;

  if (!tosKeywords.test(text) && !tosKeywords.test(document.title)) {
    const tosContainers = document.querySelectorAll('[class*="terms"], [id*="terms"], [class*="policy"], [id*="policy"], [class*="legal"], [id*="legal"]');

    if (tosContainers.length > 0) {
      text = Array.from(tosContainers)
        .map(el => el.textContent)
        .join(' ')
        .replace(/\s+/g, ' ')
        .trim();
    }
  }

  if (text.length > 100000) {
    text = text.substring(0, 100000);
  }

  return text;
}

// File extraction functions
async function extractTextFromTXT(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (e) => resolve(e.target.result);
    reader.onerror = (e) => reject(new Error('Failed to read text file'));
    reader.readAsText(file);
  });
}

async function extractTextFromPDF(file) {
  return new Promise(async (resolve, reject) => {
    try {
      // Configure PDF.js worker
      if (typeof pdfjsLib !== 'undefined') {
        pdfjsLib.GlobalWorkerOptions.workerSrc = 'pdf.worker.js';
      } else {
        reject(new Error('PDF.js library not loaded'));
        return;
      }

      const arrayBuffer = await file.arrayBuffer();
      const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;

      let fullText = '';

      // Extract text from each page
      for (let i = 1; i <= pdf.numPages; i++) {
        const page = await pdf.getPage(i);
        const textContent = await page.getTextContent();
        const pageText = textContent.items.map(item => item.str).join(' ');
        fullText += pageText + '\n\n';
      }

      // Clean up text
      fullText = fullText.replace(/\s+/g, ' ').trim();

      if (fullText.length > 100000) {
        fullText = fullText.substring(0, 100000);
      }

      resolve(fullText);
    } catch (error) {
      reject(new Error('Failed to extract text from PDF: ' + error.message));
    }
  });
}

// Injected functions
function extractTosText() {
  const clone = document.body.cloneNode(true);
  const unwanted = clone.querySelectorAll('script, style, nav, header, footer, [hidden], [style*="display: none"]');
  unwanted.forEach(el => el.remove());

  let text = clone.textContent || '';
  text = text.replace(/\s+/g, ' ').trim();

  const tosKeywords = /terms of service|terms of use|user agreement|privacy policy|cookie policy|terms and conditions|legal/i;

  if (!tosKeywords.test(text) && !tosKeywords.test(document.title)) {
    const tosContainers = document.querySelectorAll('[class*="terms"], [id*="terms"], [class*="policy"], [id*="policy"], [class*="legal"], [id*="legal"]');

    if (tosContainers.length > 0) {
      text = Array.from(tosContainers)
        .map(el => el.textContent)
        .join(' ')
        .replace(/\s+/g, ' ')
        .trim();
    }
  }

  if (text.length > 100000) {
    text = text.substring(0, 100000);
  }

  return text;
}

// File extraction functions
async function extractTextFromTXT(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (e) => resolve(e.target.result);
    reader.onerror = (e) => reject(new Error('Failed to read text file'));
    reader.readAsText(file);
  });
}

async function extractTextFromPDF(file) {
  return new Promise(async (resolve, reject) => {
    try {
      // Configure PDF.js worker
      if (typeof pdfjsLib !== 'undefined') {
        pdfjsLib.GlobalWorkerOptions.workerSrc = 'pdf.worker.js';
      } else {
        reject(new Error('PDF.js library not loaded'));
        return;
      }

      const arrayBuffer = await file.arrayBuffer();
      const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;

      let fullText = '';

      // Extract text from each page
      for (let i = 1; i <= pdf.numPages; i++) {
        const page = await pdf.getPage(i);
        const textContent = await page.getTextContent();
        const pageText = textContent.items.map(item => item.str).join(' ');
        fullText += pageText + '\n\n';
      }

      // Clean up text
      fullText = fullText.replace(/\s+/g, ' ').trim();

      if (fullText.length > 100000) {
        fullText = fullText.substring(0, 100000);
      }

      resolve(fullText);
    } catch (error) {
      reject(new Error('Failed to extract text from PDF: ' + error.message));
    }
  });
}

// Initialize on load
init();
