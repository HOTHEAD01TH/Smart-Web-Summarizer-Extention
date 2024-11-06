import React, { useState } from 'react';
import { jsPDF } from 'jspdf';

function App() {
  const [summary, setSummary] = useState('');
  const [loading, setLoading] = useState(false);
  const [summaryType, setSummaryType] = useState('brief');
  const [customPrompt, setCustomPrompt] = useState('');
  const [showCustomPrompt, setShowCustomPrompt] = useState(false);

  const SUMMARY_TYPES = {
    BRIEF: { id: 'brief', label: 'Brief Summary' },
    DETAILED: { id: 'detailed', label: 'Detailed Summary' },
    BULLET_POINTS: { id: 'bullets', label: 'Bullet Points' },
    KEY_TAKEAWAYS: { id: 'takeaways', label: 'Key Takeaways' }
  };

  const getReadingTime = (text) => {
    const wordsPerMinute = 200;
    const words = text.trim().split(/\s+/).length;
    const time = Math.ceil(words / wordsPerMinute);
    return time;
  };

  const handleSummarize = () => {
    setLoading(true);
    chrome.runtime.sendMessage({ 
      action: "summarize",
      summaryType,
      customPrompt: showCustomPrompt ? customPrompt : null
    }, (response) => {
      setSummary(response?.summary || "Failed to get summary.");
      setLoading(false);
    });
  };

  const exportSummary = async (format) => {
    try {
      const title = 'Summary-' + new Date().toISOString().split('T')[0];
      
      switch(format) {
        case 'txt':
          const blob = new Blob([summary], { type: 'text/plain' });
          const url = URL.createObjectURL(blob);
          const a = document.createElement('a');
          a.href = url;
          a.download = `${title}.txt`;
          a.click();
          URL.revokeObjectURL(url);
          break;
          
        case 'pdf':
          const doc = new jsPDF();
          
          // Split text into lines to handle word wrap
          const lineHeight = 10;
          const pageWidth = doc.internal.pageSize.getWidth();
          const margin = 20;
          const maxWidth = pageWidth - 2 * margin;
          
          // Add title
          doc.setFontSize(16);
          doc.text(title, margin, margin);
          
          // Add summary text
          doc.setFontSize(12);
          const lines = doc.splitTextToSize(summary, maxWidth);
          doc.text(lines, margin, margin + lineHeight + 5);
          
          // Save the PDF
          doc.save(`${title}.pdf`);
          break;
      }
    } catch (error) {
      console.error('Error exporting summary:', error);
      alert('Failed to export summary. Please try again.');
    }
  };

  return (
    <div className="w-[400px] min-h-[300px] p-4 bg-white dark:bg-gray-800">
      <h1 className="text-2xl font-bold mb-4 text-gray-800 dark:text-white">
        Web Page Summarizer
      </h1>
      
      {/* Summary Type Selector */}
      <div className="mb-4">
        <select
          value={summaryType}
          onChange={(e) => setSummaryType(e.target.value)}
          className="w-full p-2 rounded-lg border border-gray-300 dark:border-gray-600 
                   bg-white dark:bg-gray-700 text-gray-800 dark:text-white"
        >
          {Object.values(SUMMARY_TYPES).map((type) => (
            <option key={type.id} value={type.id}>
              {type.label}
            </option>
          ))}
          <option value="custom">Custom Prompt</option>
        </select>
      </div>

      {/* Custom Prompt Input */}
      {summaryType === 'custom' && (
        <div className="mb-4">
          <textarea
            value={customPrompt}
            onChange={(e) => setCustomPrompt(e.target.value)}
            placeholder="Enter your custom summarization prompt..."
            className="w-full p-2 rounded-lg border border-gray-300 dark:border-gray-600 
                     bg-white dark:bg-gray-700 text-gray-800 dark:text-white h-24"
          />
        </div>
      )}
      
      <button
        onClick={handleSummarize}
        disabled={loading}
        className="w-full px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 
                 disabled:bg-blue-300 disabled:cursor-not-allowed transition-colors mb-4"
      >
        {loading ? 'Summarizing...' : 'Summarize Page'}
      </button>

      {summary && (
        <div className="mt-4 p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
          <div className="flex justify-between items-center mb-2">
            <h2 className="text-lg font-semibold text-gray-800 dark:text-white">Summary:</h2>
            <span className="text-sm text-gray-500 dark:text-gray-400">
              ~{getReadingTime(summary)} min read
            </span>
          </div>
          
          <p className="text-gray-600 dark:text-gray-300 text-sm mb-4 whitespace-pre-line">
            {summary}
          </p>

          {/* Export Options */}
          <div className="flex gap-2 mt-2">
            <button
              onClick={() => exportSummary('txt')}
              className="flex items-center px-3 py-1 text-sm bg-gray-200 dark:bg-gray-600 
                        rounded hover:bg-gray-300 dark:hover:bg-gray-500 transition-colors"
            >
              <span className="mr-1">📄</span> Export as TXT
            </button>
            <button
              onClick={() => exportSummary('pdf')}
              className="flex items-center px-3 py-1 text-sm bg-gray-200 dark:bg-gray-600 
                        rounded hover:bg-gray-300 dark:hover:bg-gray-500 transition-colors"
            >
              <span className="mr-1">📑</span> Export as PDF
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

export default App;