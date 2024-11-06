import React, { useState } from 'react';

function App() {
  const [summary, setSummary] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSummarize = () => {
    setLoading(true);
    chrome.runtime.sendMessage({ action: "summarize" }, (response) => {
      setSummary(response?.summary || "Failed to get summary.");
      setLoading(false);
    });
  };

  return (
    <div className="w-[400px] min-h-[300px] p-4 bg-white dark:bg-gray-800">
      <h1 className="text-2xl font-bold mb-4 text-gray-800 dark:text-white">
        Web Page Summarizer
      </h1>
      
      <button
        onClick={handleSummarize}
        disabled={loading}
        className="w-full px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 
                 disabled:bg-blue-300 disabled:cursor-not-allowed transition-colors"
      >
        {loading ? 'Summarizing...' : 'Summarize Page'}
      </button>

      {summary && (
        <div className="mt-4 p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
          <h2 className="text-lg font-semibold mb-2 text-gray-800 dark:text-white">Summary:</h2>
          <p className="text-gray-600 dark:text-gray-300 text-sm">
            {summary}
          </p>
        </div>
      )}
    </div>
  );
}

export default App;