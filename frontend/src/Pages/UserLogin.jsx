import { useState } from "react";
import api from "../Api/Axios";
import NavbarUser from "../Components/NavbarUser";
import Footer from "../Components/Footer";
import "../Styles/Layouts.css";

function UserLogin() {
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

      const res = await api.post("api/accounts/login/", formData);

      if (!res.data.approved) {
        alert(res.data.message);
        return;
      }

      // save username for dashboard
      localStorage.setItem("username", res.data.username);
      window.location.href = "/user-dashboard";
    } catch (err) {
      alert("Login failed");
    } finally {
      setLoading(false); // ✅ stop buffering
    }
  };

  return (
    <div className="app-container">
      <NavbarUser />

      <div
        className="page-content"
        style={{
          margin: "auto",
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          border: "2px solid #1d2671",
          borderRadius: "12px",
          padding: "20px",
          minHeight: "300px"
        }}
      >
        <form onSubmit={handleLogin}>
          <h1 style={{ textAlign: "center" }}>User Login</h1>

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

      <Footer />
    </div>
  );
}

export default UserLogin;
