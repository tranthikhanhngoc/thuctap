import React, { useEffect, useState } from "react";
import axios from "axios";
import BacSiLayout from "../../components/BacsiLayout";

const API = "http://127.0.0.1:8000";

const LichKham = () => {
  const [bookings, setBookings] = useState([]);
  const [searchName, setSearchName] = useState("");
  const [filterDate, setFilterDate] = useState("");
  const [filterStatus, setFilterStatus] = useState("");

  // Modal
  const [showModal, setShowModal] = useState(false);
  const [modalMode, setModalMode] = useState("create"); // "create" hoặc "print"
  const [selectedCuochenId, setSelectedCuochenId] = useState(null);
  const [currentBooking, setCurrentBooking] = useState(null);
  const [medicines, setMedicines] = useState([]);
  const [existingToa, setExistingToa] = useState(null);

  const [toaForm, setToaForm] = useState({
    chan_doan: "",
    loi_dan: "",
    chi_tiets: [],
  });

  const token = localStorage.getItem("access_token");

  // Lấy danh sách lịch khám
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
      console.error("Lỗi lấy thuốc:", err);
    }
  };

  // Lấy toa thuốc đã kê
  const fetchToaByCuochen = async (id_cuochen) => {
    try {
      const res = await axios.get(`${API}/toathuoc/${id_cuochen}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      return res.data;
    } catch (err) {
      return null;
    }
  };

  useEffect(() => {
    fetchBookings();
  }, []);

  const confirmBooking = async (id) => {
    try {
      await axios.patch(`${API}/booking/confirm/${id}`, {}, { headers: { Authorization: `Bearer ${token}` } });
      fetchBookings();
    } catch (err) {
      console.log(err);
    }
  };

  const doneBooking = async (id) => {
    try {
      await axios.patch(`${API}/booking/done/${id}`, {}, { headers: { Authorization: `Bearer ${token}` } });
      fetchBookings();
    } catch (err) {
      console.log(err);
    }
  };

  // Mở modal KÊ TOA
  const openCreateToaModal = (id_cuochen) => {
    setSelectedCuochenId(id_cuochen);
    setModalMode("create");
    setToaForm({ chan_doan: "", loi_dan: "", chi_tiets: [] });
    setShowModal(true);
    fetchMedicines();
  };

  // Mở modal IN ĐƠN THUỐC
  const openPrintModal = async (id_cuochen, booking) => {
    setSelectedCuochenId(id_cuochen);
    setCurrentBooking(booking);
    setModalMode("print");
    const toa = await fetchToaByCuochen(id_cuochen);
    if (toa) {
      setExistingToa(toa);
      setShowModal(true);
    } else {
      alert("Chưa có toa thuốc cho lịch khám này!");
    }
  };

  const handlePrint = () => {
    window.print();
  };

  // ====================== FORM KÊ TOA ======================
  const addDrugRow = () => {
    setToaForm((prev) => ({
      ...prev,
      chi_tiets: [...prev.chi_tiets, { id_thuoc: "", so_luong: 1, sang: 0, trua: 0, chieu: 0, toi: 0 }],
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

  const saveToaThuoc = async () => {
    if (!toaForm.chan_doan.trim()) return alert("Vui lòng nhập chẩn đoán!");
    if (toaForm.chi_tiets.length === 0) return alert("Vui lòng thêm ít nhất một thuốc!");

    const chi_tiets_with_stt = toaForm.chi_tiets.map((item, idx) => ({
      ...item,
      stt: idx + 1,
    }));

    try {
      await axios.post(`${API}/toathuoc`, {
        id_cuochen: selectedCuochenId,
        chan_doan: toaForm.chan_doan,
        loi_dan: toaForm.loi_dan || "",
        chi_tiets: chi_tiets_with_stt,
      }, { headers: { Authorization: `Bearer ${token}` } });

      alert("✅ Kê toa thuốc thành công!");
      setShowModal(false);
      fetchBookings();
    } catch (err) {
      alert("❌ Lưu toa thất bại: " + (err.response?.data?.detail || err.message));
    }
  };

  // Filter
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
        <div className="flex flex-wrap gap-4 mb-6">
          <input type="text" placeholder="Tìm bệnh nhân..." value={searchName} onChange={(e) => setSearchName(e.target.value)} className="border p-2 rounded-lg" />
          <input type="date" value={filterDate} onChange={(e) => setFilterDate(e.target.value)} className="border p-2 rounded-lg" />
          <select value={filterStatus} onChange={(e) => setFilterStatus(e.target.value)} className="border p-2 rounded-lg">
            <option value="">Tất cả trạng thái</option>
            <option value="CHO_XAC_NHAN">Chờ xác nhận</option>
            <option value="DA_XAC_NHAN">Đã xác nhận</option>
            <option value="DA_KHAM">Đã khám</option>
            <option value="DA_HUY">Đã hủy</option>
          </select>
          <button onClick={() => { setSearchName(""); setFilterDate(""); setFilterStatus(""); }} className="bg-gray-500 text-white px-3 py-2 rounded-lg">Reset</button>
        </div>

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
                <td className="p-3 text-center space-x-3">
                  {b.trang_thai === "CHO_XAC_NHAN" && (
                    <button onClick={() => confirmBooking(b.id_cuochen)} className="bg-blue-500 text-white px-4 py-1 rounded-lg hover:bg-blue-600">Xác nhận</button>
                  )}

                  {b.trang_thai === "DA_XAC_NHAN" && (
                    <>
                      <button onClick={() => openCreateToaModal(b.id_cuochen)} className="bg-purple-600 text-white px-4 py-1 rounded-lg hover:bg-purple-700 text-sm">📋 Kê Toa Thuốc</button>
                      <button onClick={() => doneBooking(b.id_cuochen)} className="bg-green-500 text-white px-4 py-1 rounded-lg hover:bg-green-600 text-sm">Đã Khám</button>
                    </>
                  )}

                  {b.trang_thai === "DA_KHAM" && (
                    <button onClick={() => openPrintModal(b.id_cuochen, b)} className="bg-emerald-600 text-white px-5 py-1 rounded-lg hover:bg-emerald-700 text-sm font-medium">🖨️ In Đơn Thuốc</button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* ====================== MODAL ====================== */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-50">
          <div className="bg-white rounded-2xl w-full max-w-4xl max-h-[95vh] overflow-hidden shadow-2xl flex flex-col">
            <div className="px-6 py-4 border-b flex justify-between items-center">
              <h3 className="text-2xl font-bold">
                {modalMode === "create" ? "Kê Toa Thuốc" : "ĐƠN THUỐC"}
              </h3>
              <button onClick={() => setShowModal(false)} className="text-3xl text-gray-400 hover:text-red-600">×</button>
            </div>

            <div className="p-6 overflow-auto flex-1">
              {modalMode === "print" && existingToa ? (
                // ==================== PHẦN IN ĐƠN THUỐC ====================
                <div className="print-content p-8 text-black">
                  <div className="text-center mb-6">
                    <h1 className="text-2xl font-bold">SỞ Y TẾ CẦN THƠ</h1>
                    <h2 className="text-xl font-bold">BỆNH VIỆN ĐA KHOA TỈNH</h2>
                    <p className="text-lg font-semibold mt-2">ĐƠN THUỐC</p>
                  </div>

                  <div className="grid grid-cols-2 gap-y-2 text-sm mb-6">
                    <div><strong>Họ tên:</strong> {currentBooking?.ten_benhnhan || "........................"}</div>
                    <div><strong>Tuổi:</strong> ..............</div>
                    <div className="col-span-2"><strong>Chẩn đoán:</strong> {existingToa.chan_doan}</div>
                  </div>

                  <table className="w-full border border-gray-400 mb-6">
                    <thead>
                      <tr className="bg-gray-100">
                        <th className="border p-2 text-left">Thuốc</th>
                        <th className="border p-2 text-center">Cách dùng</th>
                        <th className="border p-2 text-center">Số lượng</th>
                      </tr>
                    </thead>
                    <tbody>
                      {existingToa.chi_tiets.map((ct, idx) => (
                        <tr key={ct.id} className="border-t">
                          <td className="border p-2">{ct.ten_thuoc}</td>
                          <td className="border p-2 text-center text-xs">
                            Sáng {ct.sang} • Trưa {ct.trua} • Chiều {ct.chieu} • Tối {ct.toi}
                          </td>
                          <td className="border p-2 text-center">{ct.so_luong}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>

                  {existingToa.loi_dan && (
                    <div className="mb-8">
                      <strong>Lời dặn:</strong>
                      <p className="mt-1 text-sm">{existingToa.loi_dan}</p>
                    </div>
                  )}

                  <div className="text-right text-sm">
                    <p>Ngày {new Date().getDate()} tháng {new Date().getMonth() + 1} năm {new Date().getFullYear()}</p>
                    <p className="mt-10">Bác sĩ điều trị</p>
                    <p className="mt-12 font-medium">(Ký và ghi rõ họ tên)</p>
                  </div>
                </div>
              ) : (
                // ==================== PHẦN KÊ TOA ====================
                <div>
                  <div className="mb-5">
                    <label className="block text-sm font-medium mb-1">Chẩn đoán</label>
                    <input type="text" value={toaForm.chan_doan} onChange={(e) => setToaForm({ ...toaForm, chan_doan: e.target.value })} className="w-full border rounded-lg p-3" placeholder="Viêm họng cấp / GERD..." />
                  </div>
                  <div className="mb-6">
                    <label className="block text-sm font-medium mb-1">Lời dặn</label>
                    <textarea value={toaForm.loi_dan} onChange={(e) => setToaForm({ ...toaForm, loi_dan: e.target.value })} rows={3} className="w-full border rounded-lg p-3" placeholder="Uống sau ăn..." />
                  </div>

                  <div>
                    <div className="flex justify-between mb-3">
                      <h4 className="font-semibold">Danh sách thuốc</h4>
                      <button onClick={addDrugRow} className="bg-purple-600 text-white px-5 py-2 rounded-lg text-sm">+ Thêm thuốc</button>
                    </div>

                    <table className="w-full border text-sm">
                      {/* Trong bảng kê toa */}
<thead className="bg-gray-100">
  <tr>
    <th className="p-3 text-left">Thuốc</th>
    <th className="p-3 w-20 text-center">SL</th>
    
    {/* Đã tăng độ rộng từ w-14 → w-24 */}
    <th className="p-3 w-24 text-center">Sáng</th>
    <th className="p-3 w-24 text-center">Trưa</th>
    <th className="p-3 w-24 text-center">Chiều</th>
    <th className="p-3 w-24 text-center">Tối</th>
    
    <th className="p-3 w-10"></th>
  </tr>
</thead>
                      <tbody>
                        {toaForm.chi_tiets.map((row, index) => (
                          <tr key={index} className="border-t">
                            <td className="p-3">
                              <select value={row.id_thuoc} onChange={(e) => updateDrugRow(index, "id_thuoc", parseInt(e.target.value))} className="w-full border rounded p-2">
                                <option value="">Chọn thuốc...</option>
                                {medicines.map((med) => (
                                  <option key={med.id_thuoc} value={med.id_thuoc}>{med.ten_thuoc} ({med.don_vi})</option>
                                ))}
                              </select>
                            </td>
                            <td className="p-3"><input type="number" min="1" value={row.so_luong} onChange={(e) => updateDrugRow(index, "so_luong", parseInt(e.target.value) || 1)} className="w-full border rounded p-2 text-center" /></td>
                            <td className="p-3"><input type="number" min="0" value={row.sang} onChange={(e) => updateDrugRow(index, "sang", parseInt(e.target.value) || 0)} className="w-full border rounded p-2 text-center" /></td>
                            <td className="p-3"><input type="number" min="0" value={row.trua} onChange={(e) => updateDrugRow(index, "trua", parseInt(e.target.value) || 0)} className="w-full border rounded p-2 text-center" /></td>
                            <td className="p-3"><input type="number" min="0" value={row.chieu} onChange={(e) => updateDrugRow(index, "chieu", parseInt(e.target.value) || 0)} className="w-full border rounded p-2 text-center" /></td>
                            <td className="p-3"><input type="number" min="0" value={row.toi} onChange={(e) => updateDrugRow(index, "toi", parseInt(e.target.value) || 0)} className="w-full border rounded p-2 text-center" /></td>
                            <td className="p-3 text-center">
                              <button onClick={() => removeDrugRow(index)} className="text-red-600 text-2xl">×</button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}
            </div>

            <div className="px-6 py-4 border-t flex justify-end gap-3">
              <button onClick={() => setShowModal(false)} className="px-6 py-2 border rounded-lg">Đóng</button>
              {modalMode === "print" && (
                <button onClick={handlePrint} className="px-8 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 font-medium">🖨️ In Đơn Thuốc</button>
              )}
              {modalMode === "create" && (
                <button onClick={saveToaThuoc} className="px-8 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 font-medium">💾 Lưu Toa Thuốc</button>
              )}
            </div>
          </div>
        </div>
      )}
    </BacSiLayout>
  );
};

export default LichKham;