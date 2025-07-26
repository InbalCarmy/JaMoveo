import { io } from "socket.io-client";

// יצירת חיבור אחד לכל האפליקציה
const SERVER_URL =
  process.env.NODE_ENV === "production"
    ? window.location.origin
    : "http://localhost:10000";

export const socket = io(SERVER_URL, { transports: ["websocket"] });


