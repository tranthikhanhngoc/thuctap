import React, { useState } from "react";
import axios from "axios";

const Login = () => {
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
        { username, password },
        { headers: { "Content-Type": "application/json" } }
      );

      if (res.data.access_token) {
        localStorage.setItem("access_token", res.data.access_token);
      }

      alert("Đăng nhập thành công 🎉");
    } catch (err) {
      setError(err.response?.data?.detail || "Đăng nhập thất bại");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-purple-50 via-pink-50 to-indigo-100 px-4 py-12">
      <div className="w-full max-w-3xl bg-white/90 backdrop-blur-lg rounded-3xl shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="bg-gradient-to-r from-purple-600 to-indigo-600 px-10 py-12 text-center text-white">
          <h2 className="text-4xl font-extrabold tracking-tight">
            Đăng nhập
          </h2>
          <p className="mt-3 text-purple-100 text-lg">
            Chào mừng trở lại! Quản lý hồ sơ bệnh nhân thông minh và an toàn
          </p>
        </div>

        <div className="px-10 py-12">
          {/* Error message */}
          {error && (
            <div className="mb-8 bg-red-50 border border-red-200 text-red-700 px-6 py-4 rounded-2xl">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-10">
            {/* Thông tin đăng nhập */}
            <div>
              <h3 className="text-2xl font-bold text-gray-800 mb-6">
                🔐 Thông tin tài khoản
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Username <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    placeholder="Nhập tên đăng nhập"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    required
                    className="w-full px-5 py-4 bg-gray-50 border border-gray-300 rounded-2xl 
                               focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent 
                               transition duration-200 placeholder-gray-400"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Mật khẩu <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="password"
                    placeholder="Nhập mật khẩu"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    className="w-full px-5 py-4 bg-gray-50 border border-gray-300 rounded-2xl 
                               focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent 
                               transition duration-200 placeholder-gray-400"
                  />
                </div>
              </div>
            </div>

            {/* Submit button */}
            <button
              type="submit"
              disabled={loading}
              className="w-full py-4 rounded-2xl text-white font-bold text-xl
                         bg-gradient-to-r from-purple-600 to-indigo-600
                         hover:from-purple-700 hover:to-indigo-700
                         focus:outline-none focus:ring-4 focus:ring-purple-300
                         shadow-xl transform transition hover:scale-[1.02] disabled:opacity-70 disabled:cursor-not-allowed"
            >
              {loading ? (
                <span className="flex items-center justify-center">
                  <svg
                    className="animate-spin -ml-1 mr-3 h-5 w-5 text-white"
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                  >
                    <circle
                      className="opacity-25"
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="currentColor"
                      strokeWidth="4"
                    ></circle>
                    <path
                      className="opacity-75"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                    ></path>
                  </svg>
                  Đang đăng nhập...
                </span>
              ) : (
                "Đăng nhập ngay"
              )}
            </button>

            <p className="text-center text-gray-600">
              Chưa có tài khoản?{" "}
              <span className="text-purple-600 font-semibold hover:underline cursor-pointer">
                Đăng ký ngay
              </span>
            </p>
          </form>
        </div>
      </div>
    </div>
  );
};

export default Login;