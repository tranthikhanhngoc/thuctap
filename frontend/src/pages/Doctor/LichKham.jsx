import React, { useEffect, useState } from "react";
import axios from "axios";
import BacSiLayout from "../../components/BacsiLayout";

const API = "http://127.0.0.1:8000";

const LichKham = () => {

  const [bookings, setBookings] = useState([]);
  const [searchName, setSearchName] = useState("");
  const [filterDate, setFilterDate] = useState("");
  const [filterStatus, setFilterStatus] = useState("");

  const token = localStorage.getItem("access_token");

  // =============================
  // LẤY DANH SÁCH LỊCH
  // =============================
  const fetchBookings = async () => {
    try {

      const res = await axios.get(`${API}/booking`, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });

      setBookings(res.data);

    } catch (err) {
      console.log("Lỗi lấy lịch:", err);
    }
  };

  useEffect(() => {
    fetchBookings();
  }, []);

  // =============================
  // XÁC NHẬN LỊCH
  // =============================
  const confirmBooking = async (id) => {

    try {

      await axios.patch(
        `${API}/booking/confirm/${id}`,
        {},
        {
          headers: {
            Authorization: `Bearer ${token}`
          }
        }
      );

      fetchBookings();

    } catch (err) {
      console.log(err);
    }

  };

  // =============================
  // ĐÃ KHÁM
  // =============================
  const doneBooking = async (id) => {

    try {

      await axios.patch(
        `${API}/booking/done/${id}`,
        {},
        {
          headers: {
            Authorization: `Bearer ${token}`
          }
        }
      );

      fetchBookings();

    } catch (err) {
      console.log(err);
    }

  };

  // =============================
  // FILTER
  // =============================
  const filteredBookings = bookings.filter((b) => {

    const matchName =
      b.ten_benhnhan
        ?.toLowerCase()
        .includes(searchName.toLowerCase());

    const matchDate =
      filterDate === "" || b.ngay_hen === filterDate;

    const matchStatus =
      filterStatus === "" || b.trang_thai === filterStatus;

    return matchName && matchDate && matchStatus;

  });

  // =============================
  // MÀU TRẠNG THÁI
  // =============================
  const statusColor = (status) => {

    if (status === "CHO_XAC_NHAN")
      return "bg-yellow-100 text-yellow-700";

    if (status === "DA_XAC_NHAN")
      return "bg-blue-100 text-blue-700";

    if (status === "DA_KHAM")
      return "bg-green-100 text-green-700";

    if (status === "DA_HUY")
      return "bg-gray-200 text-gray-700";

  };

  return (

    <BacSiLayout>

      <h2 className="text-3xl font-bold text-gray-800 mb-6">
        Lịch khám của tôi
      </h2>

      <div className="bg-white rounded-2xl shadow p-6">

        {/* ================= FILTER ================= */}
        <div className="flex flex-wrap gap-4 mb-6">

          <input
            type="text"
            placeholder="Tìm bệnh nhân..."
            value={searchName}
            onChange={(e) => setSearchName(e.target.value)}
            className="border p-2 rounded-lg"
          />

          <input
            type="date"
            value={filterDate}
            onChange={(e) => setFilterDate(e.target.value)}
            className="border p-2 rounded-lg"
          />

          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="border p-2 rounded-lg"
          >

            <option value="">Tất cả trạng thái</option>
            <option value="CHO_XAC_NHAN">Chờ xác nhận</option>
            <option value="DA_XAC_NHAN">Đã xác nhận</option>
            <option value="DA_KHAM">Đã khám</option>
            <option value="DA_HUY">Đã hủy</option>

          </select>

          <button
            onClick={() => {
              setSearchName("");
              setFilterDate("");
              setFilterStatus("");
            }}
            className="bg-gray-500 text-white px-3 py-2 rounded-lg"
          >
            Reset
          </button>

        </div>

        {/* ================= TABLE ================= */}
        <table className="w-full">

          <thead>

            <tr className="border-b text-left text-gray-600">

              <th className="p-3">ID</th>
              <th className="p-3">Bệnh nhân</th>
              <th className="p-3">Ngày khám</th>
              <th className="p-3">Ca</th>
              <th className="p-3">Lý do</th>
              <th className="p-3">Trạng thái</th>
              <th className="p-3 text-center">Hành động</th>

            </tr>

          </thead>

          <tbody>

            {filteredBookings.map((b) => (

              <tr
                key={b.id_cuochen}
                className="border-b hover:bg-gray-50"
              >

                <td className="p-3">{b.id_cuochen}</td>

                <td className="p-3">{b.ten_benhnhan}</td>

                <td className="p-3">{b.ngay_hen}</td>

                <td className="p-3">{b.ca_lam_viec}</td>

                <td className="p-3">{b.ly_do}</td>

                <td className="p-3">

                  <span
                    className={`px-3 py-1 rounded-full text-sm ${statusColor(
                      b.trang_thai
                    )}`}
                  >

                    {b.trang_thai}

                  </span>

                </td>

                <td className="p-3 text-center space-x-2">

                  {b.trang_thai === "CHO_XAC_NHAN" && (

                    <button
                      onClick={() => confirmBooking(b.id_cuochen)}
                      className="bg-blue-500 text-white px-3 py-1 rounded-lg hover:bg-blue-600"
                    >
                      Xác nhận
                    </button>

                  )}

                  {b.trang_thai === "DA_XAC_NHAN" && (

                    <button
                      onClick={() => doneBooking(b.id_cuochen)}
                      className="bg-green-500 text-white px-3 py-1 rounded-lg hover:bg-green-600"
                    >
                      Đã khám
                    </button>

                  )}

                </td>

              </tr>

            ))}

          </tbody>

        </table>

      </div>

    </BacSiLayout>

  );

};

export default LichKham;