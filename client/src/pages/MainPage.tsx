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

    // שולח join
    socket.emit("join", {
      username: user.username,
      role: user.instrument || "Player"
    });

    // מאזין לשיר שנבחר → עובר ל-LivePage
    socket.on("songSelected", (song) => {
      console.log("🎵 USER: received song selection", song);
      navigate("/live", { state: { song } });
    });

    // מאזין לכיבוי שיר → חוזר למסך המתנה
    socket.on("quit", () => {
      console.log("⏹️ USER: admin ended the song session");
      navigate("/main");
    });

    // מאזין לעדכון רשימת מחוברים
    socket.on("updateMembers", (members) => {
      console.log("🎸 CLIENT: updateMembers received", members);
      setConnectedMembers(members);
    });

    return () => {
      socket.off("songSelected");
      socket.off("quit");
      socket.off("updateMembers");
    };
  }, [user, navigate]);

  const handleLogout = () => {
    navigate("/"); // אפשר גם להוסיף signOut מה-Firebase
  };

  return (
    <div className="main-page">
      {/* כותרת עליונה */}
      <header className="main-header">
        <h1 className="logo">🎵 JaMoveo</h1>
        <div className="user-info">
          <span>Welcome, {user?.username}!</span>
          <button className="logout-btn" onClick={handleLogout}>Logout</button>
        </div>
      </header>

      <div className="main-content">
        {/* מרכז המסך - הודעת המתנה */}
        <div className="waiting-box">
          <h2 className="waiting-title">Waiting for next song</h2>
          <div className="music-icons">🎵 🎶 🎵</div>
          <p className="waiting-text">
            The admin will select a song for the rehearsal session.
            <br />
            Stay tuned!
          </p>
        </div>

        {/* צד ימין - משתמשים מחוברים + סטטוס */}
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

      {/* תחתית */}
      <footer className="main-footer">
        🎸 Ready to rock with your band!
      </footer>
    </div>
  );
}
