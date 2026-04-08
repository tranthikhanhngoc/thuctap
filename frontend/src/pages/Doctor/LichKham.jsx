import React, { useEffect, useState } from "react";
import axios from "axios";
import BacSiLayout from "../../components/BacsiLayout";

const API = "http://127.0.0.1:8000";

const LichKham = () => {
  const [bookings, setBookings] = useState([]);
  const [searchName, setSearchName] = useState("");
  const [filterDate, setFilterDate] = useState("");
  const [filterStatus, setFilterStatus] = useState("");

  // ====================== MODAL KÊ TOA ======================
  const [showToaModal, setShowToaModal] = useState(false);
  const [showViewModal, setShowViewModal] = useState(false);
  const [selectedCuochenId, setSelectedCuochenId] = useState(null);
  const [medicines, setMedicines] = useState([]);
  const [toaData, setToaData] = useState(null);

  const [toaForm, setToaForm] = useState({
    chan_doan: "",
    loi_dan: "",
    chi_tiets: [],
  });

  const token = localStorage.getItem("access_token");

  // Lấy lịch khám
  const fetchBookings = async () => {
    try {
      const res = await axios.get(`${API}/booking`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setBookings(res.data);
    } catch (err) {
      console.log("Lỗi lấy lịch:", err);
    }
  };

  // Lấy danh sách thuốc
  const fetchMedicines = async () => {
    try {
      const res = await axios.get(`${API}/medicines/`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setMedicines(Array.isArray(res.data) ? res.data : res.data.data || []);
    } catch (err) {
      console.error("Lỗi lấy danh sách thuốc:", err);
    }
  };

  useEffect(() => {
    fetchBookings();
  }, []);

  // Xác nhận & Đã khám
  const confirmBooking = async (id) => {
    try {
      await axios.patch(`${API}/booking/confirm/${id}`, {}, {
        headers: { Authorization: `Bearer ${token}` },
      });
      fetchBookings();
    } catch (err) {
      console.log(err);
    }
  };

  const doneBooking = async (id) => {
    try {
      await axios.patch(`${API}/booking/done/${id}`, {}, {
        headers: { Authorization: `Bearer ${token}` },
      });
      fetchBookings();
    } catch (err) {
      console.log(err);
    }
  };

  // Mở modal kê toa
  const openToaModal = (id_cuochen) => {
    setSelectedCuochenId(id_cuochen);
    setToaForm({ chan_doan: "", loi_dan: "", chi_tiets: [] });
    setShowToaModal(true);
    fetchMedicines();
  };

  // Xem toa thuốc
  const viewToaThuoc = async (id_cuochen) => {
    try {
      const res = await axios.get(`${API}/toathuoc/${id_cuochen}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setToaData(res.data);
      setShowViewModal(true);
    } catch (err) {
      alert("❌ Bệnh nhân này chưa có toa thuốc!");
    }
  };

  // Thêm / Xóa / Sửa thuốc
  const addDrugRow = () => {
    setToaForm((prev) => ({
      ...prev,
      chi_tiets: [
        ...prev.chi_tiets,
        { id_thuoc: "", so_luong: 1, sang: 0, trua: 0, chieu: 0, toi: 0 },
      ],
    }));
  };

  const removeDrugRow = (index) => {
    setToaForm((prev) => ({
      ...prev,
      chi_tiets: prev.chi_tiets.filter((_, i) => i !== index),
    }));
  };

  const updateDrugRow = (index, field, value) => {
    setToaForm((prev) => {
      const newChiTiets = [...prev.chi_tiets];
      newChiTiets[index][field] = value;
      return { ...prev, chi_tiets: newChiTiets };
    });
  };

  // Lưu toa thuốc
  const saveToaThuoc = async () => {
    if (!toaForm.chan_doan.trim()) return alert("Vui lòng nhập chẩn đoán!");
    if (toaForm.chi_tiets.length === 0) return alert("Vui lòng thêm ít nhất một thuốc!");

    try {
      const payload = {
        id_cuochen: selectedCuochenId,
        chan_doan: toaForm.chan_doan,
        loi_dan: toaForm.loi_dan || "",
        chi_tiets: toaForm.chi_tiets.map((item, index) => ({
          stt: index + 1,
          ...item,
        })),
      };

      await axios.post(`${API}/toathuoc`, payload, {
        headers: { Authorization: `Bearer ${token}` },
      });

      alert("✅ Kê toa thuốc thành công!");
      setShowToaModal(false);
      fetchBookings();
    } catch (err) {
      console.error(err);
      alert("❌ Lưu toa thất bại: " + (err.response?.data?.detail || err.message));
    }
  };

  // Filter
  const filteredBookings = bookings.filter((b) => {
    const matchName = b.ten_benhnhan?.toLowerCase().includes(searchName.toLowerCase());
    const matchDate = !filterDate || b.ngay_hen === filterDate;
    const matchStatus = !filterStatus || b.trang_thai === filterStatus;
    return matchName && matchDate && matchStatus;
  });

  const statusColor = (status) => {
    if (status === "CHO_XAC_NHAN") return "bg-yellow-100 text-yellow-700";
    if (status === "DA_XAC_NHAN") return "bg-blue-100 text-blue-700";
    if (status === "DA_KHAM") return "bg-green-100 text-green-700";
    if (status === "DA_HUY") return "bg-gray-200 text-gray-700";
    return "bg-gray-100 text-gray-600";
  };

  return (
    <BacSiLayout>
      <h2 className="text-3xl font-bold text-gray-800 mb-6">Lịch khám của tôi</h2>

      <div className="bg-white rounded-2xl shadow p-6">
        {/* Filter */}
        <div className="flex flex-wrap gap-4 mb-6">
          <input
            type="text"
            placeholder="Tìm bệnh nhân..."
            value={searchName}
            onChange={(e) => setSearchName(e.target.value)}
            className="border border-gray-300 p-3 rounded-xl focus:outline-none focus:border-purple-500"
          />
          <input
            type="date"
            value={filterDate}
            onChange={(e) => setFilterDate(e.target.value)}
            className="border border-gray-300 p-3 rounded-xl focus:outline-none focus:border-purple-500"
          />
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="border border-gray-300 p-3 rounded-xl focus:outline-none focus:border-purple-500"
          >
            <option value="">Tất cả trạng thái</option>
            <option value="CHO_XAC_NHAN">Chờ xác nhận</option>
            <option value="DA_XAC_NHAN">Đã xác nhận</option>
            <option value="DA_KHAM">Đã khám</option>
            <option value="DA_HUY">Đã hủy</option>
          </select>
          <button
            onClick={() => { setSearchName(""); setFilterDate(""); setFilterStatus(""); }}
            className="bg-gray-500 hover:bg-gray-600 text-white px-5 py-3 rounded-xl transition"
          >
            Reset
          </button>
        </div>

        {/* Bảng */}
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b text-left text-gray-600">
              <th className="p-4">ID</th>
              <th className="p-4">Bệnh nhân</th>
              <th className="p-4">Ngày khám</th>
              <th className="p-4">Ca</th>
              <th className="p-4">Lý do</th>
              <th className="p-4">Trạng thái</th>
              <th className="p-4 text-center">Hành động</th>
            </tr>
          </thead>
          <tbody>
            {filteredBookings.map((b) => (
              <tr key={b.id_cuochen} className="border-b hover:bg-gray-50 transition">
                <td className="p-4">{b.id_cuochen}</td>
                <td className="p-4 font-medium">{b.ten_benhnhan}</td>
                <td className="p-4">{b.ngay_hen}</td>
                <td className="p-4">{b.ca_lam_viec}</td>
                <td className="p-4">{b.ly_do}</td>
                <td className="p-4">
                  <span className={`px-4 py-1 rounded-full text-xs font-medium ${statusColor(b.trang_thai)}`}>
                    {b.trang_thai.replace("_", " ")}
                  </span>
                </td>
                <td className="p-4 text-center space-x-2">
                  {b.trang_thai === "CHO_XAC_NHAN" && (
                    <button
                      onClick={() => confirmBooking(b.id_cuochen)}
                      className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-xl text-sm transition"
                    >
                      Xác nhận
                    </button>
                  )}

                  {b.trang_thai === "DA_XAC_NHAN" && (
                    <>
                      <button
                        onClick={() => openToaModal(b.id_cuochen)}
                        className="bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded-xl text-sm transition"
                      >
                        📋 Kê Toa
                      </button>

                      <button
                        onClick={() => doneBooking(b.id_cuochen)}
                        className="bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded-xl text-sm transition"
                      >
                        Đã Khám
                      </button>
                    </>
                  )}

                  {/* Nút Xem Toa chỉ hiện khi đã khám hoặc đã có toa */}
                  {(b.trang_thai === "DA_KHAM") && (
                    <button
                      onClick={() => viewToaThuoc(b.id_cuochen)}
                      className="bg-indigo-500 hover:bg-indigo-600 text-white px-4 py-2 rounded-xl text-sm transition"
                    >
                      👁 Xem Toa
                    </button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Modal Kê Toa */}
      {showToaModal && (
        <div className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-3xl w-full max-w-5xl max-h-[92vh] overflow-hidden flex flex-col shadow-2xl">
            <div className="px-8 py-5 border-b flex justify-between items-center bg-gray-50">
              <h3 className="text-2xl font-bold text-gray-800">📝 Kê Toa Thuốc</h3>
              <button 
                onClick={() => setShowToaModal(false)} 
                className="text-4xl text-gray-400 hover:text-red-500 transition"
              >
                ×
              </button>
            </div>

            <div className="p-8 overflow-auto flex-1">
              <div className="grid grid-cols-1 gap-6">
                <div>
                  <label className="block text-sm font-semibold mb-2 text-gray-700">Chẩn đoán</label>
                  <input
                    type="text"
                    value={toaForm.chan_doan}
                    onChange={(e) => setToaForm({ ...toaForm, chan_doan: e.target.value })}
                    className="w-full border border-gray-300 rounded-2xl p-4 focus:outline-none focus:border-purple-500"
                    placeholder="Ví dụ: Viêm họng cấp..."
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold mb-2 text-gray-700">Lời dặn</label>
                  <textarea
                    value={toaForm.loi_dan}
                    onChange={(e) => setToaForm({ ...toaForm, loi_dan: e.target.value })}
                    rows={3}
                    className="w-full border border-gray-300 rounded-2xl p-4 focus:outline-none focus:border-purple-500"
                    placeholder="Uống sau ăn 30 phút, tái khám sau 7 ngày..."
                  />
                </div>

                <div>
                  <div className="flex justify-between items-center mb-3">
                    <h4 className="font-semibold text-lg">Danh sách thuốc</h4>
                    <button 
                      onClick={addDrugRow} 
                      className="bg-purple-600 hover:bg-purple-700 text-white px-6 py-2 rounded-2xl text-sm flex items-center gap-2"
                    >
                      + Thêm thuốc
                    </button>
                  </div>

                  <div className="overflow-x-auto">
                    <table className="w-full border border-gray-200 rounded-2xl overflow-hidden">
                      <thead className="bg-gray-100">
                        <tr>
                          <th className="p-4 text-left">Tên thuốc</th>
                          <th className="p-4 w-20 text-center">Số lượng</th>
                          <th className="p-4 w-16 text-center">Sáng</th>
                          <th className="p-4 w-16 text-center">Trưa</th>
                          <th className="p-4 w-16 text-center">Chiều</th>
                          <th className="p-4 w-16 text-center">Tối</th>
                          <th className="p-4 w-12"></th>
                        </tr>
                      </thead>
                      <tbody>
                        {toaForm.chi_tiets.map((row, index) => (
                          <tr key={index} className="border-t hover:bg-gray-50">
                            <td className="p-4">
                              <select
                                value={row.id_thuoc}
                                onChange={(e) => updateDrugRow(index, "id_thuoc", parseInt(e.target.value) || "")}
                                className="w-full border border-gray-300 rounded-xl p-3"
                              >
                                <option value="">Chọn thuốc...</option>
                                {medicines.map((med) => (
                                  <option key={med.id_thuoc} value={med.id_thuoc}>
                                    {med.ten_thuoc} ({med.don_vi})
                                  </option>
                                ))}
                              </select>
                            </td>
                            <td className="p-4">
                              <input 
                                type="number" 
                                min="1" 
                                value={row.so_luong} 
                                onChange={(e) => updateDrugRow(index, "so_luong", parseInt(e.target.value) || 1)} 
                                className="w-full border border-gray-300 rounded-xl p-3 text-center" 
                              />
                            </td>
                            <td className="p-4"><input type="number" min="0" value={row.sang} onChange={(e) => updateDrugRow(index, "sang", parseInt(e.target.value) || 0)} className="w-full border border-gray-300 rounded-xl p-3 text-center" /></td>
                            <td className="p-4"><input type="number" min="0" value={row.trua} onChange={(e) => updateDrugRow(index, "trua", parseInt(e.target.value) || 0)} className="w-full border border-gray-300 rounded-xl p-3 text-center" /></td>
                            <td className="p-4"><input type="number" min="0" value={row.chieu} onChange={(e) => updateDrugRow(index, "chieu", parseInt(e.target.value) || 0)} className="w-full border border-gray-300 rounded-xl p-3 text-center" /></td>
                            <td className="p-4"><input type="number" min="0" value={row.toi} onChange={(e) => updateDrugRow(index, "toi", parseInt(e.target.value) || 0)} className="w-full border border-gray-300 rounded-xl p-3 text-center" /></td>
                            <td className="p-4 text-center">
                              <button 
                                onClick={() => removeDrugRow(index)} 
                                className="text-red-500 hover:text-red-700 text-2xl"
                              >
                                ×
                              </button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            </div>

            <div className="px-8 py-6 border-t bg-gray-50 flex justify-end gap-4">
              <button 
                onClick={() => setShowToaModal(false)} 
                className="px-8 py-3 border border-gray-300 rounded-2xl hover:bg-gray-100"
              >
                Hủy
              </button>
              <button 
                onClick={saveToaThuoc} 
                className="px-10 py-3 bg-purple-600 hover:bg-purple-700 text-white rounded-2xl font-medium"
              >
                💾 Lưu Toa Thuốc
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal Xem Toa */}
      {showViewModal && toaData && (
        <div className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-3xl w-full max-w-4xl max-h-[92vh] overflow-hidden shadow-2xl">
            <div className="px-8 py-5 border-b bg-gray-50 flex justify-between items-center">
              <h3 className="text-2xl font-bold">📄 Toa thuốc</h3>
              <button onClick={() => setShowViewModal(false)} className="text-4xl text-gray-400 hover:text-red-500">×</button>
            </div>

            <div className="p-8 overflow-auto">
              <div className="mb-6 space-y-2 text-gray-700">
                <p><strong>Mã toa:</strong> {toaData.ma_toa}</p>
                <p><strong>Ngày kê:</strong> {toaData.ngay_ke}</p>
                <p><strong>Chẩn đoán:</strong> {toaData.chan_doan}</p>
                <p><strong>Lời dặn:</strong> {toaData.loi_dan || "Không có"}</p>
              </div>

              <table className="w-full border border-gray-200 rounded-2xl overflow-hidden text-sm">
                <thead className="bg-gray-100">
                  <tr>
                    <th className="p-4 text-left">STT</th>
                    <th className="p-4 text-left">Thuốc</th>
                    <th className="p-4 text-center">Số lượng</th>
                    <th className="p-4 text-center">Sáng</th>
                    <th className="p-4 text-center">Trưa</th>
                    <th className="p-4 text-center">Chiều</th>
                    <th className="p-4 text-center">Tối</th>
                  </tr>
                </thead>
                <tbody>
                  {toaData.chi_tiets?.map((ct, idx) => (
                    <tr key={idx} className="border-t hover:bg-gray-50">
                      <td className="p-4">{ct.stt}</td>
                      <td className="p-4">{ct.ten_thuoc} ({ct.don_vi})</td>
                      <td className="p-4 text-center">{ct.so_luong}</td>
                      <td className="p-4 text-center">{ct.sang}</td>
                      <td className="p-4 text-center">{ct.trua}</td>
                      <td className="p-4 text-center">{ct.chieu}</td>
                      <td className="p-4 text-center">{ct.toi}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}
    </BacSiLayout>
  );
};

export default LichKham;