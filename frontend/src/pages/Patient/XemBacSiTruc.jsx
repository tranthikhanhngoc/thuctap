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

  const API_BASE = "http://127.0.0.1:8000"; // thay bằng env variable khi deploy

  const fetchData = async () => {
    setLoading(true);
    setError(null);

    try {
      // 1. Lấy ca hiện tại & kế tiếp
      const resShift = await axios.get(`${API_BASE}/schedule/doctors/current-and-next`, {
        params: { days_ahead: 3 }, // có thể tăng lên 3-5 tùy nhu cầu
      });
      console.log("Ca trực hiện tại & kế tiếp raw response:", resShift.data);

      // 2. Lấy danh sách tất cả bác sĩ
      const resAll = await axios.get(`${API_BASE}/schedule/doctors/all`);
      console.log("Tất cả bác sĩ raw response:", resAll.data);

      const now = new Date();

      // Hàm helper: kiểm tra ca có đang active không (chính xác hơn)
      const isDoctorActive = (doc) => {
  if (!doc.ngay || !doc.thoi_gian_bat_dau || !doc.thoi_gian_ket_thuc) return false;

  const [day, month, year] = doc.ngay.split("/").map(Number);
  const shiftDate = new Date(year, month - 1, day);

  const [startH, startM] = doc.thoi_gian_bat_dau.split(":").map(Number);
  const [endH, endM]   = doc.thoi_gian_ket_thuc.split(":").map(Number);

  const now = new Date();
  const startTime = new Date(shiftDate);
  startTime.setHours(startH, startM, 0, 0);

  const endTime = new Date(shiftDate);
  endTime.setHours(endH, endM, 0, 0);

  // Nếu ca chiều kết thúc trước bắt đầu (lỗi dữ liệu) → giả sử qua ngày
  if (endTime < startTime) endTime.setDate(endTime.getDate() + 1);

  return now >= startTime && now < endTime;
};

      const enrichedCurrent = (resShift.data.current || []).map((doc) => ({
        ...doc,
        isActive: isDoctorActive(doc),
      }));

      // Sort nextDoctors theo ngày + ca (ưu tiên Sáng > Chiều > Cả ngày)
      const sortOrder = { Sáng: 1, Chiều: 2, "Cả ngày": 3, "Cả Ngày": 3 };
      const enrichedNext = (resShift.data.next || []).sort((a, b) => {
        const dateA = new Date(a.ngay.split("/").reverse().join("-"));
        const dateB = new Date(b.ngay.split("/").reverse().join("-"));
        if (dateA.getTime() !== dateB.getTime()) return dateA - dateB;
        return (sortOrder[a.ca_truc] || 999) - (sortOrder[b.ca_truc] || 999);
      });

      setCurrentDoctors(enrichedCurrent);
      setNextDoctors(enrichedNext);
      setAllDoctors(resAll.data.doctors || []);
      setLastUpdated(new Date());
    } catch (err) {
      console.error("Lỗi khi tải dữ liệu:", err);
      setError("Không thể tải dữ liệu bác sĩ. Vui lòng kiểm tra server hoặc thử lại sau.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
    const interval = setInterval(fetchData, 5 * 60 * 1000); // 5 phút
    return () => clearInterval(interval);
  }, []);

  const DoctorCard = ({ doc, isAllTab = false }) => {
    const hasContact = !!doc.sdt;
    const showActiveDot = !isAllTab && doc.isActive;

    return (
      <div
        className={`group bg-white rounded-3xl shadow-xl overflow-hidden transition-all duration-300 flex flex-col border ${
          showActiveDot ? "border-green-400 ring-1 ring-green-300" : "border-gray-100"
        } hover:shadow-2xl hover:-translate-y-1`}
      >
        <div className="p-6 pb-4 bg-gradient-to-br from-blue-50 to-white">
          <div className="flex items-center gap-4">
            <div className="relative flex-shrink-0">
              <img
                src={doc.avatar || "https://cdn-icons-png.flaticon.com/512/387/387561.png"}
                alt={doc.ten_bac_si}
                className="w-20 h-20 rounded-2xl object-cover border-4 border-white shadow-md"
              />
              {showActiveDot && (
                <span className="absolute -top-1 -right-1 flex h-5 w-5">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-5 w-5 bg-green-500 border-2 border-white"></span>
                </span>
              )}
            </div>

            <div className="flex-1 min-w-0">
              <h3 className="font-bold text-xl text-gray-900 truncate">
                {doc.ten_bac_si || "Chưa xác định"}
              </h3>
              <p className="text-blue-600 font-medium">
                {doc.chuyen_khoa || "Khoa lâm sàng / Giảng viên"}
              </p>
              {!isAllTab && (
                <p className="text-sm text-gray-500 mt-1">
                  {doc.ca_truc && (
                    <>
                      Ca <span className="font-semibold">{doc.ca_truc}</span> •{" "}
                    </>
                  )}
                  {doc.ngay || "—"}
                </p>
              )}
            </div>
          </div>
        </div>

       <div className="px-6 py-5 text-gray-700 space-y-3 flex-grow">
  {doc.ghi_chu && (
    <p className="text-sm italic text-gray-600 border-l-4 border-blue-400 pl-3">
      {doc.ghi_chu}
    </p>
  )}

  {/* Thêm phần này */}
  {(doc.sdt || doc.email) && (
    <div className="text-sm space-y-1 mt-3 pt-3 border-t border-gray-200">
      {doc.sdt && (
        <p>
          📞 <span className="font-medium">SĐT:</span>{" "}
          <a href={`tel:${doc.sdt.replace(/\s+/g, "")}`} className="text-blue-600 hover:underline">
            {doc.sdt}
          </a>
        </p>
      )}
      {doc.email && (
        <p>
          ✉️ <span className="font-medium">Email:</span>{" "}
          <a href={`mailto:${doc.email}`} className="text-blue-600 hover:underline break-all">
            {doc.email}
          </a>
        </p>
      )}
    </div>
  )}
</div>

        <div className="px-6 py-5 bg-gray-50 border-t mt-auto">
          {hasContact ? (
            <a
              href={`tel:${doc.sdt.replace(/\s+/g, "")}`}
              className="block text-center py-3 px-6 bg-green-600 hover:bg-green-700 text-white font-semibold rounded-2xl transition shadow-sm"
            >
              📞 Gọi ngay
            </a>
          ) : (
            <button
              disabled
              className="block w-full py-3 px-6 bg-gray-300 text-gray-500 font-medium rounded-2xl cursor-not-allowed"
            >
              Chưa có thông tin liên hệ
            </button>
          )}
        </div>
      </div>
    );
  };

  const renderContent = () => {
    if (loading) {
      return (
        <div className="flex flex-col items-center justify-center py-32">
          <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-blue-600 border-b-4 border-blue-200"></div>
          <p className="mt-6 text-xl text-gray-700 font-medium">Đang tải dữ liệu...</p>
        </div>
      );
    }

    if (error) {
      return (
        <div className="bg-red-50 border border-red-200 rounded-2xl p-8 text-center max-w-2xl mx-auto">
          <p className="text-red-700 text-xl font-medium">{error}</p>
          <button
            onClick={fetchData}
            className="mt-4 px-6 py-2 bg-red-600 text-white rounded-xl hover:bg-red-700"
          >
            Thử lại
          </button>
        </div>
      );
    }

    let list = [];
    let title = "";
    let emptyText = "";

    switch (activeTab) {
      case "current":
        list = currentDoctors;
        title = "🔴 Bác sĩ đang trực";
        emptyText = "Hiện tại chưa có bác sĩ nào trong ca trực";
        break;
      case "next":
        list = nextDoctors;
        title = "⏭️ Ca trực sắp tới";
        emptyText = "Không có ca trực nào trong vài ngày tới";
        break;
      case "all":
        list = allDoctors;
        title = "📋 Danh sách tất cả bác sĩ";
        emptyText = "Chưa có dữ liệu bác sĩ nào";
        break;
      default:
        break;
    }

    return (
      <>
        <h2 className="text-3xl font-bold mb-8 text-center text-gray-800">{title}</h2>

        {list.length === 0 ? (
          <div className="bg-white/60 backdrop-blur-sm rounded-2xl p-12 text-center border border-gray-200">
            <p className="text-gray-600 text-xl">{emptyText}</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 md:gap-8">
            {list.map((doc, index) => (
              <DoctorCard
                key={`${doc.ten_bac_si}-${doc.ngay || "all"}-${index}`}
                doc={doc}
                isAllTab={activeTab === "all"}
              />
            ))}
          </div>
        )}
      </>
    );
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-slate-100 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-10">
          <h1 className="text-4xl sm:text-5xl font-extrabold bg-gradient-to-r from-cyan-600 to-blue-700 bg-clip-text text-transparent mb-3">
            Bác Sĩ Trực & Danh Sách
          </h1>
          <p className="text-gray-600 text-lg">
            Cập nhật lúc: {lastUpdated.toLocaleString("vi-VN", {
              hour: "2-digit",
              minute: "2-digit",
              day: "2-digit",
              month: "2-digit",
              year: "numeric",
            })}
          </p>
        </div>

        {/* Tabs */}
        <div className="flex justify-center mb-10">
          <div className="inline-flex rounded-2xl shadow-md bg-white p-1.5">
            <button
              onClick={() => setActiveTab("current")}
              className={`px-6 py-3 rounded-xl font-medium transition-all ${
                activeTab === "current" ? "bg-green-600 text-white shadow" : "text-gray-700 hover:bg-gray-100"
              }`}
            >
              Đang trực
            </button>
            <button
              onClick={() => setActiveTab("next")}
              className={`px-6 py-3 rounded-xl font-medium transition-all ${
                activeTab === "next" ? "bg-indigo-600 text-white shadow" : "text-gray-700 hover:bg-gray-100"
              }`}
            >
              Kế tiếp
            </button>
            <button
              onClick={() => setActiveTab("all")}
              className={`px-6 py-3 rounded-xl font-medium transition-all ${
                activeTab === "all" ? "bg-blue-600 text-white shadow" : "text-gray-700 hover:bg-gray-100"
              }`}
            >
              Tất cả
            </button>
          </div>
        </div>

        {renderContent()}
      </div>
    </div>
  );
};

export default XemBacSiTruc;