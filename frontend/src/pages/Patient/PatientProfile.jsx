import React, { useState, useEffect } from "react";
import axios from "axios";

const PatientProfile = () => {

  const [editMode, setEditMode] = useState(false);

  const [patient, setPatient] = useState({
    username: "",
    ho_ten: "",
    nam_sinh: "",
    gioi_tinh: "",
    so_dien_thoai: "",
    cccd: "",
    dia_chi: ""
  });

  const token = localStorage.getItem("access_token");

  // ================================
  // Lấy hồ sơ bệnh nhân
  // ================================
  useEffect(() => {
    const fetchPatient = async () => {
      try {

        const res = await axios.get(
          "http://localhost:8000/benhnhan/me",
          {
            headers: {
              Authorization: `Bearer ${token}`
            }
          }
        );

        setPatient(res.data);

      } catch (error) {
        console.error("Lỗi lấy hồ sơ:", error);
      }
    };

    fetchPatient();
  }, []);

  // ================================
  // Change input
  // ================================
  const handleChange = (e) => {

    const { name, value } = e.target;

    setPatient({
      ...patient,
      [name]: value
    });
  };

  // ================================
  // Save update
  // ================================
  const handleSave = async () => {

    try {

      await axios.put(
        "http://localhost:8000/benhnhan/me",
        patient,
        {
          headers: {
            Authorization: `Bearer ${token}`
          }
        }
      );

      alert("Cập nhật thông tin thành công!");
      setEditMode(false);

    } catch (error) {
      console.error("Lỗi cập nhật:", error);
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 p-10">

      <div className="max-w-3xl mx-auto bg-white p-8 rounded-2xl shadow">

        <h2 className="text-3xl font-bold text-indigo-600 mb-6">
          Hồ sơ bệnh nhân
        </h2>

        {/* Username từ bảng User */}
        <div className="mb-6">
          <label className="font-semibold">Username</label>
          <p className="text-gray-700">{patient.username}</p>
        </div>

        <div className="space-y-4">

          {/* Họ tên */}
          <div>
            <label className="font-semibold">Họ tên</label>
            {editMode ? (
              <input
                type="text"
                name="ho_ten"
                value={patient.ho_ten || ""}
                onChange={handleChange}
                className="w-full border p-2 rounded mt-1"
              />
            ) : (
              <p className="text-gray-700">{patient.ho_ten || "Chưa cập nhật"}</p>
            )}
          </div>

          {/* Năm sinh */}
          <div>
            <label className="font-semibold">Năm sinh</label>
            {editMode ? (
              <input
                type="number"
                name="nam_sinh"
                value={patient.nam_sinh || ""}
                onChange={handleChange}
                className="w-full border p-2 rounded mt-1"
              />
            ) : (
              <p className="text-gray-700">{patient.nam_sinh || "Chưa cập nhật"}</p>
            )}
          </div>

          {/* Giới tính */}
          <div>
            <label className="font-semibold">Giới tính</label>
            {editMode ? (
              <select
                name="gioi_tinh"
                value={patient.gioi_tinh || ""}
                onChange={handleChange}
                className="w-full border p-2 rounded mt-1"
              >
                <option value="">Chọn giới tính</option>
                <option value="Nam">Nam</option>
                <option value="Nữ">Nữ</option>
              </select>
            ) : (
              <p className="text-gray-700">{patient.gioi_tinh || "Chưa cập nhật"}</p>
            )}
          </div>

          {/* Số điện thoại */}
          <div>
            <label className="font-semibold">Số điện thoại</label>
            {editMode ? (
              <input
                type="text"
                name="so_dien_thoai"
                value={patient.so_dien_thoai || ""}
                onChange={handleChange}
                className="w-full border p-2 rounded mt-1"
              />
            ) : (
              <p className="text-gray-700">{patient.so_dien_thoai || "Chưa cập nhật"}</p>
            )}
          </div>

          {/* CCCD */}
          <div>
            <label className="font-semibold">CCCD</label>
            {editMode ? (
              <input
                type="text"
                name="cccd"
                value={patient.cccd || ""}
                onChange={handleChange}
                className="w-full border p-2 rounded mt-1"
              />
            ) : (
              <p className="text-gray-700">{patient.cccd || "Chưa cập nhật"}</p>
            )}
          </div>

          {/* Địa chỉ */}
          <div>
            <label className="font-semibold">Địa chỉ</label>
            {editMode ? (
              <input
                type="text"
                name="dia_chi"
                value={patient.dia_chi || ""}
                onChange={handleChange}
                className="w-full border p-2 rounded mt-1"
              />
            ) : (
              <p className="text-gray-700">{patient.dia_chi || "Chưa cập nhật"}</p>
            )}
          </div>

        </div>

        {/* Buttons */}
        <div className="mt-6 flex gap-4">

          {editMode ? (
            <>
              <button
                onClick={handleSave}
                className="bg-green-500 text-white px-4 py-2 rounded-lg hover:bg-green-600"
              >
                Lưu
              </button>

              <button
                onClick={() => setEditMode(false)}
                className="bg-gray-400 text-white px-4 py-2 rounded-lg hover:bg-gray-500"
              >
                Hủy
              </button>
            </>
          ) : (
            <button
              onClick={() => setEditMode(true)}
              className="bg-indigo-500 text-white px-4 py-2 rounded-lg hover:bg-indigo-600"
            >
              Chỉnh sửa thông tin
            </button>
          )}

        </div>

      </div>

    </div>
  );
};

export default PatientProfile;