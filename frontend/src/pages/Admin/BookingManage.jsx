  import React, { useEffect, useState } from "react";
  import axios from "axios";
  import { useNavigate } from "react-router-dom"; // Thêm để quay về

  const BookingManage = () => {
    const [bookings, setBookings] = useState([]);
    const [filtered, setFiltered] = useState([]);

    const [searchPatient, setSearchPatient] = useState("");
    const [searchDoctor, setSearchDoctor] = useState("");
    const [searchDate, setSearchDate] = useState("");
    const [statusFilter, setStatusFilter] = useState("");

    const token = localStorage.getItem("access_token");
    const navigate = useNavigate();

    useEffect(() => {
      fetchBookings();
    }, []);

    useEffect(() => {
      applyFilter();
    }, [searchPatient, searchDoctor, searchDate, statusFilter, bookings]);

    const fetchBookings = async () => {
      try {
        const res = await axios.get("http://localhost:8000/booking/", {
          headers: { Authorization: `Bearer ${token}` },
        });
        setBookings(res.data || []);
        setFiltered(res.data || []);
      } catch (err) {
        console.error("Lỗi lấy danh sách lịch hẹn:", err);
      }
    };

    const confirmBooking = async (id) => {
    try {
      await axios.patch(
        `http://localhost:8000/booking/confirm/${id}`,
        {},
        { headers: { Authorization: `Bearer ${token}` } }
      );

      fetchBookings();

    } catch (err) {
      console.error("Lỗi xác nhận lịch:", err);
    }
  };
  const cancelBooking = async (id) => {
  try {
    await axios.patch(
      `http://localhost:8000/booking/cancel/${id}`,
      {},
      { headers: { Authorization: `Bearer ${token}` } }
    );

    fetchBookings();

  } catch (err) {
    console.error("Lỗi hủy lịch:", err);
  }
};

    const applyFilter = () => {
      let data = [...bookings];

      if (searchPatient) {
        data = data.filter((b) =>
          (b.ten_benhnhan || "").toLowerCase().includes(searchPatient.trim().toLowerCase())
        );
      }

      if (searchDoctor) {
        data = data.filter((b) =>
          (b.ten_bacsi || "").toLowerCase().includes(searchDoctor.trim().toLowerCase())
        );
      }

      if (searchDate) {
        data = data.filter((b) => b.ngay_hen === searchDate);
      }

      if (statusFilter) {
        data = data.filter((b) => b.trang_thai === statusFilter);
      }

      setFiltered(data);
    };

    const getStatusBadge = (status) => {
      let color = "";
      switch (status) {
        case "CHO_XAC_NHAN":
          color = "bg-yellow-100 text-yellow-800 border-yellow-300";
          break;
        case "DA_XAC_NHAN":
          color = "bg-green-100 text-green-800 border-green-300";
          break;
        case "DA_HUY":
          color = "bg-red-100 text-red-800 border-red-300";
          break;
        default:
          color = "bg-gray-100 text-gray-800 border-gray-300";
      }
      return `px-4 py-1.5 rounded-full text-xs font-semibold border ${color}`;
    };

    return (
      <div className="min-h-screen bg-gradient-to-br from-pink-50 via-white to-pink-50 relative overflow-hidden">
        {/* Background accents */}
        <div className="absolute inset-0 -z-10 opacity-30 pointer-events-none">
          <div className="absolute top-40 right-20 w-96 h-96 bg-pink-200 rounded-full blur-3xl"></div>
          <div className="absolute bottom-20 left-20 w-80 h-80 bg-pink-100 rounded-full blur-3xl"></div>
        </div>

        {/* Sidebar (đồng bộ với AdminHome) */}
        <aside className="fixed top-0 left-0 h-full w-64 bg-white shadow-xl border-r border-pink-100 z-40 hidden md:block">
          <div className="p-6 border-b border-pink-100">
            <h1 className="text-2xl font-bold text-pink-500">BeHealthy Admin</h1>
            <p className="text-gray-500 text-sm mt-1">Quản trị hệ thống</p>
          </div>

          <nav className="p-4 space-y-2">
            <button
              onClick={() => navigate("/admin")}
              className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-gray-700 hover:bg-pink-50 hover:text-pink-600 transition"
            >
              <span className="text-xl">🏠</span> Dashboard
            </button>
            <button
              onClick={() => navigate("/admin/quan-ly-lich-kham")}
              className="w-full flex items-center gap-3 px-4 py-3 rounded-xl bg-pink-50 text-pink-600 font-medium hover:bg-pink-100 transition"
            >
              <span className="text-xl">📅</span> Quản lý Lịch hẹn
            </button>
            {/* Các menu khác... */}
          </nav>

          <div className="absolute bottom-8 left-4 right-4">
            <button
              onClick={() => {
                localStorage.clear();
                navigate("/login");
              }}
              className="w-full bg-red-500 hover:bg-red-600 text-white py-3 rounded-xl font-medium transition flex items-center justify-center gap-2"
            >
              <span>🚪</span> Đăng xuất
            </button>
          </div>
        </aside>

        {/* Main Content */}
        <div className="md:ml-64 min-h-screen">
          {/* Header với nút Quay về */}
          <header className="bg-white shadow-sm border-b border-pink-100 sticky top-0 z-30">
            <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
              <div className="flex items-center gap-4">
                <button
                  onClick={() => navigate(-1)} // Quay về trang trước
                  className="flex items-center gap-2 bg-pink-100 hover:bg-pink-200 text-pink-700 px-5 py-2.5 rounded-xl font-medium transition shadow-sm"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7" />
                  </svg>
                  Quay về
                </button>

                <h2 className="text-2xl md:text-3xl font-bold text-gray-800">
                  Quản lý lịch hẹn hệ thống
                </h2>
              </div>
            </div>
          </header>

          <main className="p-6 md:p-10">
            {/* Filter Section */}
            <div className="bg-white p-6 md:p-8 rounded-2xl shadow-lg mb-8 border border-pink-100">
              <h3 className="text-xl font-semibold text-gray-800 mb-6">Bộ lọc tìm kiếm</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
                <input
                  type="text"
                  placeholder="Tìm theo tên bệnh nhân"
                  className="border border-gray-300 p-3 rounded-xl focus:outline-none focus:ring-2 focus:ring-pink-400 focus:border-pink-400 transition"
                  value={searchPatient}
                  onChange={(e) => setSearchPatient(e.target.value)}
                />
                <input
                  type="text"
                  placeholder="Tìm theo tên bác sĩ"
                  className="border border-gray-300 p-3 rounded-xl focus:outline-none focus:ring-2 focus:ring-pink-400 focus:border-pink-400 transition"
                  value={searchDoctor}
                  onChange={(e) => setSearchDoctor(e.target.value)}
                />
                <input
                  type="date"
                  className="border border-gray-300 p-3 rounded-xl focus:outline-none focus:ring-2 focus:ring-pink-400 focus:border-pink-400 transition"
                  value={searchDate}
                  onChange={(e) => setSearchDate(e.target.value)}
                />
                <select
                  className="border border-gray-300 p-3 rounded-xl focus:outline-none focus:ring-2 focus:ring-pink-400 focus:border-pink-400 transition bg-white"
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                >
                  <option value="">Tất cả trạng thái</option>
                  <option value="CHO_XAC_NHAN">Chờ xác nhận</option>
                  <option value="DA_XAC_NHAN">Đã xác nhận</option>
                  <option value="DA_HUY">Đã hủy</option>
                </select>
              </div>
            </div>

            {/* Table */}
            <div className="bg-white rounded-2xl shadow-lg overflow-hidden border border-pink-100">
              <table className="w-full text-sm text-left">
                <thead className="bg-pink-500 text-white">
                  <tr>
                    <th className="p-4 font-semibold">ID</th>
                    <th className="p-4 font-semibold">Bác sĩ</th>
                    <th className="p-4 font-semibold">Bệnh nhân</th>
                    <th className="p-4 font-semibold">Ngày hẹn</th>
                    <th className="p-4 font-semibold">Ca</th>
                    <th className="p-4 font-semibold">Lý do</th>
                   <th className="p-4 font-semibold text-center">Trạng thái</th>
<th className="p-4 font-semibold text-center">Hành động</th>
                  </tr>
                </thead>
                <tbody>
                  {filtered.length > 0 ? (
                    filtered.map((b) => (
                      <tr
                        key={b.id_cuochen}
                        className="border-b border-gray-100 hover:bg-pink-50 transition duration-200"
                      >
                        <td className="p-4 text-gray-700 font-medium">{b.id_cuochen}</td>
                        <td className="p-4 text-gray-800 font-semibold">{b.ten_bacsi || "—"}</td>
                        <td className="p-4 text-gray-800 font-semibold">{b.ten_benhnhan || "—"}</td>
                        <td className="p-4 text-gray-700">{b.ngay_hen}</td>
                        <td className="p-4 text-gray-700 capitalize">{b.ca_lam_viec}</td>
                        <td className="p-4 text-gray-600">{b.ly_do || "Không có lý do"}</td>
                        <td className="p-4 text-center">
                          <span className={getStatusBadge(b.trang_thai)}>
                            {b.trang_thai.replace(/_/g, " ")}
                          </span>
                        </td>
                        <td className="p-4 text-center space-x-2">

  {b.trang_thai === "CHO_XAC_NHAN" && (
    <button
      onClick={() => confirmBooking(b.id_cuochen)}
      className="bg-green-500 hover:bg-green-600 text-white px-3 py-1.5 rounded-lg text-xs font-medium transition"
    >
      Xác nhận
    </button>
  )}

  {b.trang_thai !== "DA_HUY" && (
    <button
      onClick={() => cancelBooking(b.id_cuochen)}
      className="bg-red-500 hover:bg-red-600 text-white px-3 py-1.5 rounded-lg text-xs font-medium transition"
    >
      Hủy
    </button>
  )}

</td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan="8" className="text-center p-10 text-gray-500 text-lg">
                        Không tìm thấy lịch hẹn nào phù hợp 🌸
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </main>
        </div>
      </div>
    );
  };

  export default BookingManage;