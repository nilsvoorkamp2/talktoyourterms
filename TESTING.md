# Testing Guide

## Test Websites

Here are some good websites to test the ToS Summarizer extension:

### Easy Tests (Clear ToS Pages)
1. **Google Terms of Service**
   - URL: https://policies.google.com/terms
   - Expected: Should detect and summarize easily

2. **Reddit User Agreement**
   - URL: https://www.reddit.com/policies/user-agreement
   - Expected: Well-structured ToS content

3. **Twitter Terms of Service**
   - URL: https://twitter.com/en/tos
   - Expected: Standard ToS format

4. **GitHub Terms of Service**
   - URL: https://docs.github.com/en/site-policy/github-terms/github-terms-of-service
   - Expected: Developer-friendly ToS

5. **Discord Terms of Service**
   - URL: https://discord.com/terms
   - Expected: Modern ToS layout

### Privacy Policy Tests
1. **Facebook Privacy Policy**
   - URL: https://www.facebook.com/privacy/policy/
   - Expected: Should work for privacy policies too

2. **Amazon Privacy Notice**
   - URL: https://www.amazon.com/gp/help/customer/display.html?nodeId=GX7NJQ4ZB8MHFRNJ
   - Expected: Longer document, good stress test

### Edge Cases
1. **Regular webpage (non-ToS)**
   - URL: https://www.google.com
   - Expected: Should show error "No terms of service text found"

2. **News article**
   - URL: Any news website
   - Expected: Should fail gracefully

## Testing Checklist

### Initial Setup
- [ ] Extension loads without errors in chrome://extensions
- [ ] Extension icon appears (or default placeholder)
- [ ] Clicking icon opens popup
- [ ] Popup displays API key input screen

### API Key Configuration
- [ ] Can paste API key
- [ ] "Save Key" button works
- [ ] After saving, main screen appears
- [ ] Settings button returns to API key screen
- [ ] Can update API key

### ToS Detection & Analysis
- [ ] Navigate to a ToS page
- [ ] Click extension icon
- [ ] "Analyze Terms of Service" button is visible
- [ ] Clicking button shows loading spinner
- [ ] Summary appears after analysis
- [ ] Summary is formatted and readable
- [ ] Summary addresses key points (rights, limitations, privacy, etc.)

### UI/UX Features
- [ ] Copy button works
- [ ] "Copied!" confirmation appears
- [ ] Error messages display clearly
- [ ] "Try Again" button resets state
- [ ] Animations work smoothly
- [ ] Popup is sized correctly (400px width)

### Error Handling
- [ ] Invalid API key shows appropriate error
- [ ] Non-ToS page shows "not found" message
- [ ] Network errors display correctly
- [ ] Can recover from errors with retry button

### Edge Cases
- [ ] Very long ToS (>100k chars) handled correctly
- [ ] Short text (<100 chars) rejected appropriately
- [ ] Pages with dynamic content work
- [ ] Multiple consecutive analyses work

## Expected Summary Format

A good summary should include sections like:

```
**Key User Rights & Obligations:**
- [Bullet points about what users can/must do]

**Important Limitations:**
- [Restrictions on use]
- [Liability limitations]

**Privacy & Data Usage:**
- [What data is collected]
- [How it's used and shared]

**Concerning Clauses:**
- [Any unusual or important terms]

**Cancellation Policy:**
- [How to cancel/terminate]
```

## Performance Metrics

Track these metrics during testing:

- **Analysis Time**: Should complete in 5-15 seconds for typical ToS
- **API Cost**: Monitor at console.anthropic.com (should be <$0.01 per summary)
- **Error Rate**: Should be minimal on valid ToS pages
- **Token Usage**: Check input/output token counts in API logs

## Common Issues & Solutions

### Issue: "API key not found"
**Solution**: Make sure you saved the API key properly

### Issue: Loading indefinitely
**Solution**: Check browser console for errors, verify API key has credits

### Issue: "No terms of service text found"
**Solution**:
- Ensure you're on an actual ToS page
- Some sites load content dynamically - wait for page to fully load
- Try scrolling through the page first

### Issue: Summary is cut off
**Solution**: The text might exceed 100k character limit - this is expected behavior

### Issue: Extension icon is gray/default
**Solution**: Add proper icon files to icons/ directory (extension still works)

## Browser Console Debugging

Open Developer Tools (F12) and check:

1. **Console tab**: Look for any JavaScript errors
2. **Network tab**: Verify API calls to anthropic.com
3. **Application tab** > **Storage** > **Local Storage**: Verify API key is saved

## Security Testing

Verify that:
- [ ] API key is stored locally (check chrome.storage in DevTools)
- [ ] API key is not exposed in console logs
- [ ] No data sent to third parties except Claude API
- [ ] Extension only activates when icon is clicked (activeTab permission)

## Regression Testing

After making any code changes, retest:
1. Basic happy path (ToS page → analyze → get summary)
2. Error cases (wrong API key, non-ToS page)
3. UI interactions (copy, settings, retry)
4. Different types of ToS documents

## Next Steps After Testing

If all tests pass:
1. The extension is ready to use
2. Consider testing on more websites
3. Monitor API costs and usage patterns
4. Consider adding features from README's "Future Enhancements" section

If tests fail:
1. Check browser console for errors
2. Verify all files are present and unchanged
3. Try reloading the extension
4. Check API key and credits
5. Review error messages carefully
