import express from "express";
import { createServer } from "http";
import { Server } from "socket.io";
import cors from "cors";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const app = express();
const httpServer = createServer(app);

// Configure CORS based on environment
const corsOrigin = process.env.NODE_ENV === 'production' ? false : "http://localhost:3000";
const io = new Server(httpServer, { 
  cors: { 
    origin: corsOrigin || "*",
    credentials: true 
  } 
});

// Needed for ES module __dirname
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load all JSON song files from the data directory
const dataDir = path.join(__dirname, "data");
const songFiles = fs.readdirSync(dataDir).filter(file => file.endsWith(".json"));

// Configure Express CORS middleware
app.use(cors({
  origin: corsOrigin || "*",
  credentials: true
}));
app.use(express.json());

// Load all songs into memory
let songs = songFiles.map(file => {
  const rawData = fs.readFileSync(path.join(dataDir, file), "utf-8");
  const jsonData = JSON.parse(rawData);

  return {
    title: jsonData.title,
    artist: jsonData.artist,
    content: jsonData.content,
    image_url: jsonData.image_url || null
  };
});

// Songs loaded successfully

// Connected users list
let connectedUsers = [];

// Endpoint for song search
app.get("/songs", (req, res) => {
  const query = (req.query.q || "").toLowerCase();
  const results = songs.filter(
    s =>
      s.title.toLowerCase().includes(query) ||
      s.artist.toLowerCase().includes(query)
  );
  res.json(results);
});

// Socket.IO real-time logic
io.on("connection", socket => {
  // Client connected

  // When the admin selects a song → broadcast to all users
  socket.on("selectSong", (song) => {
    // Admin selected song
    io.emit("songSelected", song);
  });

  // When the admin quits the session
  socket.on("quitSong", () => {
    // Admin quit song
    io.emit("quit");
  });

  // When a user joins → add/update them in the connected users list
  socket.on("join", (userData) => {
    // User join request received

    // Remove any previous entry with the same username OR same socketId to avoid duplicates
    connectedUsers = connectedUsers.filter(u => u.username !== userData.username && u.socketId !== socket.id);

    // Add the new/updated user
    connectedUsers.push({
      socketId: socket.id,
      username: userData.username,
      role: userData.role
    });

    // User list updated

    // Send current member list to the joining user immediately
    socket.emit("updateMembers", connectedUsers);
    
    // Also broadcast updated user list to everyone
    io.emit("updateMembers", connectedUsers);
  });

  // When a user explicitly logs out
  socket.on("logout", (userData) => {
    // User logout request

    // Remove the user by username (more reliable than socketId)
    connectedUsers = connectedUsers.filter(u => u.username !== userData.username);

    // User list updated after logout

    // Broadcast updated user list
    io.emit("updateMembers", connectedUsers);
  });

  // When a user disconnects (fallback for unexpected disconnections)
  socket.on("disconnect", () => {
    // Client disconnected

    // Remove the user by socketId
    connectedUsers = connectedUsers.filter(u => u.socketId !== socket.id);

    // User list updated after disconnect

    // Broadcast updated user list
    io.emit("updateMembers", connectedUsers);
  });
});


// Serve the React build (client) only in production
// ----------------------------------------------------------
if (process.env.NODE_ENV === 'production') {
  const clientBuildPath = path.join(__dirname, "../client/build");
  
  // Serve static React build
  app.use(express.static(clientBuildPath));
  
  // Catch-all (for React Router) - compatible with Express v5
  app.get(/.*/, (req, res) => {
    res.sendFile(path.join(clientBuildPath, "index.html"));
  });
  
  console.log("Production mode: Serving React build");
} else {
  console.log("Development mode: API only server");
}
// ----------------------------------------------------------


// Start the server
const PORT = process.env.PORT || 10000;
httpServer.listen(PORT, () =>
  console.log(`Server running on http://localhost:${PORT}`)
);
