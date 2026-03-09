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
        const id_benhnhan = res.data.user.id_benhnhan;

        localStorage.setItem("access_token", token);
        localStorage.setItem("role", role);
        localStorage.setItem("username", usernameRes);
        localStorage.setItem("id_benhnhan", id_benhnhan);

        if (role === "admin") navigate("/admin");
        else if (role === "bacsi") navigate("/bacsi");
        else navigate("/home");
      }

    } catch (err) {
      const message =
        err.response?.data?.detail ||
        err.response?.data?.message ||
        "Đăng nhập thất bại";

      setError(typeof message === "string" ? message : JSON.stringify(message));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-pink-50 via-white to-pink-100 px-4">

      {/* Card */}
      <div className="w-full max-w-md bg-white rounded-3xl shadow-2xl p-10">

        {/* Title */}
        <div className="text-center mb-8">
          <h2 className="text-4xl font-extrabold text-pink-500">
            BeHealthy
          </h2>
          <p className="text-gray-500 mt-2">
            Đăng nhập hệ thống đặt lịch khám
          </p>
        </div>

        {/* Error */}
        {error && (
          <div className="mb-6 bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-xl text-sm">
            {error}
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-6">

          {/* Username */}
          <div>
            <label className="text-gray-700 font-medium block mb-2">
              Username
            </label>

            <input
              type="text"
              placeholder="Nhập username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              required
              className="w-full px-4 py-3 border border-gray-200 rounded-xl
              focus:outline-none focus:ring-2 focus:ring-pink-400
              focus:border-pink-400 transition"
            />
          </div>

          {/* Password */}
          <div>
            <label className="text-gray-700 font-medium block mb-2">
              Password
            </label>

            <input
              type="password"
              placeholder="Nhập mật khẩu"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              className="w-full px-4 py-3 border border-gray-200 rounded-xl
              focus:outline-none focus:ring-2 focus:ring-pink-400
              focus:border-pink-400 transition"
            />
          </div>

          {/* Button */}
          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 text-white font-bold rounded-xl
            bg-pink-500 hover:bg-pink-600 transition
            shadow-lg hover:shadow-xl"
          >
            {loading ? "Đang đăng nhập..." : "Đăng nhập"}
          </button>

        </form>

        {/* Extra */}
        <p className="text-center text-gray-400 text-sm mt-6">
          © 2026 BeHealthy
        </p>

      </div>
    </div>
  );
};

export default Login;