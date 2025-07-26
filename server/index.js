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
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const dataDir = path.join(__dirname, "data");
const songFiles = fs.readdirSync(dataDir).filter(file => file.endsWith(".json"));


app.use(cors());
app.use(express.json());

// const heyJude = JSON.parse(fs.readFileSync("./data/hey_jude.json", "utf-8"));
// const veechShelo = JSON.parse(fs.readFileSync("./data/veech_shelo.json", "utf-8"));

// const songs = [
//   { title: "Hey Jude", artist: "The Beatles", data: heyJude },
//   { title: "Veech Shelo", artist: "Ehud Banai", data: veechShelo }
// ];

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

// ✅ רשימת משתמשים מחוברים
let connectedUsers = [];

// Endpoint חיפוש שירים
app.get("/songs", (req, res) => {
  const query = (req.query.q || "").toLowerCase();
  const results = songs.filter(
    s =>
      s.title.toLowerCase().includes(query) ||
      s.artist.toLowerCase().includes(query)
  );
  res.json(results);
});

// ✅ Socket.IO
io.on("connection", socket => {
  console.log("✅ SERVER: client connected", socket.id);

  // כשהאדמין בוחר שיר → משדר לכולם
  socket.on("selectSong", (song) => {
    console.log("🎵 SERVER: admin selected song", song.title);
    io.emit("songSelected", song);
  });

  // כשהאדמין מסיים שיר
  socket.on("quitSong", () => {
    console.log("⏹️ SERVER: admin quit song");
    io.emit("quit");
  });

  // כשהלקוח מודיע על כניסה
  socket.on("join", (userData) => {
    console.log("🎵 SERVER: join received", userData);

    // ✅ מסירים קודם אם המשתמש כבר קיים (לפי username) כדי למנוע כפילות
    connectedUsers = connectedUsers.filter(u => u.username !== userData.username);

    // ✅ מוסיפים אותו מחדש עם socketId עדכני
    connectedUsers.push({
      socketId: socket.id,
      username: userData.username,
      role: userData.role
    });

    console.log("🎵 SERVER: connectedUsers now:", connectedUsers);

    // שולחים לכולם רשימה מעודכנת
    io.emit("updateMembers", connectedUsers);
  });

  // כשהלקוח מתנתק
  socket.on("disconnect", () => {
    console.log("❌ SERVER: disconnected", socket.id);

    // ✅ מסירים את המשתמש לפי socketId
    connectedUsers = connectedUsers.filter(u => u.socketId !== socket.id);

    console.log("🎵 SERVER: connectedUsers after disconnect:", connectedUsers);

    // שולחים לכולם רשימה מעודכנת
    io.emit("updateMembers", connectedUsers);
  });
});

// הפעלת השרת
const PORT = 5001;
httpServer.listen(PORT, () =>
  console.log(`✅ Server running on http://localhost:${PORT}`)
);
