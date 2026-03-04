import React, { useEffect, useState } from "react";
import axios from "axios";

const LichSuDatLich = () => {

  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editingId, setEditingId] = useState(null);
  const [newCa, setNewCa] = useState("");

  useEffect(() => {
    fetchHistory();
  }, []);

  const fetchHistory = async () => {
    try {
      const id_benhnhan = localStorage.getItem("id_benhnhan");

      const res = await axios.get(
        `http://localhost:8000/booking/history/${id_benhnhan}`
      );

      setAppointments(res.data);

    } catch (error) {
      console.error("Lỗi load lịch sử", error);
    } finally {
      setLoading(false);
    }
  };

  const formatCa = (ca) => {
    if (ca === "sang") return "Ca sáng (07:00 - 11:00)";
    if (ca === "chieu") return "Ca chiều (13:00 - 17:00)";
    return ca;
  };

  const formatStatus = (status) => {
    if (status === "CHO_XAC_NHAN") return "🟡 Chờ xác nhận";
    if (status === "DA_XAC_NHAN") return "🟢 Đã xác nhận";
    if (status === "DA_HUY") return "🔴 Đã huỷ";
    return status;
  };

  // ===== HỦY LỊCH =====
  const handleCancel = async (id) => {
    if (!window.confirm("Bạn có chắc muốn hủy lịch này?")) return;

    try {
      await axios.patch(
        `http://localhost:8000/booking/cancel/${id}`
      );

      alert("Đã hủy lịch thành công!");
      fetchHistory();

    } catch (error) {
      alert("Hủy thất bại!");
    }
  };

  // ===== CHỈNH SỬA CA =====
  const handleEdit = (item) => {
    setEditingId(item.id_cuochen);
    setNewCa(item.ca_lam_viec);
  };

  const handleUpdate = async (item) => {
    try {

      await axios.put(
        `http://localhost:8000/booking/${item.id_cuochen}`,
        {
          ...item,
          ca_lam_viec: newCa
        }
      );

      alert("Cập nhật thành công!");
      setEditingId(null);
      fetchHistory();

    } catch (error) {
      alert("Cập nhật thất bại!");
    }
  };

  if (loading) {
    return <div className="text-center mt-10">Đang tải...</div>;
  }

  return (
    <div className="min-h-screen bg-gray-100 p-10">

      <h1 className="text-3xl font-bold text-blue-600 mb-6">
        📋 Lịch sử đặt lịch
      </h1>

      <div className="bg-white shadow rounded-lg overflow-hidden">

        <table className="w-full">

          <thead className="bg-blue-500 text-white">
            <tr>
              <th className="p-3">Ngày khám</th>
              <th className="p-3">Ca</th>
              <th className="p-3">Lý do</th>
              <th className="p-3">Trạng thái</th>
              <th className="p-3">Thao tác</th>
            </tr>
          </thead>

          <tbody>

            {appointments.length === 0 ? (
              <tr>
                <td colSpan="5" className="text-center p-5">
                  Chưa có lịch hẹn
                </td>
              </tr>
            ) : (

              appointments.map((item) => (

                <tr
                  key={item.id_cuochen}
                  className="border-b hover:bg-gray-50"
                >

                  <td className="p-3">
                    {item.ngay_hen}
                  </td>

                  <td className="p-3">
                    {editingId === item.id_cuochen ? (
                      <select
                        value={newCa}
                        onChange={(e) => setNewCa(e.target.value)}
                        className="border p-1 rounded"
                      >
                        <option value="sang">Ca sáng</option>
                        <option value="chieu">Ca chiều</option>
                      </select>
                    ) : (
                      formatCa(item.ca_lam_viec)
                    )}
                  </td>

                  <td className="p-3">
                    {item.ly_do}
                  </td>

                  <td className="p-3">
                    {formatStatus(item.trang_thai)}
                  </td>

                  <td className="p-3 space-x-2">

                    {item.trang_thai !== "DA_HUY" && (

                      editingId === item.id_cuochen ? (
                        <>
                          <button
                            onClick={() => handleUpdate(item)}
                            className="bg-green-500 text-white px-3 py-1 rounded"
                          >
                            Lưu
                          </button>

                          <button
                            onClick={() => setEditingId(null)}
                            className="bg-gray-400 text-white px-3 py-1 rounded"
                          >
                            Hủy
                          </button>
                        </>
                      ) : (
                        <>
                          <button
                            onClick={() => handleEdit(item)}
                            className="bg-yellow-500 text-white px-3 py-1 rounded"
                          >
                            Sửa
                          </button>

                          <button
                            onClick={() => handleCancel(item.id_cuochen)}
                            className="bg-red-500 text-white px-3 py-1 rounded"
                          >
                            Hủy lịch
                          </button>
                        </>
                      )

                    )}

                  </td>

                </tr>

              ))

            )}

          </tbody>

        </table>

      </div>

    </div>
  );
};

export default LichSuDatLich;