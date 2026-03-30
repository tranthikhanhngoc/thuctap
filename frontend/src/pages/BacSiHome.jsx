import React, { useEffect, useState } from "react";
import axios from "axios";
import BacSiLayout from "../components/BacsiLayout";

const BacSiHome = () => {
  const [doctor, setDoctor] = useState(null);

  useEffect(() => {
    const fetchDoctor = async () => {
      try {
        const token = localStorage.getItem("access_token");

        if (!token) {
          window.location.href = "/login";
          return;
        }

        const res = await axios.get(
          "http://127.0.0.1:8000/users/me",
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );

        setDoctor(res.data);

      } catch (err) {
        console.log("Lỗi lấy thông tin bác sĩ:", err);

        if (err.response?.status === 401) {
          localStorage.clear();
          window.location.href = "/login";
        }
      }
    };

    fetchDoctor();
  }, []);

  return (
    <BacSiLayout>

      <h2 className="text-3xl font-bold text-gray-800 mb-2">
        Dashboard bác sĩ
      </h2>

      {doctor && (
        <p className="text-gray-600 mb-8">
          Xin chào bác sĩ <b>{doctor.username}</b>
        </p>
      )}

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">

        <div className="bg-white p-6 rounded-2xl shadow hover:shadow-lg transition">
          <h3 className="text-xl font-semibold mb-3 text-pink-500">
            Lịch khám
          </h3>

          <p className="text-gray-600 mb-4">
            Xem và quản lý lịch khám bệnh.
          </p>

          <button
            onClick={() => (window.location.href = "/bacsi/lich-kham")}
            className="bg-pink-500 text-white px-4 py-2 rounded-lg hover:bg-pink-600"
          >
            Truy cập
          </button>
        </div>


 <div className="bg-white p-6 rounded-2xl shadow hover:shadow-lg transition">
          <h3 className="text-xl font-semibold mb-3 text-pink-500">
            Lịch học
          </h3>

          <p className="text-gray-600 mb-4">
            Xem và quản lý lịch khám bệnh.
          </p>

          <button
            onClick={() => (window.location.href = "/bacsi/lich-kham")}
            className="bg-pink-500 text-white px-4 py-2 rounded-lg hover:bg-pink-600"
          >
            Truy cập
          </button>
        </div>
        <div className="bg-white p-6 rounded-2xl shadow hover:shadow-lg transition">
          <h3 className="text-xl font-semibold mb-3 text-pink-500">
            Bệnh nhân
          </h3>

          <p className="text-gray-600 mb-4">
            Danh sách bệnh nhân đang điều trị.
          </p>

          <button
            onClick={() => (window.location.href = "/bacsi/benh-nhan")}
            className="bg-pink-500 text-white px-4 py-2 rounded-lg hover:bg-pink-600"
          >
            Truy cập
          </button>
        </div>

        
      </div>

    </BacSiLayout>
  );
};

export default BacSiHome;