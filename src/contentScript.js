// Extracts text content from the web page.
function getPageText() {
    return document.body.innerText;
  }
  
  // Sends the extracted text to the background script.
  chrome.runtime.sendMessage({ text: getPageText() });
  