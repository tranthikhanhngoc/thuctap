import React, { useEffect, useState } from "react";
import axios from "axios";
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

  // Quản lý bác sĩ
  const [showDoctorsModal, setShowDoctorsModal] = useState(false);
  const [currentClassDoctors, setCurrentClassDoctors] = useState([]);
  const [allDoctors, setAllDoctors] = useState([]);
  const [selectedDoctorIds, setSelectedDoctorIds] = useState([]);
  const [managingClass, setManagingClass] = useState(null);

  // Upload Excel
  const [excelFile, setExcelFile] = useState(null);

  const token = localStorage.getItem("access_token");

  const api = axios.create({
    baseURL: "http://localhost:8000",
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  // Fetch danh sách lớp
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
      alert("Upload thành công!");
      setExcelFile(null);
      fetchClasses();
    } catch (err) {
      console.error(err);
      alert("Upload thất bại");
    }
  };

  // CRUD lớp
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
        alert("Cập nhật thành công");
      } else {
        await api.post("/classes/", classForm);
        alert("Thêm lớp thành công");
      }
      setShowClassModal(false);
      fetchClasses();
    } catch (err) {
      console.error(err);
      alert("Lưu lớp thất bại");
    }
  };

  const deleteClass = async (id) => {
    if (!window.confirm("Xác nhận xóa lớp?")) return;
    try {
      await api.delete(`/classes/${id}`);
      fetchClasses();
    } catch (err) {
      console.error(err);
      alert("Xóa thất bại");
    }
  };

  // Chọn lớp xem lịch
  const selectClassForSchedule = (cls) => {
    setSelectedClassSchedule(cls);
    setActiveTab("schedule");
    loadSchedule(cls.id_lophoc);
    loadStats(cls.id_lophoc);
  };

  const loadSchedule = async (classId) => {
    try {
      const res = await api.get(`/schedule/class/${classId}`);
      setEvents(
        (res.data || []).map((item) => ({
          id: item.id,
          title: item.mon_hoc || "Không tên",
          start: item.thoi_gian_bat_dau,
          end: item.thoi_gian_ket_thuc,
        }))
      );
    } catch (err) {
      console.error("Lỗi tải lịch:", err);
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

  // Calendar handlers
  const handleEventDrop = async (info) => {
    const { event } = info;
    try {
      await api.put(`/schedule/${event.id}`, {
        thoi_gian_bat_dau: event.start.toISOString(),
        thoi_gian_ket_thuc: event.end ? event.end.toISOString() : event.start.toISOString(),
      });
    } catch (err) {
      console.error(err);
      info.revert();
      alert("Cập nhật thời gian thất bại");
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
        },
      ]);
    } catch (err) {
      console.error(err);
      alert("Thêm buổi học thất bại");
    }
  };

  // Quản lý bác sĩ
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
      console.log("Danh sách bác sĩ lớp:", res.status, res.data);
      setCurrentClassDoctors(res.data || []);
    } catch (err) {
      console.error("Lỗi tải bác sĩ lớp:", err);
      setCurrentClassDoctors([]);
    }
  };

  const loadAllDoctors = async () => {
    try {
      const res = await api.get("/classes/doctors");
      console.log("[DEBUG] GET /classes/doctors response:", {
        status: res.status,
        data: res.data,
        dataType: typeof res.data,
        isArray: Array.isArray(res.data),
      });

      let doctorsList = [];
      if (Array.isArray(res.data)) {
        doctorsList = res.data;
      } else if (res.data && res.data.items && Array.isArray(res.data.items)) {
        doctorsList = res.data.items;
      } else {
        console.warn("[DEBUG] Response không phải mảng hoặc {items: []}");
      }

      setAllDoctors(doctorsList);
    } catch (err) {
      console.error("[DEBUG] Lỗi tải tất cả bác sĩ:", err);
      if (err.response) {
        console.log("[DEBUG] Error detail:", err.response.data);
        console.log("[DEBUG] Error status:", err.response.status);
      }
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
      alert("Chọn ít nhất một bác sĩ");
      return;
    }
    try {
      await api.post(`/classes/${managingClass.id_lophoc}/add-doctors`, selectedDoctorIds);
      alert(`Đã thêm ${selectedDoctorIds.length} bác sĩ`);
      loadDoctorsOfClass(managingClass.id_lophoc);
      setSelectedDoctorIds([]);
    } catch (err) {
      console.error(err);
      alert("Thêm bác sĩ thất bại");
    }
  };

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      <h1 className="text-3xl font-bold text-indigo-700 mb-6">
        Quản lý Lớp học & Thời khóa biểu
      </h1>

      {/* Tabs */}
      <div className="flex border-b mb-6">
        <button
          onClick={() => setActiveTab("classes")}
          className={`px-6 py-3 font-medium ${
            activeTab === "classes" ? "border-b-4 border-indigo-600 text-indigo-700" : "text-gray-600 hover:text-indigo-600"
          }`}
        >
          Quản lý lớp
        </button>
        <button
          onClick={() => setActiveTab("schedule")}
          className={`px-6 py-3 font-medium ${
            activeTab === "schedule" ? "border-b-4 border-indigo-600 text-indigo-700" : "text-gray-600 hover:text-indigo-600"
          }`}
        >
          Quản lý lịch học
        </button>
      </div>

      {/* TAB QUẢN LÝ LỚP */}
      {activeTab === "classes" && (
        <>
          {/* Upload Excel */}
          <div className="bg-white p-5 rounded-lg shadow mb-6">
            <h2 className="text-lg font-semibold mb-3">Upload lịch từ Excel</h2>
            <div className="flex items-center gap-4">
              <input
                type="file"
                accept=".xlsx,.xls"
                onChange={(e) => setExcelFile(e.target.files?.[0] || null)}
                className="border rounded px-3 py-2"
              />
              <button
                onClick={handleUploadExcel}
                className="bg-green-600 hover:bg-green-700 text-white px-5 py-2 rounded"
              >
                Upload
              </button>
            </div>
          </div>

          <button
            onClick={openAddClass}
            className="bg-indigo-600 hover:bg-indigo-700 text-white px-6 py-2.5 rounded mb-6"
          >
            + Thêm lớp mới
          </button>

          <div className="bg-white shadow rounded-lg overflow-x-auto mb-8">
            <table className="w-full min-w-max text-center">
              <thead className="bg-indigo-600 text-white">
                <tr>
                  <th className="py-3 px-4">Tên lớp</th>
                  <th>Khoa</th>
                  <th>Niên khóa</th>
                  <th>Sĩ số</th>
                  <th>Hành động</th>
                </tr>
              </thead>
              <tbody>
                {classes.map((cls) => (
                  <tr key={cls.id_lophoc} className="border-b hover:bg-gray-50">
                    <td className="py-3 font-medium">{cls.ten_lop}</td>
                    <td>{cls.khoa || "-"}</td>
                    <td>{cls.nien_khoa || "-"}</td>
                    <td>{cls.si_so || "-"}</td>
                    <td className="py-3 flex gap-2 justify-center flex-wrap">
                      <button
                        onClick={() => setSelectedClassDetail(cls)}
                        className="bg-blue-500 hover:bg-blue-600 text-white px-3 py-1 rounded text-sm"
                      >
                        Chi tiết
                      </button>
                      <button
                        onClick={() => openEditClass(cls)}
                        className="bg-amber-500 hover:bg-amber-600 text-white px-3 py-1 rounded text-sm"
                      >
                        Sửa
                      </button>
                      <button
                        onClick={() => openManageDoctors(cls)}
                        className="bg-teal-500 hover:bg-teal-600 text-white px-3 py-1 rounded text-sm"
                      >
                        Bác sĩ
                      </button>
                      <button
                        onClick={() => selectClassForSchedule(cls)}
                        className="bg-purple-500 hover:bg-purple-600 text-white px-3 py-1 rounded text-sm"
                      >
                        Lịch
                      </button>
                      <button
                        onClick={() => deleteClass(cls.id_lophoc)}
                        className="bg-red-500 hover:bg-red-600 text-white px-3 py-1 rounded text-sm"
                      >
                        Xóa
                      </button>
                    </td>
                  </tr>
                ))}
                {classes.length === 0 && (
                  <tr>
                    <td colSpan={5} className="py-8 text-gray-500">
                      Chưa có lớp nào
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          {selectedClassDetail && !showClassModal && (
            <div className="bg-white p-6 rounded-lg shadow">
              <h2 className="text-xl font-semibold mb-4">Thông tin lớp</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <p><strong>Tên lớp:</strong> {selectedClassDetail.ten_lop}</p>
                <p><strong>Khoa:</strong> {selectedClassDetail.khoa || "Chưa có"}</p>
                <p><strong>Niên khóa:</strong> {selectedClassDetail.nien_khoa || "Chưa có"}</p>
                <p><strong>Sĩ số:</strong> {selectedClassDetail.si_so || "Chưa cập nhật"}</p>
              </div>
            </div>
          )}
        </>
      )}

      {/* TAB QUẢN LÝ LỊCH */}
      {activeTab === "schedule" && (
        <>
          <div className="mb-6">
            <h2 className="text-lg font-semibold mb-3">Chọn lớp để xem lịch</h2>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
              {classes.map((cls) => (
                <div
                  key={cls.id_lophoc}
                  onClick={() => selectClassForSchedule(cls)}
                  className={`p-4 rounded-lg shadow cursor-pointer transition ${
                    selectedClassSchedule?.id_lophoc === cls.id_lophoc
                      ? "bg-indigo-100 border-2 border-indigo-500"
                      : "bg-white hover:bg-indigo-50"
                  }`}
                >
                  <div className="font-bold">{cls.ten_lop}</div>
                  <div className="text-sm text-gray-600">{cls.khoa}</div>
                </div>
              ))}
            </div>
          </div>

          {selectedClassSchedule && (
            <>
              <div className="bg-white p-5 rounded-lg shadow mb-6">
                <h2 className="text-xl font-bold mb-2">
                  Thời khóa biểu - {selectedClassSchedule.ten_lop}
                </h2>
                {stats && <p className="text-gray-700">Sĩ số: {stats.totalStudents} học viên</p>}
              </div>

              <div className="bg-white p-4 rounded-lg shadow">
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
                />
              </div>
            </>
          )}

          {!selectedClassSchedule && (
            <div className="bg-yellow-50 border border-yellow-200 p-8 rounded text-center">
              <p className="text-lg text-gray-700">
                Vui lòng chọn một lớp để xem và quản lý lịch học.
              </p>
            </div>
          )}
        </>
      )}

      {/* Modal thêm/sửa lớp */}
      {showClassModal && (
        <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md mx-4">
            <h2 className="text-2xl font-bold mb-5">
              {editingClass ? "Cập nhật lớp" : "Thêm lớp mới"}
            </h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1">Tên lớp *</label>
                <input
                  value={classForm.ten_lop}
                  onChange={(e) => setClassForm({ ...classForm, ten_lop: e.target.value })}
                  className="border rounded w-full px-3 py-2"
                  placeholder="VD: YK47A"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Khoa</label>
                <input
                  value={classForm.khoa}
                  onChange={(e) => setClassForm({ ...classForm, khoa: e.target.value })}
                  className="border rounded w-full px-3 py-2"
                  placeholder="VD: Y khoa"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Niên khóa</label>
                <input
                  value={classForm.nien_khoa}
                  onChange={(e) => setClassForm({ ...classForm, nien_khoa: e.target.value })}
                  className="border rounded w-full px-3 py-2"
                  placeholder="VD: 2023-2028"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Sĩ số</label>
                <input
                  type="number"
                  value={classForm.si_so}
                  onChange={(e) => setClassForm({ ...classForm, si_so: e.target.value })}
                  className="border rounded w-full px-3 py-2"
                  placeholder="VD: 120"
                />
              </div>
            </div>
            <div className="flex justify-end gap-3 mt-6">
              <button
                onClick={() => setShowClassModal(false)}
                className="px-5 py-2 bg-gray-300 hover:bg-gray-400 rounded"
              >
                Hủy
              </button>
              <button
                onClick={saveClass}
                className="px-5 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded"
              >
                {editingClass ? "Cập nhật" : "Thêm"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal quản lý bác sĩ */}
      {showDoctorsModal && managingClass && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 overflow-y-auto">
          <div className="bg-white rounded-lg p-6 w-full max-w-5xl m-4">
            <h2 className="text-2xl font-bold mb-5">
              Quản lý bác sĩ - Lớp {managingClass.ten_lop}
            </h2>

            <div className="grid md:grid-cols-2 gap-6">
              {/* Bác sĩ hiện tại */}
              <div className="bg-gray-50 p-5 rounded border">
                <h3 className="font-semibold text-lg mb-3">
                  Bác sĩ trong lớp ({currentClassDoctors.length})
                </h3>
                {currentClassDoctors.length === 0 ? (
                  <p className="text-gray-500 italic">Chưa có bác sĩ nào</p>
                ) : (
                  <div className="space-y-2 max-h-80 overflow-y-auto">
                    {currentClassDoctors.map((doc) => (
                      <div key={doc.id_bacsi} className="bg-white p-3 rounded shadow-sm">
                        <div className="font-medium">{doc.ho_ten || "Không rõ tên"}</div>
                        <div className="text-sm text-gray-600">
                          {doc.chuyen_khoa || "Chưa có chuyên khoa"}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Chọn bác sĩ để thêm */}
              <div className="bg-gray-50 p-5 rounded border">
                <div className="flex justify-between items-center mb-3">
                  <h3 className="font-semibold text-lg">
                    Chọn bác sĩ để thêm ({selectedDoctorIds.length})
                  </h3>
                  <button
                    onClick={addSelectedDoctors}
                    disabled={selectedDoctorIds.length === 0}
                    className={`px-4 py-1.5 rounded text-white text-sm ${
                      selectedDoctorIds.length > 0 ? "bg-green-600 hover:bg-green-700" : "bg-gray-400 cursor-not-allowed"
                    }`}
                  >
                    Thêm vào lớp
                  </button>
                </div>

                {allDoctors.length === 0 ? (
                  <p className="text-red-600 font-medium">
                    Không có bác sĩ nào khả dụng hoặc bảng bacsi đang rỗng.
                    <br />
                    Kiểm tra console (F12) để xem response từ /classes/doctors.
                    <br />
                    Nếu response là mảng rỗng [] → thêm dữ liệu bác sĩ vào database.
                  </p>
                ) : (
                  <div className="space-y-2 max-h-80 overflow-y-auto">
                    {allDoctors.map((doc) => {
                      const alreadyIn = currentClassDoctors.some((d) => d.id_bacsi === doc.id_bacsi);
                      return (
                        <label
                          key={doc.id_bacsi}
                          className={`flex items-center gap-3 p-3 rounded cursor-pointer ${
                            alreadyIn ? "bg-green-50 opacity-70" : "bg-white hover:bg-gray-100"
                          }`}
                        >
                          <input
                            type="checkbox"
                            checked={selectedDoctorIds.includes(doc.id_bacsi)}
                            onChange={() => toggleDoctorSelection(doc.id_bacsi)}
                            disabled={alreadyIn}
                            className="h-5 w-5 text-indigo-600"
                          />
                          <div>
                            <div className="font-medium">{doc.ho_ten || "Không rõ tên"}</div>
                            <div className="text-sm text-gray-600">
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

            <div className="flex justify-end mt-6">
              <button
                onClick={() => setShowDoctorsModal(false)}
                className="px-6 py-2.5 bg-gray-600 hover:bg-gray-700 text-white rounded"
              >
                Đóng
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ScheduleManage;