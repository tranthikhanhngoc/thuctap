import React, { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";

const DoctorManage = () => {
  const API = "http://127.0.0.1:8000";
  const token = localStorage.getItem("access_token");
  const navigate = useNavigate();

  const [doctors, setDoctors] = useState([]);
  const [classes, setClasses] = useState([]);
  const [selectedDoctor, setSelectedDoctor] = useState(null);

  const [formData, setFormData] = useState({
    ho_ten: "",
    chuyen_khoa: "",
    trinh_do: "",
    nam_kinh_nghiem: "",
    so_dien_thoai: "",
    email: "",
    username: "",
    password: "",
    id_lophoc: "",
  });

  useEffect(() => {
    fetchDoctors();
    fetchClasses();
  }, []);
  useEffect(() => {
  console.log("Danh sách lớp:", classes);
}, [classes]);

  const fetchDoctors = async () => {
    try {
      const res = await axios.get(`${API}/doctors/`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setDoctors(res.data || []);
    } catch (err) {
      console.error(err);
    }
  };

 const fetchClasses = async () => {
  try {
    const res = await axios.get(`${API}/classes/`, {
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
    });

    console.log("API classes response:", res.data);

    // xử lý nhiều dạng response
    let classData = [];

    if (Array.isArray(res.data)) {
      classData = res.data;
    } else if (Array.isArray(res.data.data)) {
      classData = res.data.data;
    } else if (Array.isArray(res.data.classes)) {
      classData = res.data.classes;
    }

    setClasses(classData);
  } catch (err) {
    console.error("Không lấy được danh sách lớp:", err.response?.data || err);
  }
};

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const resetForm = () => {
    setFormData({
      ho_ten: "",
      chuyen_khoa: "",
      trinh_do: "",
      nam_kinh_nghiem: "",
      so_dien_thoai: "",
      email: "",
      username: "",
      password: "",
      id_lophoc: "",
    });
    setSelectedDoctor(null);
  };

  const addDoctor = async () => {
    if (!formData.username || !formData.password) {
      alert("Vui lòng nhập username và password");
      return;
    }

    try {
      const payload = {
        ...formData,
        nam_kinh_nghiem: Number(formData.nam_kinh_nghiem) || 0,
        id_lophoc: formData.id_lophoc ? Number(formData.id_lophoc) : null,
      };

      await axios.post(`${API}/doctors/`, payload, {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });

      alert("Thêm bác sĩ thành công!");
      resetForm();
      fetchDoctors();
    } catch (err) {
      alert(err.response?.data?.detail || "Thêm thất bại!");
    }
  };

  const updateDoctor = async () => {
    try {
      const payload = {
        ho_ten: formData.ho_ten,
        chuyen_khoa: formData.chuyen_khoa,
        trinh_do: formData.trinh_do,
        nam_kinh_nghiem: Number(formData.nam_kinh_nghiem) || 0,
        so_dien_thoai: formData.so_dien_thoai,
        email: formData.email,
        id_lophoc: formData.id_lophoc ? Number(formData.id_lophoc) : null,
      };

      await axios.put(`${API}/doctors/${selectedDoctor.id_bacsi}`, payload, {
        headers: { Authorization: `Bearer ${token}` },
      });

      alert("Cập nhật thành công!");
      resetForm();
      fetchDoctors();
    } catch (err) {
      alert("Cập nhật thất bại!");
    }
  };

  const deleteDoctor = async (id) => {
    if (!window.confirm("Bạn chắc chắn muốn xóa bác sĩ này?")) return;

    try {
      await axios.delete(`${API}/doctors/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      fetchDoctors();
      alert("Xóa thành công!");
    } catch (err) {
      alert("Xóa thất bại!");
    }
  };

  const editDoctor = async (id) => {
    try {
      const res = await axios.get(`${API}/doctors/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const doctor = res.data;
      setSelectedDoctor(doctor);
      setFormData({
        ...doctor,
        username: "",
        password: "",
        id_lophoc: doctor.id_lophoc || "",
      });
    } catch (err) {
      alert("Không thể tải thông tin bác sĩ!");
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
            onClick={() => navigate("/admin/quan-ly-bac-si")}
            className="w-full flex items-center gap-3 px-4 py-3 rounded-xl bg-pink-50 text-pink-600 font-medium hover:bg-pink-100 transition"
          >
            <span className="text-xl">👨‍⚕️</span> Quản lý Bác sĩ
          </button>
          {/* Thêm các menu khác nếu cần */}
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
                🏥 Quản lý bác sĩ
              </h1>
            </div>
          </div>
        </header>

        <main className="p-6 md:p-10">
          {/* Form Section */}
          <div className="bg-white rounded-2xl shadow-lg p-8 mb-10 border border-pink-100">
            <h2 className="text-2xl font-bold text-gray-800 mb-6">
              {selectedDoctor ? "Chỉnh sửa thông tin bác sĩ" : "Thêm bác sĩ mới"}
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              <div>
                <label className="block text-gray-700 font-medium mb-2">Họ tên</label>
                <input
                  name="ho_ten"
                  placeholder="Họ và tên bác sĩ"
                  value={formData.ho_ten}
                  onChange={handleChange}
                  className="w-full border border-gray-300 p-3 rounded-xl focus:outline-none focus:ring-2 focus:ring-pink-400 transition"
                />
              </div>

              <div>
                <label className="block text-gray-700 font-medium mb-2">Email</label>
                <input
                  name="email"
                  placeholder="Email liên hệ"
                  value={formData.email}
                  onChange={handleChange}
                  className="w-full border border-gray-300 p-3 rounded-xl focus:outline-none focus:ring-2 focus:ring-pink-400 transition"
                />
              </div>

              <div>
                <label className="block text-gray-700 font-medium mb-2">Số điện thoại</label>
                <input
                  name="so_dien_thoai"
                  placeholder="SĐT"
                  value={formData.so_dien_thoai}
                  onChange={handleChange}
                  className="w-full border border-gray-300 p-3 rounded-xl focus:outline-none focus:ring-2 focus:ring-pink-400 transition"
                />
              </div>

              <div>
                <label className="block text-gray-700 font-medium mb-2">Chuyên khoa</label>
                <input
                  name="chuyen_khoa"
                  placeholder="Chuyên khoa (ví dụ: Nội khoa, Nhi khoa...)"
                  value={formData.chuyen_khoa}
                  onChange={handleChange}
                  className="w-full border border-gray-300 p-3 rounded-xl focus:outline-none focus:ring-2 focus:ring-pink-400 transition"
                />
              </div>

              <div>
                <label className="block text-gray-700 font-medium mb-2">Trình độ</label>
                <input
                  name="trinh_do"
                  placeholder="Trình độ (BS CKI, ThS, TS...)"
                  value={formData.trinh_do}
                  onChange={handleChange}
                  className="w-full border border-gray-300 p-3 rounded-xl focus:outline-none focus:ring-2 focus:ring-pink-400 transition"
                />
              </div>

              <div>
                <label className="block text-gray-700 font-medium mb-2">Năm kinh nghiệm</label>
                <input
                  name="nam_kinh_nghiem"
                  type="number"
                  placeholder="Số năm"
                  value={formData.nam_kinh_nghiem}
                  onChange={handleChange}
                  className="w-full border border-gray-300 p-3 rounded-xl focus:outline-none focus:ring-2 focus:ring-pink-400 transition"
                />
              </div>

              {!selectedDoctor && (
                <>
                  <div>
                    <label className="block text-gray-700 font-medium mb-2">Username</label>
                    <input
                      name="username"
                      placeholder="Tên đăng nhập"
                      value={formData.username}
                      onChange={handleChange}
                      className="w-full border border-gray-300 p-3 rounded-xl focus:outline-none focus:ring-2 focus:ring-pink-400 transition"
                    />
                  </div>

                  <div>
                    <label className="block text-gray-700 font-medium mb-2">Mật khẩu</label>
                    <input
                      name="password"
                      type="password"
                      placeholder="Mật khẩu đăng nhập"
                      value={formData.password}
                      onChange={handleChange}
                      className="w-full border border-gray-300 p-3 rounded-xl focus:outline-none focus:ring-2 focus:ring-pink-400 transition"
                    />
                  </div>
                </>
              )}

              <div className="md:col-span-2 lg:col-span-3">
                <label className="block text-gray-700 font-medium mb-2">Lớp học / Nhóm</label>
                <select
                  name="id_lophoc"
                  value={formData.id_lophoc || ""}
                  onChange={handleChange}
                  className="w-full border border-gray-300 p-3 rounded-xl focus:outline-none focus:ring-2 focus:ring-pink-400 transition bg-white"
                >
                  <option value="">Chưa thuộc lớp nào</option>
                  {classes && classes.length > 0 ? (
  classes.map((c) => (
    <option key={c.id_lophoc} value={c.id_lophoc}>
      {c.ten_lop || `Lớp ${c.id_lophoc}`}
    </option>
  ))
) : (
  <option disabled>Không có lớp</option>
)}
                </select>
              </div>
            </div>

            <div className="mt-8 flex gap-4">
              <button
                onClick={selectedDoctor ? updateDoctor : addDoctor}
                className="bg-pink-500 hover:bg-pink-600 text-white px-8 py-3 rounded-xl font-semibold shadow-md transition transform hover:scale-105"
              >
                {selectedDoctor ? "Cập nhật thông tin" : "Thêm bác sĩ"}
              </button>

              {selectedDoctor && (
                <button
                  onClick={resetForm}
                  className="bg-gray-400 hover:bg-gray-500 text-white px-8 py-3 rounded-xl font-semibold shadow-md transition"
                >
                  Hủy chỉnh sửa
                </button>
              )}
            </div>
          </div>

          {/* Table Section */}
          <div className="bg-white rounded-2xl shadow-lg overflow-hidden border border-pink-100">
            <table className="w-full text-left">
              <thead className="bg-pink-500 text-white">
                <tr>
                  <th className="p-4 font-semibold">ID</th>
                  <th className="p-4 font-semibold">Họ tên</th>
                  <th className="p-4 font-semibold">Email</th>
                  <th className="p-4 font-semibold">SĐT</th>
                  <th className="p-4 font-semibold">Chuyên khoa</th>
                  <th className="p-4 font-semibold">Trình độ</th>
                  <th className="p-4 font-semibold">Kinh nghiệm</th>
                  <th className="p-4 font-semibold text-center">Hành động</th>
                </tr>
              </thead>
              <tbody>
                {doctors.length > 0 ? (
                  doctors.map((doc) => (
                    <tr
                      key={doc.id_bacsi}
                      className="border-b border-gray-100 hover:bg-pink-50 transition duration-200"
                    >
                      <td className="p-4 text-gray-700 font-medium">{doc.id_bacsi}</td>
                      <td className="p-4 font-semibold text-gray-800">{doc.ho_ten}</td>
                      <td className="p-4 text-gray-600">{doc.email || "—"}</td>
                      <td className="p-4 text-gray-600">{doc.so_dien_thoai || "—"}</td>
                      <td className="p-4 text-gray-700">{doc.chuyen_khoa || "—"}</td>
                      <td className="p-4 text-gray-700">{doc.trinh_do || "—"}</td>
                      <td className="p-4 text-center text-gray-700">
                        {doc.nam_kinh_nghiem ? `${doc.nam_kinh_nghiem} năm` : "—"}
                      </td>
                      <td className="p-4 text-center space-x-3">
                        <button
                          onClick={() => editDoctor(doc.id_bacsi)}
                          className="bg-yellow-500 hover:bg-yellow-600 text-white px-5 py-2 rounded-lg shadow-sm transition"
                        >
                          Sửa
                        </button>
                        <button
                          onClick={() => deleteDoctor(doc.id_bacsi)}
                          className="bg-red-500 hover:bg-red-600 text-white px-5 py-2 rounded-lg shadow-sm transition"
                        >
                          Xóa
                        </button>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="8" className="text-center p-10 text-gray-500 text-lg">
                      Chưa có bác sĩ nào trong hệ thống 🌸
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </main>
      </div>
    </div>
  );
};

export default DoctorManage;