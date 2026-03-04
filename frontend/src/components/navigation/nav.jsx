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
    { name: "Home", path: "/" },
    { name: "About", path: "/about" },
    { name: "Appointment", path: "/patient/lich-su-dat-lich" },
    { name: "Contact", path: "/contact" },
  ];

  return (
    <nav className="w-full bg-white shadow-sm">
      <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
        
        {/* Logo */}
        <div
          onClick={() => navigate("/")}
          className="text-2xl font-bold cursor-pointer"
        >
          <span className="text-pink-600">Be</span>
          <span className="text-gray-800">Healthy</span>
        </div>

        {/* Menu */}
        <ul className="hidden md:flex gap-8 font-medium text-gray-600">
          {menu.map((item) => (
            <li key={item.path}>
              <Link
                to={item.path}
                className={`hover:text-pink-500 transition ${
                  location.pathname === item.path
                    ? "text-pink-500 border-b-2 border-pink-500 pb-1"
                    : ""
                }`}
              >
                {item.name}
              </Link>
            </li>
          ))}
        </ul>

        {/* Right side buttons */}
        <div className="flex items-center gap-4">
          
          {/* Appointment */}
          <button
            onClick={() => navigate("/appointment")}
            className="bg-pink-500 hover:bg-pink-600 text-white px-5 py-2 rounded-md shadow-md transition"
          >
            APPOINTMENT
          </button>

          {/* Auth Section */}
          {!token ? (
            <>
              <button
                onClick={() => navigate("/login")}
                className="text-gray-600 hover:text-pink-500"
              >
                Login
              </button>

              <button
                onClick={() => navigate("/register")}
                className="border border-pink-500 text-pink-500 px-4 py-1 rounded-md hover:bg-pink-500 hover:text-white transition"
              >
                Register
              </button>
            </>
          ) : (
            <>
              <span className="text-gray-700 font-medium">
                👋 {username}
              </span>

              <button
                onClick={handleLogout}
                className="text-red-500 hover:text-red-600 font-medium"
              >
                Logout
              </button>
            </>
          )}
        </div>
      </div>
    </nav>
  );
};

export default Navbar;