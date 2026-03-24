
import React, { useState } from "react";
import { Link } from "react-router-dom";

const Home = () => {
  // const [isMenuOpen, setIsMenuOpen] = useState(false);

  // const isLoggedIn = !!localStorage.getItem("id_benhnhan");
  // const userName = localStorage.getItem("ten_benhnhan") || "Bệnh nhân";

  // const handleLogout = () => {
  //   localStorage.removeItem("id_benhnhan");
  //   localStorage.removeItem("ten_benhnhan");
  //   window.location.href = "/";
  // };

  return (
    <div className="min-h-screen bg-white relative overflow-hidden">
      {/* Background */}
      <div className="absolute inset-0 -z-10 opacity-20 pointer-events-none">
        <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-pink-200 rounded-full blur-3xl"></div>
        <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-pink-100 rounded-full blur-3xl"></div>
      </div>

    
      <div className="pt-20 md:pt-24">

        <section className="relative min-h-[80vh] flex items-center bg-gradient-to-br from-pink-50 via-white to-pink-50">

          <div className="relative max-w-7xl mx-auto px-6 md:px-10 py-20 grid md:grid-cols-2 gap-12 items-center">

            <div className="space-y-8">

              <p className="text-pink-600 font-bold tracking-widest uppercase text-lg">
                Be Healthy – Renew Your Vitality
              </p>

              <h1 className="text-5xl md:text-7xl font-extrabold text-gray-900 leading-tight">
                Hồi sinh năng lượng
                <br />
                <span className="text-pink-500">
                  trong tầm tay bạn
                </span>
              </h1>

              <p className="text-gray-700 text-xl leading-relaxed max-w-xl">
                Cuộc sống mệt mỏi? BeHealthy giúp bạn lấy lại sức sống
                với lịch khám nhanh chóng, bác sĩ tận tâm và kế hoạch
                chăm sóc cá nhân hóa.
              </p>

              <div className="flex gap-6">

                <Link
                  to="/patient/appointment"
                  className="bg-pink-500 hover:bg-pink-600 text-white px-10 py-5 rounded-full font-bold text-lg"
                >
                  Đặt lịch khám ngay
                </Link>

                <Link
                  to="/about"
                  className="border-2 border-pink-500 text-pink-500 px-10 py-5 rounded-full font-bold text-lg"
                >
                  Tìm hiểu thêm
                </Link>

              </div>
            </div>

            <img
              src="https://images.unsplash.com/photo-1612349317150-e413f6a5b16d"
              alt="doctor"
              className="rounded-3xl shadow-2xl object-cover w-full h-[600px]"
            />

          </div>
        </section>

      </div>
    </div>
  );
};

export default Home;

