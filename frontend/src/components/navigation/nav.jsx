import React from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";

const Navbar = () => {
  const navigate = useNavigate();
  const location = useLocation();

  const token = localStorage.getItem("access_token");
  const username = localStorage.getItem("username");

  const handleLogout = () => {
    localStorage.clear();
    navigate("/login");
  };

  const menu = [
    { name: "Trang chủ", path: "/" },
    { name: "Giới thiệu", path: "/about" },
    { name: "Liên hệ", path: "/contact" },
    { name: "Xem bác sĩ trực", path: "/patient/xem-bac-si-truc" },
    { name: "Xem danh sách thuốc", path: "/patient/xem-danh-sach-thuoc" },
  ];

  return (
    <nav className="sticky top-0 z-50 bg-white shadow-sm border-b border-pink-100">
      <div className="mx-auto px-6 md:px-10">
        <div className="flex justify-between items-center h-20">

          {/* Logo */}
          <div
            onClick={() => navigate("/")}
            className="text-3xl font-extrabold cursor-pointer"
          >
            <span className="text-pink-500">BeHealthy</span>
          </div>

          {/* Menu */}
          <div className="flex items-center space-x-8">
            {menu.map((item) => (
              <Link
                key={item.path}
                to={item.path}
                className={`font-medium transition ${
                  location.pathname === item.path
                    ? "text-pink-500 font-semibold"
                    : "text-gray-700 hover:text-pink-500"
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
                    ? "text-pink-500 font-semibold"
                    : "text-gray-700 hover:text-pink-500"
                }`}
              >
                📋 Lịch sử đặt lịch
              </Link>
            )}
          </div>

          {/* Right Side */}
          <div className="flex items-center space-x-6">
            {token ? (
              <div className="flex items-center space-x-4">
                <span className="text-gray-700 font-medium">
                  Xin chào, <span className="text-pink-600">{username}</span>
                </span>

                <button
                  onClick={handleLogout}
                  className="text-gray-600 hover:text-pink-500 font-medium transition"
                >
                  Đăng xuất
                </button>
              </div>
            ) : (
              <>
                <button
                  onClick={() => navigate("/login")}
                  className="text-gray-700 hover:text-pink-500 font-medium transition"
                >
                  Đăng nhập
                </button>

                <button
                  onClick={() => navigate("/register")}
                  className="border border-pink-500 text-pink-500 px-5 py-2 rounded-xl hover:bg-pink-500 hover:text-white transition font-medium"
                >
                  Đăng ký
                </button>
              </>
            )}

            <button
              onClick={() => navigate("/patient/appointment")}
              className="bg-pink-500 hover:bg-pink-600 text-white px-6 py-2 rounded-xl font-semibold transition"
            >
              Đặt lịch ngay
            </button>
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;