const express = require('express');
const cors = require('cors');
const path = require('path');
const fs = require('fs-extra');
const { v4: uuidv4 } = require('uuid');
const ffmpeg = require('fluent-ffmpeg');
const axios = require('axios');

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());
app.use('/downloads', express.static(path.join(__dirname, 'downloads')));

// Create downloads directory if it doesn't exist
const downloadsDir = path.join(__dirname, 'downloads');
fs.ensureDirSync(downloadsDir);

// Helper function to extract Instagram video URL
async function getInstagramVideoUrl(reelUrl) {
  try {
    // Extract the shortcode from the URL
    const shortcodeMatch = reelUrl.match(/(?:reel|p)\/([A-Za-z0-9_-]+)/);
    if (!shortcodeMatch) {
      throw new Error('Invalid Instagram URL format');
    }
    
    const shortcode = shortcodeMatch[1];
    
    // Method 1: Try the embed approach
    try {
      const embedUrl = `https://www.instagram.com/p/${shortcode}/embed/captioned/`;
      const response = await axios.get(embedUrl, {
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
        },
        timeout: 10000
      });
      
      // Try multiple patterns to extract video URL
      const patterns = [
        /"video_url":"([^"]+)"/,
        /"src":"([^"]+\.mp4[^"]*)"/,
        /video_url&quot;:&quot;([^&]+)&quot;/,
        /"video_versions":\[{"url":"([^"]+)"/
      ];
      
      for (const pattern of patterns) {
        const match = response.data.match(pattern);
        if (match) {
          let videoUrl = match[1];
          // Clean up the URL
          videoUrl = videoUrl.replace(/\\u0026/g, '&')
                            .replace(/\\/g, '')
                            .replace(/&amp;/g, '&');
          
          if (videoUrl.includes('.mp4')) {
            return videoUrl;
          }
        }
      }
    } catch (embedError) {
      console.log('Embed method failed, trying alternative approach...');
    }
    
    // Method 2: Try direct Instagram API approach
    try {
      const apiUrl = `https://www.instagram.com/api/v1/media/${shortcode}/info/`;
      const response = await axios.get(apiUrl, {
        headers: {
          'User-Agent': 'Instagram 219.0.0.12.117 Android',
          'Accept': '*/*'
        },
        timeout: 10000
      });
      
      if (response.data && response.data.items && response.data.items[0]) {
        const media = response.data.items[0];
        if (media.video_versions && media.video_versions[0]) {
          return media.video_versions[0].url;
        }
      }
    } catch (apiError) {
      console.log('API method failed...');
    }
    
    // Method 3: Fallback to a simple web scraping approach
    try {
      const webUrl = `https://www.instagram.com/p/${shortcode}/`;
      const response = await axios.get(webUrl, {
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
        },
        timeout: 15000
      });
      
      // Look for video URL in the page source
      const videoMatch = response.data.match(/"video_url":"([^"]+)"/);
      if (videoMatch) {
        return videoMatch[1].replace(/\\u0026/g, '&').replace(/\\/g, '');
      }
      
      // Alternative pattern
      const altMatch = response.data.match(/src="([^"]+\.mp4[^"]*)"/);
      if (altMatch) {
        return altMatch[1];
      }
    } catch (webError) {
      console.log('Web scraping method failed...');
    }
    
    throw new Error('Could not extract video URL using any available method');
    
  } catch (error) {
    console.error('Error extracting Instagram video URL:', error);
    throw new Error(`Failed to extract video URL from Instagram: ${error.message}`);
  }
}

// Download video from URL
async function downloadVideo(videoUrl, outputPath) {
  try {
    const response = await axios({
      method: 'GET',
      url: videoUrl,
      responseType: 'stream',
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
      }
    });

    const writer = fs.createWriteStream(outputPath);
    response.data.pipe(writer);

    return new Promise((resolve, reject) => {
      writer.on('finish', resolve);
      writer.on('error', reject);
    });
  } catch (error) {
    console.error('Error downloading video:', error);
    throw new Error('Failed to download video');
  }
}

// Extract audio from video using FFmpeg
function extractAudio(videoPath, audioPath) {
  return new Promise((resolve, reject) => {
    ffmpeg(videoPath)
      .output(audioPath)
      .audioCodec('mp3')
      .audioQuality(2) // High quality
      .on('end', () => {
        console.log('Audio extraction completed');
        resolve();
      })
      .on('error', (err) => {
        console.error('Error extracting audio:', err);
        reject(err);
      })
      .run();
  });
}

// Main API endpoint
app.post('/api/extract-audio', async (req, res) => {
  const { instagramUrl } = req.body;
  
  if (!instagramUrl) {
    return res.status(400).json({ error: 'Instagram URL is required' });
  }

  const jobId = uuidv4();
  const videoPath = path.join(downloadsDir, `${jobId}.mp4`);
  const audioPath = path.join(downloadsDir, `${jobId}.mp3`);

  try {
    // Step 1: Extract video URL from Instagram
    console.log('Extracting video URL from Instagram...');
    const videoUrl = await getInstagramVideoUrl(instagramUrl);

    // Step 2: Download the video
    console.log('Downloading video...');
    await downloadVideo(videoUrl, videoPath);

    // Step 3: Extract audio from video
    console.log('Extracting audio...');
    await extractAudio(videoPath, audioPath);

    // Step 4: Delete the original video file
    console.log('Cleaning up video file...');
    await fs.remove(videoPath);

    // Step 5: Return the audio file URL
    const audioUrl = `/downloads/${jobId}.mp3`;
    
    res.json({
      success: true,
      audioUrl: audioUrl,
      filename: `${jobId}.mp3`,
      message: 'Audio extracted successfully!'
    });

  } catch (error) {
    console.error('Error processing Instagram reel:', error);
    
    // Cleanup files in case of error
    try {
      await fs.remove(videoPath);
      await fs.remove(audioPath);
    } catch (cleanupError) {
      console.error('Error during cleanup:', cleanupError);
    }

    res.status(500).json({
      error: 'Failed to process Instagram reel',
      details: error.message
    });
  }
});

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({ status: 'OK', message: 'Instagram Audio Extractor API is running' });
});

// Cleanup old files (run every hour)
setInterval(async () => {
  try {
    const files = await fs.readdir(downloadsDir);
    const now = Date.now();
    const maxAge = 60 * 60 * 1000; // 1 hour

    for (const file of files) {
      const filePath = path.join(downloadsDir, file);
      const stats = await fs.stat(filePath);
      
      if (now - stats.mtime.getTime() > maxAge) {
        await fs.remove(filePath);
        console.log(`Cleaned up old file: ${file}`);
      }
    }
  } catch (error) {
    console.error('Error during cleanup:', error);
  }
}, 60 * 60 * 1000); // Run every hour

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
  console.log(`Health check: http://localhost:${PORT}/api/health`);
});