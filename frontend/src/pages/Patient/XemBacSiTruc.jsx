import React, { useEffect, useState } from "react";
import axios from "axios";

const XemBacSiTruc = () => {
  const [currentDoctors, setCurrentDoctors] = useState([]);
  const [nextDoctors, setNextDoctors] = useState([]);
  const [allDoctors, setAllDoctors] = useState([]);
  const [activeTab, setActiveTab] = useState("current");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [lastUpdated, setLastUpdated] = useState(new Date());

  const API_BASE = "http://127.0.0.1:8000";

  const isDoctorActive = (doc) => {
    if (!doc.ngay || !doc.thoi_gian_bat_dau || !doc.thoi_gian_ket_thuc) return false;

    const [d, m, y] = doc.ngay.split("/").map(Number);
    const shiftDate = new Date(y, m - 1, d);

    const [sh, sm] = doc.thoi_gian_bat_dau.split(":").map(Number);
    const [eh, em] = doc.thoi_gian_ket_thuc.split(":").map(Number);

    const now = new Date();
    const start = new Date(shiftDate);
    start.setHours(sh, sm, 0, 0);

    const end = new Date(shiftDate);
    end.setHours(eh, em, 0, 0);

    if (end < start) end.setDate(end.getDate() + 1);

    return now >= start && now < end;
  };

  const fetchData = async () => {
    setLoading(true);
    setError(null);

    try {
      const resShift = await axios.get(`${API_BASE}/schedule/doctors/current-and-next`, {
        params: { days_ahead: 5 },
      });

      const resAll = await axios.get(`${API_BASE}/schedule/doctors/all`);

      const enrichedCurrent = (resShift.data.current || []).map(doc => ({
        ...doc,
        isActive: isDoctorActive(doc),
      }));

      const sortOrder = { Sáng: 1, Chiều: 2, "Cả ngày": 3 };
      const enrichedNext = (resShift.data.next || []).sort((a, b) => {
        const da = new Date(a.ngay.split("/").reverse().join("-"));
        const db = new Date(b.ngay.split("/").reverse().join("-"));
        if (da.getTime() !== db.getTime()) return da - db;
        return (sortOrder[a.ca_truc] || 999) - (sortOrder[b.ca_truc] || 999);
      });

      setCurrentDoctors(enrichedCurrent);
      setNextDoctors(enrichedNext);
      setAllDoctors(resAll.data.doctors || []);
      setLastUpdated(new Date());
    } catch (err) {
      console.error("Lỗi tải dữ liệu:", err);
      setError("Không tải được dữ liệu. Vui lòng kiểm tra kết nối hoặc server.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
    const interval = setInterval(fetchData, 5 * 60 * 1000);
    return () => clearInterval(interval);
  }, []);

  const DoctorCard = ({ doc, isAll = false }) => {
    const statusBg = doc.isActive ? "bg-green-500" : "bg-gray-400";
    const statusText = doc.isActive ? "ĐANG TRỰC" : "SẮP TỚI";

    return (
      <div className="group bg-white rounded-3xl shadow-lg hover:shadow-2xl transition-all duration-300 overflow-hidden border border-pink-100">
        {/* Header gradient hồng-tím */}
        <div className="relative h-40 bg-gradient-to-br from-pink-500 via-purple-500 to-indigo-600">
          <div className="absolute -bottom-12 left-6">
            <img
              src={doc.avatar || "https://cdn-icons-png.flaticon.com/512/3135/3135715.png"}
              alt={doc.ten_bac_si}
              className="w-24 h-24 rounded-full border-4 border-white shadow-xl object-cover"
            />
          </div>

          {/* Badge trạng thái */}
          <div className={`absolute top-5 right-5 flex items-center gap-2 ${statusBg} text-white text-xs font-bold px-4 py-1.5 rounded-full shadow-md`}>
            <span className="relative flex h-3 w-3">
              {doc.isActive && (
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-white opacity-75"></span>
              )}
              <span className="relative inline-flex rounded-full h-3 w-3 bg-white"></span>
            </span>
            {statusText}
          </div>
        </div>

        {/* Nội dung */}
        <div className="pt-16 px-6 pb-6">
          <h3 className="text-2xl font-bold text-gray-900 truncate">{doc.ten_bac_si || "Chưa xác định"}</h3>
          <p className="text-base text-purple-700 font-medium mt-1">{doc.chuyen_khoa || "Khoa lâm sàng / Trực khoa"}</p>

          {!isAll && (
            <div className="mt-3 flex items-center gap-2 text-sm text-gray-600">
              <span className="font-medium">{doc.ca_truc}</span>
              <span>•</span>
              <span>{doc.ngay}</span>
              {doc.isActive && <span className="text-green-600 font-semibold ml-2">(Đang trực)</span>}
            </div>
          )}

          <div className="mt-5 text-sm space-y-2.5 text-gray-700">
            {doc.ghi_chu && (
              <p className="italic text-gray-600 border-l-4 border-pink-400 pl-3 leading-relaxed">
                {doc.ghi_chu}
              </p>
            )}
            {doc.sdt && (
              <p className="flex items-center gap-2">
                <span className="text-pink-600 text-lg">📞</span>
                <a href={`tel:${doc.sdt.replace(/\s+/g, "")}`} className="hover:text-pink-600 transition">
                  {doc.sdt}
                </a>
              </p>
            )}
            {doc.email && (
              <p className="flex items-center gap-2">
                <span className="text-purple-600 text-lg">✉️</span>
                <a href={`mailto:${doc.email}`} className="hover:text-purple-600 transition break-all">
                  {doc.email}
                </a>
              </p>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-5 bg-pink-50/50 border-t flex gap-4">
          {doc.sdt && (
            <a
              href={`tel:${doc.sdt.replace(/\s+/g, "")}`}
              className="flex-1 text-center py-3 bg-pink-600 hover:bg-pink-700 text-white font-semibold rounded-xl transition shadow-md"
            >
              Gọi ngay
            </a>
          )}
          {doc.email && (
            <a
              href={`mailto:${doc.email}`}
              className="flex-1 text-center py-3 bg-purple-600 hover:bg-purple-700 text-white font-semibold rounded-xl transition shadow-md"
            >
              Gửi email
            </a>
          )}
          {!doc.sdt && !doc.email && (
            <button
              disabled
              className="flex-1 py-3 bg-gray-300 text-gray-500 font-semibold rounded-xl cursor-not-allowed"
            >
              Chưa có liên hệ
            </button>
          )}
        </div>
      </div>
    );
  };

  const renderContent = () => {
    if (loading) {
      return (
        <div className="flex flex-col items-center justify-center py-40">
          <div className="animate-spin rounded-full h-20 w-20 border-t-4 border-pink-500 border-b-4 border-purple-300"></div>
          <p className="mt-8 text-2xl font-medium text-gray-700">Đang tải danh sách bác sĩ...</p>
        </div>
      );
    }

    if (error) {
      return (
        <div className="bg-red-50 border border-red-200 rounded-3xl p-12 text-center max-w-3xl mx-auto shadow-lg">
          <p className="text-red-700 text-2xl font-medium">{error}</p>
          <button
            onClick={fetchData}
            className="mt-8 px-10 py-4 bg-pink-600 text-white text-lg font-semibold rounded-2xl hover:bg-pink-700 transition shadow-md"
          >
            Thử tải lại
          </button>
        </div>
      );
    }

    let list = activeTab === "current" ? currentDoctors :
                activeTab === "next"    ? nextDoctors :
                allDoctors;

    let title = activeTab === "current" ? "Bác sĩ đang trực" :
                activeTab === "next"    ? "Ca trực sắp tới" :
                "Danh sách tất cả bác sĩ";

    let emptyText = activeTab === "current" ? "Hiện tại chưa có bác sĩ nào đang trực" :
                    activeTab === "next"    ? "Không có ca trực nào trong vài ngày tới" :
                    "Chưa có dữ liệu bác sĩ";

    if (!list.length) {
      return (
        <div className="bg-white rounded-3xl p-16 text-center shadow-lg border border-pink-100">
          <p className="text-gray-600 text-2xl font-medium">{emptyText}</p>
        </div>
      );
    }

    return (
      <>
        <h2 className="text-4xl sm:text-5xl font-extrabold mb-12 text-center bg-gradient-to-r from-pink-600 via-purple-600 to-indigo-600 bg-clip-text text-transparent">
          {title}
        </h2>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 md:gap-8">
          {list.map((doc, index) => (
            <DoctorCard
              key={`${doc.ten_bac_si}-${doc.ngay || "all"}-${index}`}
              doc={doc}
              isAll={activeTab === "all"}
            />
          ))}
        </div>
      </>
    );
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-50 via-purple-50 to-indigo-50 py-12 px-4 sm:px-6 lg:px-10">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="text-center mb-16">
          <h1 className="text-5xl sm:text-6xl md:text-7xl font-extrabold bg-gradient-to-r from-pink-600 via-purple-600 to-indigo-600 bg-clip-text text-transparent mb-6">
            Bác Sĩ Trực & Danh Sách
          </h1>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 text-gray-700 text-lg">
            <span>Cập nhật lúc:</span>
            <span className="font-semibold text-purple-700">
              {lastUpdated.toLocaleString("vi-VN", {
                hour: "2-digit",
                minute: "2-digit",
                day: "2-digit",
                month: "2-digit",
                year: "numeric",
              })}
            </span>
            <button
              onClick={fetchData}
              className="px-6 py-3 bg-white border border-pink-300 rounded-2xl shadow hover:bg-pink-50 transition font-medium flex items-center gap-2"
            >
              <span>↻</span> Làm mới
            </button>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex justify-center mb-16">
          <div className="inline-flex bg-white rounded-full shadow-xl p-2 border border-pink-200">
            {["current", "next", "all"].map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`px-10 py-4 rounded-full font-bold text-base transition-all duration-300 ${
                  activeTab === tab
                    ? "bg-gradient-to-r from-pink-600 to-purple-600 text-white shadow-lg"
                    : "text-gray-700 hover:bg-pink-50"
                }`}
              >
                {tab === "current" ? "Đang trực" : tab === "next" ? "Sắp tới" : "Tất cả"}
              </button>
            ))}
          </div>
        </div>

        {/* Nội dung chính */}
        {renderContent()}
      </div>
    </div>
  );
};

export default XemBacSiTruc;