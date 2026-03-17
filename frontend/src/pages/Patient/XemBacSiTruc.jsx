import React, { useEffect, useState } from "react";
import axios from "axios";

const XemBacSiTruc = () => {
  const [currentDoctors, setCurrentDoctors] = useState([]);
  const [nextDoctors, setNextDoctors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const API_BASE = "http://127.0.0.1:8000"; // thay bằng URL production khi deploy

  useEffect(() => {
    const fetchDoctors = async () => {
      try {
        // Giả sử endpoint trả về tất cả ca trực trong khoảng thời gian gần (hôm nay + ngày mai)
        // Nếu backend chỉ có /doctors/on-duty thì bạn cần điều chỉnh endpoint hoặc logic
        const res = await axios.get(`${API_BASE}/doctors/on-duty`); // hoặc /shifts/today, /shifts/current-and-next...

        const allShifts = res.data; // mảng các object bác sĩ/ca trực

        const now = new Date();
        const currentDateStr = now.toLocaleDateString("vi-VN", {
          day: "2-digit",
          month: "2-digit",
          year: "numeric",
        });

        // Lọc ca hiện tại
        const current = allShifts.filter((doc) => {
          if (doc.ngay !== currentDateStr) return false;

          const [startH, startM] = doc.thoi_gian_bat_dau.split(":").map(Number);
          const [endH, endM] = doc.thoi_gian_ket_thuc.split(":").map(Number);

          let startTime = new Date(now);
          startTime.setHours(startH, startM, 0, 0);

          let endTime = new Date(now);
          endTime.setHours(endH, endM, 0, 0);

          if (endTime < startTime) {
            endTime.setDate(endTime.getDate() + 1);
          }

          return now >= startTime && now < endTime;
        });

        // Lọc ca kế tiếp (bắt đầu sau bây giờ, cùng ngày hoặc ngày mai)
        const next = allShifts
          .filter((doc) => {
            const shiftDate = new Date(
              doc.ngay.split("/").reverse().join("-") + "T00:00:00"
            );
            return shiftDate >= now.setHours(0, 0, 0, 0); // từ hôm nay trở đi
          })
          .filter((doc) => {
            const [startH, startM] = doc.thoi_gian_bat_dau.split(":").map(Number);
            let startTime = new Date(
              doc.ngay.split("/").reverse().join("-") + "T00:00:00"
            );
            startTime.setHours(startH, startM, 0, 0);
            return startTime > now;
          })
          .sort((a, b) => {
            const dateA = new Date(a.ngay.split("/").reverse().join("-"));
            const dateB = new Date(b.ngay.split("/").reverse().join("-"));
            if (dateA.getTime() !== dateB.getTime()) return dateA - dateB;

            const ta = a.thoi_gian_bat_dau.split(":").map(Number);
            const tb = b.thoi_gian_bat_dau.split(":").map(Number);
            return ta[0] * 60 + ta[1] - (tb[0] * 60 + tb[1]);
          });

        setCurrentDoctors(current);
        setNextDoctors(next);
      } catch (err) {
        console.error("Lỗi lấy dữ liệu bác sĩ trực:", err);
        setError("Không thể tải danh sách bác sĩ. Vui lòng thử lại sau.");
      } finally {
        setLoading(false);
      }
    };

    fetchDoctors();
  }, []);

  const DoctorCard = ({ doc }) => (
    <div className="group bg-white rounded-2xl shadow-lg overflow-hidden hover:shadow-2xl hover:-translate-y-1 transition-all duration-300 border border-gray-100 flex flex-col">
      <div className="p-6 pb-4 bg-gradient-to-br from-blue-50/70 to-transparent">
        <div className="flex items-center gap-4">
          <div className="relative flex-shrink-0">
            <img
              src={doc.avatar || "https://cdn-icons-png.flaticon.com/512/387/387561.png"}
              alt={doc.ten_bac_si}
              className="w-20 h-20 rounded-full object-cover border-4 border-white shadow-md"
            />
            <span className="absolute bottom-1 right-1 w-4 h-4 bg-green-500 rounded-full border-2 border-white animate-pulse"></span>
          </div>
          <div>
            <h2 className="text-xl font-bold text-gray-800 group-hover:text-blue-700 transition-colors">
              {doc.ten_bac_si}
            </h2>
            <p className="text-blue-600 font-medium">{doc.chuyen_khoa}</p>
            <p className="text-sm text-gray-500 mt-1">
              Ca {doc.ca_truc} • {doc.ngay}
            </p>
          </div>
        </div>
      </div>

      <div className="px-6 py-5 space-y-4 text-gray-700 flex-grow">
        <div className="flex items-center gap-3">
          <span className="text-2xl">📞</span>
          <div>
            <span className="font-semibold block text-sm text-gray-500">Số điện thoại</span>
            <a
              href={`tel:${doc.sdt?.replace(/\s/g, "") || ""}`}
              className="text-blue-600 hover:underline font-medium"
            >
              {doc.sdt || "Chưa cập nhật"}
            </a>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <span className="text-2xl">✉️</span>
          <div>
            <span className="font-semibold block text-sm text-gray-500">Email</span>
            <a
              href={`mailto:${doc.email || ""}`}
              className="text-blue-600 hover:underline font-medium break-words"
            >
              {doc.email || "Chưa cập nhật"}
            </a>
          </div>
        </div>
      </div>

      <div className="px-6 py-5 bg-gray-50 border-t mt-auto">
        {doc.sdt ? (
          <a
            href={`tel:${doc.sdt.replace(/\s/g, "")}`}
            className="block w-full text-center py-2.5 bg-green-600 text-white font-medium rounded-lg hover:bg-green-700 transition"
          >
            Gọi ngay
          </a>
        ) : (
          <button
            disabled
            className="block w-full text-center py-2.5 bg-gray-400 text-white font-medium rounded-lg cursor-not-allowed"
          >
            Không có số liên hệ
          </button>
        )}
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-blue-50/30 p-5 md:p-8">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-3xl md:text-4xl font-bold text-center mb-4">
          <span className="bg-gradient-to-r from-cyan-600 to-blue-600 bg-clip-text text-transparent">
            Bác Sĩ Đang Trực
          </span>{" "}
          👨‍⚕️
        </h1>

        <p className="text-center text-gray-600 mb-10">
          Cập nhật lúc {new Date().toLocaleTimeString("vi-VN", { hour: "2-digit", minute: "2-digit" })},{" "}
          {new Date().toLocaleDateString("vi-VN")}
        </p>

        {loading ? (
          <div className="flex justify-center items-center py-20">
            <div className="animate-spin rounded-full h-12 w-12 border-t-4 border-blue-500"></div>
            <p className="ml-4 text-lg text-gray-600">Đang tải danh sách bác sĩ...</p>
          </div>
        ) : error ? (
          <div className="text-center py-16 text-red-600">
            <p className="text-xl font-medium">{error}</p>
            <p className="mt-2 text-gray-600">Vui lòng kiểm tra kết nối hoặc liên hệ quản trị viên.</p>
          </div>
        ) : (
          <>
            <section className="mb-12">
              <h2 className="text-2xl font-bold text-center mb-6 text-green-700">
                Ca trực hiện tại
              </h2>
              {currentDoctors.length === 0 ? (
                <p className="text-center text-gray-600 py-8 text-lg">
                  Hiện tại chưa có bác sĩ nào trong ca trực
                </p>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 md:gap-8">
                  {currentDoctors.map((doc, index) => (
                    <DoctorCard key={index} doc={doc} />
                  ))}
                </div>
              )}
            </section>

            <section>
              <h2 className="text-2xl font-bold text-center mb-6 text-indigo-700">
                Ca trực kế tiếp
              </h2>
              {nextDoctors.length === 0 ? (
                <p className="text-center text-gray-600 py-8 text-lg">
                  Không có ca trực kế tiếp trong thời gian tới
                </p>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 md:gap-8">
                  {nextDoctors.map((doc, index) => (
                    <DoctorCard key={index} doc={doc} />
                  ))}
                </div>
              )}
            </section>
          </>
        )}
      </div>
    </div>
  );
};

export default XemBacSiTruc;