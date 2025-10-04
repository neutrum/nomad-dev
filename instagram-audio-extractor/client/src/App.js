import React, { useState } from 'react';
import './App.css';

function App() {
  const [instagramUrl, setInstagramUrl] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!instagramUrl.trim()) {
      setError('Please enter an Instagram reel URL');
      return;
    }

    // Basic URL validation
    if (!instagramUrl.includes('instagram.com') || (!instagramUrl.includes('/reel/') && !instagramUrl.includes('/p/'))) {
      setError('Please enter a valid Instagram reel or post URL');
      return;
    }

    setIsLoading(true);
    setError('');
    setResult(null);

    try {
      const response = await fetch('http://localhost:5000/api/extract-audio', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ instagramUrl }),
      });

      const data = await response.json();

      if (response.ok) {
        setResult(data);
      } else {
        setError(data.error || 'An error occurred while processing the reel');
      }
    } catch (err) {
      setError('Failed to connect to the server. Make sure the backend is running.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleDownload = () => {
    if (result && result.audioUrl) {
      const link = document.createElement('a');
      link.href = `http://localhost:5000${result.audioUrl}`;
      link.download = result.filename;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }
  };

  const handleReset = () => {
    setInstagramUrl('');
    setResult(null);
    setError('');
  };

  return (
    <div className="App">
      <div className="container">
        <header className="header">
          <h1>🎵 Instagram Audio Extractor</h1>
          <p>Extract audio from Instagram reels and posts as MP3 files</p>
        </header>

        <div className="main-content">
          <form onSubmit={handleSubmit} className="url-form">
            <div className="input-group">
              <input
                type="url"
                value={instagramUrl}
                onChange={(e) => setInstagramUrl(e.target.value)}
                placeholder="Paste Instagram reel or post URL here..."
                className="url-input"
                disabled={isLoading}
              />
              <button 
                type="submit" 
                className="extract-btn"
                disabled={isLoading || !instagramUrl.trim()}
              >
                {isLoading ? 'Processing...' : 'Extract Audio'}
              </button>
            </div>
          </form>

          {isLoading && (
            <div className="loading">
              <div className="spinner"></div>
              <p>Processing your Instagram reel...</p>
              <div className="progress-steps">
                <div className="step">📥 Downloading video</div>
                <div className="step">🎵 Extracting audio</div>
                <div className="step">🗑️ Cleaning up</div>
              </div>
            </div>
          )}

          {error && (
            <div className="error">
              <h3>❌ Error</h3>
              <p>{error}</p>
              <button onClick={handleReset} className="reset-btn">
                Try Again
              </button>
            </div>
          )}

          {result && (
            <div className="success">
              <h3>✅ Success!</h3>
              <p>{result.message}</p>
              <div className="download-section">
                <button onClick={handleDownload} className="download-btn">
                  📥 Download MP3
                </button>
                <button onClick={handleReset} className="reset-btn">
                  Extract Another
                </button>
              </div>
            </div>
          )}
        </div>

        <footer className="footer">
          <div className="instructions">
            <h3>How to use:</h3>
            <ol>
              <li>Copy the URL of an Instagram reel or post</li>
              <li>Paste it in the input field above</li>
              <li>Click "Extract Audio" and wait for processing</li>
              <li>Download your MP3 file when ready!</li>
            </ol>
          </div>
          
          <div className="disclaimer">
            <p><strong>Note:</strong> This tool is for personal use only. Please respect copyright and Instagram's terms of service.</p>
          </div>
        </footer>
      </div>
    </div>
  );
}

export default App;