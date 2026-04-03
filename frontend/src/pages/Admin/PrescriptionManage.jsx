import React, { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import * as XLSX from "xlsx";
import { saveAs } from "file-saver";

const PrescriptionManage = () => {
  const API = "http://127.0.0.1:8000";
  const token = localStorage.getItem("access_token");
  const navigate = useNavigate();

  const [medicines, setMedicines] = useState([]);
  const [selectedMedicine, setSelectedMedicine] = useState(null);

  const [formData, setFormData] = useState({
    ten_thuoc: "",
    ma_thuoc: "",
    don_vi: "Viên",
    so_luong_ton: "0",
    gia_nhap: "",
    gia_ban: "",
    ngay_nhap: "",
    han_su_dung: "",
    nha_cung_cap: "",
    loai_thuoc: "Khác",
    mo_ta: "",
  });

  // Form Nhập/Xuất kho nhanh
  const [stockForm, setStockForm] = useState({
    id_thuoc: "",
    so_luong: "",
    loai: "nhap",
    ghi_chu: "",
  });

  useEffect(() => {
    fetchMedicines();
  }, []);

  const fetchMedicines = async () => {
    try {
      const res = await axios.get(`${API}/medicines/`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setMedicines(Array.isArray(res.data) ? res.data : res.data.data || []);
    } catch (err) {
      console.error(err);
      alert("Không thể tải danh sách thuốc!");
    }
  };

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleStockChange = (e) => {
    setStockForm({ ...stockForm, [e.target.name]: e.target.value });
  };

  const resetForm = () => {
    setFormData({
      ten_thuoc: "",
      ma_thuoc: "",
      don_vi: "Viên",
      so_luong_ton: "0",
      gia_nhap: "",
      gia_ban: "",
      ngay_nhap: "",
      han_su_dung: "",
      nha_cung_cap: "",
      loai_thuoc: "Khác",
      mo_ta: "",
    });
    setSelectedMedicine(null);
  };

  const saveMedicine = async () => {
    if (!formData.ten_thuoc || !formData.ma_thuoc) {
      alert("Vui lòng nhập Tên thuốc và Mã thuốc!");
      return;
    }

    try {
      const payload = {
        ...formData,
        so_luong_ton: Number(formData.so_luong_ton) || 0,
        gia_nhap: Number(formData.gia_nhap) || 0,
        gia_ban: Number(formData.gia_ban) || 0,
      };

      if (selectedMedicine) {
        await axios.put(`${API}/medicines/${selectedMedicine.id_thuoc}`, payload, {
          headers: { Authorization: `Bearer ${token}` },
        });
        alert("Cập nhật thuốc thành công!");
      } else {
        await axios.post(`${API}/medicines/`, payload, {
          headers: { Authorization: `Bearer ${token}` },
        });
        alert("Thêm thuốc mới thành công!");
      }

      resetForm();
      fetchMedicines();
    } catch (err) {
      alert(err.response?.data?.detail || "Thao tác thất bại!");
    }
  };

  const editMedicine = (med) => {
    setSelectedMedicine(med);
    setFormData({
      ten_thuoc: med.ten_thuoc,
      ma_thuoc: med.ma_thuoc,
      don_vi: med.don_vi || "Viên",
      so_luong_ton: med.so_luong_ton || "0",
      gia_nhap: med.gia_nhap || "",
      gia_ban: med.gia_ban || "",
      ngay_nhap: med.ngay_nhap || "",
      han_su_dung: med.han_su_dung || "",
      nha_cung_cap: med.nha_cung_cap || "",
      loai_thuoc: med.loai_thuoc || "Khác",
      mo_ta: med.mo_ta || "",
    });
  };

  const deleteMedicine = async (id) => {
    if (!window.confirm("Bạn chắc chắn muốn xóa thuốc này?")) return;
    try {
      await axios.delete(`${API}/medicines/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      fetchMedicines();
      alert("Xóa thuốc thành công!");
    } catch (err) {
      alert("Xóa thất bại!");
    }
  };

  // Nhập/Xuất kho
  const handleStockOperation = async () => {
    if (!stockForm.id_thuoc || !stockForm.so_luong) {
      alert("Vui lòng chọn thuốc và nhập số lượng!");
      return;
    }
    try {
      const payload = {
        so_luong: Number(stockForm.so_luong),
        ghi_chu: stockForm.ghi_chu,
      };

      const url = stockForm.loai === "nhap"
        ? `${API}/medicines/${stockForm.id_thuoc}/nhap-kho/`
        : `${API}/medicines/${stockForm.id_thuoc}/xuat-kho/`;

      await axios.post(url, payload, {
        headers: { Authorization: `Bearer ${token}` },
      });

      alert(stockForm.loai === "nhap" ? "Nhập kho thành công!" : "Xuất kho thành công!");
      setStockForm({ id_thuoc: "", so_luong: "", loai: "nhap", ghi_chu: "" });
      fetchMedicines();
    } catch (err) {
      alert("Thao tác kho thất bại!");
    }
  };

  // Xuất Excel
// ==================== XUẤT EXCEL (ĐÃ SỬA) ====================
const exportToExcel = () => {
  if (!medicines || medicines.length === 0) {
    alert("Không có dữ liệu để xuất!");
    return;
  }

  const data = medicines.map((m, index) => ({
    "STT": index + 1,
    "Mã thuốc": m.ma_thuoc || "",
    "Tên thuốc": m.ten_thuoc || "",
    "Loại thuốc": m.loai_thuoc || "",
    "Đơn vị": m.don_vi || "",
    "Giá nhập (VNĐ)": Number(m.gia_nhap) || 0,
    "Giá bán (VNĐ)": Number(m.gia_ban) || 0,
    "Số lượng tồn": Number(m.so_luong_ton) || 0,        // ← Ép về Number
    "Ngày nhập": m.ngay_nhap || "",
    "Hạn sử dụng": m.han_su_dung || "",
    "Nhà cung cấp": m.nha_cung_cap || "",
    "Mô tả": m.mo_ta || "",
  }));

  // Tạo worksheet
  const ws = XLSX.utils.json_to_sheet(data);

  // === ÉP CÁC CỘT SỐ THÀNH KIỂU NUMBER THỰC SỰ ===
  const range = XLSX.utils.decode_range(ws['!ref']);

  // Danh sách các cột cần ép thành số (theo thứ tự cột trong object)
  const numberColumns = ["Giá nhập (VNĐ)", "Giá bán (VNĐ)", "Số lượng tồn"];

  for (let R = range.s.r + 1; R <= range.e.r; ++R) {           // bỏ qua header
    numberColumns.forEach(colName => {
      // Tìm vị trí cột theo tên header
      const colIndex = Object.keys(data[0]).indexOf(colName);
      if (colIndex === -1) return;

      const cellAddress = XLSX.utils.encode_cell({ r: R, c: colIndex });
      const cell = ws[cellAddress];

      if (cell) {
        const numValue = Number(cell.v);
        if (!isNaN(numValue)) {
          cell.t = 'n';                    // t = 'n' → number
          cell.v = numValue;
          // cell.z = '0';                 // uncomment nếu muốn format không dấu phẩy
          // cell.z = '#,##0';             // có dấu phẩy hàng nghìn (khuyến nghị)
        }
      }
    });
  }

  // Auto width cột (có thể tinh chỉnh thêm)
  const colWidths = Object.keys(data[0]).map((key) => ({
    wch: Math.max(key.length + 8, 15),   // tăng độ rộng một chút
  }));
  ws["!cols"] = colWidths;

  // Tạo workbook và xuất file
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, "Danh sách thuốc");

  const excelBuffer = XLSX.write(wb, { bookType: "xlsx", type: "array" });
  const fileName = `DanhSachThuoc_${new Date().toISOString().slice(0, 10)}.xlsx`;

  saveAs(new Blob([excelBuffer]), fileName);
};
  // Nhập Excel
  const importFromExcel = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (evt) => {
      const data = new Uint8Array(evt.target.result);
      const wb = XLSX.read(data, { type: "array" });
      const json = XLSX.utils.sheet_to_json(wb.Sheets[wb.SheetNames[0]]);

      json.forEach(async (row) => {
        try {
          const payload = {
            ten_thuoc: row["Tên thuốc"] || row.ten_thuoc,
            ma_thuoc: row["Mã thuốc"] || row.ma_thuoc,
            don_vi: row["Đơn vị"] || "Viên",
            so_luong_ton: Number(row["Số lượng tồn"] || row.so_luong_ton) || 0,
            gia_nhap: Number(row["Giá nhập"]) || 0,
            gia_ban: Number(row["Giá bán"]) || 0,
            ngay_nhap: row["Ngày nhập"] || "",
            han_su_dung: row["Hạn sử dụng"] || "",
            nha_cung_cap: row["Nhà cung cấp"] || "",
            loai_thuoc: row["Loại thuốc"] || "Khác",
            mo_ta: row["Mô tả"] || "",
          };

          await axios.post(`${API}/medicines/`, payload, {
            headers: { Authorization: `Bearer ${token}` },
          });
        } catch (err) {
          console.error("Lỗi nhập thuốc:", row);
        }
      });

      alert("Nhập file Excel hoàn tất!");
      fetchMedicines();
    };
    reader.readAsArrayBuffer(file);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-50 via-white to-pink-50 relative overflow-hidden">
      {/* Background */}
      <div className="absolute inset-0 -z-10 opacity-30 pointer-events-none">
        <div className="absolute top-40 right-20 w-96 h-96 bg-pink-200 rounded-full blur-3xl"></div>
        <div className="absolute bottom-20 left-20 w-80 h-80 bg-pink-100 rounded-full blur-3xl"></div>
      </div>

      {/* Sidebar */}
      <aside className="fixed top-0 left-0 h-full w-64 bg-white shadow-xl border-r border-pink-100 z-40 hidden md:block">
        <div className="p-6 border-b border-pink-100">
          <h1 className="text-2xl font-bold text-pink-500">BeHealthy Admin</h1>
          <p className="text-gray-500 text-sm mt-1">Quản trị hệ thống</p>
        </div>
        <nav className="p-4 space-y-2">
          <button onClick={() => navigate("/admin")} className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-gray-700 hover:bg-pink-50 hover:text-pink-600 transition">
            🏠 Dashboard
          </button>
          <button onClick={() => navigate("/admin/quan-ly-bac-si")} className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-gray-700 hover:bg-pink-50 hover:text-pink-600 transition">
            👨‍⚕️ Quản lý Bác sĩ
          </button>
          <button className="w-full flex items-center gap-3 px-4 py-3 rounded-xl bg-pink-50 text-pink-600 font-medium">
            💊 Quản lý Thuốc
          </button>
        </nav>
        <div className="absolute bottom-8 left-4 right-4">
          <button onClick={() => { localStorage.clear(); navigate("/login"); }} className="w-full bg-red-500 hover:bg-red-600 text-white py-3 rounded-xl font-medium flex items-center justify-center gap-2">
            🚪 Đăng xuất
          </button>
        </div>
      </aside>

      <div className="md:ml-64 min-h-screen">
        <header className="bg-white shadow-sm border-b border-pink-100 sticky top-0 z-30">
          <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
            <div className="flex items-center gap-4">
              <button onClick={() => navigate(-1)} className="flex items-center gap-2 bg-pink-100 hover:bg-pink-200 text-pink-700 px-5 py-2.5 rounded-xl font-medium">
                ← Quay về
              </button>
              <h1 className="text-2xl md:text-3xl font-bold text-gray-800">💊 Quản lý Thuốc</h1>
            </div>
          </div>
        </header>

        <main className="p-6 md:p-10">
          {/* ==================== FORM THÊM / SỬA THUỐC ==================== */}
          <div className="bg-white rounded-2xl shadow-lg p-8 mb-10 border border-pink-100">
            <h2 className="text-2xl font-bold text-gray-800 mb-6">
              {selectedMedicine ? "Chỉnh sửa thông tin thuốc" : "Thêm thuốc mới"}
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              <div>
                <label className="block text-gray-700 font-medium mb-2">Tên thuốc *</label>
                <input name="ten_thuoc" value={formData.ten_thuoc} onChange={handleChange} className="w-full border border-gray-300 p-3 rounded-xl focus:ring-2 focus:ring-pink-400" placeholder="Paracetamol 500mg" />
              </div>
              <div>
                <label className="block text-gray-700 font-medium mb-2">Mã thuốc *</label>
                <input name="ma_thuoc" value={formData.ma_thuoc} onChange={handleChange} className="w-full border border-gray-300 p-3 rounded-xl focus:ring-2 focus:ring-pink-400" placeholder="PARA500" />
              </div>
              <div>
                <label className="block text-gray-700 font-medium mb-2">Loại thuốc</label>
                <select name="loai_thuoc" value={formData.loai_thuoc} onChange={handleChange} className="w-full border border-gray-300 p-3 rounded-xl bg-white">
                  <option value="Kháng sinh">Kháng sinh</option>
                  <option value="Giảm đau - Hạ sốt">Giảm đau - Hạ sốt</option>
                  <option value="Vitamin - Khoáng chất">Vitamin - Khoáng chất</option>
                  <option value="Tim mạch">Tim mạch</option>
                  <option value="Tiêu hóa">Tiêu hóa</option>
                  <option value="Khác">Khác</option>
                </select>
              </div>

              <div>
                <label className="block text-gray-700 font-medium mb-2">Đơn vị</label>
                <input name="don_vi" value={formData.don_vi} onChange={handleChange} className="w-full border border-gray-300 p-3 rounded-xl" placeholder="Viên, Hộp, Lọ..." />
              </div>
              <div>
                <label className="block text-gray-700 font-medium mb-2">Số lượng tồn kho</label>
                <input name="so_luong_ton" type="number" value={formData.so_luong_ton} onChange={handleChange} className="w-full border border-gray-300 p-3 rounded-xl" />
              </div>
              <div>
                <label className="block text-gray-700 font-medium mb-2">Giá nhập (VNĐ)</label>
                <input name="gia_nhap" type="number" value={formData.gia_nhap} onChange={handleChange} className="w-full border border-gray-300 p-3 rounded-xl" />
              </div>
              <div>
                <label className="block text-gray-700 font-medium mb-2">Giá bán (VNĐ)</label>
                <input name="gia_ban" type="number" value={formData.gia_ban} onChange={handleChange} className="w-full border border-gray-300 p-3 rounded-xl" />
              </div>
              <div>
                <label className="block text-gray-700 font-medium mb-2">Ngày nhập kho</label>
                <input name="ngay_nhap" type="date" value={formData.ngay_nhap} onChange={handleChange} className="w-full border border-gray-300 p-3 rounded-xl" />
              </div>
              <div>
                <label className="block text-gray-700 font-medium mb-2">Hạn sử dụng</label>
                <input name="han_su_dung" type="date" value={formData.han_su_dung} onChange={handleChange} className="w-full border border-gray-300 p-3 rounded-xl" />
              </div>
              <div>
                <label className="block text-gray-700 font-medium mb-2">Nhà cung cấp</label>
                <input name="nha_cung_cap" value={formData.nha_cung_cap} onChange={handleChange} className="w-full border border-gray-300 p-3 rounded-xl" placeholder="Công ty Dược phẩm XYZ" />
              </div>

              <div className="lg:col-span-3">
                <label className="block text-gray-700 font-medium mb-2">Mô tả / Công dụng</label>
                <textarea name="mo_ta" value={formData.mo_ta} onChange={handleChange} rows="3" className="w-full border border-gray-300 p-3 rounded-xl" placeholder="Công dụng, liều dùng, thành phần chính..." />
              </div>
            </div>

            <div className="mt-8 flex gap-4">
              <button onClick={saveMedicine} className="bg-pink-500 hover:bg-pink-600 text-white px-8 py-3 rounded-xl font-semibold shadow-md transition hover:scale-105">
                {selectedMedicine ? "Cập nhật thuốc" : "Thêm thuốc mới"}
              </button>
              {selectedMedicine && (
                <button onClick={resetForm} className="bg-gray-400 hover:bg-gray-500 text-white px-8 py-3 rounded-xl font-semibold">Hủy chỉnh sửa</button>
              )}
            </div>
          </div>

          {/* Nhập/Xuất kho nhanh */}
          <div className="bg-white rounded-2xl shadow-lg p-8 mb-10 border border-pink-100">
            <h2 className="text-xl font-bold mb-4">Nhập / Xuất kho nhanh</h2>
            <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
              <select name="id_thuoc" value={stockForm.id_thuoc} onChange={handleStockChange} className="border p-3 rounded-xl">
                <option value="">Chọn thuốc</option>
                {medicines.map(m => (
                  <option key={m.id_thuoc} value={m.id_thuoc}>{m.ten_thuoc} ({m.ma_thuoc})</option>
                ))}
              </select>
              <input name="so_luong" type="number" value={stockForm.so_luong} onChange={handleStockChange} placeholder="Số lượng" className="border p-3 rounded-xl" />
              <select name="loai" value={stockForm.loai} onChange={handleStockChange} className="border p-3 rounded-xl">
                <option value="nhap">Nhập kho (+)</option>
                <option value="xuat">Xuất kho (-)</option>
              </select>
              <input name="ghi_chu" value={stockForm.ghi_chu} onChange={handleStockChange} placeholder="Ghi chú" className="border p-3 rounded-xl" />
              <button onClick={handleStockOperation} className="bg-emerald-500 hover:bg-emerald-600 text-white py-3 rounded-xl font-semibold">
                Thực hiện
              </button>
            </div>
          </div>

          {/* Toolbar Excel */}
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-bold text-gray-800">📋 Danh sách thuốc trong kho</h2>
            <div className="flex gap-3">
              <button onClick={exportToExcel} className="bg-green-500 hover:bg-green-600 text-white px-6 py-3 rounded-xl flex items-center gap-2">
                📥 Xuất Excel
              </button>
              <label className="bg-blue-500 hover:bg-blue-600 text-white px-6 py-3 rounded-xl flex items-center gap-2 cursor-pointer">
                📤 Nhập từ Excel
                <input type="file" accept=".xlsx,.xls" onChange={importFromExcel} className="hidden" />
              </label>
            </div>
          </div>

          {/* Bảng danh sách */}
          <div className="bg-white rounded-2xl shadow-lg overflow-hidden border border-pink-100">
            <table className="w-full text-left">
              <thead className="bg-pink-500 text-white">
                <tr>
                  <th className="p-4">Mã thuốc</th>
                  <th className="p-4">Tên thuốc</th>
                  <th className="p-4">Loại</th>
                  <th className="p-4">Đơn vị</th>
                  <th className="p-4 text-right">Giá nhập</th>
                  <th className="p-4 text-right">Giá bán</th>
                  <th className="p-4 text-center">Tồn kho</th>
                  <th className="p-4">Ngày nhập</th>
                  <th className="p-4">Hạn sử dụng</th>
                  <th className="p-4">Nhà cung cấp</th>
                  <th className="p-4 text-center">Hành động</th>
                </tr>
              </thead>
              <tbody>
                {medicines.length > 0 ? medicines.map((med) => (
                  <tr key={med.id_thuoc} className="border-b hover:bg-pink-50 transition">
                    <td className="p-4 font-medium">{med.ma_thuoc}</td>
                    <td className="p-4 font-semibold">{med.ten_thuoc}</td>
                    <td className="p-4">{med.loai_thuoc}</td>
                    <td className="p-4">{med.don_vi}</td>
                    <td className="p-4 text-right">{Number(med.gia_nhap).toLocaleString()} ₫</td>
                    <td className="p-4 text-right">{Number(med.gia_ban).toLocaleString()} ₫</td>
                    <td className="p-4 text-center font-bold text-emerald-600">{med.so_luong_ton}</td>
                    <td className="p-4">{med.ngay_nhap || "—"}</td>
                    <td className="p-4">{med.han_su_dung || "—"}</td>
                    <td className="p-4">{med.nha_cung_cap || "—"}</td>
                    <td className="p-4 text-center space-x-2">
                      <button onClick={() => editMedicine(med)} className="bg-yellow-500 hover:bg-yellow-600 text-white px-4 py-1.5 rounded-lg text-sm">Sửa</button>
                      <button onClick={() => deleteMedicine(med.id_thuoc)} className="bg-red-500 hover:bg-red-600 text-white px-4 py-1.5 rounded-lg text-sm">Xóa</button>
                    </td>
                  </tr>
                )) : (
                  <tr>
                    <td colSpan="11" className="text-center p-12 text-gray-500 text-lg">
                      Chưa có thuốc nào trong kho 💊
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

export default PrescriptionManage;