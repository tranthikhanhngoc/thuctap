import React from "react";
import { useNavigate } from "react-router-dom";

const About = () => {

  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-pink-50">

      {/* Hero Section */}
      <div className="bg-white py-16 px-6 text-center shadow-sm">
        <h1 className="text-4xl font-bold text-pink-600 mb-4">
          About BeHealthy
        </h1>
        <p className="max-w-2xl mx-auto text-gray-600 text-lg">
          Chúng tôi mang đến giải pháp chăm sóc sức khỏe hiện đại,
          giúp bạn dễ dàng đặt lịch khám và quản lý lịch hẹn mọi lúc, mọi nơi.
        </p>
      </div>

      {/* Mission & Vision */}
      <div className="max-w-6xl mx-auto px-6 py-16 grid md:grid-cols-2 gap-12">

        {/* Mission */}
        <div className="bg-white p-8 rounded-2xl shadow-lg hover:shadow-xl transition">
          <h2 className="text-2xl font-bold text-pink-500 mb-4">
            🎯 Sứ mệnh
          </h2>
          <p className="text-gray-600 leading-relaxed">
            BeHealthy được xây dựng nhằm đơn giản hóa quy trình đặt lịch khám,
            giúp bệnh nhân kết nối nhanh chóng với bác sĩ chuyên môn.
            Chúng tôi hướng tới việc cải thiện trải nghiệm chăm sóc sức khỏe
            bằng công nghệ hiện đại.
          </p>
        </div>

        {/* Vision */}
        <div className="bg-white p-8 rounded-2xl shadow-lg hover:shadow-xl transition">
          <h2 className="text-2xl font-bold text-pink-500 mb-4">
            🌟 Tầm nhìn
          </h2>
          <p className="text-gray-600 leading-relaxed">
            Trở thành nền tảng đặt lịch khám trực tuyến hàng đầu,
            giúp tối ưu hóa quy trình khám chữa bệnh,
            giảm thời gian chờ đợi và nâng cao chất lượng dịch vụ y tế.
          </p>
        </div>

      </div>

      {/* Why Choose Us */}
      <div className="bg-white py-16 px-6">
        <div className="max-w-6xl mx-auto text-center">

          <h2 className="text-3xl font-bold text-pink-600 mb-10">
            Vì sao chọn BeHealthy?
          </h2>

          <div className="grid md:grid-cols-3 gap-8">

            <div className="p-6 rounded-xl shadow hover:shadow-lg transition">
              <div className="text-4xl mb-4">⚡</div>
              <h3 className="font-semibold text-lg mb-2">
                Đặt lịch nhanh chóng
              </h3>
              <p className="text-gray-600 text-sm">
                Chỉ vài bước đơn giản để đặt lịch khám với bác sĩ mong muốn.
              </p>
            </div>

            <div className="p-6 rounded-xl shadow hover:shadow-lg transition">
              <div className="text-4xl mb-4">🔒</div>
              <h3 className="font-semibold text-lg mb-2">
                Bảo mật thông tin
              </h3>
              <p className="text-gray-600 text-sm">
                Dữ liệu cá nhân được bảo vệ an toàn theo tiêu chuẩn bảo mật cao.
              </p>
            </div>

            <div className="p-6 rounded-xl shadow hover:shadow-lg transition">
              <div className="text-4xl mb-4">👨‍⚕️</div>
              <h3 className="font-semibold text-lg mb-2">
                Đội ngũ chuyên môn
              </h3>
              <p className="text-gray-600 text-sm">
                Hệ thống bác sĩ giàu kinh nghiệm, chuyên môn cao.
              </p>
            </div>

          </div>
        </div>
      </div>

      {/* CTA */}
      <div className="bg-pink-500 py-14 text-center text-white">
        <h2 className="text-3xl font-bold mb-4">
          Sẵn sàng chăm sóc sức khỏe của bạn?
        </h2>
        <button
          onClick={() => navigate("/appointment")}
          className="bg-white text-pink-600 px-8 py-3 rounded-lg font-semibold hover:bg-gray-100 transition"
        >
          Đặt lịch ngay
        </button>
      </div>

    </div>
  );
};

export default About;