import React, { useEffect, useState } from "react";
import axios from "axios";

const BacSiHome = () => {
  const [doctor, setDoctor] = useState(null);

  useEffect(() => {
    const token = localStorage.getItem("access_token");

    if (!token) {
      alert("Bạn chưa đăng nhập");
      window.location.href = "/login";
      return;
    }

    axios
      .get("http://127.0.0.1:8000/users/me", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })
      .then((res) => {
        setDoctor(res.data);
      })
      .catch((err) => {
        console.log(err);

        if (err.response?.status === 401) {
          alert("Token hết hạn, vui lòng đăng nhập lại");
          localStorage.clear();
          window.location.href = "/login";
        }
      });
  }, []);

  const handleLogout = () => {
    localStorage.clear();
    window.location.href = "/login";
  };

  return (
    <div className="min-h-screen bg-blue-50">

      {/* Header */}
      <div className="w-full bg-blue-600 text-white p-4 flex justify-between items-center shadow">
        <h1 className="text-2xl font-bold">Bác sĩ Dashboard</h1>

        <button
          onClick={handleLogout}
          className="bg-white text-blue-600 px-4 py-2 rounded-lg font-semibold hover:bg-gray-200"
        >
          Đăng xuất
        </button>
      </div>

      {/* Content */}
      <div className="p-10">

        <h2 className="text-3xl font-bold text-gray-800 mb-2">
          Trang bác sĩ
        </h2>

        {doctor && (
          <p className="text-gray-600 mb-8">
            Xin chào bác sĩ <b>{doctor.username}</b>
          </p>
        )}

        {/* Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">

          {/* Lịch khám */}
          <div className="bg-white p-6 rounded-2xl shadow hover:shadow-lg transition">
            <h3 className="text-xl font-semibold mb-3 text-blue-600">
              Lịch khám
            </h3>

            <p className="text-gray-600 mb-4">
              Xem và quản lý lịch khám bệnh.
            </p>

            <button
              onClick={() => (window.location.href = "/lich-kham")}
              className="bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600"
            >
              Truy cập
            </button>
          </div>

          {/* Bệnh nhân */}
          <div className="bg-white p-6 rounded-2xl shadow hover:shadow-lg transition">
            <h3 className="text-xl font-semibold mb-3 text-blue-600">
              Danh sách bệnh nhân
            </h3>

            <p className="text-gray-600 mb-4">
              Xem thông tin bệnh nhân đang điều trị.
            </p>

            <button
              onClick={() => (window.location.href = "/benh-nhan")}
              className="bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600"
            >
              Truy cập
            </button>
          </div>

          {/* Hồ sơ bệnh án */}
          <div className="bg-white p-6 rounded-2xl shadow hover:shadow-lg transition">
            <h3 className="text-xl font-semibold mb-3 text-blue-600">
              Hồ sơ bệnh án
            </h3>

            <p className="text-gray-600 mb-4">
              Quản lý hồ sơ khám bệnh của bệnh nhân.
            </p>

            <button
              onClick={() => (window.location.href = "/benh-an")}
              className="bg-blue-500 text-white px-4 py-2 rounded-lg ">
              Truy cập
            </button>
          </div>

        </div>
      </div>
    </div>
  );
};

export default BacSiHome;