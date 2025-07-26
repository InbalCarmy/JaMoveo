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

    // Listen for song end from admin
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


const handleScrollSpeed = () => {
  if (!autoScroll) {
    // Start auto-scroll at x1
    setAutoScroll(true);
    setSpeedLevel(1);
  } else {
    const currentIndex = speedSteps.indexOf(speedLevel);
    const nextIndex = (currentIndex + 1) % speedSteps.length;

    // If we returned to the beginning → stop
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
    const baseInterval = 50; // Base for normal scroll
    const intervalSpeed = baseInterval / speedLevel; // Higher speed → shorter time
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


  // Detect if song is in Hebrew → RTL direction
  const isHebrew = /[\u0590-\u05FF]/.test(song.title) || /[\u0590-\u05FF]/.test(song.artist);
  const direction = isHebrew ? "rtl" : "ltr";

    // Prepare for line splitting
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

<div className="auto-scroll-right">
  <button className="auto-scroll-btn" onClick={handleScrollSpeed}>
    {autoScroll ? `Auto Scroll x${speedLevel}` : "Start Auto Scroll"}
  </button>
</div>


    </div>
  );
}
