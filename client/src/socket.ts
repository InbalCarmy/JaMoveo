import { io } from "socket.io-client";

// יצירת חיבור אחד לכל האפליקציה
export const socket = io("http://localhost:5001", {
  transports: ["websocket"],
});

