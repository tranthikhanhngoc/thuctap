import React from "react";
import { useNavigate } from "react-router-dom";

const UserHome = () => {

  const username = localStorage.getItem("username");
  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.clear();
    navigate("/login");
  };

  return (

    <div className="min-h-screen bg-gray-100">

      {/* Header */}
      <div className="w-full bg-indigo-600 text-white p-4 flex justify-between items-center shadow">

        <h1 className="text-2xl font-bold">
          Hệ thống quản lý bệnh nhân
        </h1>

        <div className="flex items-center gap-4">

          <span className="font-medium">
            Xin chào, {username || "User"}
          </span>

          <button
            onClick={handleLogout}
            className="bg-white text-indigo-600 px-4 py-2 rounded-lg font-semibold hover:bg-gray-200"
          >
            Đăng xuất
          </button>

        </div>
      </div>

      {/* Content */}
      <div className="p-10">

        <h2 className="text-3xl font-bold text-gray-800 mb-8">
          Trang người dùng
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">

          {/* Hồ sơ bệnh nhân */}
          <div className="bg-white p-6 rounded-2xl shadow hover:shadow-lg transition">

            <h3 className="text-xl font-semibold mb-3 text-indigo-600">
              Hồ sơ bệnh nhân
            </h3>

            <p className="text-gray-600 mb-4">
              Xem và quản lý thông tin hồ sơ bệnh án của bạn.
            </p>

            <button
              onClick={() => navigate("/patient/ho-so-benh-nhan")}
              className="bg-indigo-500 text-white px-4 py-2 rounded-lg hover:bg-indigo-600"
            >
              Xem hồ sơ
            </button>

          </div>

          {/* Đặt lịch khám */}
          <div className="bg-white p-6 rounded-2xl shadow hover:shadow-lg transition">

            <h3 className="text-xl font-semibold mb-3 text-indigo-600">
              Đặt lịch khám
            </h3>

            <p className="text-gray-600 mb-4">
              Đặt lịch khám với bác sĩ trong hệ thống.
            </p>

            <button
              onClick={() => navigate("/patient/appointment")}
              className="bg-indigo-500 text-white px-4 py-2 rounded-lg hover:bg-indigo-600"
            >
              Đặt lịch
            </button>

          </div>

          {/* Lịch sử đặt lịch */}
          <div className="bg-white p-6 rounded-2xl shadow hover:shadow-lg transition">

            <h3 className="text-xl font-semibold mb-3 text-indigo-600">
              Lịch sử đặt lịch
            </h3>

            <p className="text-gray-600 mb-4">
              Xem lại các lịch hẹn khám bạn đã đặt.
            </p>

            <button
              onClick={() => navigate("/patient/lich-su-dat-lich")}
              className="bg-indigo-500 text-white px-4 py-2 rounded-lg hover:bg-indigo-600"
            >
              Xem lịch hẹn
            </button>

          </div>

          {/* Lịch sử khám */}
          <div className="bg-white p-6 rounded-2xl shadow hover:shadow-lg transition">

            <h3 className="text-xl font-semibold mb-3 text-indigo-600">
              Lịch sử khám
            </h3>

            <p className="text-gray-600 mb-4">
              Xem lại các lần khám bệnh trước đây.
            </p>

            <button
              onClick={() => navigate("/patient/lich-su")}
              className="bg-indigo-500 text-white px-4 py-2 rounded-lg hover:bg-indigo-600"
            >
              Xem lịch sử
            </button>

          </div>

        </div>

      </div>

    </div>

  );

};

export default UserHome;