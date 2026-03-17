import React, { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";

const ScheduleManage = () => {
  const [activeTab, setActiveTab] = useState("classes");

  const [classes, setClasses] = useState([]);
  const [filteredClasses, setFilteredClasses] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");

  const [selectedClass, setSelectedClass] = useState(null);

  const [scheduleData, setScheduleData] = useState({}); // Lịch 1 lớp theo tuần
  const [allSchedules, setAllSchedules] = useState({}); // Lịch tất cả lớp theo tuần
  const [loadingSchedule, setLoadingSchedule] = useState(false);
  const [scheduleError, setScheduleError] = useState(null);

  const [excelFile, setExcelFile] = useState(null);
  const [selectedWeek, setSelectedWeek] = useState("");
  const [weekRange, setWeekRange] = useState("");

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

  // Tạo danh sách tuần
  const generateWeeks = () => {
    const weeks = [];
    const today = new Date();
    const dayOfWeek = today.getDay();
    const monday = new Date(today);
    monday.setDate(today.getDate() - (dayOfWeek === 0 ? 6 : dayOfWeek - 1));

    for (let i = -4; i <= 4; i++) {
      const weekStart = new Date(monday);
      weekStart.setDate(monday.getDate() + i * 7);
      const weekEnd = new Date(weekStart);
      weekEnd.setDate(weekStart.getDate() + 4);

      const startStr = weekStart.toLocaleDateString("vi-VN");
      const endStr = weekEnd.toLocaleDateString("vi-VN");
      const value = `${startStr}|${endStr}`;

      weeks.push({
        value,
        label: `Tuần ${startStr} → ${endStr}`,
      });
    }
    return weeks;
  };

  const weeksList = generateWeeks();

  // Set tuần hiện tại mặc định
  useEffect(() => {
    if (!selectedWeek && weeksList.length > 0) {
      const todayStr = new Date().toLocaleDateString("vi-VN");
      const current = weeksList.find((w) => w.label.includes(todayStr));
      if (current) {
        setSelectedWeek(current.value);
        setWeekRange(current.label);
      } else if (weeksList[4]) {
        setSelectedWeek(weeksList[4].value);
        setWeekRange(weeksList[4].label);
      }
    }
  }, [weeksList]);

  // Reset dữ liệu khi đổi tuần
  useEffect(() => {
    if (selectedWeek) {
      setScheduleData({});
      setAllSchedules({});
      setScheduleError(null);
    }
  }, [selectedWeek]);

  // Lấy danh sách lớp
  const fetchClasses = async () => {
    try {
      const res = await api.get("/classes/");
      setClasses(res.data || []);
      setFilteredClasses(res.data || []);
    } catch (err) {
      console.error("Lỗi lấy danh sách lớp:", err);
    }
  };

  useEffect(() => {
    fetchClasses();
  }, []);

  // Lọc lớp
  useEffect(() => {
    if (!searchTerm.trim()) {
      setFilteredClasses(classes);
      return;
    }
    const lower = searchTerm.toLowerCase().trim();
    setFilteredClasses(classes.filter((cls) => cls.ten_lop.toLowerCase().includes(lower)));
  }, [searchTerm, classes]);

  // Thêm lớp
  const handleAddClass = async () => {
    if (!newClass.ten_lop.trim()) return alert("Vui lòng nhập tên lớp");
    try {
      await api.post("/classes/", newClass);
      alert("Thêm lớp thành công!");
      setNewClass({ ten_lop: "", khoa: "", nien_khoa: "", si_so: "" });
      fetchClasses();
    } catch (err) {
      alert("Thêm lớp thất bại: " + (err.response?.data?.detail || err.message));
    }
  };

  // Upload Excel
  const handleUploadExcel = async () => {
    if (!excelFile) return alert("Vui lòng chọn file Excel");
    if (!selectedWeek) return alert("Vui lòng chọn tuần");

    const [startDate, endDate] = selectedWeek.split("|");

    setLoadingSchedule(true);

    try {
      const checkRes = await api.get(`/schedule/week/exists?start=${startDate}&end=${endDate}`);
      const { exists } = checkRes.data;

      if (exists) {
        if (!window.confirm("Tuần này đã có lịch. Thay thế?")) {
          setLoadingSchedule(false);
          return;
        }
        await api.delete(`/schedule/week?start=${startDate}&end=${endDate}`);
      }

      const formData = new FormData();
      formData.append("file", excelFile);

      await api.post(`/schedule/upload?week_start=${startDate}&week_end=${endDate}`, formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      alert("Upload thành công!");
      setExcelFile(null);

      setScheduleData({});
      setAllSchedules({});
      if (activeTab === "schedule" && selectedClass) loadSchedule(selectedClass.id_lophoc);
      if (activeTab === "all-schedules") loadAllSchedules();
    } catch (err) {
      console.error("Lỗi upload:", err);
      alert("Upload thất bại: " + (err.response?.data?.detail || err.message));
    } finally {
      setLoadingSchedule(false);
    }
  };

  // Load lịch 1 lớp
  const loadSchedule = async (classId) => {
  if (!selectedWeek) return;
  const [start, end] = selectedWeek.split("|");

  setLoadingSchedule(true);
  setScheduleError(null);
  setScheduleData({});

  try {
    const res = await api.get(`/schedule/class/${classId}?start=${start}&end=${end}`);
    const data = res.data || [];

    const byDay = {};
    const seenPerDay = {}; // unique per day

    data.forEach((item) => {
      const thu = Number(item.thu);
      if (thu >= 1 && thu <= 5) {
        if (!byDay[thu]) {
          byDay[thu] = [];
          seenPerDay[thu] = new Set();
        }

        const key = `${item.ca_hoc || ''}|${item.mon_hoc || ''}`;
        if (!seenPerDay[thu].has(key)) {
          seenPerDay[thu].add(key);
          byDay[thu].push(item);
        }
      }
    });

    setScheduleData(byDay);
  } catch (err) {
    setScheduleError("Không tải được lịch tuần này.");
  } finally {
    setLoadingSchedule(false);
  }
};

  // Load tất cả lịch
  const loadAllSchedules = async () => {
    if (!selectedWeek) return;
    const [start, end] = selectedWeek.split("|");

    setLoadingSchedule(true);
    setScheduleError(null);

    try {
      const allData = {};
      for (const cls of classes) {
        try {
          const res = await api.get(`/schedule/class/${cls.id_lophoc}?start=${start}&end=${end}`);
          const data = res.data || [];
          const byDay = {};
          data.forEach((item) => {
            const thu = Number(item.thu);
            if (thu >= 1 && thu <= 5) {
              if (!byDay[thu]) byDay[thu] = [];
              byDay[thu].push(item);
            }
          });
          allData[cls.id_lophoc] = { ten_lop: cls.ten_lop, schedule: byDay };
        } catch {}
      }
      setAllSchedules(allData);
    } catch (err) {
      setScheduleError("Không tải được lịch tổng hợp.");
    } finally {
      setLoadingSchedule(false);
    }
  };

  useEffect(() => {
    if (activeTab === "schedule" && selectedClass && selectedWeek) {
      loadSchedule(selectedClass.id_lophoc);
    }
    if (activeTab === "all-schedules" && selectedWeek) {
      loadAllSchedules();
    }
  }, [selectedWeek, activeTab, selectedClass, classes]);

  const getShiftStyle = (ca_hoc) => {
    switch (ca_hoc) {
      case "Sáng": return "bg-blue-50 border-blue-300 text-blue-900";
      case "Chiều": return "bg-orange-50 border-orange-300 text-orange-900";
      case "Cả ngày": return "bg-purple-50 border-purple-300 text-purple-900 font-medium";
      default: return "bg-gray-50 border-gray-200 text-gray-700";
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 pb-10">
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
              activeTab === "classes" ? "border-b-4 border-pink-500 text-pink-600" : "text-gray-600 hover:text-gray-800"
            }`}
          >
            Quản lý lớp
          </button>
          <button
            onClick={() => setActiveTab("all-schedules")}
            className={`pb-4 px-8 font-semibold text-lg transition-all ${
              activeTab === "all-schedules" ? "border-b-4 border-pink-500 text-pink-600" : "text-gray-600 hover:text-gray-800"
            }`}
          >
            Thời khóa biểu tất cả lớp
          </button>
          <button
            onClick={() => setActiveTab("schedule")}
            className={`pb-4 px-8 font-semibold text-lg transition-all ${
              activeTab === "schedule" ? "border-b-4 border-pink-500 text-pink-600" : "text-gray-600 hover:text-gray-800"
            }`}
            disabled={!selectedClass}
          >
            Thời khóa biểu lớp {selectedClass?.ten_lop || ""}
          </button>
        </div>

        {/* Chọn tuần */}
        {(activeTab === "schedule" || activeTab === "all-schedules") && (
          <div className="mb-6 bg-white p-5 rounded-xl shadow-md">
            <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
              <div className="flex-1">
                <label className="block text-gray-700 font-medium mb-2">Chọn tuần:</label>
                <select
                  value={selectedWeek}
                  onChange={(e) => {
                    setSelectedWeek(e.target.value);
                    const sel = weeksList.find((w) => w.value === e.target.value);
                    setWeekRange(sel ? sel.label : "");
                  }}
                  className="w-full border p-3 rounded-lg focus:ring-2 focus:ring-pink-400"
                >
                  {weeksList.map((w) => (
                    <option key={w.value} value={w.value}>
                      {w.label}
                    </option>
                  ))}
                </select>
              </div>
              <div className="text-center sm:text-right mt-4 sm:mt-0">
                <p className="text-lg font-semibold text-pink-600">
                  {weekRange || "Chưa chọn tuần"}
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Tab Quản lý lớp */}
        {activeTab === "classes" && (
          <div className="space-y-10">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {/* Thêm lớp */}
              <div className="bg-white p-6 rounded-xl shadow-md">
                <h2 className="text-xl font-semibold mb-5 text-gray-800">Thêm lớp mới</h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <input placeholder="Tên lớp *" value={newClass.ten_lop} onChange={(e) => setNewClass({ ...newClass, ten_lop: e.target.value })} className="border p-3 rounded-lg focus:ring-2 focus:ring-pink-400" />
                  <input placeholder="Khoa" value={newClass.khoa} onChange={(e) => setNewClass({ ...newClass, khoa: e.target.value })} className="border p-3 rounded-lg focus:ring-2 focus:ring-pink-400" />
                  <input placeholder="Niên khóa" value={newClass.nien_khoa} onChange={(e) => setNewClass({ ...newClass, nien_khoa: e.target.value })} className="border p-3 rounded-lg focus:ring-2 focus:ring-pink-400" />
                  <input placeholder="Sĩ số" type="number" value={newClass.si_so} onChange={(e) => setNewClass({ ...newClass, si_so: e.target.value })} className="border p-3 rounded-lg focus:ring-2 focus:ring-pink-400" />
                </div>
                <button onClick={handleAddClass} className="mt-6 bg-green-600 hover:bg-green-700 text-white px-8 py-3 rounded-lg w-full sm:w-auto">
                  Thêm lớp
                </button>
              </div>

              {/* Upload */}
              <div className="bg-white p-6 rounded-xl shadow-md">
                <h2 className="text-xl font-semibold mb-5 text-gray-800">Upload thời khóa biểu từ Excel</h2>
                <div className="space-y-4">
                  <div>
                    <label className="block text-gray-700 font-medium mb-2">Chọn tuần:</label>
                    <select value={selectedWeek} onChange={(e) => { setSelectedWeek(e.target.value); const sel = weeksList.find(w => w.value === e.target.value); setWeekRange(sel ? sel.label : ""); }} className="w-full border p-3 rounded-lg focus:ring-2 focus:ring-pink-400">
                      <option value="">-- Chọn tuần --</option>
                      {weeksList.map(w => <option key={w.value} value={w.value}>{w.label}</option>)}
                    </select>
                  </div>
                  <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center">
                    <input type="file" accept=".xlsx,.xls" onChange={(e) => setExcelFile(e.target.files?.[0] || null)} className="block w-full text-sm text-gray-500 file:mr-4 file:py-2.5 file:px-5 file:rounded-lg file:bg-pink-50 file:text-pink-700 hover:file:bg-pink-100 cursor-pointer" />
                    <button onClick={handleUploadExcel} disabled={!excelFile || !selectedWeek || loadingSchedule} className={`px-8 py-3 rounded-lg font-medium text-white transition w-full sm:w-auto ${excelFile && selectedWeek && !loadingSchedule ? "bg-pink-600 hover:bg-pink-700" : "bg-pink-300 cursor-not-allowed"}`}>
                      {loadingSchedule ? "Đang xử lý..." : "Upload"}
                    </button>
                  </div>
                </div>
              </div>
            </div>

            {/* Danh sách lớp */}
            <div className="bg-white rounded-xl shadow-md overflow-hidden">
              <div className="p-5 border-b">
                <input type="text" placeholder="Tìm kiếm theo tên lớp..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-pink-400" />
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
                      <tr><td colSpan={5} className="p-10 text-center text-gray-500">{searchTerm.trim() ? "Không tìm thấy" : "Chưa có lớp"}</td></tr>
                    ) : (
                      filteredClasses.map((cls) => (
                        <tr key={cls.id_lophoc} className="border-b hover:bg-gray-50">
                          <td className="p-4 font-medium">{cls.ten_lop}</td>
                          <td className="p-4">{cls.khoa || "—"}</td>
                          <td className="p-4">{cls.nien_khoa || "—"}</td>
                          <td className="p-4">{cls.si_so || "—"}</td>
                          <td className="p-4 text-center">
                            <button onClick={() => { setSelectedClass(cls); setActiveTab("schedule"); }} className="bg-purple-600 hover:bg-purple-700 text-white px-6 py-2 rounded-md text-sm">
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

        {/* Tab Tất cả lớp */}
        {activeTab === "all-schedules" && (
          <div className="bg-white p-6 rounded-xl shadow-lg">
            <h2 className="text-2xl font-bold mb-6 text-gray-800">
              Thời khóa biểu tất cả lớp - {weekRange}
            </h2>

            {loadingSchedule ? (
              <div className="text-center py-20">
                <div className="animate-spin h-14 w-14 border-b-4 border-pink-500 mx-auto mb-6"></div>
                <p className="text-gray-600">Đang tải...</p>
              </div>
            ) : scheduleError ? (
              <p className="text-center text-red-600 py-20 text-xl">{scheduleError}</p>
            ) : Object.keys(allSchedules).length === 0 ? (
              <p className="text-center text-gray-500 py-20">Chưa có dữ liệu cho tuần này</p>
            ) : (
              <div className="overflow-x-auto pb-6">
                <table className="w-full border-collapse min-w-[1400px]">
                  <thead>
                    <tr className="bg-gradient-to-r from-pink-50 to-blue-50">
                      <th className="border p-5 text-left font-bold sticky left-0 bg-gradient-to-r from-pink-50 to-blue-50 z-20 shadow-right min-w-[180px]">Lớp học</th>
                      {days.map(day => <th key={day} className="border p-5 text-center font-bold min-w-[240px]">{day}</th>)}
                    </tr>
                  </thead>
                  <tbody>
                    {Object.values(allSchedules)
                      .sort((a, b) => a.ten_lop.localeCompare(b.ten_lop, "vi"))
                      .map(clsSchedule => (
                        <tr key={clsSchedule.ten_lop} className="border-b hover:bg-gray-50/80">
                          <td className="border p-5 font-semibold sticky left-0 bg-white z-10 shadow-right">{clsSchedule.ten_lop}</td>
                          {days.map((day, idx) => {
                            const thu = idx + 1;
                            const items = clsSchedule.schedule[thu] || [];
                            return (
                              <td key={day} className="border p-4 align-top min-h-[260px] text-sm">
                                {items.length === 0 ? (
                                  <div className="h-full flex items-center justify-center text-gray-300 text-2xl">—</div>
                                ) : (
                                  <div className="space-y-4">
                                    {items
                                      .filter(item => ["Sáng", "Chiều", "Cả ngày"].includes(item.ca_hoc)) // Chỉ hiển thị 3 ca
                                      .sort((a, b) => {
                                        const order = { "Sáng": 1, "Chiều": 2, "Cả ngày": 3 };
                                        return (order[a.ca_hoc] || 999) - (order[b.ca_hoc] || 999);
                                      })
                                      .map((item, i) => (
                                        <div key={i} className={`p-4 rounded-lg border shadow-sm ${getShiftStyle(item.ca_hoc)}`}>
                                          <div className="font-bold text-base mb-2">{item.ca_hoc}</div>
                                          <div className="font-medium whitespace-pre-line">{item.mon_hoc || "—"}</div>
                                          {/* Không hiển thị giang_vien và phong */}
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

        {/* Tab 1 lớp */}
        {activeTab === "schedule" && selectedClass && (
          <div className="bg-white p-6 rounded-xl shadow-lg">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold text-gray-800">
                Thời khóa biểu lớp {selectedClass.ten_lop} - {weekRange}
              </h2>
              <button
                onClick={() => { setActiveTab("classes"); setSelectedClass(null); }}
                className="bg-gray-600 hover:bg-gray-700 text-white px-6 py-2.5 rounded-md transition"
              >
                Quay lại
              </button>
            </div>

            {loadingSchedule ? (
              <div className="text-center py-20">
                <div className="animate-spin h-12 w-12 border-b-4 border-purple-500 mx-auto mb-4"></div>
                <p className="text-gray-600">Đang tải...</p>
              </div>
            ) : scheduleError ? (
              <p className="text-center text-red-600 py-20 text-xl">{scheduleError}</p>
            ) : Object.keys(scheduleData).length === 0 ? (
              <p className="text-center text-gray-500 py-20">Không có lịch cho tuần này</p>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full border-collapse table-fixed">
                  <thead>
                    <tr className="bg-gray-100">
                      {days.map(day => <th key={day} className="border p-5 text-center font-bold text-gray-700">{day}</th>)}
                    </tr>
                  </thead>
                  <tbody>
                    <tr>
                      {days.map((day, idx) => {
                        const thu = idx + 1;
                        const items = scheduleData[thu] || [];
                        return (
                          <td key={day} className="border p-4 align-top min-h-[300px] text-sm">
                            {items.length > 0 ? (
                              <div className="space-y-4">
                                {items
                                  .filter(item => ["Sáng", "Chiều", "Cả ngày"].includes(item.ca_hoc)) // Chỉ 3 ca
                                  .sort((a, b) => {
                                    const order = { "Sáng": 1, "Chiều": 2, "Cả ngày": 3 };
                                    return (order[a.ca_hoc] || 999) - (order[b.ca_hoc] || 999);
                                  })
                                  .map((item, i) => (
                                    <div key={i} className={`p-4 rounded-lg border shadow-sm ${getShiftStyle(item.ca_hoc)}`}>
                                      <div className="font-bold text-base mb-2">{item.ca_hoc}</div>
                                      <div className="font-medium whitespace-pre-line">{item.mon_hoc || "—"}</div>
                                      {/* Không hiển thị giang_vien và phong */}
                                    </div>
                                  ))}
                              </div>
                            ) : (
                              <div className="h-full flex items-center justify-center text-gray-300 text-3xl font-light">—</div>
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