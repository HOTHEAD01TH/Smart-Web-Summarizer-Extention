chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === "summarize") {
    chrome.tabs.query({active: true, currentWindow: true}, function(tabs) {
      chrome.scripting.executeScript({
        target: { tabId: tabs[0].id },
        function: getPageText,
      }, async (results) => {
        const text = results[0].result;
        const summary = await summarizeText(text, request.summaryType, request.customPrompt);
        sendResponse({ summary });
      });
    });
    return true;
  }
});

function getPageText() {
  return document.body.innerText;
}

async function summarizeText(text, summaryType, customPrompt) {
  try {
    const API_KEY = 'AIzaSyBm_5a4hnmJ8TlbzpNfNTcGT5GzEWVAAbU';
    let promptText;

    if (customPrompt) {
      promptText = `${customPrompt}: ${text}`;
    } else {
      switch(summaryType) {
        case 'brief':
          promptText = `Please provide a brief summary of the following text in 2-3 sentences: ${text}`;
          break;
        case 'detailed':
          promptText = `Please provide a detailed summary of the following text, covering all main points: ${text}`;
          break;
        case 'bullets':
          promptText = `Please summarize the following text in bullet points, highlighting the key points: ${text}`;
          break;
        case 'takeaways':
          promptText = `Please extract the 3-5 most important takeaways from the following text: ${text}`;
          break;
        default:
          promptText = `Please summarize the following text in a concise way: ${text}`;
      }
    }

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
              text: promptText
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