import React, { useEffect, useState } from "react";
import axios from "axios";

const DoctorManage = () => {

  const [doctors, setDoctors] = useState([]);
  const [classes, setClasses] = useState([]);
  const [selectedDoctor, setSelectedDoctor] = useState(null);
  const [doctorDetail, setDoctorDetail] = useState(null);

  const token = localStorage.getItem("access_token");
  const viewDoctorDetail = async (id) => {

  try {

    const res = await axios.get(`${API}/doctors/${id}`, {
      headers: { Authorization: `Bearer ${token}` }
    });

    setDoctorDetail(res.data);

  } catch (err) {
    console.log(err);
    alert("Không lấy được chi tiết bác sĩ");
  }

};

  const [formData, setFormData] = useState({
    ho_ten: "",
    chuyen_khoa: "",
    trinh_do: "",
    nam_kinh_nghiem: "",
    so_dien_thoai: "",
    email: "",
    id_lophoc: ""
  });

  const API = "http://127.0.0.1:8000";

  // ==========================
  // Lấy danh sách bác sĩ
  // ==========================
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

  // ==========================
  // Lấy danh sách lớp học
  // ==========================
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

  // ==========================
  // handle input
  // ==========================
  const handleChange = (e) => {

    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });

  };

  // ==========================
  // reset form
  // ==========================
  const resetForm = () => {

    setFormData({
      ho_ten: "",
      chuyen_khoa: "",
      trinh_do: "",
      nam_kinh_nghiem: "",
      so_dien_thoai: "",
      email: "",
      id_lophoc: ""
    });

  };

  // ==========================
  // THÊM BÁC SĨ
  // ==========================
  const addDoctor = async () => {

    try {

      const payload = {
        ho_ten: formData.ho_ten,
        chuyen_khoa: formData.chuyen_khoa,
        trinh_do: formData.trinh_do,
        nam_kinh_nghiem: Number(formData.nam_kinh_nghiem),
        so_dien_thoai: formData.so_dien_thoai,
        email: formData.email
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

      console.log(err.response?.data);
      alert("Thêm bác sĩ thất bại");

    }

  };

  // ==========================
  // XÓA BÁC SĨ
  // ==========================
  const deleteDoctor = async (id) => {

    if (!window.confirm("Bạn chắc chắn muốn xóa?")) return;

    try {

      await axios.delete(`${API}/doctors/${id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });

      fetchDoctors();

    } catch (err) {
      alert("Xóa thất bại");
    }

  };

  // ==========================
  // LẤY CHI TIẾT BÁC SĨ
  // ==========================
  const editDoctor = async (id) => {

    try {

      const res = await axios.get(`${API}/doctors/${id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });

      const doctor = res.data;

      setSelectedDoctor(doctor);

      setFormData({
        ho_ten: doctor.ho_ten || "",
        chuyen_khoa: doctor.chuyen_khoa || "",
        trinh_do: doctor.trinh_do || "",
        nam_kinh_nghiem: doctor.nam_kinh_nghiem || "",
        so_dien_thoai: doctor.so_dien_thoai || "",
        email: doctor.email || "",
        id_lophoc: doctor.id_lophoc || ""
      });

    } catch (err) {
      console.log(err);
    }

  };

  // ==========================
  // UPDATE
  // ==========================
  const updateDoctor = async () => {

    try {

      const payload = {
        ho_ten: formData.ho_ten,
        chuyen_khoa: formData.chuyen_khoa,
        trinh_do: formData.trinh_do,
        nam_kinh_nghiem: Number(formData.nam_kinh_nghiem),
        so_dien_thoai: formData.so_dien_thoai,
        email: formData.email
      };

      if (formData.id_lophoc) {
        payload.id_lophoc = Number(formData.id_lophoc);
      }

      await axios.put(
        `${API}/doctors/${selectedDoctor.id_bacsi}`,
        payload,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json"
          }
        }
      );

      alert("Cập nhật thành công");

      setSelectedDoctor(null);
      resetForm();
      fetchDoctors();

    } catch (err) {

      console.log(err.response?.data);
      alert("Cập nhật thất bại");

    }

  };

  return (

    <div className="p-10">

      <h1 className="text-3xl font-bold mb-6">
        Quản lý bác sĩ
      </h1>

      {/* FORM */}

      <div className="bg-gray-100 p-5 rounded-xl mb-8">

        <h2 className="text-xl font-semibold mb-4">
          {selectedDoctor ? "Chỉnh sửa bác sĩ" : "Thêm bác sĩ"}
        </h2>

        <div className="grid grid-cols-2 gap-4">

          <input
            name="ho_ten"
            placeholder="Họ tên"
            value={formData.ho_ten}
            onChange={handleChange}
            className="border p-2 rounded"
          />

          <input
            name="email"
            placeholder="Email"
            value={formData.email}
            onChange={handleChange}
            className="border p-2 rounded"
          />

          <input
            name="so_dien_thoai"
            placeholder="SĐT"
            value={formData.so_dien_thoai}
            onChange={handleChange}
            className="border p-2 rounded"
          />

          <input
            name="chuyen_khoa"
            placeholder="Chuyên khoa"
            value={formData.chuyen_khoa}
            onChange={handleChange}
            className="border p-2 rounded"
          />

          <input
            name="trinh_do"
            placeholder="Trình độ"
            value={formData.trinh_do}
            onChange={handleChange}
            className="border p-2 rounded"
          />

          <input
            name="nam_kinh_nghiem"
            placeholder="Năm kinh nghiệm"
            value={formData.nam_kinh_nghiem}
            onChange={handleChange}
            className="border p-2 rounded"
          />

          {/* dropdown lớp học */}

          {selectedDoctor && (

            <select
              name="id_lophoc"
              value={formData.id_lophoc || ""}
              onChange={handleChange}
              className="border p-2 rounded"
            >

              <option value="">
                Chưa có lớp học
              </option>

              {classes.map((c) => (

                <option
                  key={c.id_lophoc}
                  value={c.id_lophoc}
                >
                  {c.ten_lophoc}
                </option>

              ))}

            </select>

          )}

        </div>

        <button
          onClick={selectedDoctor ? updateDoctor : addDoctor}
          className="mt-4 bg-blue-500 text-white px-6 py-2 rounded"
        >
          {selectedDoctor ? "Cập nhật" : "Thêm bác sĩ"}
        </button>

      </div>

      {/* DANH SÁCH */}

      <table className="w-full border">

        <thead className="bg-gray-200">
          <tr>
            <th>ID</th>
            <th>Họ tên</th>
            <th>Email</th>
            <th>SĐT</th>
            <th>Chuyên khoa</th>
            <th>Hành động</th>
          </tr>
        </thead>

        <tbody>

          {doctors.map((doc) => (

            <tr key={doc.id_bacsi} className="text-center border-t">

              <td>{doc.id_bacsi}</td>
              <td>{doc.ho_ten}</td>
              <td>{doc.email}</td>
              <td>{doc.so_dien_thoai}</td>
              <td>{doc.chuyen_khoa}</td>

              <td className="space-x-2">
                <button
                    className="bg-green-500 text-white px-3 py-1 rounded"
                    onClick={() => viewDoctorDetail(doc.id_bacsi)}
                >
                    Chi tiết
                </button>
                <button
                  className="bg-yellow-500 text-white px-3 py-1 rounded"
                  onClick={() => editDoctor(doc.id_bacsi)}
                >
                  Sửa
                </button>

                <button
                  className="bg-red-500 text-white px-3 py-1 rounded"
                  onClick={() => deleteDoctor(doc.id_bacsi)}
                >
                  Xóa
                </button>

              </td>

            </tr>

          ))}

        </tbody>

      </table>

      {doctorDetail && (

  <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center">

    <div className="bg-white p-6 rounded-xl w-[400px] shadow-lg">

      <h2 className="text-xl font-bold mb-4">
        Chi tiết bác sĩ
      </h2>

      <div className="space-y-2 text-left">

        <p><b>ID:</b> {doctorDetail.id_bacsi}</p>
        <p><b>Họ tên:</b> {doctorDetail.ho_ten}</p>
        <p><b>Email:</b> {doctorDetail.email}</p>
        <p><b>SĐT:</b> {doctorDetail.so_dien_thoai}</p>
        <p><b>Chuyên khoa:</b> {doctorDetail.chuyen_khoa}</p>
        <p><b>Trình độ:</b> {doctorDetail.trinh_do}</p>
        <p><b>Năm kinh nghiệm:</b> {doctorDetail.nam_kinh_nghiem}</p>

        <p>
          <b>Lớp học:</b>{" "}
          {doctorDetail.id_lophoc
            ? classes.find(c => c.id_lophoc === doctorDetail.id_lophoc)?.ten_lophoc || doctorDetail.id_lophoc
            : "Chưa có"}
        </p>

      </div>

      <div className="flex justify-end mt-4">

        <button
          onClick={() => setDoctorDetail(null)}
          className="bg-red-500 text-white px-4 py-2 rounded"
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

export default DoctorManage;