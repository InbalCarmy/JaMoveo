import { useState } from "react";
import { signInWithEmailAndPassword } from "firebase/auth";
import { auth, db } from "../firebaseConfig";
import { useNavigate } from "react-router-dom";
import { collection, query, where, getDocs } from "firebase/firestore";
import "./Login.css";

export default function Login() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const navigate = useNavigate();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      // Search email by username
      const usersRef = collection(db, "users");
      const q = query(usersRef, where("username", "==", username));
      const querySnapshot = await getDocs(q);

      if (querySnapshot.empty) {
        alert("❌ Username not found");
        return;
      }

      let emailFromDB = "";
      let roleFromDB = "";
      // let userId = "";

      querySnapshot.forEach((docSnap) => {
        const data = docSnap.data();
        emailFromDB = data.email;
        roleFromDB = data.role;
        // userId = docSnap.id;
      });

      // Login with email+password
      await signInWithEmailAndPassword(auth, emailFromDB, password);

      // Redirect by role
      if (roleFromDB === "admin") {
        navigate("/admin");
      } else {
        navigate("/main");
      }

    } catch (error: any) {
      alert("❌ Error: " + error.message);
    }
  };

  return (
    <div className="login-page">
      <div className="login-container">
        <h1 className="login-title">🎵 JaMoveo</h1>
        <p className="login-subtitle">
          Welcome back to your band rehearsal app!
        </p>

        <form onSubmit={handleLogin}>
          <input
            type="text"
            placeholder="Username"
            className="login-input"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
          />

          <input
            type="password"
            placeholder="Password"
            className="login-input"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />

          <button type="submit" className="login-button">
            LOGIN
          </button>
        </form>

        <p className="signup-text">
          Don’t have an account?{" "}
          <span onClick={() => navigate("/signup")} className="signup-link">
            Sign up
          </span>
        </p>
      </div>
    </div>
  );
}
