import React from "react";

const AdminHome = () => {
  const handleLogout = () => {
    localStorage.clear();
    window.location.href = "/login";
  };

  return (
    <div className="min-h-screen bg-gray-100">

      {/* Header */}
      <div className="w-full bg-red-600 text-white p-4 flex justify-between items-center shadow">
        <h1 className="text-2xl font-bold">Admin Dashboard</h1>

        <button
          onClick={handleLogout}
          className="bg-white text-red-600 px-4 py-2 rounded-lg font-semibold hover:bg-gray-200"
        >
          Đăng xuất
        </button>
      </div>

      {/* Content */}
      <div className="p-10">

        <h2 className="text-3xl font-bold text-gray-800 mb-8">
          Trang quản trị hệ thống
        </h2>

        {/* Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">

          {/* Quản lý bác sĩ */}
          <div className="bg-white p-6 rounded-2xl shadow hover:shadow-lg transition">
            <h3 className="text-xl font-semibold mb-3 text-red-600">
              Quản lý bác sĩ
            </h3>
            <p className="text-gray-600 mb-4">
              Thêm, sửa, xóa thông tin bác sĩ trong hệ thống.
            </p>

            <button className="bg-red-500 text-white px-4 py-2 rounded-lg hover:bg-red-600">
              Truy cập
            </button>
          </div>

          {/* Quản lý bệnh nhân */}
          <div className="bg-white p-6 rounded-2xl shadow hover:shadow-lg transition">
            <h3 className="text-xl font-semibold mb-3 text-red-600">
              Quản lý bệnh nhân
            </h3>
            <p className="text-gray-600 mb-4">
              Xem danh sách và quản lý thông tin bệnh nhân.
            </p>

            <button className="bg-red-500 text-white px-4 py-2 rounded-lg hover:bg-red-600">
              Truy cập
            </button>
          </div>

          {/* Quản lý lịch khám */}
          <div className="bg-white p-6 rounded-2xl shadow hover:shadow-lg transition">
            <h3 className="text-xl font-semibold mb-3 text-red-600">
              Quản lý lịch khám
            </h3>
            <p className="text-gray-600 mb-4">
              Theo dõi và quản lý lịch khám bệnh.
            </p>

            <button className="bg-red-500 text-white px-4 py-2 rounded-lg hover:bg-red-600">
              Truy cập
            </button>
          </div>

        </div>
      </div>
    </div>
  );
};

export default AdminHome;