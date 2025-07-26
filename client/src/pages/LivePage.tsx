import { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { socket } from "../socket";
import "./LivePage.css";

export default function LivePage() {
  const location = useLocation();
  const navigate = useNavigate();
  const { user } = useAuth();
  // const [scrollSpeed, setScrollSpeed] = useState(50);

  const [speedLevel, setSpeedLevel] = useState(1);
  const speedSteps = [1, 1.25, 1.5, 2];
  const song = location.state?.song;
  const [autoScroll, setAutoScroll] = useState(false);

  useEffect(() => {
    if (!song) {
      navigate("/main");
      return;
    }

    // מאזין לכיבוי שיר מהאדמין
    socket.on("quit", () => {
      console.log("⏹️ Admin ended the song session");
      if (user?.role === "admin") {
        navigate("/admin");
      } else {
        navigate("/main");
      }
    });

    return () => {
      socket.off("quit");
    };
  }, [song, navigate, user]);

//   // גלילה אוטומטית איטית
// useEffect(() => {
//   let scrollInterval: NodeJS.Timeout;
//   if (autoScroll) {
//     scrollInterval = setInterval(() => {
//       window.scrollBy(0, 1); // תמיד גולל פיקסל 1
//     }, scrollSpeed); // הזמן בין הגלילות תלוי במהירות
//   }
//   return () => clearInterval(scrollInterval);
// }, [autoScroll, scrollSpeed]);



const handleScrollSpeed = () => {
  if (!autoScroll) {
    // Start auto-scroll at x1
    setAutoScroll(true);
    setSpeedLevel(1);
  } else {
    const currentIndex = speedSteps.indexOf(speedLevel);
    const nextIndex = (currentIndex + 1) % speedSteps.length;

    // אם חזרנו להתחלה → מפסיקים
    if (nextIndex === 0) {
      setAutoScroll(false);
      setSpeedLevel(1);
    } else {
      setSpeedLevel(speedSteps[nextIndex]);
    }
  }
};


  useEffect(() => {
  let scrollInterval: NodeJS.Timeout;

  if (autoScroll) {
    const baseInterval = 50; // בסיס לגלילה רגילה
    const intervalSpeed = baseInterval / speedLevel; // ככל שמהירות גבוהה → זמן קצר יותר
    scrollInterval = setInterval(() => {
      window.scrollBy(0, 1); // scroll down
    }, intervalSpeed);
  }

  return () => clearInterval(scrollInterval);
}, [autoScroll, speedLevel]);



  if (!song) {
    return (
      <div className="live-container">
        ❌ No song selected
      </div>
    );
  }

  const isVocals = user?.instrument?.toLowerCase() === "vocals";


  // זיהוי אם השיר בעברית → כיוון RTL
  const isHebrew = /[\u0590-\u05FF]/.test(song.title) || /[\u0590-\u05FF]/.test(song.artist);
  const direction = isHebrew ? "rtl" : "ltr";

    // הכנה לפיצול שורות
  const lyricsLines = song.lyrics?.split("\n") || [];
  const chordsLines = song.chords?.split("\n") || [];

  return (
    <div className="live-page" dir={direction}>
    <div className="live-header">
      <div className="live-header-top">
        <div className="song-info">
          <h1 className="song-title">{song.title}</h1>
          <h2 className="song-artist">
            {isHebrew ? song.artist : `by ${song.artist}`}
          </h2>
        </div>

        <div className="live-controls">
          {/* Live badge */}
          <span className="live-badge">● Live</span>

          {/* Quit session only for admin */}
          {user?.role === "admin" && (
            <button
              className="quit-session-btn"
              onClick={() => {
                socket.emit("quitSong");
                navigate("/admin");
              }}
            >
              Quit Session
            </button>
          )}
        </div>
      </div>
    </div>

        <div className="song-box">
        {lyricsLines.map((line: string, idx: number) => (
            <div key={idx} className="song-line" dir={direction}>
            {!isVocals && chordsLines[idx] && (
                <div className="chords-line">{chordsLines[idx]}</div>
            )}
            <div className="lyrics-line">{line}</div>
            </div>
        ))}
        </div>

      {/* כפתורי שליטה */}
{/* <div className="floating-buttons">
  <button
    className="toggle-scroll-btn"
    onClick={() => setAutoScroll(prev => !prev)}
  >
    {autoScroll ? "Stop Auto-scroll" : "Start Auto-scroll"}
  </button>

  {autoScroll && (
    <div className="scroll-speed-control">
      <label>Scroll speed:</label>
      <input
        type="range"
        min="10"
        max="200"
        step="10"
        value={scrollSpeed}
        onChange={(e) => setScrollSpeed(Number(e.target.value))}
      />
      <span>{scrollSpeed}ms</span>
    </div>
  )}
</div> */}

<div className="auto-scroll-right">
  <button className="auto-scroll-btn" onClick={handleScrollSpeed}>
    {autoScroll ? `Auto Scroll x${speedLevel}` : "Start Auto Scroll"}
  </button>
</div>


    </div>
  );
}
