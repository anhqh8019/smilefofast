import { useEffect, useState } from "react";
import MainScreen from "./MainScreen";
import { getCurrentUser, login, logout } from "./api/authApi";
import type { AuthUser } from "./api/authApi";
import "./App.css";

function App() {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [checking, setChecking] = useState(true);
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    getCurrentUser()
      .then(setUser)
      .catch(() => setUser(null))
      .finally(() => setChecking(false));
  }, []);

  async function handleLogin(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!username.trim() || !password) {
      setError("Vui lòng nhập tên đăng nhập và mật khẩu.");
      return;
    }
    try {
      setSubmitting(true);
      setError("");
      const loggedInUser = await login(username.trim(), password);
      setUser(loggedInUser);
      setPassword("");
    } catch (e) {
      setError(e instanceof Error ? e.message : "Đăng nhập thất bại.");
    } finally {
      setSubmitting(false);
    }
  }

  async function handleLogout() {
    try {
      await logout();
    } finally {
      setUser(null);
      setPassword("");
    }
  }

  if (checking) {
    return <div className="auth-loading">Đang kiểm tra đăng nhập...</div>;
  }

  if (!user) {
    return (
      <div className="login-page">
        <form className="login-card" onSubmit={handleLogin}>
          <div className="login-brand">SMILE FO → FAST</div>
          <h1>Đăng nhập</h1>
          <p>Hệ thống xuất hóa đơn Smile FO sang FAST</p>

          <label htmlFor="username">Tên đăng nhập</label>
          <input id="username" autoFocus autoComplete="username" value={username}
            onChange={(e) => setUsername(e.target.value)} />

          <label htmlFor="password">Mật khẩu</label>
          <input id="password" type="password" autoComplete="current-password" value={password}
            onChange={(e) => setPassword(e.target.value)} />

          {error && <div className="login-error">{error}</div>}

          <button type="submit" disabled={submitting}>
            {submitting ? "ĐANG ĐĂNG NHẬP..." : "ĐĂNG NHẬP"}
          </button>
        </form>
      </div>
    );
  }

  return (
    <div>
      <div className="user-bar">
        <span>{user.fullName || user.username} ({user.username})</span>
        <button onClick={handleLogout}>ĐĂNG XUẤT</button>
      </div>
      <MainScreen />
    </div>
  );
}

export default App;
