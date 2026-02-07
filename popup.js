// State management
let currentTosText = '';
let selectedModel = 'claude-3-haiku-20240307'; // Default model - works with all API tiers

// DOM elements
const authSection = document.getElementById('auth-section');
const mainSection = document.getElementById('main-section');

// Model selection elements
const modelBtn = document.getElementById('model-btn');
const modelModal = document.getElementById('model-modal');
const modelModalOverlay = document.getElementById('model-modal-overlay');
const closeModelBtn = document.getElementById('close-model-btn');
const saveModelBtn = document.getElementById('save-model-btn');
const modelRadios = document.querySelectorAll('input[name="model"]');

// Auth elements
const loginForm = document.getElementById('login-form');
const signupForm = document.getElementById('signup-form');
const loginEmail = document.getElementById('login-email');
const loginPassword = document.getElementById('login-password');
const signupEmail = document.getElementById('signup-email');
const signupPassword = document.getElementById('signup-password');
const signupPasswordConfirm = document.getElementById('signup-password-confirm');
const loginBtn = document.getElementById('login-btn');
const signupBtn = document.getElementById('signup-btn');
const showSignupLink = document.getElementById('show-signup');
const showLoginLink = document.getElementById('show-login');
const authError = document.getElementById('auth-error');

// Main elements
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

// Feedback elements
const stars = document.querySelectorAll('.star');
const ratingText = document.getElementById('rating-text');
const feedbackInput = document.getElementById('feedback-input');
const submitFeedbackBtn = document.getElementById('submit-feedback-btn');
const feedbackStatus = document.getElementById('feedback-status');

// State for feedback
let currentRating = 0;
let lastAnalyzedUrl = '';

// Initialize
async function init() {
  // Load saved model preference
  const { userModel } = await chrome.storage.local.get('userModel');
  if (userModel) {
    selectedModel = userModel;
    const radio = document.querySelector(`input[name="model"][value="${userModel}"]`);
    if (radio) radio.checked = true;
  }

  // Show main section immediately (no authentication needed)
  showMainSection();
  
  // Restore previous analysis if exists
  const { lastAnalysis } = await chrome.storage.local.get('lastAnalysis');
  if (lastAnalysis) {
    currentTosText = lastAnalysis.tosText || '';
    if (lastAnalysis.summary) {
      displayResults(lastAnalysis.summary);
    }
  }

  // Add event listeners
  showSignupLink.addEventListener('click', (e) => {
    e.preventDefault();
    showSignupForm();
  });

  showLoginLink.addEventListener('click', (e) => {
    e.preventDefault();
    showLoginForm();
  });

  loginBtn.addEventListener('click', handleLogin);
  signupBtn.addEventListener('click', handleSignup);
  settingsBtn.addEventListener('click', handleLogout);
  minimizeBtn.addEventListener('click', handleMinimize);
  modelBtn.addEventListener('click', openModelModal);
  closeModelBtn.addEventListener('click', closeModelModal);
  modelModalOverlay.addEventListener('click', closeModelModal);
  saveModelBtn.addEventListener('click', saveModelSelection);
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

  // Feedback event listeners
  stars.forEach(star => {
    star.addEventListener('click', (e) => handleStarClick(e.target));
    star.addEventListener('mouseover', (e) => handleStarHover(e.target));
  });
  document.querySelector('.stars').addEventListener('mouseout', resetStarHover);
  submitFeedbackBtn.addEventListener('click', handleSubmitFeedback);

  // Enter key handling
  loginPassword.addEventListener('keydown', (e) => {
    if (e.key === 'Enter') handleLogin();
  });

  signupPasswordConfirm.addEventListener('keydown', (e) => {
    if (e.key === 'Enter') handleSignup();
  });

  questionInput.addEventListener('keydown', (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleAskQuestion();
    }
  });
}

// Model selection handlers
function openModelModal() {
  modelModal.style.display = 'block';
  modelModalOverlay.style.display = 'flex';
}

function closeModelModal() {
  modelModal.style.display = 'none';
  modelModalOverlay.style.display = 'none';
}

async function saveModelSelection() {
  const selected = document.querySelector('input[name="model"]:checked');
  if (selected) {
    selectedModel = selected.value;
    await chrome.storage.local.set({ userModel: selectedModel });
    closeModelModal();
  }
}

// Section visibility
function showAuthSection() {
  authSection.style.display = 'flex';
  mainSection.style.display = 'none';
}

function showMainSection() {
  authSection.style.display = 'none';
  mainSection.style.display = 'block';
}

function showLoginForm() {
  loginForm.style.display = 'block';
  signupForm.style.display = 'none';
  authError.style.display = 'none';
}

function showSignupForm() {
  loginForm.style.display = 'none';
  signupForm.style.display = 'block';
  authError.style.display = 'none';
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

function showAuthError(message) {
  authError.textContent = message;
  authError.style.display = 'block';
}

// Authentication handlers
async function handleLogin() {
  const email = loginEmail.value.trim();
  const password = loginPassword.value;

  if (!email || !password) {
    showAuthError('Please enter email and password');
    return;
  }

  loginBtn.disabled = true;
  loginBtn.textContent = 'Signing in...';

  try {
    const response = await fetch(`${API_CONFIG.BASE_URL}${API_CONFIG.ENDPOINTS.LOGIN}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password })
    });

    const data = await response.json();

    if (!response.ok) {
      showAuthError(data.error || 'Login failed');
      return;
    }

    // Save token
    await chrome.storage.local.set({ authToken: data.token });
    showMainSection();
  } catch (error) {
    showAuthError('Connection error. Make sure the backend server is running.');
  } finally {
    loginBtn.disabled = false;
    loginBtn.textContent = 'Sign In';
  }
}

async function handleSignup() {
  const email = signupEmail.value.trim();
  const password = signupPassword.value;
  const confirmPassword = signupPasswordConfirm.value;

  if (!email || !password) {
    showAuthError('Please enter email and password');
    return;
  }

  if (password.length < 8) {
    showAuthError('Password must be at least 8 characters');
    return;
  }

  if (password !== confirmPassword) {
    showAuthError('Passwords do not match');
    return;
  }

  signupBtn.disabled = true;
  signupBtn.textContent = 'Creating account...';

  try {
    const response = await fetch(`${API_CONFIG.BASE_URL}${API_CONFIG.ENDPOINTS.REGISTER}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password })
    });

    const data = await response.json();

    if (!response.ok) {
      showAuthError(data.error || 'Registration failed');
      return;
    }

    // Save token
    await chrome.storage.local.set({ authToken: data.token });
    showMainSection();
  } catch (error) {
    showAuthError('Connection error. Make sure the backend server is running.');
  } finally {
    signupBtn.disabled = false;
    signupBtn.textContent = 'Create Account';
  }
}

async function verifyToken(token) {
  try {
    const response = await fetch(`${API_CONFIG.BASE_URL}${API_CONFIG.ENDPOINTS.VERIFY}`, {
      headers: { 'Authorization': `Bearer ${token}` }
    });
    const data = await response.json();
    return data.valid === true;
  } catch (error) {
    return false;
  }
}

async function handleLogout() {
  await chrome.storage.local.remove(['authToken', 'lastAnalysis']);
  showAuthSection();
  showLoginForm();
}

// Analysis handlers
async function handleAnalyze() {
  showLoading('Analyzing terms of service...');

  try {
    const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });

    if (tab.url && tab.url.toLowerCase().endsWith('.pdf')) {
      showError('PDF pages are not directly supported. Please use the "Upload PDF" button instead.');
      return;
    }

    const [result] = await chrome.scripting.executeScript({
      target: { tabId: tab.id },
      func: extractTosText
    });

    currentTosText = result.result;

    if (!currentTosText || currentTosText.length < 100) {
      showError('No terms of service text found on this page. Try navigating to a ToS or privacy policy page, or upload a PDF/TXT file.');
      return;
    }

    // Send to backend for analysis (no auth token needed)
    const response = await fetch(`${API_CONFIG.BASE_URL}${API_CONFIG.ENDPOINTS.ANALYZE}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ text: currentTosText, model: selectedModel })
    });

    if (!response.ok) {
      const data = await response.json();
      
      // If model not available, offer fallback to Haiku
      if (data.fallbackAvailable && data.suggestion) {
        showError(data.error + '\n\n📌 Would you like us to retry with Claude 3 Haiku (which works with all API tiers)?');
        
        // Replace retry button with fallback option
        retryBtn.textContent = 'Retry with Haiku';
        retryBtn.onclick = () => {
          selectedModel = 'claude-3-haiku-20240307';
          retryBtn.textContent = 'Try Again';
          retryBtn.onclick = () => {
            hideError();
            showInitial();
          };
          hideError();
          handleAnalyze();
        };
        return;
      }
      
      showError(data.error || 'Analysis failed');
      return;
    }

    const data = await response.json();
    displayResults(data.summary);
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
    showLoading('Analyzing terms of service...');

    // Send to backend (no auth token needed)
    const response = await fetch(`${API_CONFIG.BASE_URL}${API_CONFIG.ENDPOINTS.ANALYZE}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ text: currentTosText, model: selectedModel })
    });

    if (!response.ok) {
      const data = await response.json();
      
      // If model not available, offer fallback to Haiku
      if (data.fallbackAvailable && data.suggestion) {
        showError(data.error + '\n\n📌 Would you like us to retry with Claude 3 Haiku (which works with all API tiers)?');
        
        // Replace retry button with fallback option
        retryBtn.textContent = 'Retry with Haiku';
        retryBtn.onclick = () => {
          selectedModel = 'claude-3-haiku-20240307';
          retryBtn.textContent = 'Try Again';
          retryBtn.onclick = () => {
            hideError();
            showInitial();
          };
          hideError();
          // Re-trigger analysis with Haiku
          showLoading('Analyzing terms of service...');
          fetch(`${API_CONFIG.BASE_URL}${API_CONFIG.ENDPOINTS.ANALYZE}`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ text: currentTosText, model: selectedModel })
          }).then(r => r.json()).then(d => displayResults(d.summary))
            .catch(e => showError('Error: ' + e.message));
        };
        return;
      }
      
      showError(data.error || 'Analysis failed');
      return;
    }

    const data = await response.json();
    displayResults(data.summary);
  } catch (error) {
    showError('Error processing file: ' + error.message);
  } finally {
    fileInput.value = '';
  }
}

function displayResults(summary) {
  summaryContent.textContent = summary;
  qaHistory.innerHTML = '';

  // Get current tab URL for feedback
  chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
    if (tabs[0]) {
      lastAnalyzedUrl = tabs[0].url;
    }
  });

  // Reset feedback form
  currentRating = 0;
  feedbackInput.value = '';
  ratingText.style.display = 'none';
  feedbackStatus.textContent = '';
  feedbackStatus.className = '';
  updateStarDisplay();
  submitFeedbackBtn.disabled = false;

  // Save analysis
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

  addMessage('user', question);
  questionInput.value = '';
  questionInput.disabled = true;
  askBtn.disabled = true;

  try {
    // No auth token needed - send request directly
    const response = await fetch(`${API_CONFIG.BASE_URL}${API_CONFIG.ENDPOINTS.ASK}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        question: question,
        context: currentTosText,
        model: selectedModel
      })
    });

    if (!response.ok) {
      const data = await response.json();
      
      // If model not available, offer fallback to Haiku
      if (data.fallbackAvailable && data.suggestion) {
        addMessage('assistant', data.error + '\n\n📌 Retrying with Claude 3 Haiku (which works with all API tiers)...');
        
        // Retry with Haiku
        selectedModel = 'claude-3-haiku-20240307';
        const retryResponse = await fetch(`${API_CONFIG.BASE_URL}${API_CONFIG.ENDPOINTS.ASK}`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ question, context: currentTosText, model: selectedModel })
        });
        
        if (retryResponse.ok) {
          const retryData = await retryResponse.json();
          addMessage('assistant', retryData.answer);
        } else {
          addMessage('assistant', 'Sorry, analysis failed even with fallback model.');
        }
        return;
      }
      
      addMessage('assistant', 'Sorry, I encountered an error: ' + (data.error || 'Unknown error'));
      return;
    }

    const data = await response.json();
    addMessage('assistant', data.answer);
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
  chrome.storage.local.remove('lastAnalysis');
  showInitial();
}

function handleMinimize() {
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
      if (typeof pdfjsLib !== 'undefined') {
        pdfjsLib.GlobalWorkerOptions.workerSrc = 'pdf.worker.js';
      } else {
        reject(new Error('PDF.js library not loaded'));
        return;
      }

      const arrayBuffer = await file.arrayBuffer();
      const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;

      let fullText = '';

      for (let i = 1; i <= pdf.numPages; i++) {
        const page = await pdf.getPage(i);
        const textContent = await page.getTextContent();
        const pageText = textContent.items.map(item => item.str).join(' ');
        fullText += pageText + '\n\n';
      }

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

// ===== Feedback Handlers =====

const ratingLabels = {
  1: '👎 Poor',
  2: '😐 Fair',
  3: '👍 Good',
  4: '😊 Very Good',
  5: '⭐ Excellent'
};

function handleStarClick(star) {
  const rating = parseInt(star.dataset.rating);
  currentRating = rating;
  updateStarDisplay();
  ratingText.textContent = ratingLabels[rating];
  ratingText.style.display = 'inline-block';
}

function handleStarHover(star) {
  const rating = parseInt(star.dataset.rating);
  stars.forEach((s, index) => {
    if (index < rating) {
      s.style.color = 'var(--primary)';
    } else {
      s.style.color = '#D1D5DB';
    }
  });
}

function resetStarHover() {
  updateStarDisplay();
}

function updateStarDisplay() {
  stars.forEach((s, index) => {
    if (index < currentRating) {
      s.classList.add('selected');
      s.style.color = 'var(--primary)';
    } else {
      s.classList.remove('selected');
      s.style.color = '#D1D5DB';
    }
  });
}

async function handleSubmitFeedback() {
  if (currentRating === 0) {
    showFeedbackError('Please select a rating');
    return;
  }

  submitFeedbackBtn.disabled = true;
  feedbackStatus.textContent = 'Sending feedback...';
  feedbackStatus.className = '';

  try {
    const response = await fetch(`${API_CONFIG.BASE_URL}/api/analysis/feedback`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        tosUrl: lastAnalyzedUrl || null,
        tosText: currentTosText,
        summary: summaryContent.textContent,
        rating: currentRating,
        feedback: feedbackInput.value || null,
        corrections: null,
        model: selectedModel,
        source: 'web'
      })
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || 'Failed to submit feedback');
    }

    const data = await response.json();
    showFeedbackSuccess('Thank you! Your feedback helps improve the AI model.');
    
    // Reset form
    setTimeout(() => {
      currentRating = 0;
      feedbackInput.value = '';
      ratingText.style.display = 'none';
      updateStarDisplay();
      feedbackStatus.textContent = '';
      submitFeedbackBtn.disabled = false;
    }, 2000);
  } catch (error) {
    console.error('Feedback submission error:', error);
    showFeedbackError('Failed to submit feedback: ' + error.message);
    submitFeedbackBtn.disabled = false;
  }
}

function showFeedbackSuccess(message) {
  feedbackStatus.textContent = message;
  feedbackStatus.className = 'success';
}

function showFeedbackError(message) {
  feedbackStatus.textContent = message;
  feedbackStatus.className = 'error';
}

// Initialize on load
init();
