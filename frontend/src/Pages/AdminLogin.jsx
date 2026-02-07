import { useState } from "react";
import api from "../Api/Axios";
import "../Styles/Auth.css";

function AdminLogin() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false); // ✅ loading state

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true); // ✅ start buffering

    try {
      const formData = new FormData();
      formData.append("username", username);
      formData.append("password", password);

      const res = await api.post("/api/admin/login/", formData);

      alert(res.data.message);
      window.location.href = "/admin-dashboard";
    } catch (err) {
      alert("Login failed");
    } finally {
      setLoading(false); // ✅ stop buffering
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-card">
        <h2>Admin Login</h2>

        <form onSubmit={handleLogin}>
          <input
            placeholder="Username"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
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

export default AdminLogin;
