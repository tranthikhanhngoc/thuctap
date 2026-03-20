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
      // 1. Ca hiện tại & kế tiếp
      const resShift = await axios.get(`${API_BASE}/schedule/doctors/current-and-next`, {
        params: { days_ahead: 5 },
      });

      // 2. Tất cả bác sĩ
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
      console.error(err);
      setError("Không tải được dữ liệu bác sĩ trực. Vui lòng kiểm tra server.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
    const timer = setInterval(fetchData, 300000); // 5 phút
    return () => clearInterval(timer);
  }, []);

  const DoctorCard = ({ doc, isAll = false }) => (
    <div className={`bg-white rounded-xl shadow-lg p-5 border ${doc.isActive ? "border-green-500 ring-2 ring-green-200" : "border-gray-200"} hover:shadow-xl transition`}>
      <div className="flex items-center gap-4">
        <img
          src={doc.avatar || "https://cdn-icons-png.flaticon.com/512/387/387561.png"}
          alt={doc.ten_bac_si}
          className="w-16 h-16 rounded-full object-cover border-2 border-gray-300"
        />
        <div>
          <h3 className="font-bold text-lg">{doc.ten_bac_si || "Chưa xác định"}</h3>
          <p className="text-sm text-blue-600">{doc.chuyen_khoa || "Giảng viên / Trực khoa"}</p>
          {!isAll && (
            <p className="text-xs text-gray-500 mt-1">
              {doc.ca_truc} • {doc.ngay} {doc.isActive && <span className="text-green-600 font-semibold">(Đang trực)</span>}
            </p>
          )}
        </div>
      </div>

      <div className="mt-4 text-sm text-gray-700">
        {doc.ghi_chu && <p className="italic">Ghi chú: {doc.ghi_chu}</p>}
        {doc.sdt && <p>📞 {doc.sdt}</p>}
        {doc.email && <p>✉️ {doc.email}</p>}
      </div>
    </div>
  );

  const renderList = () => {
    let data = activeTab === "current" ? currentDoctors :
               activeTab === "next"    ? nextDoctors :
               allDoctors;

    let title = activeTab === "current" ? "Bác sĩ đang trực" :
                activeTab === "next"    ? "Ca trực sắp tới" :
                "Danh sách tất cả bác sĩ";

    if (loading) return <p className="text-center py-20">Đang tải...</p>;
    if (error) return <p className="text-red-600 text-center py-20">{error}</p>;
    if (!data.length) return <p className="text-gray-500 text-center py-20">Không có dữ liệu</p>;

    return (
      <>
        <h2 className="text-2xl font-bold mb-6 text-center">{title}</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {data.map((doc, i) => <DoctorCard key={i} doc={doc} isAll={activeTab === "all"} />)}
        </div>
      </>
    );
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-6xl mx-auto">
        <h1 className="text-4xl font-bold text-center mb-8 text-gray-800">Bác Sĩ Trực Hôm Nay & Sắp Tới</h1>

        <div className="flex justify-center mb-10 space-x-4">
          {["current", "next", "all"].map(tab => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-6 py-3 rounded-full font-medium transition ${
                activeTab === tab
                  ? "bg-blue-600 text-white shadow-lg"
                  : "bg-white text-gray-700 hover:bg-gray-100 shadow"
              }`}
            >
              {tab === "current" ? "Đang trực" : tab === "next" ? "Sắp tới" : "Tất cả"}
            </button>
          ))}
        </div>

        {renderList()}

        <p className="text-center text-sm text-gray-500 mt-10">
          Cập nhật lúc: {lastUpdated.toLocaleString("vi-VN")}
        </p>
      </div>
    </div>
  );
};

export default XemBacSiTruc;