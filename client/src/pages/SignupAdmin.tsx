import { useState } from "react";
import { auth, db } from "../firebaseConfig";
import { createUserWithEmailAndPassword } from "firebase/auth";
import { doc, setDoc, collection, query, where, getDocs } from "firebase/firestore";
import { useNavigate } from "react-router-dom";
import "./Signup.css";

export default function SignupAdmin() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [username, setUsername] = useState("");
  const [instrument] = useState("guitar");
  const navigate = useNavigate();

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      // Check username uniqueness
      const usersRef = collection(db, "users");
      const q = query(usersRef, where("username", "==", username));
      const querySnapshot = await getDocs(q);
      if (!querySnapshot.empty) {
        alert("❌ Username already taken, choose another one.");
        return;
      }

      // Create admin user in Auth
      const cred = await createUserWithEmailAndPassword(auth, email, password);

      // Save user details in Firestore
      await setDoc(doc(db, "users", cred.user.uid), {
        username,
        email,
        instrument,
        role: "admin" // Always ADMIN
      });

      alert("✅ Admin Signup successful!");
      navigate("/"); // Return to login page
    } catch (error: any) {
      alert("❌ Error: " + error.message);
    }
  };

  return (
    <div className="signup-page">
      <div className="signup-container">
        <h1 className="signup-title">🎵 JaMoveo Admin</h1>
        <p className="signup-subtitle">Register as an admin for the band!</p>

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

          <button type="submit" className="signup-button">
            SIGN UP AS ADMIN
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
