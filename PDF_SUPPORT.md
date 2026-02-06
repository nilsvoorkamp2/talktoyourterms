# PDF and File Upload Support

## New Feature: File Upload

Version 2.1.0 adds support for analyzing Terms of Service documents from PDF and text files!

## Supported File Types

### ✅ PDF Files (.pdf)
- Extracts text from all pages
- Works with most PDF documents
- Automatically handles multi-page documents
- Maximum 100,000 characters

### ✅ Text Files (.txt)
- Plain text documents
- UTF-8 encoding
- Simple and fast processing

## How to Use

### Method 1: Upload a File

1. Click the extension icon
2. Click **"Upload PDF or Text File"**
3. Select your ToS PDF or TXT file
4. Wait for text extraction (2-5 seconds for PDFs)
5. The extension will automatically analyze the extracted text

### Method 2: Analyze Current Page

1. Navigate to a ToS webpage
2. Click the extension icon
3. Click **"Analyze Current Page"**
4. Works for HTML-based ToS pages

## PDF Support Details

### What Works
- ✅ Text-based PDFs
- ✅ Multi-page documents
- ✅ Standard fonts
- ✅ Most formatting

### Limitations
- ❌ Image-based PDFs (scanned documents) - no text to extract
- ❌ Password-protected PDFs
- ❌ Complex layouts may have text extraction issues
- ❌ PDFs opened directly in Chrome (use upload instead)

### Technical Details
- Uses **PDF.js** library for text extraction
- Processes PDFs entirely in your browser
- No data sent to external servers (except Claude API for analysis)
- Handles documents up to 100,000 characters

## Use Cases

### Common Scenarios

**Before signing up for a service:**
- Download their ToS PDF
- Upload to the extension
- Get AI analysis and key clauses
- Ask specific questions

**PDF in email:**
- Save the PDF attachment
- Upload to extension
- Review important terms before accepting

**Comparing services:**
- Upload ToS PDFs from multiple services
- Analyze each one separately
- Compare key clauses and concerns

**Legal documents:**
- Works with any legal document in PDF format
- Privacy policies, user agreements, etc.
- Quick summaries of lengthy documents

## Troubleshooting

### "Could not extract text from PDF"

**Possible causes:**
1. **Scanned PDF**: The PDF is an image, not text
   - **Solution**: Use OCR software to convert to text first
   - **Alternatives**: Copy-paste text if possible

2. **Corrupted PDF**: File may be damaged
   - **Solution**: Try re-downloading the PDF

3. **Protected PDF**: Password-protected or restricted
   - **Solution**: Remove restrictions first

### "Text too short"

**Cause**: Extracted less than 100 characters
**Solutions:**
- Check if PDF actually contains text
- Try a different PDF viewer/converter
- For scanned PDFs, use OCR

### "Unsupported file type"

**Cause**: File is not PDF or TXT
**Solutions:**
- Convert to PDF or TXT format
- Save as plain text (.txt)
- Use supported formats only

### Chrome PDF Viewer Not Working

**Why**: Chrome's built-in PDF viewer uses a plugin that's hard to extract from
**Solution**: Use the "Upload PDF" button instead of analyzing the current page

## Best Practices

### For Best Results

1. **Use text-based PDFs** (not scanned images)
2. **Check file size** (under 10MB recommended)
3. **Clean PDFs work best** (clear formatting, standard fonts)
4. **Single documents** (analyze one ToS at a time)

### File Preparation

If you're having issues:
1. Try opening the PDF in Adobe Reader
2. Use "Save As" to create a new copy
3. This can fix formatting issues

## Privacy & Security

### Your Files Are Safe

- ✅ Files processed entirely in browser
- ✅ No upload to external servers (except Claude API)
- ✅ File content not stored
- ✅ Analyzed via secure Claude API

### What Gets Sent

Only the extracted text is sent to Claude API for analysis. The actual PDF file never leaves your computer except as text.

## Performance

### Processing Times

- **TXT files**: Instant (~0.1 seconds)
- **Small PDFs (1-10 pages)**: 2-5 seconds
- **Large PDFs (50+ pages)**: 10-20 seconds
- **AI Analysis**: 5-15 seconds

### File Size Limits

- **Recommended**: Under 10MB
- **Maximum text**: 100,000 characters
- **Longer documents**: Automatically truncated

## Examples

### Typical Use Case

```
1. Receive ToS PDF via email
2. Save to Downloads folder
3. Open Talk to your Terms extension
4. Click "Upload PDF or Text File"
5. Select the PDF
6. Wait 5 seconds for extraction
7. Wait 10 seconds for AI analysis
8. Read summary and key clauses
9. Ask questions: "Can I cancel anytime?"
```

### Quick Analysis

```
1. Have ToS PDF open in another window
2. Click extension
3. Click "Upload PDF"
4. Get instant analysis
```

## Technical Architecture

### How It Works

```
PDF File
  ↓
FileReader API (browser)
  ↓
PDF.js (text extraction)
  ↓
Text Processing (cleanup)
  ↓
Claude API (analysis)
  ↓
Display Results
```

### Libraries Used

- **PDF.js**: Mozilla's PDF rendering library
- **FileReader API**: Browser built-in for file reading
- **Claude API**: AI analysis

## Future Enhancements

Potential improvements:
- ✨ OCR support for scanned PDFs
- ✨ Batch analysis (multiple files)
- ✨ DOCX file support
- ✨ Drag-and-drop upload
- ✨ File history/cache

## FAQ

**Q: Can I analyze PDFs opened in Chrome?**
A: No, use the upload button instead. Chrome's PDF viewer doesn't allow text extraction from extensions.

**Q: Does this work offline?**
A: Text extraction works offline, but AI analysis requires internet (Claude API).

**Q: Are my files stored?**
A: No, files are processed and discarded immediately.

**Q: Can I analyze scanned PDFs?**
A: Not directly. You'll need OCR software to convert images to text first.

**Q: What about password-protected PDFs?**
A: Remove password protection first, then upload.

**Q: File size limit?**
A: No hard limit, but 10MB recommended for performance. Text limited to 100k characters.

## Support

Having issues?
1. Check troubleshooting section above
2. Try converting PDF to TXT
3. Ensure file contains actual text (not images)
4. Check browser console for errors (F12)

## Examples to Test

Test the feature with these free ToS documents:
- Google ToS: Download from https://policies.google.com/terms
- GitHub ToS: Available as PDF
- Any service's Privacy Policy PDF

## Conclusion

File upload support makes Talk to your Terms much more versatile. Now you can analyze Terms of Service regardless of where they come from - web pages, PDFs, or text files!
