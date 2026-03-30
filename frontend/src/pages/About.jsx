import React from "react";
import { useNavigate } from "react-router-dom";

const About = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-white relative overflow-hidden">
      {/* Background accents */}
      <div className="absolute inset-0 -z-10 opacity-20 pointer-events-none">
        <div className="absolute top-20 right-10 w-[500px] h-[500px] bg-pink-200 rounded-full blur-3xl"></div>
        <div className="absolute bottom-10 left-10 w-[400px] h-[400px] bg-pink-100 rounded-full blur-3xl"></div>
      </div>

      {/* Hero Section with Image */}
      <section className="relative bg-gray-50 py-24 md:py-32 px-6 md:px-10 text-center overflow-hidden border-b border-pink-100">
        <div className="absolute inset-0">
          <img
            src="https://www.wellstar.org/-/media/project/wellstar/org/articles/makehealthyourhabit_blog_1440.jpg?rev=fc11d39ac28b4f66b00a937ad1467d11"
            alt="Wellness clinic welcoming environment"
            className="w-full h-full object-cover opacity-30"
          />
        </div>
        <div className="relative max-w-5xl mx-auto z-10">
          <p className="text-pink-500 font-semibold tracking-widest uppercase mb-6 text-lg">
            Về BeHealthy
          </p>
          <h1 className="text-4xl md:text-6xl font-extrabold text-gray-900 mb-8 leading-tight">
            Nơi hồi sinh sức sống và năng lượng
          </h1>
          <p className="text-gray-700 text-xl md:text-2xl leading-relaxed max-w-4xl mx-auto">
            Giải pháp chăm sóc sức khỏe hiện đại – đặt lịch nhanh chóng, kết nối tận tâm với bác sĩ, quản lý dễ dàng mọi lúc mọi nơi.
          </p>
        </div>
      </section>

      {/* Mission & Vision */}
      <section className="max-w-7xl mx-auto px-6 py-20 grid md:grid-cols-2 gap-10 md:gap-16">
        <div className="bg-white p-10 rounded-2xl shadow-xl hover:shadow-2xl hover:scale-[1.02] transition-all duration-300 border border-pink-50">
          <div className="flex items-center gap-5 mb-8">
            <div className="w-16 h-16 flex items-center justify-center bg-pink-100 rounded-full text-pink-500 text-5xl shadow-md">
              🎯
            </div>
            <h2 className="text-3xl font-bold text-gray-800">Sứ mệnh</h2>
          </div>
          <p className="text-gray-600 text-lg leading-relaxed">
            BeHealthy ra đời để đơn giản hóa hành trình chăm sóc sức khỏe: kết nối bệnh nhân với bác sĩ nhanh chóng, cá nhân hóa trải nghiệm, và mang lại sự yên tâm tuyệt đối nhờ công nghệ hiện đại kết hợp sự tận tâm.
          </p>
        </div>

        <div className="bg-white p-10 rounded-2xl shadow-xl hover:shadow-2xl hover:scale-[1.02] transition-all duration-300 border border-pink-50">
          <div className="flex items-center gap-5 mb-8">
            <div className="w-16 h-16 flex items-center justify-center bg-pink-100 rounded-full text-pink-500 text-5xl shadow-md">
              🌟
            </div>
            <h2 className="text-3xl font-bold text-gray-800">Tầm nhìn</h2>
          </div>
          <p className="text-gray-600 text-lg leading-relaxed">
            Trở thành nền tảng đặt lịch khám trực tuyến số 1 tại Việt Nam, giúp giảm thời gian chờ đợi, nâng cao chất lượng dịch vụ y tế và mang sức khỏe chất lượng cao đến gần hơn với mọi người dân.
          </p>
        </div>
      </section>

      {/* Why Choose Us */}
      <section className="bg-pink-50 py-20 px-6">
        <div className="max-w-7xl mx-auto text-center">
          <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-16">
            Vì sao hàng ngàn người tin chọn BeHealthy?
          </h2>

          <div className="grid md:grid-cols-3 gap-8 md:gap-12">
            <div className="bg-white p-10 rounded-2xl shadow-lg hover:shadow-2xl hover:scale-[1.03] transition-all duration-300 border border-pink-100">
              <div className="w-20 h-20 mx-auto mb-8 flex items-center justify-center bg-pink-100 rounded-full text-pink-500 text-5xl shadow-inner">
                ⚡
              </div>
              <h3 className="text-2xl font-bold text-gray-800 mb-4">
                Đặt lịch siêu tốc
              </h3>
              <p className="text-gray-600 text-base">
                Chỉ 30 giây – vài cú click để hẹn khám với bác sĩ yêu thích, mọi lúc mọi nơi.
              </p>
            </div>

            <div className="bg-white p-10 rounded-2xl shadow-lg hover:shadow-2xl hover:scale-[1.03] transition-all duration-300 border border-pink-100">
              <div className="w-20 h-20 mx-auto mb-8 flex items-center justify-center bg-pink-100 rounded-full text-pink-500 text-5xl shadow-inner">
                🔒
              </div>
              <h3 className="text-2xl font-bold text-gray-800 mb-4">
                Bảo mật tuyệt đối
              </h3>
              <p className="text-gray-600 text-base">
                Dữ liệu cá nhân, lịch sử bệnh án được mã hóa và bảo vệ theo chuẩn cao nhất.
              </p>
            </div>

            <div className="bg-white p-10 rounded-2xl shadow-lg hover:shadow-2xl hover:scale-[1.03] transition-all duration-300 border border-pink-100">
              <div className="w-20 h-20 mx-auto mb-8 flex items-center justify-center bg-pink-100 rounded-full text-pink-500 text-5xl shadow-inner">
                👩‍⚕️
              </div>
              <h3 className="text-2xl font-bold text-gray-800 mb-4">
                Bác sĩ tận tâm
              </h3>
              <p className="text-gray-600 text-base">
                Đội ngũ chuyên gia giàu kinh nghiệm, luôn đặt sức khỏe và sự hài lòng của bạn lên hàng đầu.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="bg-pink-500 py-24 text-center text-white relative overflow-hidden">
        <div className="absolute inset-0 opacity-20">
          <img
            src="https://thumbs.dreamstime.com/b/abstract-pink-bokeh-background-texture-color-circles-blurred-98448276.jpg"
            alt="Pink bokeh background"
            className="w-full h-full object-cover"
          />
        </div>
        <div className="relative max-w-4xl mx-auto px-6 z-10">
          <h2 className="text-4xl md:text-5xl font-extrabold mb-8">
            Sẵn sàng lấy lại năng lượng và sức sống?
          </h2>
          <p className="text-pink-100 text-xl md:text-2xl mb-10 max-w-3xl mx-auto">
            Hàng ngàn người đã bắt đầu hành trình khỏe mạnh hơn cùng BeHealthy. Bạn thì sao?
          </p>
          <button
            onClick={() => navigate("/patient/appointment")}
            className="bg-white text-pink-600 px-12 py-5 rounded-xl font-bold text-xl shadow-2xl hover:bg-pink-50 hover:text-pink-700 hover:shadow-3xl transition-all duration-300 transform hover:scale-105"
          >
            Đặt lịch khám ngay hôm nay
          </button>
        </div>
      </section>
    </div>
  );
};

export default About;