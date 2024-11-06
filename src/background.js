chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === "summarize") {
    // Get text from active tab
    chrome.tabs.query({active: true, currentWindow: true}, function(tabs) {
      chrome.scripting.executeScript({
        target: { tabId: tabs[0].id },
        function: getPageText,
      }, async (results) => {
        const text = results[0].result;
        const summary = await summarizeText(text);
        sendResponse({ summary });
      });
    });
    return true;
  }
});

function getPageText() {
  return document.body.innerText;
}

async function summarizeText(text) {
  try {
    const API_KEY = 'AIzaSyBm_5a4hnmJ8TlbzpNfNTcGT5GzEWVAAbU';
    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent?key=${API_KEY}`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          contents: [{
            parts: [{
              text: `Please summarize the following text in a concise way: ${text}`
            }]
          }]
        })
      }
    );
    const data = await response.json();
    return data.candidates[0].content.parts[0].text;
  } catch (error) {
    console.error("Error summarizing text:", error);
    return "Error in fetching summary.";
  }
}