# 🎵 Instagram Audio Extractor

A modern web application that downloads Instagram reels, extracts the audio track to MP3 format, and provides a download link while automatically cleaning up the original video file.

## ✨ Features

- 🎯 **Simple Interface**: Clean, modern React frontend
- 📱 **Instagram Reel Support**: Works with Instagram reel and post URLs
- 🎵 **High-Quality Audio**: Extracts audio in MP3 format with high quality settings
- 🗑️ **Auto Cleanup**: Automatically deletes original MP4 files after extraction
- ⚡ **Fast Processing**: Efficient backend processing with real-time feedback
- 📱 **Responsive Design**: Works on desktop and mobile devices
- 🔄 **Auto File Cleanup**: Automatically removes old files after 1 hour

## 🛠️ Tech Stack

### Backend
- **Node.js** with Express.js
- **FFmpeg** for audio extraction
- **Axios** for HTTP requests
- **fs-extra** for file system operations

### Frontend
- **React** for the user interface
- **Modern CSS** with gradients and animations
- **Responsive design** for all devices

## 🚀 Quick Start

### Prerequisites

Before running this application, make sure you have:

1. **Node.js** (v14 or higher) installed
2. **FFmpeg** installed on your system:
   - **Windows**: Download from [FFmpeg website](https://ffmpeg.org/download.html)
   - **macOS**: `brew install ffmpeg`
   - **Ubuntu/Debian**: `sudo apt install ffmpeg`
   - **CentOS/RHEL**: `sudo yum install ffmpeg`

### Installation

1. **Clone or navigate to the project directory**:
   ```bash
   cd instagram-audio-extractor
   ```

2. **Install all dependencies** (root, server, and client):
   ```bash
   npm run install-all
   ```

3. **Start the development servers**:
   ```bash
   npm run dev
   ```

This will start both the backend server (port 5000) and React frontend (port 3000) concurrently.

### Manual Setup (Alternative)

If you prefer to run servers separately:

1. **Start the backend server**:
   ```bash
   cd server
   npm install
   npm run dev
   ```

2. **In a new terminal, start the frontend**:
   ```bash
   cd client
   npm install
   npm start
   ```

## 📖 How to Use

1. **Open your browser** and go to `http://localhost:3000`
2. **Copy an Instagram reel or post URL** (e.g., `https://www.instagram.com/reel/ABC123/`)
3. **Paste the URL** into the input field
4. **Click "Extract Audio"** and wait for processing
5. **Download your MP3 file** when ready!

## 🔧 API Endpoints

### POST `/api/extract-audio`
Processes an Instagram reel and extracts audio.

**Request Body:**
```json
{
  "instagramUrl": "https://www.instagram.com/reel/ABC123/"
}
```

**Response:**
```json
{
  "success": true,
  "audioUrl": "/downloads/uuid.mp3",
  "filename": "uuid.mp3",
  "message": "Audio extracted successfully!"
}
```

### GET `/api/health`
Health check endpoint.

**Response:**
```json
{
  "status": "OK",
  "message": "Instagram Audio Extractor API is running"
}
```

## 📁 Project Structure

```
instagram-audio-extractor/
├── package.json                 # Root package.json with scripts
├── README.md                   # This file
├── server/                     # Backend API
│   ├── package.json           # Server dependencies
│   ├── server.js              # Main server file
│   └── downloads/             # Temporary file storage (auto-created)
└── client/                    # React frontend
    ├── package.json          # Client dependencies
    ├── public/               # Static files
    └── src/                  # React source code
        ├── App.js           # Main React component
        ├── App.css          # Styles
        └── index.js         # React entry point
```

## 🔒 Security & Legal Notes

- **Personal Use Only**: This tool is intended for personal use only
- **Respect Copyright**: Please respect Instagram's terms of service and copyright laws
- **Auto Cleanup**: Files are automatically deleted after 1 hour for privacy
- **No Data Storage**: No user data or URLs are permanently stored

## 🐛 Troubleshooting

### Common Issues

1. **FFmpeg not found**:
   - Make sure FFmpeg is installed and available in your system PATH
   - Test by running `ffmpeg -version` in your terminal

2. **Instagram URL not working**:
   - Make sure the URL is a public Instagram reel or post
   - The URL should contain `/reel/` or `/p/` in the path

3. **Server connection error**:
   - Make sure the backend server is running on port 5000
   - Check that no firewall is blocking the connection

4. **Download not working**:
   - Check browser console for errors
   - Make sure the backend server is accessible

### Development

To modify or extend the application:

1. **Backend changes**: Edit `server/server.js`
2. **Frontend changes**: Edit `client/src/App.js` and `client/src/App.css`
3. **Add dependencies**: Update respective `package.json` files

## 📄 License

This project is licensed under the MIT License - see the package.json files for details.

## 🤝 Contributing

1. Fork the project
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

---

**Disclaimer**: This tool is for educational and personal use only. Please respect Instagram's terms of service and applicable copyright laws when using this application.