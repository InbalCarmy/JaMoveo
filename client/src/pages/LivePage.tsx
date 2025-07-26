import { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { socket } from "../socket";
import { Song, SongContent } from "../types";
import { AUTO_SCROLL_BASE_INTERVAL, AUTO_SCROLL_SPEED_STEPS } from "../constants";
import "./LivePage.css";

export default function LivePage() {
  const location = useLocation();
  const navigate = useNavigate();
  const { user } = useAuth();

  const [speedLevel, setSpeedLevel] = useState(1);
  const song = location.state?.song;
  const [autoScroll, setAutoScroll] = useState(false);

  useEffect(() => {
    if (!song) {
      navigate("/main");
      return;
    }

    // Listen for song end from admin
    socket.on("quit", () => {
      // Admin ended the song session
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
    const currentIndex = AUTO_SCROLL_SPEED_STEPS.indexOf(speedLevel);
    const nextIndex = (currentIndex + 1) % AUTO_SCROLL_SPEED_STEPS.length;

    // If we returned to the beginning → stop
    if (nextIndex === 0) {
      setAutoScroll(false);
      setSpeedLevel(1);
    } else {
      setSpeedLevel(AUTO_SCROLL_SPEED_STEPS[nextIndex]);
    }
  }
};


  useEffect(() => {
  let scrollInterval: NodeJS.Timeout;

  if (autoScroll) {
    const baseInterval = AUTO_SCROLL_BASE_INTERVAL;
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

    // Prepare content for rendering
  const content = song.content || [];

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
          {content.map((item: SongContent, idx: number) => {
            if (item.text === "\n" || item.text === "\n\n") {
              return <div key={idx} className="line-break">{item.text}</div>;
            }
            return (
              <span key={idx} className="word-container">
                {!isVocals && item.chord && (
                  <div className="chord-above">{item.chord}</div>
                )}
                <span className="word">{item.text}</span>
                {idx < content.length - 1 && content[idx + 1].text !== "\n" && content[idx + 1].text !== "\n\n" ? "\u00A0" : ""}
              </span>
            );
          })}
        </div>

<div className="auto-scroll-right">
  <button className="auto-scroll-btn" onClick={handleScrollSpeed}>
    {autoScroll ? `Auto Scroll x${speedLevel}` : "Start Auto Scroll"}
  </button>
</div>


    </div>
  );
}
