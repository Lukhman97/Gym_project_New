import { useState } from "react";
import api from "../Api/Axios";
import "../Styles/TrainerLogin.css";

function TrainerLogin() {
  const [trainerId, setTrainerId] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false); // ✅ loading state

  const handleLogin = async (e) => {
    e.preventDefault();

    if (!trainerId || !password) {
      alert("Trainer ID and Password required");
      return;
    }

    setLoading(true); // ✅ start buffering

    const formData = new FormData();
    formData.append("trainer_id", trainerId);
    formData.append("password", password);

    try {
      const res = await api.post("/api/accounts/trainer/login/", formData);
      localStorage.setItem("trainer_id", res.data.trainer_id);
      window.location.href = "/trainer-dashboard";
    } catch {
      alert("Trainer login failed");
    } finally {
      setLoading(false); // ✅ stop buffering
    }
  };

  return (
    <div className="trainer-login-page">
      <div className="trainer-login-card">
        <h2>Trainer Login</h2>

        <form onSubmit={handleLogin}>
          <input
            placeholder="Trainer ID"
            value={trainerId}
            onChange={(e) => setTrainerId(e.target.value)}
            disabled={loading}
          />

          <input
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            disabled={loading}
          />

          <button type="submit" disabled={loading}>
            {loading ? "Logging in..." : "Login"}
          </button>

          {/* ✅ Optional spinner */}
          {loading && <div className="spinner"></div>}
        </form>
      </div>
    </div>
  );
}

export default TrainerLogin;
