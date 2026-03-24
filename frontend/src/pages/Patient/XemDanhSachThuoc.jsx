import React, { useEffect, useState } from "react";
import axios from "axios";

/**
 * Component hiển thị danh sách thuốc
 * Cho phép xem, tìm kiếm theo tên thuốc hoặc mã thuốc
 */
const XemDanhSachThuoc = () => {
  // ==================== STATE ====================
  const [medicines, setMedicines] = useState([]);        // Danh sách tất cả thuốc
  const [loading, setLoading] = useState(true);          // Trạng thái đang tải dữ liệu
  const [searchTerm, setSearchTerm] = useState("");      // Từ khóa tìm kiếm

  // ==================== SIDE EFFECTS ====================
  /**
   * Gọi API lấy danh sách thuốc khi component mount
   */
  useEffect(() => {
    fetchMedicines();
  }, []);

  // ==================== API CALLS ====================
  /**
   * Lấy danh sách thuốc từ backend
   */
  const fetchMedicines = async () => {
    try {
      const res = await axios.get("http://localhost:8000/medicines/");
      setMedicines(res.data);
    } catch (error) {
      console.error("Lỗi khi tải danh sách thuốc:", error);
      alert("Không thể tải danh sách thuốc. Vui lòng thử lại sau!");
    } finally {
      setLoading(false);
    }
  };

  // ==================== HELPER FUNCTIONS ====================
  /**
   * Định dạng số tiền theo kiểu Việt Nam (ví dụ: 150.000 ₫)
   */
  const formatCurrency = (amount) => {
    return Number(amount).toLocaleString("vi-VN") + " ₫";
  };

  /**
   * Định dạng ngày tháng theo kiểu Việt Nam (dd/mm/yyyy)
   */
  const formatDate = (dateStr) => {
    if (!dateStr) return "—";
    const date = new Date(dateStr);
    return date.toLocaleDateString("vi-VN");
  };

  // ==================== FILTERING ====================
  /**
   * Lọc danh sách thuốc theo từ khóa tìm kiếm (tên thuốc hoặc mã thuốc)
   */
  const filteredMedicines = medicines.filter((thuoc) =>
    thuoc.ten_thuoc.toLowerCase().includes(searchTerm.toLowerCase()) ||
    thuoc.ma_thuoc.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // ==================== RENDER LOADING ====================
  if (loading) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-pink-500 text-xl font-semibold animate-pulse">
          Đang tải danh sách thuốc...
        </div>
      </div>
    );
  }

  // ==================== MAIN RENDER ====================
  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-50 via-white to-pink-50 py-16 px-6 md:px-10 relative overflow-hidden">
      {/* Background decorative elements */}
      <div className="absolute inset-0 -z-10 opacity-30 pointer-events-none">
        <div className="absolute top-40 right-20 w-96 h-96 bg-pink-200 rounded-full blur-3xl"></div>
        <div className="absolute bottom-20 left-20 w-80 h-80 bg-pink-100 rounded-full blur-3xl"></div>
      </div>

      <div className="max-w-7xl mx-auto">
        {/* ==================== HEADER & SEARCH ==================== */}
        <div className="flex flex-col md:flex-row md:justify-between md:items-start gap-8 mb-12">
          {/* Tiêu đề */}
          <div>
            <h1 className="text-4xl md:text-5xl font-bold text-gray-800 mb-3">
              Danh sách thuốc
            </h1>
            <p className="text-gray-600 text-lg">
              Xem thông tin thuốc có sẵn tại phòng khám
            </p>
          </div>

          {/* Thanh tìm kiếm */}
          <div className="w-full md:w-96">
            <input
              type="text"
              placeholder="🔍 Tìm theo tên thuốc hoặc mã thuốc..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full border border-gray-300 focus:border-pink-400 focus:ring-2 focus:ring-pink-300 rounded-2xl px-6 py-4 text-lg outline-none transition"
            />
          </div>
        </div>

        {/* ==================== TABLE ==================== */}
        <div className="bg-white shadow-xl rounded-3xl overflow-hidden border border-pink-100">
          <table className="w-full text-left">
            <thead className="bg-pink-500 text-white">
              <tr>
                <th className="p-5 font-semibold">Mã thuốc</th>
                <th className="p-5 font-semibold">Tên thuốc</th>
                <th className="p-5 font-semibold">Loại</th>
                <th className="p-5 font-semibold">Đơn vị</th>
                <th className="p-5 font-semibold text-right">Giá bán</th>
                <th className="p-5 font-semibold text-center">Tồn kho</th>
                <th className="p-5 font-semibold">Hạn sử dụng</th>
                <th className="p-5 font-semibold">Nhà cung cấp</th>
              </tr>
            </thead>

            <tbody>
              {filteredMedicines.length === 0 ? (
                <tr>
                  <td
                    colSpan="8"
                    className="text-center p-16 text-gray-500 text-lg"
                  >
                    Không tìm thấy thuốc nào phù hợp 💊
                  </td>
                </tr>
              ) : (
                filteredMedicines.map((thuoc) => (
                  <tr
                    key={thuoc.id_thuoc}
                    className="border-b border-gray-100 hover:bg-pink-50 transition duration-200"
                  >
                    <td className="p-5 font-medium text-gray-700">{thuoc.ma_thuoc}</td>
                    <td className="p-5 font-semibold text-gray-800">{thuoc.ten_thuoc}</td>
                    <td className="p-5 text-gray-600">{thuoc.loai_thuoc}</td>
                    <td className="p-5 text-gray-600">{thuoc.don_vi}</td>
                    <td className="p-5 text-right font-medium text-emerald-600">
                      {formatCurrency(thuoc.gia_ban)}
                    </td>
                    <td className="p-5 text-center">
                      <span
                        className={`inline-block px-4 py-1 rounded-full text-sm font-bold ${
                          thuoc.so_luong_ton > 10
                            ? "bg-emerald-100 text-emerald-700"
                            : thuoc.so_luong_ton > 0
                            ? "bg-amber-100 text-amber-700"
                            : "bg-red-100 text-red-700"
                        }`}
                      >
                        {thuoc.so_luong_ton}
                      </span>
                    </td>
                    <td className="p-5 text-gray-600">
                      {formatDate(thuoc.han_su_dung)}
                    </td>
                    <td className="p-5 text-gray-600">
                      {thuoc.nha_cung_cap || "—"}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* ==================== FOOTER NOTE ==================== */}
        <div className="text-center mt-10 text-gray-500 text-sm">
          * Giá trên là giá tham khảo. Vui lòng liên hệ quầy thuốc để biết thêm chi tiết.
        </div>
      </div>
    </div>
  );
};

export default XemDanhSachThuoc;