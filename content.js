// Content script - runs on all pages
// This file is loaded automatically by the manifest
// The actual ToS extraction is done via executeScript in popup.js for better control

console.log('ToS Summarizer extension loaded');

// Optional: Add visual indicator when ToS content is detected
(function() {
  const tosKeywords = /terms of service|terms of use|user agreement|privacy policy|cookie policy|terms and conditions/i;

  if (tosKeywords.test(document.title) || tosKeywords.test(document.body.textContent.substring(0, 5000))) {
    // This page likely contains ToS content
    console.log('ToS content detected on this page');
  }
})();
