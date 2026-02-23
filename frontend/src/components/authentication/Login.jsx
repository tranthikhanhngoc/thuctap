import React, { useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";

const Login = () => {
  const navigate = useNavigate();

  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const res = await axios.post(
        "http://127.0.0.1:8000/users/login",
        { username, password }
      );

      if (res.data.access_token) {
        const token = res.data.access_token;
        const role = res.data.user.role;
        const usernameRes = res.data.user.username;

        // lưu localStorage
        localStorage.setItem("access_token", token);
        localStorage.setItem("role", role);
        localStorage.setItem("username", usernameRes);

        // điều hướng theo role
        if (role === "admin") {
          navigate("/admin");
        } 
        else if (role === "bacsi") {
          navigate("/bacsi");
        } 
        else {
          navigate("/home");
        }
      }

    } catch (err) {
      console.error(err);

      const message =
        err.response?.data?.detail ||
        err.response?.data?.message ||
        "Đăng nhập thất bại";

      setError(
        typeof message === "string"
          ? message
          : JSON.stringify(message)
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-purple-50 via-pink-50 to-indigo-100 px-4 py-12">
      <div className="w-full max-w-3xl bg-white rounded-3xl shadow-2xl overflow-hidden">

        <div className="bg-gradient-to-r from-purple-600 to-indigo-600 px-10 py-12 text-center text-white">
          <h2 className="text-4xl font-extrabold">Đăng nhập</h2>
          <p className="mt-3 text-purple-100 text-lg">
            Hệ thống quản lý hồ sơ bệnh nhân
          </p>
        </div>

        <div className="px-10 py-12">

          {error && (
            <div className="mb-8 bg-red-50 border border-red-200 text-red-700 px-6 py-4 rounded-2xl">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-8">

            <div>
              <label className="block font-semibold mb-2">
                Username
              </label>

              <input
                type="text"
                placeholder="Nhập username"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                required
                className="w-full px-5 py-3 border rounded-xl"
              />
            </div>

            <div>
              <label className="block font-semibold mb-2">
                Password
              </label>

              <input
                type="password"
                placeholder="Nhập mật khẩu"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="w-full px-5 py-3 border rounded-xl"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-4 text-white font-bold text-lg rounded-xl
              bg-gradient-to-r from-purple-600 to-indigo-600 hover:opacity-90"
            >
              {loading ? "Đang đăng nhập..." : "Đăng nhập"}
            </button>

          </form>
        </div>
      </div>
    </div>
  );
};

export default Login;