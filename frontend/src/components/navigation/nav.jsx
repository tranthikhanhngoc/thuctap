import React, { useState } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";

const Navbar = () => {
  const navigate = useNavigate();
  const location = useLocation();

  const token = localStorage.getItem("access_token");
  const username = localStorage.getItem("username");

  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const handleLogout = () => {
    localStorage.clear();
    navigate("/login");
  };

  const menu = [
    { name: "Trang chủ", path: "/" },
    { name: "Giới thiệu", path: "/about" },
    { name: "Liên hệ", path: "/contact" },
    { name: "Xem bác sĩ trực", path: "/patient/xem-bac-si-truc" }
  ];

  return (
    <nav className=" z-50 bg-white/95 backdrop-blur-md shadow-sm">
      <div className="max-w-7xl mx-auto px-6 md:px-10">
        <div className="flex justify-between items-center h-16 md:h-20">

          {/* Logo */}
          <div
            onClick={() => navigate("/")}
            className="text-3xl font-extrabold cursor-pointer"
          >
            <span className="text-pink-500">BeHealthy</span>
          </div>

          {/* Desktop Menu */}
          <div className="hidden md:flex items-center space-x-10">
            {menu.map((item) => (
              <Link
                key={item.path}
                to={item.path}
                className={`font-medium transition ${
                  location.pathname === item.path
                    ? "text-pink-500"
                    : "text-gray-800 hover:text-pink-500"
                }`}
              >
                {item.name}
              </Link>
            ))}

            {token && (
              <Link
                to="/patient/lich-su-dat-lich"
                className={`font-medium transition ${
                  location.pathname === "/patient/lich-su-dat-lich"
                    ? "text-pink-500"
                    : "text-gray-800 hover:text-pink-500"
                }`}
              >
                Lịch sử
              </Link>
            )}
          </div>

          {/* Right Side */}
          <div className="hidden md:flex items-center space-x-6">
            {token ? (
              <div className="flex items-center space-x-4">
                <span className="text-gray-700 font-medium">
                  Xin chào, {username}
                </span>

                <button
                  onClick={handleLogout}
                  className="text-gray-600 hover:text-pink-500 transition"
                >
                  Đăng xuất
                </button>
              </div>
            ) : (
              <>
                <button
                  onClick={() => navigate("/login")}
                  className="text-gray-800 hover:text-pink-500 font-medium transition"
                >
                  Đăng nhập
                </button>

                <button
                  onClick={() => navigate("/register")}
                  className="border border-pink-500 text-pink-500 px-4 py-2 rounded-md hover:bg-pink-500 hover:text-white transition"
                >
                  Đăng ký
                </button>
              </>
            )}

            <button
              onClick={() => navigate("/patient/appointment")}
              className="bg-pink-500 hover:bg-pink-600 text-white px-7 py-3 rounded-full shadow-lg font-semibold transition transform hover:scale-105"
            >
              Đặt lịch ngay
            </button>
          </div>

          {/* Mobile Menu Button */}
          <button
            className="md:hidden text-gray-800"
            onClick={() => setIsMenuOpen(!isMenuOpen)}
          >
            <svg
              className="w-9 h-9"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d={
                  isMenuOpen
                    ? "M6 18L18 6M6 6l12 12"
                    : "M4 6h16M4 12h16M4 18h16"
                }
              />
            </svg>
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      {isMenuOpen && (
        <div className="md:hidden bg-white border-t shadow-lg">
          <div className="px-6 py-6 space-y-5">

            {menu.map((item) => (
              <Link
                key={item.path}
                to={item.path}
                className="block text-gray-800 hover:text-pink-500 py-2"
                onClick={() => setIsMenuOpen(false)}
              >
                {item.name}
              </Link>
            ))}

            {token && (
              <Link
                to="/patient/lich-su-dat-lich"
                className="block text-gray-800 hover:text-pink-500 py-2"
                onClick={() => setIsMenuOpen(false)}
              >
                Lịch sử
              </Link>
            )}

            <div className="pt-4 border-t">

              {token ? (
                <>
                  <div className="text-gray-700 py-2">
                    Xin chào, {username}
                  </div>

                  <button
                    onClick={() => {
                      handleLogout();
                      setIsMenuOpen(false);
                    }}
                    className="block text-gray-600 hover:text-pink-500 py-2"
                  >
                    Đăng xuất
                  </button>
                </>
              ) : (
                <>
                  <Link
                    to="/login"
                    className="block text-gray-800 hover:text-pink-500 py-2"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    Đăng nhập
                  </Link>

                  <Link
                    to="/register"
                    className="block text-gray-800 hover:text-pink-500 py-2"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    Đăng ký
                  </Link>
                </>
              )}

              <button
                onClick={() => {
                  navigate("/patient/appointment");
                  setIsMenuOpen(false);
                }}
                className="block mt-6 bg-pink-500 hover:bg-pink-600 text-white text-center py-4 rounded-full shadow-lg font-semibold w-full"
              >
                Đặt lịch ngay
              </button>

              

            </div>
          </div>
        </div>
      )}
    </nav>
  );
};

export default Navbar;