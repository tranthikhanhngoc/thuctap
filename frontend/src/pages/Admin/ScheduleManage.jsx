import React, { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";

const ScheduleManage = () => {

  const [activeTab, setActiveTab] = useState("classes");

  const [classes, setClasses] = useState([]);
  const [selectedClassSchedule, setSelectedClassSchedule] = useState(null);

  const [scheduleTable, setScheduleTable] = useState([]);
  const [loadingSchedule, setLoadingSchedule] = useState(false);

  const [excelFile, setExcelFile] = useState(null);

  // form thêm lớp
  const [newClass, setNewClass] = useState({
    ten_lop: "",
    khoa: "",
    nien_khoa: "",
    si_so: ""
  });

  const token = localStorage.getItem("access_token");
  const navigate = useNavigate();

  const api = axios.create({
    baseURL: "http://127.0.0.1:8000",
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  const days = [
    "Thứ Hai",
    "Thứ Ba",
    "Thứ Tư",
    "Thứ Năm",
    "Thứ Sáu",
    "Thứ Bảy",
    "Chủ Nhật",
  ];

  const fetchClasses = async () => {
    try {
      const res = await api.get("/classes/");
      setClasses(res.data || []);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    fetchClasses();
  }, []);

  // =========================
  // THÊM LỚP
  // =========================
  const handleAddClass = async () => {

    if (!newClass.ten_lop) {
      alert("Nhập tên lớp");
      return;
    }

    try {

      await api.post("/classes/", newClass);

      alert("Thêm lớp thành công");

      setNewClass({
        ten_lop: "",
        khoa: "",
        nien_khoa: "",
        si_so: ""
      });

      fetchClasses();

    } catch (err) {
      console.error(err);
      alert("Thêm lớp thất bại");
    }
  };

  // =========================
  // UPLOAD EXCEL
  // =========================
  const handleUploadExcel = async () => {

    if (!excelFile) {
      alert("Chọn file Excel");
      return;
    }

    const formData = new FormData();
    formData.append("file", excelFile);

    try {

      await api.post("/schedule/upload", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      alert("Upload thành công");

      fetchClasses();

    } catch (err) {
      console.error(err);
      alert("Upload thất bại");
    }
  };

  // =========================
  // XEM LỊCH
  // =========================
  const selectClassForSchedule = (cls) => {

    setSelectedClassSchedule(cls);
    setActiveTab("schedule");

    loadSchedule(cls.id_lophoc);
  };

  const loadSchedule = async (classId) => {

    setLoadingSchedule(true);

    try {

      const res = await api.get(`/schedule/class/${classId}`);
      const data = res.data || [];

      const table = days.map((day, index) => {
        const item = data.find((d) => d.thu === index + 1);

        return {
          day,
          mon: item?.mon_hoc || "/",
          gv: item?.giang_vien || "",
        };
      });

      setScheduleTable(table);

    } catch (err) {

      console.error("Lỗi load lịch:", err);

    } finally {

      setLoadingSchedule(false);

    }
  };

  return (

    <div className="min-h-screen bg-gray-100">

      {/* HEADER */}

      <div className="bg-white shadow p-5 flex justify-between">

        <h1 className="text-2xl font-bold">
          Quản lý lớp & lịch học
        </h1>

        <button
          onClick={() => navigate("/admin")}
          className="bg-gray-500 text-white px-4 py-2 rounded"
        >
          Quay lại
        </button>

      </div>

      <div className="p-6">

        {/* TAB */}

        <div className="flex gap-3 mb-6">

          <button
            onClick={() => setActiveTab("classes")}
            className={`px-5 py-2 rounded ${
              activeTab === "classes"
                ? "bg-pink-500 text-white"
                : "bg-white"
            }`}
          >
            Quản lý lớp
          </button>

          <button
            onClick={() => setActiveTab("schedule")}
            className={`px-5 py-2 rounded ${
              activeTab === "schedule"
                ? "bg-pink-500 text-white"
                : "bg-white"
            }`}
          >
            Thời khóa biểu
          </button>

        </div>

        {/* TAB LỚP */}

        {activeTab === "classes" && (

          <>

            {/* FORM THÊM LỚP */}

            <div className="bg-white p-5 rounded shadow mb-6">

              <h2 className="font-bold mb-4">
                Thêm lớp
              </h2>

              <div className="grid grid-cols-4 gap-3">

                <input
                  placeholder="Tên lớp"
                  value={newClass.ten_lop}
                  onChange={(e) =>
                    setNewClass({ ...newClass, ten_lop: e.target.value })
                  }
                  className="border p-2 rounded"
                />

                <input
                  placeholder="Khoa"
                  value={newClass.khoa}
                  onChange={(e) =>
                    setNewClass({ ...newClass, khoa: e.target.value })
                  }
                  className="border p-2 rounded"
                />

                <input
                  placeholder="Niên khóa"
                  value={newClass.nien_khoa}
                  onChange={(e) =>
                    setNewClass({ ...newClass, nien_khoa: e.target.value })
                  }
                  className="border p-2 rounded"
                />

                <input
                  placeholder="Sĩ số"
                  type="number"
                  value={newClass.si_so}
                  onChange={(e) =>
                    setNewClass({ ...newClass, si_so: e.target.value })
                  }
                  className="border p-2 rounded"
                />

              </div>

              <button
                onClick={handleAddClass}
                className="mt-4 bg-green-500 text-white px-4 py-2 rounded"
              >
                Thêm lớp
              </button>

            </div>

            {/* UPLOAD EXCEL */}

            <div className="bg-white p-5 rounded shadow mb-6">

              <h2 className="font-bold mb-4">
                Upload lịch từ Excel
              </h2>

              <div className="flex gap-3">

                <input
                  type="file"
                  accept=".xlsx,.xls"
                  onChange={(e) =>
                    setExcelFile(e.target.files?.[0] || null)
                  }
                />

                <button
                  onClick={handleUploadExcel}
                  className="bg-pink-500 text-white px-4 py-2 rounded"
                >
                  Upload
                </button>

              </div>

            </div>

            {/* DANH SÁCH LỚP */}

            <div className="bg-white rounded shadow">

              <table className="w-full">

                <thead className="bg-pink-500 text-white">

                  <tr>
                    <th className="p-3">Tên lớp</th>
                    <th className="p-3">Khoa</th>
                    <th className="p-3">Niên khóa</th>
                    <th className="p-3">Sĩ số</th>
                    <th className="p-3">Lịch học</th>
                  </tr>

                </thead>

                <tbody>

                  {classes.map((cls) => (

                    <tr key={cls.id_lophoc} className="border-b">

                      <td className="p-3">{cls.ten_lop}</td>
                      <td className="p-3">{cls.khoa}</td>
                      <td className="p-3">{cls.nien_khoa}</td>
                      <td className="p-3">{cls.si_so}</td>

                      <td className="p-3">

                        <button
                          onClick={() => selectClassForSchedule(cls)}
                          className="bg-purple-500 text-white px-3 py-1 rounded"
                        >
                          Xem lịch
                        </button>

                      </td>

                    </tr>

                  ))}

                </tbody>

              </table>

            </div>

          </>

        )}

        {/* TAB LỊCH */}

        {activeTab === "schedule" && selectedClassSchedule && (

          <div className="bg-white p-6 rounded shadow">

            <div className="flex justify-between mb-6">

              <h2 className="text-xl font-bold">
                Lịch học lớp {selectedClassSchedule.ten_lop}
              </h2>

              <button
                onClick={() => setActiveTab("classes")}
                className="bg-gray-500 text-white px-4 py-2 rounded"
              >
                Quay lại
              </button>

            </div>

            {loadingSchedule ? (

              <div>Đang tải...</div>

            ) : (

              <div className="overflow-x-auto">

                <table className="w-full border">

                  <thead className="bg-gray-200">

                    <tr>

                      {scheduleTable.map((d, i) => (

                        <th key={i} className="border p-3">
                          {d.day}
                        </th>

                      ))}

                    </tr>

                  </thead>

                  <tbody>

                    <tr>

                      {scheduleTable.map((d, i) => (

                        <td
                          key={i}
                          className="border p-4 h-28 text-center"
                        >

                          <div className="font-semibold text-pink-600">
                            {d.mon}
                          </div>

                          {d.gv && (
                            <div className="text-sm text-gray-600 mt-2">
                              {d.gv}
                            </div>
                          )}

                        </td>

                      ))}

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