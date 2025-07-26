import { useEffect, useState } from "react";
import { socket } from "../socket";
import { useAuth } from "../context/AuthContext";
import { useNavigate } from "react-router-dom";
import "./MainPage.css";

export default function MainPage() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [connectedMembers, setConnectedMembers] = useState<any[]>([]);

  useEffect(() => {
    if (!user) return;

    // Ensure socket is connected
    if (!socket.connected) {
      socket.connect();
    }

    // Set up listeners FIRST before joining
    // Listen for selected song → navigate to LivePage
    socket.on("songSelected", (song) => {
      console.log("🎵 USER: received song selection", song);
      navigate("/live", { state: { song } });
    });

    // Listen for song end → return to waiting screen
    socket.on("quit", () => {
      console.log("⏹️ USER: admin ended the song session");
      navigate("/main");
    });

    // Listen for connected members list update
    socket.on("updateMembers", (members) => {
      console.log("🎸 CLIENT: updateMembers received", members);
      setConnectedMembers(members);
    });

    // Ensure socket is connected before joining
    const joinWhenReady = () => {
      if (socket.connected) {
        console.log("🎵 USER: Socket connected, joining...");
        socket.emit("join", {
          username: user.username,
          role: user.instrument || "Player"
        });
      } else {
        console.log("🎵 USER: Socket not connected, waiting for connection...");
        // Wait for connection and then join
        socket.once("connect", () => {
          console.log("🎵 USER: Socket connected, joining...");
          socket.emit("join", {
            username: user.username,
            role: user.instrument || "Player"
          });
        });
      }
    };

    // Small delay to ensure listeners are set up, then join
    setTimeout(joinWhenReady, 200);

    return () => {
      socket.off("songSelected");
      socket.off("quit");
      socket.off("updateMembers");
    };
  }, [user, navigate]);

  const handleLogout = () => {
    // Emit logout event to server before disconnecting
    socket.emit("logout", { username: user?.username });
    // Disconnect socket to ensure clean removal
    socket.disconnect();
    navigate("/");
  };

  return (
    <div className="main-page">
      {/* Top header */}
      <header className="main-header">
        <h1 className="logo">🎵 JaMoveo</h1>
        <div className="user-info">
          <span>Welcome, {user?.username}</span>
          <button className="logout-btn" onClick={handleLogout}>Logout</button>
        </div>
      </header>

      <div className="main-content">
        {/* Center screen - waiting message */}
        <div className="waiting-box">
          <h2 className="waiting-title">Waiting for next song</h2>
          <div className="music-icons">🎵 🎶 🎵</div>
          <p className="waiting-text">
            The admin will select a song for the rehearsal session.
            <br />
            Stay tuned!
          </p>
        </div>

        {/* Right side - connected users + status */}
        <aside className="sidebar">
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

          <div className="session-status-box">
            <h3>Session Status</h3>
            <p>
              <strong>Your Role:</strong> Player
            </p>
            <p>
              <strong>Your Instrument:</strong> {user?.instrument}
            </p>
            <p>
              <strong>Connection:</strong> <span className="status-green">Connected</span>
            </p>
          </div>
        </aside>
      </div>

      {/* Footer */}
      <footer className="main-footer">
        🎸 Ready to rock with your band!
      </footer>
    </div>
  );
}
