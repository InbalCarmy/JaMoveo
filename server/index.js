import express from "express";
import { createServer } from "http";
import { Server } from "socket.io";
import cors from "cors";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const app = express();
const httpServer = createServer(app);
const io = new Server(httpServer, { cors: { origin: "*" } });

// Needed for ES module __dirname
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load all JSON song files from the data directory
const dataDir = path.join(__dirname, "data");
const songFiles = fs.readdirSync(dataDir).filter(file => file.endsWith(".json"));

app.use(cors());
app.use(express.json());

// Load all songs into memory
let songs = songFiles.map(file => {
  const rawData = fs.readFileSync(path.join(dataDir, file), "utf-8");
  const jsonData = JSON.parse(rawData);

  return {
    title: jsonData.title,
    artist: jsonData.artist,
    lyrics: jsonData.lyrics,
    chords: jsonData.chords,
    image_url: jsonData.image_url || null
  };
});

console.log("✅ Loaded songs:", songs.map(s => s.title));

// ✅ Connected users list
let connectedUsers = [];

// ✅ Endpoint for song search
app.get("/songs", (req, res) => {
  const query = (req.query.q || "").toLowerCase();
  const results = songs.filter(
    s =>
      s.title.toLowerCase().includes(query) ||
      s.artist.toLowerCase().includes(query)
  );
  res.json(results);
});

// ✅ Socket.IO real-time logic
io.on("connection", socket => {
  console.log("✅ SERVER: client connected", socket.id);

  // When the admin selects a song → broadcast to all users
  socket.on("selectSong", (song) => {
    console.log("🎵 SERVER: admin selected song", song.title);
    io.emit("songSelected", song);
  });

  // When the admin quits the session
  socket.on("quitSong", () => {
    console.log("⏹️ SERVER: admin quit song");
    io.emit("quit");
  });

  // When a user joins → add/update them in the connected users list
  socket.on("join", (userData) => {
    console.log("🎵 SERVER: join received", userData);

    // Remove any previous entry with the same username to avoid duplicates
    connectedUsers = connectedUsers.filter(u => u.username !== userData.username);

    // Add the new/updated user
    connectedUsers.push({
      socketId: socket.id,
      username: userData.username,
      role: userData.role
    });

    console.log("🎵 SERVER: connectedUsers now:", connectedUsers);

    // Broadcast updated user list to everyone
    io.emit("updateMembers", connectedUsers);
  });

  // When a user disconnects
  socket.on("disconnect", () => {
    console.log("❌ SERVER: disconnected", socket.id);

    // Remove the user by socketId
    connectedUsers = connectedUsers.filter(u => u.socketId !== socket.id);

    console.log("🎵 SERVER: connectedUsers after disconnect:", connectedUsers);

    // Broadcast updated user list
    io.emit("updateMembers", connectedUsers);
  });
});


// ✅ Serve the React build (client)
// ----------------------------------------------------------
const clientBuildPath = path.join(__dirname, "../client/build");

// Serve static React build
app.use(express.static(clientBuildPath));

// ✅ Catch-all (for React Router) - compatible with Express v5
app.get(/.*/, (req, res) => {
  res.sendFile(path.join(clientBuildPath, "index.html"));
});
// ----------------------------------------------------------


// ✅ Start the server
const PORT = process.env.PORT || 10000;
httpServer.listen(PORT, () =>
  console.log(`✅ Server running on http://localhost:${PORT}`)
);
