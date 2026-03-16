import React, { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";

const ScheduleManage = () => {
  const [activeTab, setActiveTab] = useState("classes");

  const [classes, setClasses] = useState([]);
  const [filteredClasses, setFilteredClasses] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");

  const [selectedClass, setSelectedClass] = useState(null);

  const [scheduleData, setScheduleData] = useState({}); // Lịch của lớp đang chọn
  const [allSchedules, setAllSchedules] = useState({}); // Lịch tất cả lớp
  const [loadingSchedule, setLoadingSchedule] = useState(false);
  const [scheduleError, setScheduleError] = useState(null);

  const [excelFile, setExcelFile] = useState(null);

  // Form thêm lớp
  const [newClass, setNewClass] = useState({
    ten_lop: "",
    khoa: "",
    nien_khoa: "",
    si_so: "",
  });

  const token = localStorage.getItem("access_token");
  const navigate = useNavigate();

  const api = axios.create({
    baseURL: "http://127.0.0.1:8000",
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  const days = ["Thứ Hai", "Thứ Ba", "Thứ Tư", "Thứ Năm", "Thứ Sáu"];

  // Lấy danh sách lớp
  const fetchClasses = async () => {
    try {
      const res = await api.get("/classes/");
      const data = res.data || [];
      setClasses(data);
      setFilteredClasses(data);
    } catch (err) {
      console.error("Lỗi lấy danh sách lớp:", err);
    }
  };

  useEffect(() => {
    fetchClasses();
  }, []);

  // Lọc lớp theo tìm kiếm
  useEffect(() => {
    if (!searchTerm.trim()) {
      setFilteredClasses(classes);
      return;
    }
    const lowerSearch = searchTerm.toLowerCase().trim();
    const filtered = classes.filter((cls) =>
      cls.ten_lop.toLowerCase().includes(lowerSearch)
    );
    setFilteredClasses(filtered);
  }, [searchTerm, classes]);

  // Thêm lớp mới
  const handleAddClass = async () => {
    if (!newClass.ten_lop.trim()) {
      alert("Vui lòng nhập tên lớp");
      return;
    }

    try {
      await api.post("/classes/", newClass);
      alert("Thêm lớp thành công!");
      setNewClass({ ten_lop: "", khoa: "", nien_khoa: "", si_so: "" });
      fetchClasses();
    } catch (err) {
      console.error("Lỗi thêm lớp:", err);
      alert("Thêm lớp thất bại");
    }
  };

  // Upload Excel
  const handleUploadExcel = async () => {
    if (!excelFile) {
      alert("Vui lòng chọn file Excel");
      return;
    }

    const formData = new FormData();
    formData.append("file", excelFile);

    try {
      await api.post("/schedule/upload", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      alert("Upload lịch học thành công!");
      setExcelFile(null);
      fetchClasses();
    } catch (err) {
      console.error("Lỗi upload:", err);
      alert("Upload thất bại: " + (err.response?.data?.error || "Lỗi không xác định"));
    }
  };

  // Chọn lớp → xem lịch chi tiết
  const selectClassForSchedule = (cls) => {
    setSelectedClass(cls);
    setActiveTab("schedule");
    loadSchedule(cls.id_lophoc);
  };

  // Load lịch 1 lớp
  const loadSchedule = async (classId) => {
    setLoadingSchedule(true);
    setScheduleError(null);
    setScheduleData({});

    try {
      const res = await api.get(`/schedule/class/${classId}`);
      const data = res.data || [];

      const scheduleByDay = {};
      data.forEach((item) => {
        const thu = item.thu;
        if (thu >= 1 && thu <= 5) {
          if (!scheduleByDay[thu]) scheduleByDay[thu] = [];
          scheduleByDay[thu].push(item);
        }
      });

      setScheduleData(scheduleByDay);
    } catch (err) {
      console.error("Lỗi load lịch:", err);
      setScheduleError("Không tải được lịch học. Vui lòng thử lại.");
    } finally {
      setLoadingSchedule(false);
    }
  };

  // Load tất cả lịch (tab Lịch tất cả lớp)
  const loadAllSchedules = async () => {
    if (Object.keys(allSchedules).length > 0) return;

    setLoadingSchedule(true);
    setScheduleError(null);

    try {
      const allData = {};
      for (const cls of classes) {
        try {
          const res = await api.get(`/schedule/class/${cls.id_lophoc}`);
          const data = res.data || [];

          const scheduleByDay = {};
          data.forEach((item) => {
            const thu = item.thu;
            if (thu >= 1 && thu <= 5) {
              if (!scheduleByDay[thu]) scheduleByDay[thu] = [];
              scheduleByDay[thu].push(item);
            }
          });

          allData[cls.id_lophoc] = {
            ten_lop: cls.ten_lop,
            schedule: scheduleByDay,
          };
        } catch (err) {
          console.warn(`Lỗi load lịch lớp ${cls.ten_lop}:`, err);
        }
      }

      setAllSchedules(allData);
    } catch (err) {
      console.error("Lỗi load tất cả lịch:", err);
      setScheduleError("Không tải được lịch tổng hợp.");
    } finally {
      setLoadingSchedule(false);
    }
  };

  useEffect(() => {
    if (activeTab === "all-schedules") {
      loadAllSchedules();
    }
  }, [activeTab, classes]);

  // Style ca học
  const getShiftStyle = (ca_hoc) => {
    switch (ca_hoc) {
      case "Sáng":
        return "bg-blue-50 border-blue-300 text-blue-900";
      case "Chiều":
        return "bg-orange-50 border-orange-300 text-orange-900";
      case "Cả ngày":
        return "bg-purple-50 border-purple-300 text-purple-900 font-medium";
      default:
        return "bg-gray-50 border-gray-200 text-gray-700";
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 pb-10">
      {/* Header */}
      <div className="bg-white shadow p-5 flex justify-between items-center">
        <h1 className="text-2xl font-bold text-gray-800">
          Quản lý lớp học & Thời khóa biểu
        </h1>
        <button
          onClick={() => navigate("/admin")}
          className="bg-gray-600 hover:bg-gray-700 text-white px-6 py-2 rounded-md transition"
        >
          Quay lại
        </button>
      </div>

      <div className="p-6 max-w-7xl mx-auto">
        {/* Tabs */}
        <div className="flex gap-6 mb-8 border-b">
          <button
            onClick={() => setActiveTab("classes")}
            className={`pb-4 px-8 font-semibold text-lg transition-all ${
              activeTab === "classes"
                ? "border-b-4 border-pink-500 text-pink-600"
                : "text-gray-600 hover:text-gray-800 hover:border-b-2 hover:border-gray-400"
            }`}
          >
            Quản lý lớp
          </button>

          <button
            onClick={() => setActiveTab("all-schedules")}
            className={`pb-4 px-8 font-semibold text-lg transition-all ${
              activeTab === "all-schedules"
                ? "border-b-4 border-pink-500 text-pink-600"
                : "text-gray-600 hover:text-gray-800 hover:border-b-2 hover:border-gray-400"
            }`}
          >
            Thời khóa biểu tất cả lớp
          </button>

          <button
            onClick={() => setActiveTab("schedule")}
            className={`pb-4 px-8 font-semibold text-lg transition-all ${
              activeTab === "schedule"
                ? "border-b-4 border-pink-500 text-pink-600"
                : "text-gray-600 hover:text-gray-800 hover:border-b-2 hover:border-gray-400"
            }`}
            disabled={!selectedClass}
          >
            Thời khóa biểu lớp {selectedClass?.ten_lop || ""}
          </button>
        </div>

        {/* Tab Quản lý lớp */}
        {activeTab === "classes" && (
          <div className="space-y-10">
            {/* Thêm lớp + Upload */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {/* Form thêm lớp */}
              <div className="bg-white p-6 rounded-xl shadow-md">
                <h2 className="text-xl font-semibold mb-5 text-gray-800">
                  Thêm lớp mới
                </h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <input
                    placeholder="Tên lớp *"
                    value={newClass.ten_lop}
                    onChange={(e) => setNewClass({ ...newClass, ten_lop: e.target.value })}
                    className="border border-gray-300 p-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-pink-400"
                  />
                  <input
                    placeholder="Khoa"
                    value={newClass.khoa}
                    onChange={(e) => setNewClass({ ...newClass, khoa: e.target.value })}
                    className="border border-gray-300 p-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-pink-400"
                  />
                  <input
                    placeholder="Niên khóa"
                    value={newClass.nien_khoa}
                    onChange={(e) => setNewClass({ ...newClass, nien_khoa: e.target.value })}
                    className="border border-gray-300 p-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-pink-400"
                  />
                  <input
                    placeholder="Sĩ số"
                    type="number"
                    value={newClass.si_so}
                    onChange={(e) => setNewClass({ ...newClass, si_so: e.target.value })}
                    className="border border-gray-300 p-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-pink-400"
                  />
                </div>
                <button
                  onClick={handleAddClass}
                  className="mt-6 bg-green-600 hover:bg-green-700 text-white px-8 py-3 rounded-lg font-medium transition w-full sm:w-auto"
                >
                  Thêm lớp
                </button>
              </div>

              {/* Upload Excel */}
              <div className="bg-white p-6 rounded-xl shadow-md">
                <h2 className="text-xl font-semibold mb-5 text-gray-800">
                  Upload thời khóa biểu từ Excel
                </h2>
                <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
                  <input
                    type="file"
                    accept=".xlsx,.xls"
                    onChange={(e) => setExcelFile(e.target.files?.[0] || null)}
                    className="block w-full text-sm text-gray-500 file:mr-4 file:py-2.5 file:px-5 file:rounded-lg file:border-0 file:text-sm file:font-medium file:bg-pink-50 file:text-pink-700 hover:file:bg-pink-100 cursor-pointer"
                  />
                  <button
                    onClick={handleUploadExcel}
                    disabled={!excelFile}
                    className={`px-8 py-3 rounded-lg font-medium text-white transition w-full sm:w-auto ${
                      excelFile
                        ? "bg-pink-600 hover:bg-pink-700"
                        : "bg-pink-300 cursor-not-allowed"
                    }`}
                  >
                    Upload
                  </button>
                </div>
              </div>
            </div>

            {/* Danh sách lớp */}
            <div className="bg-white rounded-xl shadow-md overflow-hidden">
              <div className="p-5 border-b">
                <input
                  type="text"
                  placeholder="Tìm kiếm theo tên lớp..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-pink-400"
                />
              </div>

              <div className="overflow-x-auto">
                <table className="w-full min-w-[700px]">
                  <thead className="bg-pink-600 text-white">
                    <tr>
                      <th className="p-4 text-left">Tên lớp</th>
                      <th className="p-4 text-left">Khoa</th>
                      <th className="p-4 text-left">Niên khóa</th>
                      <th className="p-4 text-left">Sĩ số</th>
                      <th className="p-4 text-center">Hành động</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredClasses.length === 0 ? (
                      <tr>
                        <td colSpan={5} className="p-10 text-center text-gray-500 italic">
                          {searchTerm.trim()
                            ? "Không tìm thấy lớp nào phù hợp"
                            : "Chưa có lớp học nào trong hệ thống"}
                        </td>
                      </tr>
                    ) : (
                      filteredClasses.map((cls) => (
                        <tr key={cls.id_lophoc} className="border-b hover:bg-gray-50 transition-colors">
                          <td className="p-4 font-medium">{cls.ten_lop}</td>
                          <td className="p-4">{cls.khoa || "—"}</td>
                          <td className="p-4">{cls.nien_khoa || "—"}</td>
                          <td className="p-4">{cls.si_so || "—"}</td>
                          <td className="p-4 text-center">
                            <button
                              onClick={() => selectClassForSchedule(cls)}
                              className="bg-purple-600 hover:bg-purple-700 text-white px-6 py-2 rounded-md transition text-sm font-medium"
                            >
                              Xem TKB
                            </button>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* Tab Thời khóa biểu TẤT CẢ lớp – thiết kế đẹp */}
        {activeTab === "all-schedules" && (
          <div className="bg-white p-6 rounded-xl shadow-lg">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
              <h2 className="text-2xl font-bold text-gray-800">
                Thời khóa biểu tất cả các lớp
              </h2>
              <span className="text-sm text-gray-500 italic">
                (Thứ Hai → Thứ Sáu • Cuộn ngang để xem đầy đủ)
              </span>
            </div>

            {loadingSchedule ? (
              <div className="text-center py-20">
                <div className="animate-spin rounded-full h-14 w-14 border-b-4 border-pink-500 mx-auto mb-6"></div>
                <p className="text-gray-600 text-lg">Đang tải thời khóa biểu tổng hợp...</p>
              </div>
            ) : scheduleError ? (
              <div className="text-center py-20 text-red-600 text-xl font-medium">
                {scheduleError}
              </div>
            ) : Object.keys(allSchedules).length === 0 ? (
              <div className="text-center py-20 text-gray-500 text-lg italic">
                Chưa có dữ liệu thời khóa biểu nào
              </div>
            ) : (
              <div className="overflow-x-auto pb-6">
                <table className="w-full border-collapse min-w-[1400px]">
                  <thead>
                    <tr className="bg-gradient-to-r from-pink-50 via-purple-50 to-blue-50">
                      <th className="border p-5 text-left font-bold text-gray-800 min-w-[180px] sticky left-0 bg-gradient-to-r from-pink-50 via-purple-50 to-blue-50 z-20 shadow-right">
                        Lớp học
                      </th>
                      {days.map((day) => (
                        <th
                          key={day}
                          className="border p-5 text-center font-bold text-gray-800 min-w-[240px]"
                        >
                          {day}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {Object.values(allSchedules)
                      .sort((a, b) => a.ten_lop.localeCompare(b.ten_lop, "vi"))
                      .map((clsSchedule) => (
                        <tr
                          key={clsSchedule.ten_lop}
                          className="border-b hover:bg-gray-50/80 transition-colors"
                        >
                          <td className="border p-5 font-semibold text-gray-800 sticky left-0 bg-white z-10 shadow-right">
                            {clsSchedule.ten_lop}
                          </td>

                          {days.map((day, index) => {
                            const thu = index + 1;
                            const items = clsSchedule.schedule[thu] || [];

                            return (
                              <td
                                key={day}
                                className="border p-4 align-top min-h-[260px] text-sm leading-relaxed"
                              >
                                {items.length === 0 ? (
                                  <div className="h-full flex items-center justify-center text-gray-300 text-2xl font-light">
                                    —
                                  </div>
                                ) : (
                                  <div className="space-y-4">
                                    {items
                                      .sort((a, b) => {
                                        const order = { Sáng: 1, Chiều: 2, "Cả ngày": 3 };
                                        return (order[a.ca_hoc] || 999) - (order[b.ca_hoc] || 999);
                                      })
                                      .map((item, idx) => (
                                        <div
                                          key={idx}
                                          className={`p-4 rounded-lg border shadow-sm ${getShiftStyle(item.ca_hoc)}`}
                                        >
                                          {item.ca_hoc && (
                                            <div className="font-bold text-base mb-2 tracking-wide">
                                              {item.ca_hoc}
                                            </div>
                                          )}
                                          <div className="font-medium text-gray-900 whitespace-pre-line leading-snug">
                                            {item.mon_hoc || "—"}
                                          </div>
                                          {item.giang_vien && (
                                            <div className="mt-2 text-gray-600 italic text-sm">
                                              GV: {item.giang_vien}
                                            </div>
                                          )}
                                          {item.phong_hoc && (
                                            <div className="mt-1.5 text-xs text-gray-500">
                                              Phòng: {item.phong_hoc}
                                            </div>
                                          )}
                                        </div>
                                      ))}
                                  </div>
                                )}
                              </td>
                            );
                          })}
                        </tr>
                      ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}

        {/* Tab Thời khóa biểu CHI TIẾT 1 lớp */}
        {activeTab === "schedule" && selectedClass && (
          <div className="bg-white p-6 rounded-xl shadow-lg">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold text-gray-800">
                Thời khóa biểu lớp {selectedClass.ten_lop}
              </h2>
              <button
                onClick={() => {
                  setActiveTab("classes");
                  setSelectedClass(null);
                }}
                className="bg-gray-600 hover:bg-gray-700 text-white px-6 py-2.5 rounded-md transition"
              >
                Quay lại danh sách
              </button>
            </div>

            {loadingSchedule ? (
              <div className="text-center py-20">
                <div className="animate-spin rounded-full h-12 w-12 border-b-4 border-purple-500 mx-auto mb-4"></div>
                <p className="text-gray-600">Đang tải thời khóa biểu...</p>
              </div>
            ) : scheduleError ? (
              <div className="text-center py-20 text-red-600 text-xl font-medium">
                {scheduleError}
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full border-collapse table-fixed">
                  <thead>
                    <tr className="bg-gray-100">
                      {days.map((day) => (
                        <th
                          key={day}
                          className="border p-5 text-center font-bold text-gray-700"
                        >
                          {day}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    <tr>
                      {days.map((day, index) => {
                        const thu = index + 1;
                        const items = scheduleData[thu] || [];

                        return (
                          <td
                            key={day}
                            className="border p-4 align-top min-h-[300px] text-sm leading-relaxed"
                          >
                            {items.length > 0 ? (
                              <div className="space-y-4">
                                {items
                                  .sort((a, b) => {
                                    const order = { Sáng: 1, Chiều: 2, "Cả ngày": 3 };
                                    return (order[a.ca_hoc] || 999) - (order[b.ca_hoc] || 999);
                                  })
                                  .map((item, idx) => (
                                    <div
                                      key={idx}
                                      className={`p-4 rounded-lg border shadow-sm ${getShiftStyle(item.ca_hoc)}`}
                                    >
                                      {item.ca_hoc && (
                                        <div className="font-bold text-base mb-2">
                                          {item.ca_hoc}
                                        </div>
                                      )}
                                      <div className="whitespace-pre-line font-medium">
                                        {item.mon_hoc || "—"}
                                      </div>
                                      {item.giang_vien && (
                                        <div className="mt-2 text-gray-600 italic text-sm">
                                          {item.giang_vien}
                                        </div>
                                      )}
                                      {item.phong_hoc && (
                                        <div className="mt-1.5 text-xs text-gray-500">
                                          Phòng: {item.phong_hoc}
                                        </div>
                                      )}
                                    </div>
                                  ))}
                              </div>
                            ) : (
                              <div className="h-full flex items-center justify-center text-gray-300 text-3xl font-light">
                                —
                              </div>
                            )}
                          </td>
                        );
                      })}
                    </tr>
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default ScheduleManage;