# 🎵 JaMoveo - Real-time Band Rehearsal Platform

A modern web application that enables bands to rehearse together in real-time with synchronized song sheets, chord displays, and live member management.

![JaMoveo Banner](https://img.shields.io/badge/JaMoveo-Band%20Rehearsal%20Platform-gold?style=for-the-badge)

## ✨ Features

### 🎯 Core Functionality
- **Real-time Song Synchronization** - Admin selects songs, all band members see them instantly
- **Live Member Management** - See who's online and their instruments in real-time
- **Multi-language Support** - English and Hebrew songs with RTL text support
- **Auto-scroll Feature** - Adjustable speed auto-scrolling for hands-free performance

### 🎭 User Roles
- **Admin/Conductor** - Search and select songs, manage rehearsal sessions
- **Band Members** - View selected songs with chords and lyrics, track other members

### 🎼 Song Features
- **Chord Display** - Guitar chords displayed above lyrics (hidden for vocalists)
- **Word-by-word Synchronization** - Precise chord timing with individual words
- **Multiple Formats** - Support for various song structures and arrangements
- **Visual Enhancements** - Professional typography with golden theme

## 🚀 Quick Start

### Prerequisites
- Node.js 16+ and npm
- Modern web browser with WebSocket support

### Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd jamoveo
   ```

2. **Install dependencies**
   ```bash
   npm run install-all
   ```

3. **Environment Setup**
   
   Create `.env` files with required configuration:
   ```bash
   # server/.env (optional)
   PORT=10000
   NODE_ENV=development
   ALLOWED_ORIGINS=http://localhost:3000
   
   # client/.env (required for Firebase)
   REACT_APP_API_URL=http://localhost:10000
   REACT_APP_FIREBASE_API_KEY=your_firebase_api_key
   REACT_APP_FIREBASE_AUTH_DOMAIN=your_project_id.firebaseapp.com
   REACT_APP_FIREBASE_PROJECT_ID=your_firebase_project_id
   REACT_APP_FIREBASE_STORAGE_BUCKET=your_project_id.appspot.com
   REACT_APP_FIREBASE_MESSAGING_SENDER_ID=your_messaging_sender_id
   REACT_APP_FIREBASE_APP_ID=your_firebase_app_id
   ```

### Running the Application

#### Development Mode (Recommended)
```bash
# Run both client and server simultaneously
npm run dev

# Or run separately:
npm run dev-client  # React dev server on port 3000
npm run dev-server  # API server on port 10000
```

#### Production Mode
```bash
# Build and run production version
npm run build
npm start
```

### Access the Application
- **Development**: http://localhost:3000 (client) + http://localhost:10000 (server)
- **Production**: http://localhost:10000 (combined)

## 🏗️ Architecture

### Technology Stack

#### Frontend
- **React 19** with TypeScript
- **React Router** for navigation  
- **Socket.IO Client** for real-time communication
- **CSS3** with custom properties and responsive design

#### Backend
- **Node.js** with Express
- **Socket.IO** for WebSocket communication
- **Firebase Firestore** for user authentication and data storage
- **JSON-based** song database
- **CORS** configured for security

#### Development Tools
- **ESLint** for code quality
- **TypeScript** for type safety
- **CSS Variables** for consistent theming

### Project Structure
```
jamoveo/
├── client/                 # React frontend
│   ├── src/
│   │   ├── components/     # Reusable components
│   │   ├── pages/          # Main application pages
│   │   ├── context/        # React context providers
│   │   ├── types/          # TypeScript type definitions
│   │   ├── constants/      # Application constants
│   │   ├── config/         # Configuration files
│   │   └── styles/         # Global CSS and variables
│   └── public/             # Static assets
├── server/                 # Node.js backend
│   ├── data/               # Song database (JSON files)
│   └── index.js           # Main server file
└── docs/                   # Documentation
```

## 🎵 Song Management

### Adding New Songs

Songs are stored as JSON files in `server/data/`. Each song follows this structure:

```json
{
  "title": "Song Title",
  "artist": "Artist Name",
  "content": [
    {"text": "First", "chord": "G"},
    {"text": "word"},
    {"text": "with", "chord": "C"},
    {"text": "chord"},
    {"text": "\n"},
    {"text": "Next", "chord": "D"},
    {"text": "line"}
  ],
  "image_url": "https://example.com/sheet-music.jpg"
}
```

### Song Content Format
- **Text with Chords**: `{"text": "word", "chord": "G"}`
- **Text Only**: `{"text": "word"}`
- **Line Breaks**: `{"text": "\n"}` or `{"text": "\n\n"}`

### Supported Languages
- **English**: Left-to-right text rendering
- **Hebrew**: Right-to-left text rendering with automatic detection

## 🔧 Configuration

### Firebase Setup

JaMoveo uses Firebase for user authentication and data storage. To set up Firebase:

1. **Create a Firebase Project**
   - Go to [Firebase Console](https://console.firebase.google.com/)
   - Click "Create a project" and follow the setup wizard
   - Enable Google Analytics (optional)

2. **Enable Authentication**
   - In your Firebase project, go to Authentication > Sign-in method
   - Enable "Email/Password" provider
   - Configure authorized domains for production deployment

3. **Set up Firestore Database**
   - Go to Firestore Database > Create database
   - Start in test mode (configure security rules later)
   - Choose a location close to your users

4. **Get Firebase Configuration**
   - Go to Project Settings > General
   - Scroll down to "Your apps" and click "Web app" icon
   - Register your app and copy the configuration object
   - Use these values in your environment variables

5. **Firestore Data Structure**
   ```javascript
   // Collection: users
   // Document ID: {user_uid}
   {
     username: "string",
     instrument: "string", 
     role: "admin" | "user",
     email: "string",
     createdAt: timestamp
   }
   ```

### Environment Variables

#### Server Configuration
```bash
PORT=10000                           # Server port
NODE_ENV=production|development      # Environment mode
ALLOWED_ORIGINS=http://localhost:3000 # Comma-separated allowed origins
```

#### Client Configuration
```bash
REACT_APP_API_URL=http://localhost:10000  # API server URL

# Firebase Configuration (Required)
REACT_APP_FIREBASE_API_KEY=your_firebase_api_key
REACT_APP_FIREBASE_AUTH_DOMAIN=your_project_id.firebaseapp.com
REACT_APP_FIREBASE_PROJECT_ID=your_firebase_project_id
REACT_APP_FIREBASE_STORAGE_BUCKET=your_project_id.appspot.com
REACT_APP_FIREBASE_MESSAGING_SENDER_ID=your_messaging_sender_id
REACT_APP_FIREBASE_APP_ID=your_firebase_app_id
```

### Development vs Production

| Feature | Development | Production |
|---------|-------------|------------|
| CORS | `localhost:3000` | Environment-based |
| Static Files | Separate servers | Single server |
| Error Handling | Detailed errors | Sanitized errors |
| Logging | Console output | Production logging |
| Firebase | Test/Development project | Production project |

## 🎮 Usage Guide

### For Admins/Conductors

1. **Login** as an admin user
2. **Search Songs** using the search box
   - Search by title: "Amazing Grace"
   - Search by artist: "John Newton"
   - Search Hebrew songs: "הללויה"
3. **Select Song** from search results
4. **Manage Session** with the "Quit Session" button
5. **Monitor Members** in the online members list

### For Band Members

1. **Login** with your instrument role
2. **Wait for Song** selection from admin
3. **View Song** with lyrics and chords
4. **Use Auto-scroll** for hands-free viewing
   - Click "Start Auto Scroll" button
   - Cycle through speeds: x1 → x1.25 → x1.5 → x2 → Stop
5. **Track Bandmates** in the members list

### Keyboard Shortcuts
- **Space**: Start/stop auto-scroll (when focused on scroll button)
- **Escape**: Return to main page
- **Enter**: Submit search queries

## 🛠️ Development

### Available Scripts

#### Root Level
```bash
npm run install-all  # Install all dependencies
npm run dev          # Run client + server in development
npm run dev-client   # Run only React dev server
npm run dev-server   # Run only API server
npm run build        # Build for production
npm start            # Run production build
```

#### Client Scripts
```bash
cd client
npm start            # Development server
npm run build        # Production build
npm test            # Run tests
npm run eject       # Eject from Create React App
```

#### Server Scripts
```bash
cd server
npm run dev         # Development with auto-reload
npm start           # Production server
```

## 🚀 Deployment

### Production Deployment

1. **Build the application**
   ```bash
   npm run build
   ```

2. **Set environment variables**
   ```bash
   export NODE_ENV=production
   export PORT=10000
   export ALLOWED_ORIGINS=https://yourdomain.com
   
   # Firebase configuration (required)
   export REACT_APP_FIREBASE_API_KEY=your_firebase_api_key
   export REACT_APP_FIREBASE_AUTH_DOMAIN=your_project_id.firebaseapp.com
   export REACT_APP_FIREBASE_PROJECT_ID=your_firebase_project_id
   export REACT_APP_FIREBASE_STORAGE_BUCKET=your_project_id.appspot.com
   export REACT_APP_FIREBASE_MESSAGING_SENDER_ID=your_messaging_sender_id
   export REACT_APP_FIREBASE_APP_ID=your_firebase_app_id
   ```

3. **Start the server**
   ```bash
   npm start
   ```


### Environment Setup
- **Development**: Separate React dev server + API server
- **Production**: Single server serving built React app + API

## 📚 API Reference

### REST Endpoints

#### GET /songs
Search for songs by title or artist.

**Query Parameters:**
- `q` (string): Search query (required)

**Response:**
```json
[
  {
    "title": "Song Title",
    "artist": "Artist Name", 
    "content": [...],
    "image_url": "url"
  }
]
```

**Error Responses:**
- `400`: Invalid search query
- `500`: Internal server error

### Socket.IO Events

#### Client → Server

**join**
```javascript
socket.emit("join", {
  username: "string",
  role: "string"
});
```

**logout**
```javascript
socket.emit("logout", {
  username: "string"
});
```

**selectSong** (Admin only)
```javascript
socket.emit("selectSong", songObject);
```

**quitSong** (Admin only)
```javascript
socket.emit("quitSong");
```

#### Server → Client

**updateMembers**
```javascript
socket.on("updateMembers", (members) => {
  // Array of connected members
});
```

**songSelected**
```javascript
socket.on("songSelected", (song) => {
  // Selected song object
});
```

**quit**
```javascript
socket.on("quit", () => {
  // Session ended
});
```
### Debug Mode

Enable debug logging in development:
```javascript
// In browser console
localStorage.debug = 'socket.io-client:socket';
```