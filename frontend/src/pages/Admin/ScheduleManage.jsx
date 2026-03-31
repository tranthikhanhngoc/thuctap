import React, { useEffect, useState, useMemo, useCallback } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";

const ScheduleManage = () => {
  const navigate = useNavigate();
  const token = localStorage.getItem("access_token");

  const api = useMemo(
    () => axios.create({
      baseURL: "http://127.0.0.1:8000",
      headers: { Authorization: token ? `Bearer ${token}` : "" },
    }),
    [token]
  );

  // ─── States ────────────────────────────────────────────────
  const [activeTab, setActiveTab] = useState("classes");
  const [classes, setClasses] = useState([]);
  const [filteredClasses, setFilteredClasses] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [newClass, setNewClass] = useState({ ten_lop: "", khoa: "", nien_khoa: "", si_so: "" });
  const [selectedWeek, setSelectedWeek] = useState("");
  const [weekRange, setWeekRange] = useState("");
  const [scheduleData, setScheduleData] = useState({});
  const [allSchedules, setAllSchedules] = useState({});
  const [loadingSchedule, setLoadingSchedule] = useState(false);
  const [scheduleError, setScheduleError] = useState(null);
  const [excelFile, setExcelFile] = useState(null);
  const [selectedClass, setSelectedClass] = useState(null);
  const [loadingDoctor, setLoadingDoctor] = useState(false);

  // ─── States cho gán bác sĩ ──────────────────────────────
  const [allDoctors, setAllDoctors] = useState([]);
  const [loadingDoctors, setLoadingDoctors] = useState(false);

  const days = ["Thứ Hai", "Thứ Ba", "Thứ Tư", "Thứ Năm", "Thứ Sáu"];

  // ─── Weeks List ────────────────────────────────────────────
  const weeksList = useMemo(() => {
    const weeks = [];
    const today = new Date();
    let monday = new Date(today);
    monday.setDate(today.getDate() - (today.getDay() === 0 ? 6 : today.getDay() - 1));

    for (let i = -5; i <= 6; i++) {
      const ws = new Date(monday);
      ws.setDate(monday.getDate() + i * 7);
      const we = new Date(ws);
      we.setDate(ws.getDate() + 4);

      const startStr = ws.toLocaleDateString("vi-VN", { day: "2-digit", month: "2-digit", year: "numeric" });
      const endStr   = we.toLocaleDateString("vi-VN", { day: "2-digit", month: "2-digit", year: "numeric" });

      weeks.push({ value: `${startStr}|${endStr}`, label: `Tuần ${startStr} → ${endStr}` });
    }
    return weeks;
  }, []);

  useEffect(() => {
    if (selectedWeek || !weeksList.length) return;
    const todayStr = new Date().toLocaleDateString("vi-VN", { day: "2-digit", month: "2-digit", year: "numeric" });
    const current = weeksList.find(w => w.label.includes(todayStr)) || weeksList[5];
    setSelectedWeek(current.value);
    setWeekRange(current.label);
  }, [weeksList, selectedWeek]);

  // ─── API Functions ─────────────────────────────────────────
  const fetchClasses = useCallback(async () => {
    try {
      const res = await api.get("/classes/");
      setClasses(res.data || []);
      setFilteredClasses(res.data || []);
    } catch (err) {
      console.error("Lấy lớp thất bại:", err);
    }
  }, [api]);

  const loadSchedule = useCallback(async (classId) => {
    if (!selectedWeek) return;
    const [start, end] = selectedWeek.split("|");
    setLoadingSchedule(true);
    setScheduleError(null);

    try {
      const { data } = await api.get(`/schedule/class/${classId}?start=${start}&end=${end}`);
      const scheduleArray = data.schedule || [];
      const byDay = {};
      const seen = {};
      
      // Map day names to numeric values (Thứ Hai=1, Thứ Ba=2, etc.)
      const dayNameMap = {
        "Thứ Hai": 1, "Thứ Ba": 2, "Thứ Tư": 3, "Thứ Năm": 4, "Thứ Sáu": 5
      };
      
      scheduleArray.forEach(item => {
        const thu = dayNameMap[item.day] || Number(item.day);
        if (thu < 1 || thu > 5) return;
        if (!byDay[thu]) {
          byDay[thu] = [];
          seen[thu] = new Set();
        }
        const key = `${item.ca_hoc || ""}|${item.mon_hoc || ""}`;
        if (!seen[thu].has(key)) {
          seen[thu].add(key);
          byDay[thu].push(item);
        }
      });
      setScheduleData(byDay);
    } catch (err) {
      setScheduleError("Không tải được lịch tuần này");
      console.error(err);
    } finally {
      setLoadingSchedule(false);
    }
  }, [api, selectedWeek]);

  const loadAllSchedules = useCallback(async () => {
    if (!selectedWeek || !classes.length) return;
    const [start, end] = selectedWeek.split("|");
    setLoadingSchedule(true);
    setScheduleError(null);

    // Map day names to numeric values (Thứ Hai=1, Thứ Ba=2, etc.)
    const dayNameMap = {
      "Thứ Hai": 1, "Thứ Ba": 2, "Thứ Tư": 3, "Thứ Năm": 4, "Thứ Sáu": 5
    };

    const allData = {};
    await Promise.allSettled(
      classes.map(async cls => {
        try {
          const { data } = await api.get(`/schedule/class/${cls.id_lophoc}?start=${start}&end=${end}`);
          const scheduleArray = data.schedule || [];
          const byDay = {};
          scheduleArray.forEach(item => {
            const thu = dayNameMap[item.day] || Number(item.day);
            if (thu >= 1 && thu <= 5) {
              (byDay[thu] ||= []).push(item);
            }
          });
          allData[cls.id_lophoc] = { ten_lop: cls.ten_lop, schedule: byDay };
        } catch {}
      })
    );
    setAllSchedules(allData);
    setLoadingSchedule(false);
  }, [api, selectedWeek, classes]);

  const handleUploadExcel = async () => {
    if (!excelFile || !selectedWeek) return alert("Thiếu file hoặc tuần");
    const [startDate, endDate] = selectedWeek.split("|");
    setLoadingSchedule(true);

    try {
      const { data: { exists } } = await api.get(`/schedule/week/exists?start=${startDate}&end=${endDate}`);
      if (exists && !window.confirm("Tuần này đã có lịch. Ghi đè?")) return;

      if (exists) await api.delete(`/schedule/week?start=${startDate}&end=${endDate}`);

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
      alert("Upload thất bại: " + (err.response?.data?.detail || err.message));
    } finally {
      setLoadingSchedule(false);
    }
  };

  const [currentDoctors, setCurrentDoctors] = useState([]);
  const [nextDoctors, setNextDoctors] = useState([]);
  const [adminDocTab, setAdminDocTab] = useState("current"); // current | next | all

  const isDoctorActive = useCallback((doc) => {
    if (!doc.ngay || !doc.thoi_gian_bat_dau || !doc.thoi_gian_ket_thuc) return false;
    const [d, m, y] = doc.ngay.split("/").map(Number);
    const shiftDate = new Date(y, m - 1, d);
    const [sh, sm] = doc.thoi_gian_bat_dau.split(":").map(Number);
    const [eh, em] = doc.thoi_gian_ket_thuc.split(":").map(Number);
    const now = new Date();
    const start = new Date(shiftDate); start.setHours(sh, sm, 0, 0);
    const end = new Date(shiftDate); end.setHours(eh, em, 0, 0);
    if (end < start) end.setDate(end.getDate() + 1);
    return now >= start && now < end;
  }, []);

  const fetchAdminDoctorsDuty = useCallback(async () => {
    setLoadingDoctor(true);
    try {
      const [resShift, resAll] = await Promise.all([
        api.get("/schedule/doctors/current-and-next", { params: { days_ahead: 5 } }),
        api.get("/schedule/doctors/all")
      ]);

      const enrichedCurrent = (resShift.data.current || []).map(doc => ({
        ...doc, isActive: isDoctorActive(doc),
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
    } catch (err) {
      console.error("Lỗi tải thông tin trực:", err);
    } finally {
      setLoadingDoctor(false);
    }
  }, [api, isDoctorActive]);

  useEffect(() => {
    if (activeTab === "doctors") {
      fetchAdminDoctorsDuty();
    }
  }, [activeTab, fetchAdminDoctorsDuty]);

  useEffect(() => { fetchClasses(); }, [fetchClasses]);

  // ─── Fetch all doctors ────────────────────────────────────
  const fetchDoctors = useCallback(async () => {
    setLoadingDoctors(true);
    try {
      const res = await api.get("/doctors/");
      setAllDoctors(res.data || []);
    } catch (err) {
      console.error("Lấy danh sách bác sĩ thất bại:", err);
    } finally {
      setLoadingDoctors(false);
    }
  }, [api]);

  useEffect(() => {
    if (activeTab === "assign-doctors") fetchDoctors();
  }, [activeTab, fetchDoctors]);

  const handleAssignClass = async (doctorId, idLophoc) => {
    try {
      await api.patch(`/doctors/${doctorId}/assign-class`, {
        id_lophoc: idLophoc || null
      });
      fetchDoctors();
    } catch (err) {
      alert("Gán lớp thất bại: " + (err.response?.data?.detail || err.message));
    }
  };

  useEffect(() => {
    const term = searchTerm.toLowerCase().trim();
    setFilteredClasses(term ? classes.filter(c => c.ten_lop.toLowerCase().includes(term)) : classes);
  }, [searchTerm, classes]);

  useEffect(() => {
    if (activeTab === "schedule" && selectedClass?.id_lophoc && selectedWeek) {
      loadSchedule(selectedClass.id_lophoc);
    }
    if (activeTab === "all-schedules" && selectedWeek) {
      loadAllSchedules();
    }
  }, [activeTab, selectedWeek, selectedClass?.id_lophoc, loadSchedule, loadAllSchedules]);

  // ─── Handlers ──────────────────────────────────────────────
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

  const getShiftStyle = (ca) => {
    const map = {
      Sáng: "bg-blue-50 border-blue-300 text-blue-900",
      Chiều: "bg-orange-50 border-orange-300 text-orange-900",
      "Cả ngày": "bg-purple-50 border-purple-300 text-purple-900 font-medium",
    };
    return map[ca] || "bg-gray-50 border-gray-200 text-gray-700";
  };

  // ─── Render ────────────────────────────────────────────────
  return (
    <div className="min-h-screen bg-gray-50 pb-12">
      <div className="bg-white shadow p-5 flex justify-between items-center">
        <h1 className="text-2xl font-bold text-gray-800">Quản lý lớp học & Thời khóa biểu</h1>
        <button onClick={() => navigate("/admin")} className="bg-gray-700 hover:bg-gray-800 text-white px-6 py-2 rounded transition">
          Quay lại
        </button>
      </div>

      <div className="p-6 max-w-7xl mx-auto">
        {/* Tabs */}
        <div className="flex flex-wrap gap-4 md:gap-8 mb-8 border-b pb-2">
          {["classes", "all-schedules", "schedule", "assign-doctors", "doctors"].map(tab => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              disabled={tab === "schedule" && !selectedClass}
              className={`pb-3 px-5 md:px-8 font-medium transition-all ${
                activeTab === tab
                  ? "border-b-4 border-pink-500 text-pink-600 font-semibold"
                  : "text-gray-600 hover:text-gray-800"
              } ${tab === "schedule" && !selectedClass ? "opacity-50 cursor-not-allowed" : ""}`}
            >
              {tab === "classes" ? "Quản lý lớp" :
               tab === "all-schedules" ? "TKB tất cả lớp" :
               tab === "schedule" ? `TKB ${selectedClass?.ten_lop || "..."}` :
               tab === "assign-doctors" ? "Gán bác sĩ - lớp" : "Bác sĩ trực"}
            </button>
          ))}
        </div>

        {/* Week selector */}
        {(activeTab === "schedule" || activeTab === "all-schedules") && (
          <div className="mb-8 bg-white p-6 rounded-xl shadow">
            <div className="flex flex-col sm:flex-row gap-6 items-end">
              <div className="flex-1">
                <label className="block text-gray-700 font-medium mb-2">Chọn tuần</label>
                <select
                  value={selectedWeek}
                  onChange={e => {
                    const val = e.target.value;
                    setSelectedWeek(val);
                    setWeekRange(weeksList.find(w => w.value === val)?.label || "");
                  }}
                  className="w-full border p-3 rounded-lg focus:ring-2 focus:ring-pink-400"
                >
                  <option value="">— Chọn tuần —</option>
                  {weeksList.map(w => (
                    <option key={w.value} value={w.value}>{w.label}</option>
                  ))}
                </select>
              </div>
              <div className="text-pink-600 font-semibold text-lg whitespace-nowrap">
                {weekRange || "Chưa chọn tuần"}
              </div>
            </div>
          </div>
        )}

        {/* Tab: Quản lý lớp */}
        {activeTab === "classes" && (
          <div className="space-y-10">
            {/* Form thêm lớp + Upload */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {/* Thêm lớp */}
              <div className="bg-white p-6 rounded-xl shadow-md">
                <h2 className="text-xl font-semibold mb-5">Thêm lớp mới</h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {["ten_lop", "khoa", "nien_khoa", "si_so"].map(key => (
                    <input
                      key={key}
                      placeholder={key === "ten_lop" ? "Tên lớp *" : key === "si_so" ? "Sĩ số" : key.charAt(0).toUpperCase() + key.slice(1)}
                      type={key === "si_so" ? "number" : "text"}
                      value={newClass[key]}
                      onChange={e => setNewClass({ ...newClass, [key]: e.target.value })}
                      className="border p-3 rounded focus:ring-pink-400 focus:border-pink-400"
                    />
                  ))}
                </div>
                <button onClick={handleAddClass} className="mt-6 bg-green-600 hover:bg-green-700 text-white px-8 py-3 rounded w-full sm:w-auto transition">
                  Thêm lớp
                </button>
              </div>

              {/* Upload Excel */}
              <div className="bg-white p-6 rounded-xl shadow-md">
                <h2 className="text-xl font-semibold mb-5">Upload TKB từ Excel</h2>
                <div className="space-y-5">
                  <div>
                    <label className="block text-gray-700 font-medium mb-2">Chọn tuần</label>
                    <select value={selectedWeek} onChange={e => {
                      const val = e.target.value;
                      setSelectedWeek(val);
                      setWeekRange(weeksList.find(w => w.value === val)?.label || "");
                    }} className="w-full border p-3 rounded focus:ring-pink-400">
                      <option value="">— Chọn tuần —</option>
                      {weeksList.map(w => <option key={w.value} value={w.value}>{w.label}</option>)}
                    </select>
                  </div>
                  <div className="flex flex-col sm:flex-row gap-4">
                    <input
                      type="file"
                      accept=".xlsx,.xls"
                      onChange={e => setExcelFile(e.target.files?.[0] ?? null)}
                      className="block w-full text-sm text-gray-500 file:mr-4 file:py-2.5 file:px-5 file:rounded file:bg-pink-50 file:text-pink-700 hover:file:bg-pink-100 cursor-pointer"
                    />
                    <button
                      onClick={handleUploadExcel}
                      disabled={loadingSchedule || !excelFile || !selectedWeek}
                      className={`px-8 py-3 rounded font-medium text-white transition ${
                        loadingSchedule || !excelFile || !selectedWeek ? "bg-pink-300 cursor-not-allowed" : "bg-pink-600 hover:bg-pink-700"
                      }`}
                    >
                      {loadingSchedule ? "Đang xử lý..." : "Upload"}
                    </button>
                  </div>
                </div>
              </div>
            </div>

            {/* Danh sách lớp */}
            <div className="bg-white rounded-xl shadow overflow-hidden">
              <div className="p-5 border-b">
                <input
                  type="text"
                  placeholder="Tìm theo tên lớp..."
                  value={searchTerm}
                  onChange={e => setSearchTerm(e.target.value)}
                  className="w-full p-3 border rounded focus:ring-pink-400"
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
                      <tr><td colSpan={5} className="p-12 text-center text-gray-500">
                        {searchTerm.trim() ? "Không tìm thấy" : "Chưa có lớp"}
                      </td></tr>
                    ) : filteredClasses.map(cls => (
                      <tr key={cls.id_lophoc} className="border-b hover:bg-gray-50">
                        <td className="p-4 font-medium">{cls.ten_lop}</td>
                        <td className="p-4">{cls.khoa || "—"}</td>
                        <td className="p-4">{cls.nien_khoa || "—"}</td>
                        <td className="p-4">{cls.si_so || "—"}</td>
                        <td className="p-4 text-center">
                          <button
                            onClick={() => { setSelectedClass(cls); setActiveTab("schedule"); }}
                            className="bg-purple-600 hover:bg-purple-700 text-white px-5 py-2 rounded text-sm transition"
                          >
                            Xem TKB
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* Tab: TKB tất cả lớp */}
        {activeTab === "all-schedules" && (
          <div className="bg-white p-6 rounded-xl shadow-lg">
            <h2 className="text-2xl font-bold mb-6">Thời khóa biểu tất cả lớp - {weekRange}</h2>
            {loadingSchedule ? (
              <div className="text-center py-20">Đang tải...</div>
            ) : scheduleError ? (
              <div className="text-center text-red-600 py-20">{scheduleError}</div>
            ) : Object.keys(allSchedules).length === 0 ? (
              <div className="text-center text-gray-500 py-20">Chưa có dữ liệu</div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full border-collapse min-w-[1200px]">
                  <thead>
                    <tr className="bg-gray-100">
                      <th className="border p-4 sticky left-0 bg-gray-100 z-10">Lớp</th>
                      {days.map(d => <th key={d} className="border p-4">{d}</th>)}
                    </tr>
                  </thead>
                  <tbody>
                    {Object.values(allSchedules).sort((a,b) => a.ten_lop.localeCompare(b.ten_lop, "vi")).map(cls => (
                      <tr key={cls.ten_lop} className="hover:bg-gray-50">
                        <td className="border p-4 font-medium sticky left-0 bg-white z-10">{cls.ten_lop}</td>
                        {days.map((_, i) => {
                          const items = cls.schedule[i+1] || [];
                          return (
                            <td key={i} className="border p-3 align-top min-h-[180px]">
                              {items.length === 0 ? (
                                <div className="text-gray-300 text-center h-full flex items-center justify-center">—</div>
                              ) : (
                                <div className="space-y-3">
                                  {items.map((it, idx) => (
                                    <div key={idx} className={`p-3 rounded border ${getShiftStyle(it.ca_hoc)}`}>
                                      <div className="font-bold">{it.ca_hoc}</div>
                                      <div>{it.mon_hoc || "—"}</div>
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

        {/* Tab: TKB một lớp */}
        {activeTab === "schedule" && selectedClass && (
          <div className="bg-white p-6 rounded-xl shadow-lg">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold">TKB lớp {selectedClass.ten_lop} - {weekRange}</h2>
              <button onClick={() => { setActiveTab("classes"); setSelectedClass(null); }} className="bg-gray-600 hover:bg-gray-700 text-white px-6 py-2 rounded transition">
                Quay lại
              </button>
            </div>
            {loadingSchedule ? (
              <div className="text-center py-20">Đang tải...</div>
            ) : scheduleError ? (
              <div className="text-center text-red-600 py-20">{scheduleError}</div>
            ) : Object.keys(scheduleData).length === 0 ? (
              <div className="text-center text-gray-500 py-20">Không có lịch tuần này</div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full border-collapse">
                  <thead>
                    <tr className="bg-gray-100">
                      {days.map(d => <th key={d} className="border p-4">{d}</th>)}
                    </tr>
                  </thead>
                  <tbody>
                    <tr>
                      {days.map((_, i) => {
                        const items = scheduleData[i+1] || [];
                        return (
                          <td key={i} className="border p-3 align-top min-h-[220px]">
                            {items.length === 0 ? (
                              <div className="text-gray-300 text-2xl text-center h-full flex items-center justify-center">—</div>
                            ) : (
                              <div className="space-y-3">
                                {items.map((it, idx) => (
                                  <div key={idx} className={`p-3 rounded border ${getShiftStyle(it.ca_hoc)}`}>
                                    <div className="font-bold">{it.ca_hoc}</div>
                                    <div>{it.mon_hoc || "—"}</div>
                                  </div>
                                ))}
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

        {/* Tab: Bác sĩ trực */}
        {activeTab === "doctors" && (
          <div className="bg-white p-6 rounded-xl shadow-lg">
            <h2 className="text-2xl font-bold mb-6">Bác sĩ trực dự kiến</h2>

            {/* Sub-tabs */}
            <div className="flex gap-4 mb-6 border-b pb-2">
              {[
                { id: "current", label: "Đang trực" },
                { id: "next", label: "Sắp tới" },
                { id: "all", label: "Tất cả" }
              ].map(tab => (
                <button
                  key={tab.id}
                  onClick={() => setAdminDocTab(tab.id)}
                  className={`pb-2 px-4 font-medium transition-all ${
                    adminDocTab === tab.id
                      ? "border-b-4 border-pink-500 text-pink-600 font-semibold"
                      : "text-gray-600 hover:text-gray-800"
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>

            {loadingDoctor ? (
              <div className="text-center py-12">
                <div className="animate-spin h-10 w-10 border-4 border-pink-500 border-t-transparent rounded-full mx-auto"></div>
                <p className="mt-4 text-gray-600">Đang tải...</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead className="bg-pink-600 text-white">
                    <tr>
                      <th className="p-4 border-b">Bác sĩ</th>
                      <th className="p-4 border-b">Khoa</th>
                      <th className="p-4 border-b">Tình trạng</th>
                      <th className="p-4 border-b">Ca / Ngày</th>
                    </tr>
                  </thead>
                  <tbody>
                    {(
                      adminDocTab === "current" ? currentDoctors :
                      adminDocTab === "next" ? nextDoctors : allDoctors
                    ).map((doc, idx) => (
                      <tr key={idx} className="border-b hover:bg-gray-50 transition">
                        <td className="p-4 font-medium text-gray-900">{doc.ten_bac_si || doc.ho_ten || "—"}</td>
                        <td className="p-4 text-gray-600">{doc.chuyen_khoa || "—"}</td>
                        <td className="p-4">
                          <span className={`px-3 py-1 text-xs font-bold rounded-full ${
                            doc.isActive ? "bg-emerald-100 text-emerald-700" :
                            adminDocTab === "next" ? "bg-blue-100 text-blue-700" :
                            "bg-gray-100 text-gray-600"
                          }`}>
                            {doc.isActive ? "Đang trực" :
                             adminDocTab === "next" ? "Sắp tới" : "Tất cả"}
                          </span>
                        </td>
                        <td className="p-4 text-gray-600">
                          {adminDocTab !== "all" ? (
                            <span>{doc.ca_truc} • {doc.ngay}</span>
                          ) : (
                            "—"
                          )}
                        </td>
                      </tr>
                    ))}
                    {(
                      adminDocTab === "current" ? currentDoctors :
                      adminDocTab === "next" ? nextDoctors : allDoctors
                    ).length === 0 && (
                      <tr>
                        <td colSpan="4" className="text-center py-8 text-gray-500">
                          Chưa có dữ liệu cho mục này
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}

        {/* Tab: Gán bác sĩ vào lớp */}
        {activeTab === "assign-doctors" && (
          <div className="bg-white p-6 rounded-xl shadow-lg">
            <h2 className="text-2xl font-bold mb-6">Gán bác sĩ vào lớp học</h2>
            <p className="text-gray-600 mb-6">
              Mỗi bác sĩ cần được gán vào một lớp. Khi lớp đó có lịch học,
              bác sĩ sẽ tự động hiển thị là "đang trực" cho bệnh nhân.
            </p>

            {loadingDoctors ? (
              <div className="text-center py-12">
                <div className="animate-spin h-10 w-10 border-4 border-pink-500 border-t-transparent rounded-full mx-auto"></div>
                <p className="mt-4 text-gray-600">Đang tải...</p>
              </div>
            ) : allDoctors.length === 0 ? (
              <p className="text-center text-gray-500 py-12">Chưa có bác sĩ nào trong hệ thống</p>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full min-w-[700px]">
                  <thead className="bg-pink-600 text-white">
                    <tr>
                      <th className="p-4 text-left">ID</th>
                      <th className="p-4 text-left">Họ tên</th>
                      <th className="p-4 text-left">Chuyên khoa</th>
                      <th className="p-4 text-left">SĐT</th>
                      <th className="p-4 text-left">Lớp hiện tại</th>
                      <th className="p-4 text-center">Gán lớp</th>
                    </tr>
                  </thead>
                  <tbody>
                    {allDoctors.map(doc => {
                      const currentClass = classes.find(c => c.id_lophoc === doc.id_lophoc);
                      return (
                        <tr key={doc.id_bacsi} className="border-b hover:bg-gray-50">
                          <td className="p-4">{doc.id_bacsi}</td>
                          <td className="p-4 font-medium">{doc.ho_ten || "—"}</td>
                          <td className="p-4">{doc.chuyen_khoa || "—"}</td>
                          <td className="p-4">{doc.so_dien_thoai || "—"}</td>
                          <td className="p-4">
                            {currentClass ? (
                              <span className="bg-green-100 text-green-800 px-3 py-1 rounded-full text-sm font-medium">
                                {currentClass.ten_lop}
                              </span>
                            ) : (
                              <span className="bg-red-100 text-red-600 px-3 py-1 rounded-full text-sm">
                                Chưa gán
                              </span>
                            )}
                          </td>
                          <td className="p-4 text-center">
                            <select
                              value={doc.id_lophoc || ""}
                              onChange={e => handleAssignClass(doc.id_bacsi, e.target.value ? parseInt(e.target.value) : null)}
                              className="border p-2 rounded focus:ring-pink-400 min-w-[180px]"
                            >
                              <option value="">— Chưa gán —</option>
                              {classes.map(cls => (
                                <option key={cls.id_lophoc} value={cls.id_lophoc}>
                                  {cls.ten_lop}
                                </option>
                              ))}
                            </select>
                          </td>
                        </tr>
                      );
                    })}
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