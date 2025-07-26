import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { socket } from "../socket";
import { useAuth } from "../context/AuthContext";
import "./AdminPage.css";

export default function AdminPage() {
  const [connectedMembers, setConnectedMembers] = useState<any[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults] = useState<any[]>([]);
  const [loadingSongs, setLoadingSongs] = useState(false);

  const navigate = useNavigate();
  const { user } = useAuth();

  useEffect(() => {
    if (!user) return;

    // Ensure socket is connected
    if (!socket.connected) {
      socket.connect();
    }

    socket.on("connect", () => {
      console.log("✅ CLIENT: connected to Socket.IO server. ID:", socket.id);
    });

    socket.on("disconnect", () => {
      console.log("❌ CLIENT: disconnected from Socket.IO server");
    });

    // Set up listeners FIRST before joining
    socket.on("updateMembers", (members) => {
      console.log("🎸 CLIENT: updateMembers received", members);
      setConnectedMembers(members);
    });

    console.log("🎵 CLIENT: sending join", {
      username: user.username,
      role: user.role === "admin" ? "Conductor (Admin)" : user.role,
    });

    // Ensure socket is connected before joining
    const joinWhenReady = () => {
      if (socket.connected) {
        console.log("🎵 ADMIN: Socket connected, joining...");
        socket.emit("join", {
          username: user.username,
          role: user.role === "admin" ? "Conductor (Admin)" : user.role,
        });
      } else {
        console.log("🎵 ADMIN: Socket not connected, waiting for connection...");
        // Wait for connection and then join
        socket.once("connect", () => {
          console.log("🎵 ADMIN: Socket connected, joining...");
          socket.emit("join", {
            username: user.username,
            role: user.role === "admin" ? "Conductor (Admin)" : user.role,
          });
        });
      }
    };

    // Small delay to ensure listeners are set up, then join
    setTimeout(joinWhenReady, 200);

    // Listen for selected song – admin also goes to LivePage
    socket.on("songSelected", (song) => {
      console.log("🎵 ADMIN: received songSelected", song);
      navigate("/live", { state: { song } });
    });

    // Listen for song end – will return admin to management page
    socket.on("quit", () => {
      console.log("⏹️ ADMIN: quit received");
      navigate("/admin");
    });

    return () => {
      socket.off("connect");
      socket.off("disconnect");
      socket.off("updateMembers");
      socket.off("songSelected");
      socket.off("quit");
    };
  }, [user, navigate]);

  const handleLogout = () => {
    // Emit logout event to server before disconnecting
    socket.emit("logout", { username: user?.username });
    // Disconnect socket to ensure clean removal
    socket.disconnect();
    navigate("/");
  };

  const searchSongs = async () => {
    if (!searchQuery.trim()) return;
    setLoadingSongs(true);
    try {
      const apiUrl = process.env.NODE_ENV === 'development' ? 'http://localhost:10000' : '';
      const res = await fetch(`${apiUrl}/songs?q=${encodeURIComponent(searchQuery)}`);
      const data = await res.json();
      // Pass results to ResultsPage
      navigate("/results", { state: { results: data } });
    } catch (err) {
      console.error("❌ Error fetching songs:", err);
    } finally {
      setLoadingSongs(false);
    }
  };

  const selectSong = (song: any) => {
    console.log("🎵 ADMIN: selected song", song);
    socket.emit("selectSong", song);
      console.log("✅ ADMIN: selectSong emitted to server");
    alert(`✅ Selected "${song.title}" for the band!`);
  };

  return (
    <div className="admin-page">
      <header className="admin-header">
        <h1 className="logo">🎵 <span>JaMoveo Admin</span></h1>
        <div className="admin-info">
          <span className="welcome">Welcome, {user?.username || "admin"}!</span>
          <button className="logout-btn" onClick={handleLogout}>Logout</button>
        </div>
      </header>

      <main className="admin-content">
        {/* Song search box */}
        <section className="search-section">
          <h2 className="search-title">Search any song...</h2>
          <div className="search-box">
            <input
              type="text"
              placeholder="Enter song title or artist name"
              className="search-input"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
            <button className="search-btn" onClick={searchSongs}>Search</button>
          </div>

          {loadingSongs && <p>Loading songs...</p>}

          {searchResults.length > 0 && (
            <div className="search-results">
              <h3>Results:</h3>
              <ul>
                {searchResults.map((song, idx) => (
                  <li key={idx} className="song-item">
                    <div>
                      <strong>{song.title}</strong> – {song.artist}
                    </div>
                    <button className="select-btn" onClick={() => selectSong(song)}>
                      Select
                    </button>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* {!loadingSongs && searchResults.length === 0 && searchQuery && (
            <p>No results found.</p>
          )} */}

          <div className="search-tips">
            <h3>Search Tips:</h3>
            <ul>
              <li>🎵 Try searching for song titles like "Amazing Grace" or "Camptown Races"</li>
              <li>🎵 Search by artist name like "Stephen Foster" or "John Newton"</li>
              <li>🎵 Hebrew songs are supported – try "הללויה" or "שיר לשלום"</li>
              <li>🎵 Search is case-insensitive and matches partial words</li>
            </ul>
          </div>
        </section>

        {/* Right side - connected members + admin controls */}
        <aside className="admin-sidebar">
          <div className="members-box">
            <h3>Band Members Online</h3>
            <ul>
              {connectedMembers.length === 0 && (
                <li style={{ opacity: 0.7 }}>No members connected</li>
              )}
              {connectedMembers.map((member, index) => (
                <li key={index}>
                  <span className="member-name">{member.username}</span>
                  <span className="member-role">{member.role}</span>
                </li>
              ))}
            </ul>
          </div>

          <div className="controls-box">
            <h3>Admin Controls</h3>
            <ul>
              <li>🎵 Search for songs in the database</li>
              <li>🎵 Select songs for band rehearsal</li>
              <li>🎵 Control what all members see</li>
              <li>🎵 Start and end song sessions</li>
            </ul>
          </div>
        </aside>
      </main>

      <footer className="admin-footer">
        🎼 Control your band’s rehearsal session
      </footer>
    </div>
  );
}
