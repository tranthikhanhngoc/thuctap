import React, { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import FullCalendar from "@fullcalendar/react";
import dayGridPlugin from "@fullcalendar/daygrid";
import timeGridPlugin from "@fullcalendar/timegrid";
import interactionPlugin from "@fullcalendar/interaction";

const ScheduleManage = () => {
  const [activeTab, setActiveTab] = useState("classes");

  // Quản lý lớp
  const [classes, setClasses] = useState([]);
  const [selectedClassDetail, setSelectedClassDetail] = useState(null);
  const [showClassModal, setShowClassModal] = useState(false);
  const [editingClass, setEditingClass] = useState(false);
  const [classForm, setClassForm] = useState({
    ten_lop: "",
    khoa: "",
    nien_khoa: "",
    si_so: "",
  });

  // Quản lý lịch
  const [selectedClassSchedule, setSelectedClassSchedule] = useState(null);
  const [events, setEvents] = useState([]);
  const [stats, setStats] = useState(null);
  const [loadingSchedule, setLoadingSchedule] = useState(false);

  // Quản lý bác sĩ
  const [showDoctorsModal, setShowDoctorsModal] = useState(false);
  const [currentClassDoctors, setCurrentClassDoctors] = useState([]);
  const [allDoctors, setAllDoctors] = useState([]);
  const [selectedDoctorIds, setSelectedDoctorIds] = useState([]);
  const [managingClass, setManagingClass] = useState(null);

  // Upload Excel
  const [excelFile, setExcelFile] = useState(null);

  const token = localStorage.getItem("access_token");
  const navigate = useNavigate();

  const api = axios.create({
    baseURL: "http://localhost:8000",
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  const fetchClasses = async () => {
    try {
      const res = await api.get("/classes/");
      setClasses(res.data || []);
    } catch (err) {
      console.error("Lỗi tải danh sách lớp:", err);
    }
  };

  useEffect(() => {
    fetchClasses();
  }, []);

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
      alert("Upload lịch từ Excel thành công!");
      setExcelFile(null);
      fetchClasses();
    } catch (err) {
      alert("Upload thất bại!");
    }
  };

  const openAddClass = () => {
    setEditingClass(false);
    setClassForm({ ten_lop: "", khoa: "", nien_khoa: "", si_so: "" });
    setShowClassModal(true);
  };

  const openEditClass = (cls) => {
    setEditingClass(true);
    setSelectedClassDetail(cls);
    setClassForm({
      ten_lop: cls.ten_lop || "",
      khoa: cls.khoa || "",
      nien_khoa: cls.nien_khoa || "",
      si_so: cls.si_so || "",
    });
    setShowClassModal(true);
  };

  const saveClass = async () => {
    if (!classForm.ten_lop.trim()) {
      alert("Vui lòng nhập tên lớp");
      return;
    }
    try {
      if (editingClass) {
        await api.put(`/classes/${selectedClassDetail.id_lophoc}`, classForm);
        alert("Cập nhật lớp thành công!");
      } else {
        await api.post("/classes/", classForm);
        alert("Thêm lớp mới thành công!");
      }
      setShowClassModal(false);
      fetchClasses();
    } catch (err) {
      alert("Lưu lớp thất bại!");
    }
  };

  const deleteClass = async (id) => {
    if (!window.confirm("Xác nhận xóa lớp này?")) return;
    try {
      await api.delete(`/classes/${id}`);
      fetchClasses();
      alert("Xóa lớp thành công!");
    } catch (err) {
      alert("Xóa thất bại!");
    }
  };

  const selectClassForSchedule = (cls) => {
    setSelectedClassSchedule(cls);
    setActiveTab("schedule");
    loadSchedule(cls.id_lophoc);
    loadStats(cls.id_lophoc);
  };

  const loadSchedule = async (classId) => {
    setLoadingSchedule(true);
    try {
      const res = await api.get(`/schedule/class/${classId}`);
      setEvents(
        (res.data || []).map((item) => ({
          id: item.id,
          title: item.mon_hoc || "Buổi học",
          start: item.thoi_gian_bat_dau,
          end: item.thoi_gian_ket_thuc,
          backgroundColor: "#ec4899", // pink-500
          borderColor: "#db2777",     // pink-600
          textColor: "#ffffff",
        }))
      );
    } catch (err) {
      console.error("Lỗi tải lịch:", err);
    } finally {
      setLoadingSchedule(false);
    }
  };

  const loadStats = async (classId) => {
    try {
      const res = await api.get(`/classes/${classId}/students`);
      setStats({ totalStudents: res.data?.length || 0 });
    } catch (err) {
      console.error("Lỗi tải thống kê:", err);
    }
  };

  const handleEventDrop = async (info) => {
    const { event } = info;
    try {
      await api.put(`/schedule/${event.id}`, {
        thoi_gian_bat_dau: event.start.toISOString(),
        thoi_gian_ket_thuc: event.end ? event.end.toISOString() : event.start.toISOString(),
      });
    } catch (err) {
      info.revert();
      alert("Cập nhật thời gian thất bại!");
    }
  };

  const handleDateClick = async (info) => {
    if (!selectedClassSchedule) return;
    const subject = prompt("Nhập tên môn học:");
    if (!subject?.trim()) return;
    try {
      const payload = {
        class_id: selectedClassSchedule.id_lophoc,
        mon_hoc: subject,
        thoi_gian_bat_dau: info.dateStr,
        thoi_gian_ket_thuc: info.dateStr,
      };
      const res = await api.post("/schedule", payload);
      setEvents([
        ...events,
        {
          id: res.data.id,
          title: subject,
          start: info.dateStr,
          end: info.dateStr,
          backgroundColor: "#ec4899",
          borderColor: "#db2777",
          textColor: "#ffffff",
        },
      ]);
    } catch (err) {
      alert("Thêm buổi học thất bại!");
    }
  };

  const openManageDoctors = (cls) => {
    setManagingClass(cls);
    setSelectedDoctorIds([]);
    loadDoctorsOfClass(cls.id_lophoc);
    loadAllDoctors();
    setShowDoctorsModal(true);
  };

  const loadDoctorsOfClass = async (classId) => {
    try {
      const res = await api.get(`/classes/${classId}/students`);
      setCurrentClassDoctors(res.data || []);
    } catch (err) {
      console.error("Lỗi tải bác sĩ lớp:", err);
      setCurrentClassDoctors([]);
    }
  };

  const loadAllDoctors = async () => {
    try {
      const res = await api.get("/classes/doctors");
      let doctorsList = Array.isArray(res.data) ? res.data : res.data?.items || [];
      setAllDoctors(doctorsList);
    } catch (err) {
      console.error("Lỗi tải tất cả bác sĩ:", err);
      setAllDoctors([]);
    }
  };

  const toggleDoctorSelection = (id) => {
    setSelectedDoctorIds((prev) =>
      prev.includes(id) ? prev.filter((d) => d !== id) : [...prev, id]
    );
  };

  const addSelectedDoctors = async () => {
    if (selectedDoctorIds.length === 0) {
      alert("Vui lòng chọn ít nhất một bác sĩ");
      return;
    }
    try {
      await api.post(`/classes/${managingClass.id_lophoc}/add-doctors`, selectedDoctorIds);
      alert(`Đã thêm ${selectedDoctorIds.length} bác sĩ vào lớp`);
      loadDoctorsOfClass(managingClass.id_lophoc);
      setSelectedDoctorIds([]);
    } catch (err) {
      alert("Thêm bác sĩ thất bại!");
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-50 via-white to-pink-50 relative overflow-hidden">
      {/* Background accents */}
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
          <button
            onClick={() => navigate("/admin")}
            className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-gray-700 hover:bg-pink-50 hover:text-pink-600 transition"
          >
            <span className="text-xl">🏠</span> Dashboard
          </button>
          <button
            onClick={() => navigate("/admin/quan-ly-lich-hoc")}
            className="w-full flex items-center gap-3 px-4 py-3 rounded-xl bg-pink-50 text-pink-600 font-medium hover:bg-pink-100 transition"
          >
            <span className="text-xl">📚</span> Quản lý Lớp & Lịch học
          </button>
        </nav>

        <div className="absolute bottom-8 left-4 right-4">
          <button
            onClick={() => {
              localStorage.clear();
              navigate("/login");
            }}
            className="w-full bg-red-500 hover:bg-red-600 text-white py-3 rounded-xl font-medium transition flex items-center justify-center gap-2"
          >
            <span>🚪</span> Đăng xuất
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <div className="md:ml-64 min-h-screen">
        {/* Header */}
        <header className="bg-white shadow-sm border-b border-pink-100 sticky top-0 z-30">
          <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
            <div className="flex items-center gap-4">
              <button
                onClick={() => navigate(-1)}
                className="flex items-center gap-2 bg-pink-100 hover:bg-pink-200 text-pink-700 px-5 py-2.5 rounded-xl font-medium transition shadow-sm"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7" />
                </svg>
                Quay về
              </button>

              <h1 className="text-2xl md:text-3xl font-bold text-gray-800">
                Quản lý lớp học & Thời khóa biểu
              </h1>
            </div>
          </div>
        </header>

        <main className="p-6 md:p-10">
          {/* Tabs */}
          <div className="flex flex-wrap gap-3 mb-8">
            <button
              onClick={() => setActiveTab("classes")}
              className={`px-6 py-3 rounded-full font-medium transition shadow-sm ${
                activeTab === "classes"
                  ? "bg-pink-500 text-white shadow-md"
                  : "bg-white text-gray-700 hover:bg-pink-100"
              }`}
            >
              Quản lý lớp học
            </button>
            <button
              onClick={() => setActiveTab("schedule")}
              className={`px-6 py-3 rounded-full font-medium transition shadow-sm ${
                activeTab === "schedule"
                  ? "bg-pink-500 text-white shadow-md"
                  : "bg-white text-gray-700 hover:bg-pink-100"
              }`}
            >
              Quản lý thời khóa biểu
            </button>
          </div>

          {/* TAB QUẢN LÝ LỚP */}
          {activeTab === "classes" && (
            <>
              {/* Upload Excel */}
              <div className="bg-white rounded-2xl shadow-lg p-6 mb-8 border border-pink-100">
                <h2 className="text-xl font-bold text-gray-800 mb-4">Upload lịch từ file Excel</h2>
                <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
                  <input
                    type="file"
                    accept=".xlsx,.xls"
                    onChange={(e) => setExcelFile(e.target.files?.[0] || null)}
                    className="border border-gray-300 rounded-xl px-4 py-3 text-gray-700 file:mr-4 file:py-2 file:px-4 file:rounded-xl file:border-0 file:text-sm file:bg-pink-100 file:text-pink-700 hover:file:bg-pink-200 transition"
                  />
                  <button
                    onClick={handleUploadExcel}
                    disabled={!excelFile}
                    className={`px-6 py-3 rounded-xl font-semibold shadow-md transition ${
                      excelFile
                        ? "bg-pink-500 hover:bg-pink-600 text-white"
                        : "bg-gray-300 text-gray-500 cursor-not-allowed"
                    }`}
                  >
                    Upload lịch
                  </button>
                </div>
              </div>

              <button
                onClick={openAddClass}
                className="mb-8 bg-pink-500 hover:bg-pink-600 text-white px-8 py-3 rounded-xl font-semibold shadow-md transition transform hover:scale-105 flex items-center gap-2"
              >
                <span className="text-xl">➕</span> Thêm lớp mới
              </button>

              <div className="bg-white rounded-2xl shadow-lg overflow-hidden border border-pink-100">
                <table className="w-full text-left">
                  <thead className="bg-pink-500 text-white">
                    <tr>
                      <th className="p-4 font-semibold">Tên lớp</th>
                      <th className="p-4 font-semibold">Khoa</th>
                      <th className="p-4 font-semibold">Niên khóa</th>
                      <th className="p-4 font-semibold">Sĩ số</th>
                      <th className="p-4 font-semibold text-center">Hành động</th>
                    </tr>
                  </thead>
                  <tbody>
                    {classes.length > 0 ? (
                      classes.map((cls) => (
                        <tr
                          key={cls.id_lophoc}
                          className="border-b border-gray-100 hover:bg-pink-50 transition duration-200"
                        >
                          <td className="p-4 font-medium text-gray-800">{cls.ten_lop}</td>
                          <td className="p-4 text-gray-600">{cls.khoa || "—"}</td>
                          <td className="p-4 text-gray-600">{cls.nien_khoa || "—"}</td>
                          <td className="p-4 text-center text-gray-700">{cls.si_so || "—"}</td>
                          <td className="p-4 text-center space-x-3 flex flex-wrap gap-2 justify-center">
                            <button
                              onClick={() => setSelectedClassDetail(cls)}
                              className="bg-pink-500 hover:bg-pink-600 text-white px-4 py-2 rounded-lg text-sm shadow-sm transition"
                            >
                              Chi tiết
                            </button>
                            <button
                              onClick={() => openEditClass(cls)}
                              className="bg-yellow-500 hover:bg-yellow-600 text-white px-4 py-2 rounded-lg text-sm shadow-sm transition"
                            >
                              Sửa
                            </button>
                            <button
                              onClick={() => openManageDoctors(cls)}
                              className="bg-teal-500 hover:bg-teal-600 text-white px-4 py-2 rounded-lg text-sm shadow-sm transition"
                            >
                              Bác sĩ
                            </button>
                            <button
                              onClick={() => selectClassForSchedule(cls)}
                              className="bg-purple-500 hover:bg-purple-600 text-white px-4 py-2 rounded-lg text-sm shadow-sm transition"
                            >
                              Lịch học
                            </button>
                            <button
                              onClick={() => deleteClass(cls.id_lophoc)}
                              className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-lg text-sm shadow-sm transition"
                            >
                              Xóa
                            </button>
                          </td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan="5" className="text-center p-10 text-gray-500 text-lg">
                          Chưa có lớp học nào trong hệ thống 🌸
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>

              {selectedClassDetail && !showClassModal && (
                <div className="mt-8 bg-white rounded-2xl shadow-lg p-8 border border-pink-100">
                  <h2 className="text-2xl font-bold text-gray-800 mb-6">Thông tin lớp chi tiết</h2>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                    <div>
                      <label className="text-gray-600 block mb-1">Tên lớp</label>
                      <p className="font-semibold text-gray-800">{selectedClassDetail.ten_lop}</p>
                    </div>
                    <div>
                      <label className="text-gray-600 block mb-1">Khoa</label>
                      <p className="font-semibold text-gray-800">{selectedClassDetail.khoa || "Chưa cập nhật"}</p>
                    </div>
                    <div>
                      <label className="text-gray-600 block mb-1">Niên khóa</label>
                      <p className="font-semibold text-gray-800">{selectedClassDetail.nien_khoa || "Chưa cập nhật"}</p>
                    </div>
                    <div>
                      <label className="text-gray-600 block mb-1">Sĩ số</label>
                      <p className="font-semibold text-gray-800">{selectedClassDetail.si_so || "Chưa cập nhật"}</p>
                    </div>
                  </div>
                </div>
              )}
            </>
          )}

          {/* TAB QUẢN LÝ LỊCH */}
          {activeTab === "schedule" && (
            <>
              <div className="mb-8">
                <h2 className="text-xl font-bold text-gray-800 mb-4">Chọn lớp để quản lý thời khóa biểu</h2>
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
                  {classes.map((cls) => (
                    <div
                      key={cls.id_lophoc}
                      onClick={() => selectClassForSchedule(cls)}
                      className={`p-5 rounded-2xl shadow-md cursor-pointer transition-all duration-300 text-center border-2 ${
                        selectedClassSchedule?.id_lophoc === cls.id_lophoc
                          ? "bg-pink-100 border-pink-500 scale-105"
                          : "bg-white hover:bg-pink-50 border-transparent hover:border-pink-300 hover:scale-105"
                      }`}
                    >
                      <div className="font-bold text-lg text-gray-800">{cls.ten_lop}</div>
                      <div className="text-sm text-gray-600 mt-1">{cls.khoa || "Chưa có khoa"}</div>
                    </div>
                  ))}
                </div>
              </div>

              {selectedClassSchedule && (
                <>
                  <div className="bg-white rounded-2xl shadow-lg p-6 mb-8 border border-pink-100">
                    <div className="flex justify-between items-center mb-4">
                      <h2 className="text-2xl font-bold text-gray-800">
                        Thời khóa biểu - {selectedClassSchedule.ten_lop}
                      </h2>
                      {stats && (
                        <div className="bg-pink-100 px-4 py-2 rounded-xl text-pink-700 font-medium">
                          Sĩ số: {stats.totalStudents} học viên
                        </div>
                      )}
                    </div>

                    {loadingSchedule ? (
                      <div className="text-center py-20 text-pink-500 text-xl animate-pulse">
                        Đang tải thời khóa biểu...
                      </div>
                    ) : (
                      <FullCalendar
                        plugins={[dayGridPlugin, timeGridPlugin, interactionPlugin]}
                        initialView="timeGridWeek"
                        headerToolbar={{
                          left: "prev,next today",
                          center: "title",
                          right: "dayGridMonth,timeGridWeek,timeGridDay",
                        }}
                        editable={true}
                        selectable={true}
                        events={events}
                        eventDrop={handleEventDrop}
                        dateClick={handleDateClick}
                        height="auto"
                        locale="vi"
                        eventContent={(arg) => (
                          <div className="p-1 text-white font-medium">{arg.event.title}</div>
                        )}
                      />
                    )}
                  </div>
                </>
              )}

              {!selectedClassSchedule && (
                <div className="bg-pink-50 border border-pink-200 rounded-2xl p-10 text-center">
                  <p className="text-xl text-pink-700 font-medium">
                    Vui lòng chọn một lớp để xem và quản lý thời khóa biểu 🌸
                  </p>
                </div>
              )}
            </>
          )}
        </main>
      </div>

      {/* Modal thêm/sửa lớp */}
      {showClassModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg">
            <div className="p-6 md:p-8">
              <h2 className="text-2xl font-bold text-gray-800 mb-6">
                {editingClass ? "Chỉnh sửa lớp học" : "Thêm lớp học mới"}
              </h2>

              <div className="space-y-5">
                <div>
                  <label className="block text-gray-700 font-medium mb-2">Tên lớp *</label>
                  <input
                    value={classForm.ten_lop}
                    onChange={(e) => setClassForm({ ...classForm, ten_lop: e.target.value })}
                    className="w-full border border-gray-300 p-3 rounded-xl focus:outline-none focus:ring-2 focus:ring-pink-400 transition"
                    placeholder="Ví dụ: YK47A"
                  />
                </div>

                <div>
                  <label className="block text-gray-700 font-medium mb-2">Khoa</label>
                  <input
                    value={classForm.khoa}
                    onChange={(e) => setClassForm({ ...classForm, khoa: e.target.value })}
                    className="w-full border border-gray-300 p-3 rounded-xl focus:outline-none focus:ring-2 focus:ring-pink-400 transition"
                    placeholder="Ví dụ: Y khoa"
                  />
                </div>

                <div>
                  <label className="block text-gray-700 font-medium mb-2">Niên khóa</label>
                  <input
                    value={classForm.nien_khoa}
                    onChange={(e) => setClassForm({ ...classForm, nien_khoa: e.target.value })}
                    className="w-full border border-gray-300 p-3 rounded-xl focus:outline-none focus:ring-2 focus:ring-pink-400 transition"
                    placeholder="Ví dụ: 2023-2028"
                  />
                </div>

                <div>
                  <label className="block text-gray-700 font-medium mb-2">Sĩ số</label>
                  <input
                    type="number"
                    value={classForm.si_so}
                    onChange={(e) => setClassForm({ ...classForm, si_so: e.target.value })}
                    className="w-full border border-gray-300 p-3 rounded-xl focus:outline-none focus:ring-2 focus:ring-pink-400 transition"
                    placeholder="Ví dụ: 120"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-4 mt-8">
                <button
                  onClick={() => setShowClassModal(false)}
                  className="bg-gray-400 hover:bg-gray-500 text-white px-8 py-3 rounded-xl font-semibold shadow-md transition"
                >
                  Hủy
                </button>
                <button
                  onClick={saveClass}
                  className="bg-pink-500 hover:bg-pink-600 text-white px-8 py-3 rounded-xl font-semibold shadow-md transition"
                >
                  {editingClass ? "Cập nhật lớp" : "Thêm lớp"}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Modal quản lý bác sĩ */}
      {showDoctorsModal && managingClass && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4 overflow-y-auto">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-5xl">
            <div className="p-6 md:p-8">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-bold text-gray-800">
                  Quản lý bác sĩ - Lớp {managingClass.ten_lop}
                </h2>
                <button
                  onClick={() => setShowDoctorsModal(false)}
                  className="text-gray-500 hover:text-pink-600 text-3xl"
                >
                  ×
                </button>
              </div>

              <div className="grid md:grid-cols-2 gap-8">
                {/* Bác sĩ hiện tại trong lớp */}
                <div className="bg-pink-50 p-6 rounded-2xl border border-pink-100">
                  <h3 className="font-bold text-lg mb-4 text-pink-700">
                    Bác sĩ hiện tại trong lớp ({currentClassDoctors.length})
                  </h3>
                  {currentClassDoctors.length === 0 ? (
                    <p className="text-gray-500 italic">Chưa có bác sĩ nào được phân công</p>
                  ) : (
                    <div className="space-y-3 max-h-96 overflow-y-auto">
                      {currentClassDoctors.map((doc) => (
                        <div key={doc.id_bacsi} className="bg-white p-4 rounded-xl shadow-sm">
                          <div className="font-semibold text-gray-800">{doc.ho_ten || "Không rõ tên"}</div>
                          <div className="text-sm text-gray-600 mt-1">
                            {doc.chuyen_khoa || "Chưa có chuyên khoa"}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* Danh sách bác sĩ để thêm */}
                <div className="bg-pink-50 p-6 rounded-2xl border border-pink-100">
                  <div className="flex justify-between items-center mb-4">
                    <h3 className="font-bold text-lg text-pink-700">
                      Chọn bác sĩ để thêm ({selectedDoctorIds.length} đã chọn)
                    </h3>
                    <button
                      onClick={addSelectedDoctors}
                      disabled={selectedDoctorIds.length === 0}
                      className={`px-6 py-2.5 rounded-xl text-white font-medium transition ${
                        selectedDoctorIds.length > 0
                          ? "bg-pink-500 hover:bg-pink-600 shadow-md"
                          : "bg-gray-300 cursor-not-allowed"
                      }`}
                    >
                      Thêm vào lớp
                    </button>
                  </div>

                  {allDoctors.length === 0 ? (
                    <p className="text-red-600 font-medium bg-red-50 p-4 rounded-xl">
                      Không có bác sĩ nào khả dụng. Kiểm tra dữ liệu bác sĩ trong hệ thống.
                    </p>
                  ) : (
                    <div className="space-y-3 max-h-96 overflow-y-auto">
                      {allDoctors.map((doc) => {
                        const alreadyIn = currentClassDoctors.some((d) => d.id_bacsi === doc.id_bacsi);
                        return (
                          <label
                            key={doc.id_bacsi}
                            className={`flex items-center gap-4 p-4 rounded-xl cursor-pointer transition ${
                              alreadyIn ? "bg-green-50 opacity-70" : "bg-white hover:bg-pink-50"
                            }`}
                          >
                            <input
                              type="checkbox"
                              checked={selectedDoctorIds.includes(doc.id_bacsi)}
                              onChange={() => toggleDoctorSelection(doc.id_bacsi)}
                              disabled={alreadyIn}
                              className="h-5 w-5 text-pink-600 rounded"
                            />
                            <div>
                              <div className="font-semibold text-gray-800">{doc.ho_ten || "Không rõ tên"}</div>
                              <div className="text-sm text-gray-600 mt-1">
                                {doc.chuyen_khoa || "Chưa có chuyên khoa"} •{" "}
                                {doc.id_lophoc ? "Đã thuộc lớp khác" : "Chưa thuộc lớp"}
                              </div>
                            </div>
                          </label>
                        );
                      })}
                    </div>
                  )}
                </div>
              </div>

              <div className="flex justify-end mt-8">
                <button
                  onClick={() => setShowDoctorsModal(false)}
                  className="bg-gray-500 hover:bg-gray-600 text-white px-8 py-3 rounded-xl font-semibold shadow-md transition"
                >
                  Đóng
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ScheduleManage;