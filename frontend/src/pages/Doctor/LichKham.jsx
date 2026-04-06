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
  const [selectedCuochenId, setSelectedCuochenId] = useState(null);
  const [medicines, setMedicines] = useState([]);        // ← Danh sách thuốc từ /medicines/
  const [showViewModal, setShowViewModal] = useState(false);
const [toaData, setToaData] = useState(null);

const viewToaThuoc = async (id_cuochen) => {
  try {
    const res = await axios.get(`${API}/toathuoc/${id_cuochen}`, {
      headers: { Authorization: `Bearer ${token}` },
    });

    setToaData(res.data);
    setShowViewModal(true);
  } catch (err) {
    alert("❌ Chưa có toa thuốc!");
  }
};

  const [toaForm, setToaForm] = useState({
    chan_doan: "",
    loi_dan: "",
    chi_tiets: [], // [{ id_thuoc, so_luong, sang, trua, chieu, toi }]
  });

  const token = localStorage.getItem("access_token");

  // =============================
  // LẤY LỊCH KHÁM
  // =============================
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

  // =============================
  // LẤY DANH SÁCH THUỐC (đúng endpoint như PrescriptionManage)
  // =============================
  const fetchMedicines = async () => {
    try {
      const res = await axios.get(`${API}/medicines/`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      // Xử lý cả 2 kiểu response (array hoặc {data: [...]})
      setMedicines(Array.isArray(res.data) ? res.data : res.data.data || []);
    } catch (err) {
      console.error("Lỗi lấy danh sách thuốc:", err);
      alert("Không thể tải danh sách thuốc từ kho!");
    }
  };

  useEffect(() => {
    fetchBookings();
  }, []);

  // =============================
  // XÁC NHẬN & ĐÃ KHÁM
  // =============================
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

  // =============================
  // MỞ MODAL KÊ TOA
  // =============================
  const openToaModal = (id_cuochen) => {
    setSelectedCuochenId(id_cuochen);
    setToaForm({ chan_doan: "", loi_dan: "", chi_tiets: [] });
    setShowToaModal(true);
    fetchMedicines();           // ← Load thuốc mỗi khi mở modal
  };

  // =============================
  // THÊM / XÓA / SỬA DÒNG THUỐC
  // =============================
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

  // =============================
  // LƯU TOA THUỐC
  // =============================
 const saveToaThuoc = async () => {
  if (!toaForm.chan_doan.trim()) return alert("Vui lòng nhập chẩn đoán!");
  if (toaForm.chi_tiets.length === 0) return alert("Vui lòng thêm ít nhất một thuốc!");

  try {
    const payload = {
      id_cuochen: selectedCuochenId,
      chan_doan: toaForm.chan_doan,
      loi_dan: toaForm.loi_dan || "",
      chi_tiets: toaForm.chi_tiets.map((item, index) => ({
        stt: index + 1,   // ✅ THÊM DÒNG NÀY
        ...item
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
  // =============================
  // FILTER & STATUS COLOR
  // =============================
  const filteredBookings = bookings.filter((b) => {
    const matchName = b.ten_benhnhan?.toLowerCase().includes(searchName.toLowerCase());
    const matchDate = filterDate === "" || b.ngay_hen === filterDate;
    const matchStatus = filterStatus === "" || b.trang_thai === filterStatus;
    return matchName && matchDate && matchStatus;
  });

  const statusColor = (status) => {
    if (status === "CHO_XAC_NHAN") return "bg-yellow-100 text-yellow-700";
    if (status === "DA_XAC_NHAN") return "bg-blue-100 text-blue-700";
    if (status === "DA_KHAM") return "bg-green-100 text-green-700";
    if (status === "DA_HUY") return "bg-gray-200 text-gray-700";
  };

  return (
    <BacSiLayout>
      <h2 className="text-3xl font-bold text-gray-800 mb-6">Lịch khám của tôi</h2>

      <div className="bg-white rounded-2xl shadow p-6">
        {/* FILTER */}
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
            onClick={() => { setSearchName(""); setFilterDate(""); setFilterStatus(""); }}
            className="bg-gray-500 text-white px-3 py-2 rounded-lg"
          >
            Reset
          </button>
        </div>

        {/* TABLE */}
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
              <tr key={b.id_cuochen} className="border-b hover:bg-gray-50">
                <td className="p-3">{b.id_cuochen}</td>
                <td className="p-3">{b.ten_benhnhan}</td>
                <td className="p-3">{b.ngay_hen}</td>
                <td className="p-3">{b.ca_lam_viec}</td>
                <td className="p-3">{b.ly_do}</td>
                <td className="p-3">
                  <span className={`px-3 py-1 rounded-full text-sm ${statusColor(b.trang_thai)}`}>
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
  <>
    <button
      onClick={() => openToaModal(b.id_cuochen)}
      className="bg-purple-600 text-white px-4 py-1 rounded-lg hover:bg-purple-700 text-sm"
    >
      📋 Kê Toa
    </button>

    <button
      onClick={() => viewToaThuoc(b.id_cuochen)}
      className="bg-indigo-500 text-white px-3 py-1 rounded-lg hover:bg-indigo-600 text-sm"
    >
      👁 Xem Toa
    </button>

    <button
      onClick={() => doneBooking(b.id_cuochen)}
      className="bg-green-500 text-white px-3 py-1 rounded-lg hover:bg-green-600 text-sm"
    >
      Đã Khám
    </button>
  </>
)}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* ====================== MODAL KÊ TOA ====================== */}
      {showToaModal && (
        <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-50">
          <div className="bg-white rounded-2xl w-full max-w-4xl max-h-[90vh] overflow-hidden flex flex-col">
            <div className="px-6 py-4 border-b flex justify-between items-center">
              <h3 className="text-2xl font-bold">Kê Toa Thuốc</h3>
              <button onClick={() => setShowToaModal(false)} className="text-3xl text-gray-400 hover:text-red-600">×</button>
            </div>

            <div className="p-6 overflow-auto flex-1">
              <div className="mb-5">
                <label className="block font-medium mb-1">Chẩn đoán</label>
                <input
                  type="text"
                  value={toaForm.chan_doan}
                  onChange={(e) => setToaForm({ ...toaForm, chan_doan: e.target.value })}
                  className="w-full border rounded-lg p-3"
                  placeholder="Viêm họng cấp / GERD..."
                />
              </div>

              <div className="mb-6">
                <label className="block font-medium mb-1">Lời dặn</label>
                <textarea
                  value={toaForm.loi_dan}
                  onChange={(e) => setToaForm({ ...toaForm, loi_dan: e.target.value })}
                  rows={2}
                  className="w-full border rounded-lg p-3"
                  placeholder="Uống sau ăn 30 phút, tái khám sau 7 ngày..."
                />
              </div>

              <div>
                <div className="flex justify-between mb-3">
                  <h4 className="font-semibold">Danh sách thuốc</h4>
                  <button onClick={addDrugRow} className="bg-purple-600 text-white px-4 py-1 rounded-lg text-sm">+ Thêm thuốc</button>
                </div>

                <table className="w-full border text-sm">
                  <thead className="bg-gray-100">
                    <tr>
                      <th className="p-2 text-left">Thuốc</th>
                      <th className="p-2 w-20">SL</th>
                      <th className="p-2 w-14 text-center">Sáng</th>
                      <th className="p-2 w-14 text-center">Trưa</th>
                      <th className="p-2 w-14 text-center">Chiều</th>
                      <th className="p-2 w-14 text-center">Tối</th>
                      <th className="p-2 w-10"></th>
                    </tr>
                  </thead>
                  <tbody>
                    {toaForm.chi_tiets.map((row, index) => (
                      <tr key={index} className="border-t">
                        <td className="p-2">
                          <select
                            value={row.id_thuoc}
                            onChange={(e) => updateDrugRow(index, "id_thuoc", parseInt(e.target.value))}
                            className="w-full border rounded p-2"
                          >
                            <option value="">Chọn thuốc...</option>
                            {medicines.map((med) => (
                              <option key={med.id_thuoc} value={med.id_thuoc}>
                                {med.ten_thuoc} ({med.don_vi})
                              </option>
                            ))}
                          </select>
                        </td>
                        <td className="p-2"><input type="number" min="1" value={row.so_luong} onChange={(e) => updateDrugRow(index, "so_luong", parseInt(e.target.value) || 1)} className="w-full border rounded p-2 text-center" /></td>
                        <td className="p-2"><input type="number" min="0" value={row.sang} onChange={(e) => updateDrugRow(index, "sang", parseInt(e.target.value) || 0)} className="w-full border rounded p-2 text-center" /></td>
                        <td className="p-2"><input type="number" min="0" value={row.trua} onChange={(e) => updateDrugRow(index, "trua", parseInt(e.target.value) || 0)} className="w-full border rounded p-2 text-center" /></td>
                        <td className="p-2"><input type="number" min="0" value={row.chieu} onChange={(e) => updateDrugRow(index, "chieu", parseInt(e.target.value) || 0)} className="w-full border rounded p-2 text-center" /></td>
                        <td className="p-2"><input type="number" min="0" value={row.toi} onChange={(e) => updateDrugRow(index, "toi", parseInt(e.target.value) || 0)} className="w-full border rounded p-2 text-center" /></td>
                        <td className="p-2 text-center">
                          <button onClick={() => removeDrugRow(index)} className="text-red-600 text-xl">×</button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            <div className="px-6 py-4 border-t flex justify-end gap-3">
              <button onClick={() => setShowToaModal(false)} className="px-6 py-2 border rounded-lg">Hủy</button>
              <button onClick={saveToaThuoc} className="px-8 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700">💾 Lưu Toa Thuốc</button>
            </div>
          </div>
        </div>
      )}

      {showViewModal && toaData && (
  <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-50">
    <div className="bg-white rounded-2xl w-full max-w-3xl max-h-[90vh] overflow-auto p-6">

      <div className="flex justify-between mb-4">
        <h3 className="text-2xl font-bold">📄 Toa thuốc</h3>
        <button onClick={() => setShowViewModal(false)} className="text-2xl">×</button>
      </div>

      <div className="mb-4">
        <p><b>Mã toa:</b> {toaData.ma_toa}</p>
        <p><b>Ngày kê:</b> {toaData.ngay_ke}</p>
        <p><b>Chẩn đoán:</b> {toaData.chan_doan}</p>
        <p><b>Lời dặn:</b> {toaData.loi_dan}</p>
      </div>

      <table className="w-full border text-sm">
        <thead className="bg-gray-100">
          <tr>
            <th className="p-2">STT</th>
            <th className="p-2">Thuốc</th>
            <th className="p-2">SL</th>
            <th className="p-2">Sáng</th>
            <th className="p-2">Trưa</th>
            <th className="p-2">Chiều</th>
            <th className="p-2">Tối</th>
          </tr>
        </thead>
        <tbody>
          {toaData.chi_tiets.map((ct) => (
            <tr key={ct.id} className="border-t text-center">
              <td className="p-2">{ct.stt}</td>
              <td className="p-2">{ct.ten_thuoc} ({ct.don_vi})</td>
              <td className="p-2">{ct.so_luong}</td>
              <td className="p-2">{ct.sang}</td>
              <td className="p-2">{ct.trua}</td>
              <td className="p-2">{ct.chieu}</td>
              <td className="p-2">{ct.toi}</td>
            </tr>
          ))}
        </tbody>
      </table>

    </div>
  </div>
)}  
    </BacSiLayout>
  );
};

export default LichKham;