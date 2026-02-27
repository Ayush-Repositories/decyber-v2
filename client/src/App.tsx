import { Routes, Route } from "react-router-dom";
import { GlobalTimer } from "./components/GlobalTimer";
import Home from "./pages/Home";
import QuizLogin from "./pages/QuizLogin";
import QuizMap from "./pages/QuizMap";
import QuizQuestion from "./pages/QuizQuestion";
import AdminLogin from "./pages/AdminLogin";
import Admin from "./pages/Admin";
import Leaderboard from "./pages/Leaderboard";
import Login from "./pages/Login";
import Dashboard from "./pages/Dashboard";
import RoundOne from "./pages/RoundOne";

export default function App() {
  return (
    <>
      <GlobalTimer />
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/quiz/login" element={<QuizLogin />} />
        <Route path="/quiz" element={<QuizMap />} />
        <Route path="/quiz/:stateCode" element={<QuizQuestion />} />
        <Route path="/admin/login" element={<AdminLogin />} />
        <Route path="/admin" element={<Admin />} />
        <Route path="/leaderboard" element={<Leaderboard />} />
        <Route path="/login" element={<Login />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/rounds/1" element={<RoundOne />} />
      </Routes>
    </>
  );
}
