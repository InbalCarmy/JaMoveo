// import { useState } from "react";
// import { signInWithEmailAndPassword } from "firebase/auth";
// import { auth, db } from "../firebaseConfig";
// import { useNavigate } from "react-router-dom";
// import { collection, query, where, getDocs } from "firebase/firestore";
// import "./Login.css";

// export default function Login() {
//   const [username, setUsername] = useState(""); // ✅ במקום email
//   const [password, setPassword] = useState("");
//   const navigate = useNavigate();

//   const handleLogin = async (e: React.FormEvent) => {
//     e.preventDefault();
//     try {
//       // 1️⃣ נחפש את המשתמש לפי username ב-Firestore
//       const usersRef = collection(db, "users");
//       const q = query(usersRef, where("username", "==", username));
//       const querySnapshot = await getDocs(q);

//       if (querySnapshot.empty) {
//         alert("❌ Username not found");
//         return;
//       }

//       // 2️⃣ נמצא את ה-email של המשתמש הראשון שתואם
//       let emailFromDB = "";
//       querySnapshot.forEach((doc) => {
//         const data = doc.data();
//         emailFromDB = data.email;
//       });

//       // 3️⃣ נתחבר עם האימייל שמצאנו + הסיסמה
//       await signInWithEmailAndPassword(auth, emailFromDB, password);

//       alert("✅ Login successful!");
//       navigate("/main");
//     } catch (error: any) {
//       alert("❌ Error: " + error.message);
//     }
//   };

//   return (
//     <div className="login-page">
//       <div className="login-container">
//         <h1 className="login-title">🎵 JaMoveo</h1>
//         <p className="login-subtitle">
//           Welcome back to your band rehearsal app!
//         </p>

//         <form onSubmit={handleLogin}>
//           <input
//             type="text"
//             placeholder="Username"
//             className="login-input"
//             value={username}
//             onChange={(e) => setUsername(e.target.value)}
//           />

//           <input
//             type="password"
//             placeholder="Password"
//             className="login-input"
//             value={password}
//             onChange={(e) => setPassword(e.target.value)}
//           />

//           <button type="submit" className="login-button">
//             LOGIN
//           </button>
//         </form>

//         <p className="signup-text">
//           Don’t have an account?{" "}
//           <span onClick={() => navigate("/signup")} className="signup-link">
//             Sign up
//           </span>
//         </p>
//       </div>
//     </div>
//   );
// }
import { useState } from "react";
import { signInWithEmailAndPassword } from "firebase/auth";
import { auth, db } from "../firebaseConfig";
import { useNavigate } from "react-router-dom";
import { collection, query, where, getDocs, doc, getDoc } from "firebase/firestore";
import "./Login.css";

export default function Login() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const navigate = useNavigate();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      // חיפוש אימייל לפי username
      const usersRef = collection(db, "users");
      const q = query(usersRef, where("username", "==", username));
      const querySnapshot = await getDocs(q);

      if (querySnapshot.empty) {
        alert("❌ Username not found");
        return;
      }

      let emailFromDB = "";
      let roleFromDB = "";
      let userId = "";

      querySnapshot.forEach((docSnap) => {
        const data = docSnap.data();
        emailFromDB = data.email;
        roleFromDB = data.role;
        userId = docSnap.id;
      });

      // התחברות עם אימייל+סיסמה
      await signInWithEmailAndPassword(auth, emailFromDB, password);

      // הפניה לפי role
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
