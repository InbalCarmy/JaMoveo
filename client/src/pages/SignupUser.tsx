import { useState } from "react";
import { auth, db } from "../firebaseConfig";
import { createUserWithEmailAndPassword } from "firebase/auth";
import { doc, setDoc, collection, query, where, getDocs } from "firebase/firestore";
import { useNavigate } from "react-router-dom";
import "./Signup.css"; // אותו עיצוב כמו login

export default function SignupUser() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [username, setUsername] = useState("");
  const [instrument, setInstrument] = useState("guitar");
  const navigate = useNavigate();

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      // בדיקת ייחודיות username
      const usersRef = collection(db, "users");
      const q = query(usersRef, where("username", "==", username));
      const querySnapshot = await getDocs(q);
      if (!querySnapshot.empty) {
        alert("❌ Username already taken, choose another one.");
        return;
      }

      // יצירת משתמש רגיל ב-Auth
      const cred = await createUserWithEmailAndPassword(auth, email, password);

      // שמירת פרטי המשתמש ב-Firestore
      await setDoc(doc(db, "users", cred.user.uid), {
        username,
        email,
        instrument,
        role: "user" // ✅ תמיד USER
      });

      alert("✅ Signup successful!");
      navigate("/"); // חזרה לעמוד login
    } catch (error: any) {
      alert("❌ Error: " + error.message);
    }
  };

  return (
    <div className="signup-page">
      <div className="signup-container">
        <h1 className="signup-title">🎵 JaMoveo</h1>
        <p className="signup-subtitle">Create your account and join the band!</p>

        <form onSubmit={handleSignup}>
          <input
            type="text"
            placeholder="Username"
            className="signup-input"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            required
          />

          <input
            type="email"
            placeholder="Email"
            className="signup-input"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />

          <input
            type="password"
            placeholder="Password"
            className="signup-input"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />

          <select
            className="signup-select"
            value={instrument}
            onChange={(e) => setInstrument(e.target.value)}
          >
            <option value="guitar">Guitar</option>
            <option value="drums">Drums</option>
            <option value="bass">Bass</option>
            <option value="keyboard">Keyboard</option>
            <option value="vocals">Vocals</option>
          </select>

          <button type="submit" className="signup-button">
            SIGN UP
          </button>
        </form>

        <p className="signup-text">
          Already have an account?{" "}
          <span onClick={() => navigate("/")} className="signup-link">
            Login
          </span>
        </p>
      </div>
    </div>
  );
}
