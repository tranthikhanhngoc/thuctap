import React, { useEffect, useState } from "react";
import axios from "axios";

const DoctorManage = () => {

  const API = "http://127.0.0.1:8000";
  const token = localStorage.getItem("access_token");

  const [doctors, setDoctors] = useState([]);
  const [classes, setClasses] = useState([]);
  const [selectedDoctor, setSelectedDoctor] = useState(null);
  const [doctorDetail, setDoctorDetail] = useState(null);

  const [formData, setFormData] = useState({
    ho_ten: "",
    chuyen_khoa: "",
    trinh_do: "",
    nam_kinh_nghiem: "",
    so_dien_thoai: "",
    email: "",
    username: "",
    password: "",
    id_lophoc: ""
  });

  // ================= FETCH =================
  const fetchDoctors = async () => {
    try {
      const res = await axios.get(`${API}/doctors/`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setDoctors(res.data);
    } catch (err) {
      console.log(err);
    }
  };

  const fetchClasses = async () => {
    try {
      const res = await axios.get(`${API}/classes/`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setClasses(res.data);
    } catch (err) {
      console.log(err);
    }
  };

  useEffect(() => {
    fetchDoctors();
    fetchClasses();
  }, []);

  // ================= HANDLE =================
  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
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
      id_lophoc: ""
    });
  };

  // ================= ADD =================
  const addDoctor = async () => {

    if (!formData.username || !formData.password) {
      alert("Vui lòng nhập username và password");
      return;
    }

    try {

      const payload = {
        ...formData,
        nam_kinh_nghiem: Number(formData.nam_kinh_nghiem),
        id_lophoc: formData.id_lophoc ? Number(formData.id_lophoc) : null
      };

      await axios.post(`${API}/doctors/`, payload, {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json"
        }
      });

      alert("Thêm bác sĩ thành công");
      resetForm();
      fetchDoctors();

    } catch (err) {
      alert(err.response?.data?.detail || "Thêm thất bại");
    }
  };

  // ================= UPDATE =================
  const updateDoctor = async () => {
    try {

      const payload = {
        ho_ten: formData.ho_ten,
        chuyen_khoa: formData.chuyen_khoa,
        trinh_do: formData.trinh_do,
        nam_kinh_nghiem: Number(formData.nam_kinh_nghiem),
        so_dien_thoai: formData.so_dien_thoai,
        email: formData.email,
        id_lophoc: formData.id_lophoc ? Number(formData.id_lophoc) : null
      };

      await axios.put(
        `${API}/doctors/${selectedDoctor.id_bacsi}`,
        payload,
        { headers: { Authorization: `Bearer ${token}` } }
      );

      alert("Cập nhật thành công");
      setSelectedDoctor(null);
      resetForm();
      fetchDoctors();

    } catch (err) {
      alert("Cập nhật thất bại");
    }
  };

  // ================= DELETE =================
  const deleteDoctor = async (id) => {

    if (!window.confirm("Bạn chắc chắn muốn xóa?")) return;

    try {
      await axios.delete(`${API}/doctors/${id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      fetchDoctors();
    } catch {
      alert("Xóa thất bại");
    }
  };

  // ================= EDIT =================
  const editDoctor = async (id) => {

    const res = await axios.get(`${API}/doctors/${id}`, {
      headers: { Authorization: `Bearer ${token}` }
    });

    const doctor = res.data;
    setSelectedDoctor(doctor);

    setFormData({
      ...doctor,
      username: "",
      password: ""
    });
  };

  // ================= UI =================
  return (
    <div className="p-10 bg-gray-50 min-h-screen">

      <h1 className="text-3xl font-bold mb-8 text-blue-600">
        🏥 Quản lý bác sĩ
      </h1>

      {/* FORM */}
      <div className="bg-white shadow-lg rounded-2xl p-6 mb-10">

        <h2 className="text-xl font-semibold mb-6">
          {selectedDoctor ? "Chỉnh sửa bác sĩ" : "Thêm bác sĩ mới"}
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">

          <input name="ho_ten" placeholder="Họ tên"
            value={formData.ho_ten} onChange={handleChange}
            className="input" />

          <input name="email" placeholder="Email"
            value={formData.email} onChange={handleChange}
            className="input" />

          <input name="so_dien_thoai" placeholder="SĐT"
            value={formData.so_dien_thoai} onChange={handleChange}
            className="input" />

          <input name="chuyen_khoa" placeholder="Chuyên khoa"
            value={formData.chuyen_khoa} onChange={handleChange}
            className="input" />

          <input name="trinh_do" placeholder="Trình độ"
            value={formData.trinh_do} onChange={handleChange}
            className="input" />

          <input name="nam_kinh_nghiem" type="number"
            placeholder="Năm kinh nghiệm"
            value={formData.nam_kinh_nghiem}
            onChange={handleChange}
            className="input" />

          {!selectedDoctor && (
            <>
              <input name="username" placeholder="Username đăng nhập"
                value={formData.username}
                onChange={handleChange}
                className="input" />

              <input name="password" type="password"
                placeholder="Password"
                value={formData.password}
                onChange={handleChange}
                className="input" />
            </>
          )}

          <select name="id_lophoc"
            value={formData.id_lophoc || ""}
            onChange={handleChange}
            className="input">

            <option value="">Chưa có lớp</option>

            {classes.map(c => (
              <option key={c.id_lophoc} value={c.id_lophoc}>
                {c.ten_lophoc}
              </option>
            ))}

          </select>

        </div>

        <button
          onClick={selectedDoctor ? updateDoctor : addDoctor}
          className="mt-6 bg-blue-600 hover:bg-blue-700 transition text-white px-6 py-2 rounded-lg"
        >
          {selectedDoctor ? "Cập nhật" : "Thêm bác sĩ"}
        </button>

      </div>

      {/* TABLE */}
      <div className="bg-white shadow-lg rounded-2xl p-6">
        <table className="w-full text-center">
          <thead className="bg-blue-100">
            <tr>
              <th>ID</th>
              <th>Họ tên</th>
              <th>Email</th>
              <th>Số điện thoại</th>
              <th>Chuyên khoa</th>
              <th>Trình độ</th>
              <th>Năm kinh nghiệm</th>
              <th>Hành động</th>
            </tr>
          </thead>
          <tbody>
          {doctors.map(doc => (
            <tr key={doc.id_bacsi} className="border-t hover:bg-gray-50 text-sm">
              <td className="p-2">{doc.id_bacsi}</td>
              <td className="p-2 font-semibold text-blue-600">{doc.ho_ten}</td>
    
              <td className="p-2">{doc.email}</td>
              <td className="p-2">{doc.so_dien_thoai}</td>
              <td className="p-2">{doc.chuyen_khoa}</td>
              <td className="p-2">{doc.trinh_do}</td>
              <td className="p-2 text-center">
                {doc.nam_kinh_nghiem} năm
              </td>
              <td className="space-x-2 py-2">
                <button
                  onClick={() => editDoctor(doc.id_bacsi)}
                  className="bg-yellow-500 hover:bg-yellow-600 text-white px-3 py-1 rounded"
                >
                  Sửa
                </button>
                <button
                  onClick={() => deleteDoctor(doc.id_bacsi)}
                  className="bg-red-500 hover:bg-red-600 text-white px-3 py-1 rounded"
                >
                  Xóa
                </button>
              </td>
            </tr>
          ))}
        </tbody>
        </table>
      </div>

      <style>{`
        .input {
          border: 1px solid #ddd;
          padding: 10px;
          border-radius: 8px;
          outline: none;
        }
        .input:focus {
          border-color: #2563eb;
        }
      `}</style>

    </div>
  );
};

export default DoctorManage;