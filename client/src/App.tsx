import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import SignupUser from "./pages/SignupUser";
import SignupAdmin from "./pages/SignupAdmin";
import Login from "./pages/Login";
import MainPage from "./pages/MainPage";
import AdminPage from "./pages/AdminPage";
import LivePage from "./pages/LivePage";
import ResultsPage from "./pages/ResultsPage";



function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Login />} />
        <Route path="/signup" element={<SignupUser />} />         {/* רגיל */}
        <Route path="/admin/signup" element={<SignupAdmin />} /> {/* רק אדמין */}
        <Route path="/main" element={<MainPage />} />
        <Route path="/admin" element={<AdminPage />} />
        <Route path="/results" element={<ResultsPage />} />
        <Route path="/live" element={<LivePage />} />

      </Routes>
    </Router>
  );
}

export default App;
