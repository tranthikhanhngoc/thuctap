import React from "react";
import { useNavigate } from "react-router-dom";

const AdminHome = () => {
  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.clear();
    navigate("/login");
  };

  const username = localStorage.getItem("username") || "Admin";

  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-50 via-white to-pink-50 relative overflow-hidden">
      {/* Background accents */}
      <div className="absolute inset-0 -z-10 opacity-30 pointer-events-none">
        <div className="absolute top-20 right-20 w-[500px] h-[500px] bg-pink-200 rounded-full blur-3xl"></div>
        <div className="absolute bottom-10 left-10 w-[400px] h-[400px] bg-pink-100 rounded-full blur-3xl"></div>
      </div>

      {/* Sidebar Navigation */}
      <aside className="fixed top-0 left-0 h-full w-64 bg-white shadow-xl border-r border-pink-100 z-40 hidden md:block">
        <div className="p-6 border-b border-pink-100">
          <h1 className="text-2xl font-bold text-pink-500">BeHealthy Admin</h1>
          <p className="text-gray-500 text-sm mt-1">Quản trị hệ thống</p>
        </div>

        <nav className="p-4 space-y-2">
          <button
            onClick={() => navigate("/admin")}
            className="w-full flex items-center gap-3 px-4 py-3 rounded-xl bg-pink-50 text-pink-600 font-medium hover:bg-pink-100 transition"
          >
            <span className="text-xl">🏠</span> Dashboard
          </button>
          <button
            onClick={() => navigate("/admin/quan-ly-bac-si")}
            className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-gray-700 hover:bg-pink-50 hover:text-pink-600 transition"
          >
            <span className="text-xl">👨‍⚕️</span> Quản lý Bác sĩ
          </button>
          <button
            onClick={() => navigate("/admin/quan-ly-benh-nhan")}
            className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-gray-700 hover:bg-pink-50 hover:text-pink-600 transition"
          >
            <span className="text-xl">🧑‍🤝‍🧑</span> Quản lý Bệnh nhân
          </button>
          <button
            onClick={() => navigate("/admin/quan-ly-lich-kham")}
            className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-gray-700 hover:bg-pink-50 hover:text-pink-600 transition"
          >
            <span className="text-xl">📅</span> Quản lý Lịch khám
          </button>
          <button
            onClick={() => navigate("/admin/quan-ly-lich-hoc")}
            className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-gray-700 hover:bg-pink-50 hover:text-pink-600 transition"
          >
            <span className="text-xl">📚</span> Quản lý Lịch học
          </button>
          <button
            onClick={() => navigate("/admin/quan-ly-thuoc")}
            className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-gray-700 hover:bg-pink-50 hover:text-pink-600 transition"
          >
            <span className="text-xl"></span> Quản lý thuốc
          </button>
        </nav>

        <div className="absolute bottom-8 left-4 right-4">
          <button
            onClick={handleLogout}
            className="w-full bg-red-500 hover:bg-red-600 text-white py-3 rounded-xl font-medium transition flex items-center justify-center gap-2"
          >
            <span>🚪</span> Đăng xuất
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <div className="md:ml-64 min-h-screen">
        {/* Header */}
        <header className="bg-white shadow-sm border-b border-pink-100">
          <div className="max-w-7xl mx-auto px-6 py-4 flex justify-between items-center">
            <h2 className="text-2xl md:text-3xl font-bold text-gray-800">
              Quản trị viên hệ thống: <span className="text-pink-600">{username}</span>
            </h2>

            <div className="md:hidden">
              <button onClick={handleLogout} className="text-red-600 font-medium">
                Đăng xuất
              </button>
            </div>
          </div>
        </header>

        {/* Cards Grid */}
        <main className="p-6 md:p-10">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 md:gap-8">
            {/* Card 1: Quản lý bác sĩ */}
            <div className="bg-white rounded-2xl shadow-lg overflow-hidden hover:shadow-2xl hover:scale-[1.03] transition-all duration-300 border border-pink-100">
              <div className="h-2 bg-pink-500"></div>
              <div className="p-6 md:p-8">
                <div className="w-16 h-16 mb-6 flex items-center justify-center bg-pink-100 rounded-full text-pink-500 text-4xl shadow-inner mx-auto">
                  👨‍⚕️
                </div>
                <h3 className="text-xl md:text-2xl font-bold text-gray-800 mb-3 text-center">
                  Quản lý Bác sĩ
                </h3>
                <p className="text-gray-600 text-center mb-6">
                  Thêm, chỉnh sửa, xóa thông tin bác sĩ và lịch làm việc.
                </p>
                <button
                  onClick={() => navigate("/admin/quan-ly-bac-si")}
                  className="w-full bg-pink-500 hover:bg-pink-600 text-white py-3 rounded-xl font-semibold transition shadow-md"
                >
                  Truy cập ngay
                </button>
              </div>
            </div>

            {/* Card 2: Quản lý bệnh nhân */}
            <div className="bg-white rounded-2xl shadow-lg overflow-hidden hover:shadow-2xl hover:scale-[1.03] transition-all duration-300 border border-pink-100">
              <div className="h-2 bg-pink-500"></div>
              <div className="p-6 md:p-8">
                <div className="w-16 h-16 mb-6 flex items-center justify-center bg-pink-100 rounded-full text-pink-500 text-4xl shadow-inner mx-auto">
                  🧑‍🤝‍🧑
                </div>
                <h3 className="text-xl md:text-2xl font-bold text-gray-800 mb-3 text-center">
                  Quản lý Bệnh nhân
                </h3>
                <p className="text-gray-600 text-center mb-6">
                  Xem danh sách, cập nhật hồ sơ và theo dõi tình trạng.
                </p>
                <button
                  onClick={() => navigate("/admin/quan-ly-benh-nhan")}
                  className="w-full bg-pink-500 hover:bg-pink-600 text-white py-3 rounded-xl font-semibold transition shadow-md"
                >
                  Truy cập ngay
                </button>
              </div>
            </div>

            {/* Card 3: Quản lý lịch khám */}
            <div className="bg-white rounded-2xl shadow-lg overflow-hidden hover:shadow-2xl hover:scale-[1.03] transition-all duration-300 border border-pink-100">
              <div className="h-2 bg-pink-500"></div>
              <div className="p-6 md:p-8">
                <div className="w-16 h-16 mb-6 flex items-center justify-center bg-pink-100 rounded-full text-pink-500 text-4xl shadow-inner mx-auto">
                  📅
                </div>
                <h3 className="text-xl md:text-2xl font-bold text-gray-800 mb-3 text-center">
                  Quản lý Lịch khám
                </h3>
                <p className="text-gray-600 text-center mb-6">
                  Theo dõi, xác nhận, hủy lịch và báo cáo lịch sử.
                </p>
                <button
                  onClick={() => navigate("/admin/quan-ly-lich-kham")}
                  className="w-full bg-pink-500 hover:bg-pink-600 text-white py-3 rounded-xl font-semibold transition shadow-md"
                >
                  Truy cập ngay
                </button>
              </div>
            </div>

            {/* Card 4: Quản lý lịch học */}
            <div className="bg-white rounded-2xl shadow-lg overflow-hidden hover:shadow-2xl hover:scale-[1.03] transition-all duration-300 border border-pink-100">
              <div className="h-2 bg-pink-500"></div>
              <div className="p-6 md:p-8">
                <div className="w-16 h-16 mb-6 flex items-center justify-center bg-pink-100 rounded-full text-pink-500 text-4xl shadow-inner mx-auto">
                  📚
                </div>
                <h3 className="text-xl md:text-2xl font-bold text-gray-800 mb-3 text-center">
                  Quản lý Lịch học
                </h3>
                <p className="text-gray-600 text-center mb-6">
                  Thêm, chỉnh sửa lịch học và theo dõi tiến độ.
                </p>
                <button
                  onClick={() => navigate("/admin/quan-ly-lich-hoc")}
                  className="w-full bg-pink-500 hover:bg-pink-600 text-white py-3 rounded-xl font-semibold transition shadow-md"
                >
                  Truy cập ngay
                </button>
              </div>
            </div>
          </div>

          {/* Optional Stats or Welcome Note */}
          <div className="mt-12 text-center text-gray-600">
            <p className="text-lg">Chào mừng bạn đến với bảng điều khiển quản trị BeHealthy Clinic 🌸</p>
            <p className="mt-2">Hệ thống đang hoạt động ổn định. Hãy quản lý hiệu quả nhé!</p>
          </div>
        </main>
      </div>
    </div>
  );
};

export default AdminHome;