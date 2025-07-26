import { useLocation, useNavigate } from "react-router-dom";
import { socket } from "../socket";
import { useAuth } from "../context/AuthContext";
import "./ResultsPage.css";

export default function ResultsPage() {
  const location = useLocation();
  const navigate = useNavigate();
  const { user } = useAuth();

  // נקבל את תוצאות החיפוש מה-AdminPage
  const results = location.state?.results || [];
  

  const selectSong = (song: any) => {
    console.log("🎵 ADMIN: selected song from results", song);

    // משדר את כל אובייקט השיר לשרת → כל המשתמשים יקבלו
    socket.emit("selectSong", song);

    // גם האדמין עובר ללייב עם אותו שיר
    navigate("/live", { state: { song } });
  };

  if (!results.length) {
    return (
      <div className="results-page">
        <h2>No results found</h2>
        <button className="back-btn" onClick={() => navigate("/admin")}>
          Back to search
        </button>
      </div>
    );
  }

  return (
    <div className="results-page">
      <h1 className="results-title">Search Results</h1>

      <div className="results-list">
    {results.map((song: any, idx: number) => {
  const isHebrew = /[\u0590-\u05FF]/.test(song.title) || /[\u0590-\u05FF]/.test(song.artist);

  return (
    <div key={idx} className="song-card" dir={isHebrew ? "rtl" : "ltr"}>
      {song.image_url && (
          <img src={song.image_url} alt={song.title} className="song-image" />
        )}
        <div className="song-info">
          <h2>{song.title}</h2>
          <p>{song.artist}</p>
        </div>
        <button className="select-btn" onClick={() => selectSong(song)}>
          Select
        </button>
      </div>
    );
  })}

      </div>

      <button className="back-btn" onClick={() => navigate("/admin")}>
        Back to search
      </button>
    </div>
  );
}
