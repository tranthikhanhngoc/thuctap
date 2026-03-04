import React, { useEffect, useState } from "react";
import axios from "axios";

const BookingManage = () => {
  const [bookings, setBookings] = useState([]);
  const [filtered, setFiltered] = useState([]);

  const [searchPatient, setSearchPatient] = useState("");
  const [searchDoctor, setSearchDoctor] = useState("");
  const [searchDate, setSearchDate] = useState("");
  const [statusFilter, setStatusFilter] = useState("");

  const token = localStorage.getItem("access_token");

  useEffect(() => {
    fetchBookings();
  }, []);

  useEffect(() => {
    applyFilter();
  }, [searchPatient, searchDoctor, searchDate, statusFilter, bookings]);

  // ================= FETCH DATA =================
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

  // ================= FILTER =================
  const applyFilter = () => {
    let data = [...bookings];

    if (searchPatient) {
      data = data.filter((b) =>
        (b.ten_benhnhan || "")
          .toLowerCase()
          .includes(searchPatient.trim().toLowerCase())
      );
    }

    if (searchDoctor) {
      data = data.filter((b) =>
        (b.ten_bacsi || "")
          .toLowerCase()
          .includes(searchDoctor.trim().toLowerCase())
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

  // ================= STATUS COLOR =================
  const getStatusColor = (status) => {
    switch (status) {
      case "CHO_XAC_NHAN":
        return "bg-yellow-100 text-yellow-700";
      case "DA_HUY":
        return "bg-red-100 text-red-700";
      case "DA_XAC_NHAN":
        return "bg-green-100 text-green-700";
      default:
        return "bg-gray-100";
    }
  };

  return (
    <div className="p-6 bg-gray-100 min-h-screen">
      <h2 className="text-2xl font-bold text-blue-600 mb-6">
        Quản lý lịch hẹn hệ thống
      </h2>

      {/* ================= FILTER SECTION ================= */}
      <div className="bg-white p-4 rounded-xl shadow mb-6 grid grid-cols-4 gap-4">
        <input
          type="text"
          placeholder="Tìm theo tên bệnh nhân"
          className="border p-2 rounded"
          value={searchPatient}
          onChange={(e) => setSearchPatient(e.target.value)}
        />

        <input
          type="text"
          placeholder="Tìm theo tên bác sĩ"
          className="border p-2 rounded"
          value={searchDoctor}
          onChange={(e) => setSearchDoctor(e.target.value)}
        />

        <input
          type="date"
          className="border p-2 rounded"
          value={searchDate}
          onChange={(e) => setSearchDate(e.target.value)}
        />

        <select
          className="border p-2 rounded"
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
        >
          <option value="">Tất cả trạng thái</option>
          <option value="CHO_XAC_NHAN">Chờ xác nhận</option>
          <option value="DA_XAC_NHAN">Đã xác nhận</option>
          <option value="DA_HUY">Đã hủy</option>
        </select>
      </div>

      {/* ================= TABLE ================= */}
      <div className="bg-white shadow rounded-xl overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-blue-500 text-white">
            <tr>
              <th className="p-3">ID</th>
              <th className="p-3">Bác sĩ</th>
              <th className="p-3">Bệnh nhân</th>
              <th className="p-3">Ngày</th>
              <th className="p-3">Ca</th>
              <th className="p-3">Lý do</th>
              <th className="p-3">Trạng thái</th>
            </tr>
          </thead>

          <tbody>
            {filtered.length > 0 ? (
              filtered.map((b) => (
                <tr key={b.id_cuochen} className="border-b hover:bg-gray-50">
                  <td className="p-3 text-center">{b.id_cuochen}</td>

                  <td className="p-3 text-center font-semibold text-blue-600">
                    {b.ten_bacsi || "—"}
                  </td>

                  <td className="p-3 text-center font-semibold text-purple-600">
                    {b.ten_benhnhan || "—"}
                  </td>

                  <td className="p-3 text-center">{b.ngay_hen}</td>

                  <td className="p-3 text-center capitalize">
                    {b.ca_lam_viec}
                  </td>

                  <td className="p-3">{b.ly_do}</td>

                  <td className="p-3 text-center">
                    <span
                      className={`px-3 py-1 rounded-full text-xs font-semibold ${getStatusColor(
                        b.trang_thai
                      )}`}
                    >
                      {b.trang_thai}
                    </span>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="7" className="text-center p-4 text-gray-500">
                  Không có dữ liệu
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default BookingManage;