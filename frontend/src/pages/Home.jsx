import React, { useState } from "react";
import { Link } from "react-router-dom";

const Home = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const isLoggedIn = !!localStorage.getItem("id_benhnhan");
  const userName = isLoggedIn ? "Tiểu My" : null;

  return (
    <div className="min-h-screen bg-white relative overflow-hidden">
      {/* Background subtle accents */}
      <div className="absolute inset-0 -z-10 opacity-20 pointer-events-none">
        <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-pink-200 rounded-full blur-3xl"></div>
        <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-pink-100 rounded-full blur-3xl"></div>
      </div>

      {/* ===== NAVBAR (giữ nguyên nhưng tinh chỉnh) ===== */}
      <nav className="fixed top-0 left-0 right-0 z-50 bg-white/95 backdrop-blur-md shadow-sm">
        <div className="max-w-7xl mx-auto px-6 md:px-10">
          <div className="flex justify-between items-center h-16 md:h-20">
            <Link to="/" className="flex items-center space-x-3">
              <span className="text-pink-500 text-3xl font-extrabold">BeHealthy</span>
            </Link>

            <div className="hidden md:flex items-center space-x-10">
              <Link to="/" className="text-gray-800 hover:text-pink-500 font-medium transition">
                Trang chủ
              </Link>
              <Link to="/about" className="text-gray-800 hover:text-pink-500 font-medium transition">
                Giới thiệu
              </Link>
              <Link to="/contact" className="text-gray-800 hover:text-pink-500 font-medium transition">
                Liên hệ
              </Link>
              {isLoggedIn && (
                <Link to="/lich-su-dat-lich" className="text-gray-800 hover:text-pink-500 font-medium transition">
                  Lịch sử
                </Link>
              )}
            </div>

            <div className="hidden md:flex items-center space-x-6">
              {isLoggedIn ? (
                <div className="flex items-center space-x-4">
                  <span className="text-gray-700 font-medium">Xin chào, {userName}</span>
                  <button
                    onClick={() => {
                      localStorage.removeItem("id_benhnhan");
                      window.location.href = "/";
                    }}
                    className="text-gray-600 hover:text-pink-500 transition"
                  >
                    Đăng xuất
                  </button>
                </div>
              ) : (
                <Link to="/login" className="text-gray-800 hover:text-pink-500 font-medium transition">
                  Đăng nhập
                </Link>
              )}

              <Link
                to="/patient/appointment"
                className="bg-pink-500 hover:bg-pink-600 text-white px-8 py-3 rounded-full shadow-lg font-semibold transition transform hover:scale-105"
              >
                Đặt lịch ngay
              </Link>
            </div>

            <button className="md:hidden text-gray-800" onClick={() => setIsMenuOpen(!isMenuOpen)}>
              <svg className="w-9 h-9" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d={isMenuOpen ? "M6 18L18 6M6 6l12 12" : "M4 6h16M4 12h16M4 18h16"} />
              </svg>
            </button>
          </div>
        </div>

        {isMenuOpen && (
          <div className="md:hidden bg-white border-t shadow-lg">
            <div className="px-6 py-6 space-y-5">
              <Link to="/" className="block text-gray-800 hover:text-pink-500 py-2" onClick={() => setIsMenuOpen(false)}>Trang chủ</Link>
              <Link to="/about" className="block text-gray-800 hover:text-pink-500 py-2" onClick={() => setIsMenuOpen(false)}>Giới thiệu</Link>
              <Link to="/contact" className="block text-gray-800 hover:text-pink-500 py-2" onClick={() => setIsMenuOpen(false)}>Liên hệ</Link>
              {isLoggedIn && <Link to="/lich-su-dat-lich" className="block text-gray-800 hover:text-pink-500 py-2" onClick={() => setIsMenuOpen(false)}>Lịch sử</Link>}

              <div className="pt-4 border-t">
                {isLoggedIn ? (
                  <>
                    <div className="text-gray-700 py-2">Xin chào, {userName}</div>
                    <button onClick={() => { localStorage.removeItem("id_benhnhan"); setIsMenuOpen(false); window.location.href = "/"; }} className="block text-gray-600 hover:text-pink-500 py-2">
                      Đăng xuất
                    </button>
                  </>
                ) : (
                  <Link to="/login" className="block text-gray-800 hover:text-pink-500 py-2" onClick={() => setIsMenuOpen(false)}>Đăng nhập</Link>
                )}
                <Link to="/patient/appointmentn/appointment" className="block mt-6 bg-pink-500 hover:bg-pink-600 text-white text-center py-4 rounded-full shadow-lg font-semibold" onClick={() => setIsMenuOpen(false)}>
                  Đặt lịch ngay
                </Link>
              </div>
            </div>
          </div>
        )}
      </nav>

      <div className="pt-20 md:pt-24">
        {/* ===== HERO SECTION - Nâng cấp lớn ===== */}
        <section className="relative min-h-[80vh] flex items-center bg-gradient-to-br from-pink-50 via-white to-pink-50 overflow-hidden">
          <div className="absolute inset-0 opacity-40">
            <img
              src="https://images.unsplash.com/photo-1576092768241-dec231879fc3?ixlib=rb-4.0.3&auto=format&fit=crop&w=2000&q=80"
              alt="Modern clinic wellness"
              className="w-full h-full object-cover"
            />
          </div>
          <div className="relative max-w-7xl mx-auto px-6 md:px-10 py-20 grid md:grid-cols-2 gap-12 items-center z-10">
            <div className="space-y-8">
              <p className="text-pink-600 font-bold tracking-widest uppercase text-lg">Be Healthy – Renew Your Vitality</p>
              <h1 className="text-5xl md:text-7xl font-extrabold text-gray-900 leading-tight">
                Hồi sinh năng lượng <br />
                <span className="text-pink-500">trong tầm tay bạn</span>
              </h1>
              <p className="text-gray-700 text-xl leading-relaxed max-w-xl">
                Cuộc sống mệt mỏi? BeHealthy giúp bạn lấy lại sức sống với lịch khám nhanh chóng, bác sĩ tận tâm và kế hoạch chăm sóc cá nhân hóa. Bắt đầu hành trình khỏe mạnh hôm nay!
              </p>
              <div className="flex flex-col sm:flex-row gap-6">
                <Link
                  to="/patient/appointmentn/appointment"
                  className="bg-pink-500 hover:bg-pink-600 text-white px-10 py-5 rounded-full shadow-2xl font-bold text-lg transition transform hover:scale-105"
                >
                  Đặt lịch khám ngay
                </Link>
                <Link
                  to="/about"
                  className="border-2 border-pink-500 text-pink-500 hover:bg-pink-50 px-10 py-5 rounded-full font-bold text-lg transition"
                >
                  Tìm hiểu thêm
                </Link>
              </div>
            </div>

            <div className="relative block">
             <img
                src="https://images.unsplash.com/photo-1612349317150-e413f6a5b16d"
                alt="Smiling doctor consultation"
                className="rounded-3xl shadow-2xl object-cover w-full h-[600px]"
              />
              <div className="absolute -bottom-6 -right-6 bg-white p-6 rounded-2xl shadow-xl">
                <p className="text-pink-500 font-bold text-2xl">+5000</p>
                <p className="text-gray-600">Bệnh nhân tin tưởng</p>
              </div>
            </div>
          </div>
        </section>

        {/* ===== TRUST BADGES / Why Us Quick ===== */}
        <section className="py-16 bg-white">
          <div className="max-w-7xl mx-auto px-6 grid md:grid-cols-3 gap-8 text-center">
            <div className="p-8 bg-pink-50 rounded-2xl shadow-lg hover:shadow-xl transition">
              <div className="text-5xl mb-4">⚡</div>
              <h3 className="text-2xl font-bold text-gray-800 mb-3">Đặt lịch siêu tốc</h3>
              <p className="text-gray-600">Chỉ 30 giây để hẹn khám với bác sĩ bạn chọn.</p>
            </div>
            <div className="p-8 bg-pink-50 rounded-2xl shadow-lg hover:shadow-xl transition">
              <div className="text-5xl mb-4">🔒</div>
              <h3 className="text-2xl font-bold text-gray-800 mb-3">Bảo mật 100%</h3>
              <p className="text-gray-600">Dữ liệu cá nhân được bảo vệ theo chuẩn cao nhất.</p>
            </div>
            <div className="p-8 bg-pink-50 rounded-2xl shadow-lg hover:shadow-xl transition">
              <div className="text-5xl mb-4">👩‍⚕️</div>
              <h3 className="text-2xl font-bold text-gray-800 mb-3">Bác sĩ tận tâm</h3>
              <p className="text-gray-600">Đội ngũ chuyên gia giàu kinh nghiệm tại Cần Thơ.</p>
            </div>
          </div>
        </section>

        {/* ===== FEATURES / Services ===== */}
        <section className="py-20 bg-pink-50">
          <div className="max-w-7xl mx-auto px-6 text-center">
            <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6">Dịch vụ nổi bật</h2>
            <p className="text-gray-600 text-xl mb-16 max-w-3xl mx-auto">
              Chúng tôi mang đến quy trình chăm sóc sức khỏe toàn diện, cá nhân hóa và tiện lợi nhất cho bạn.
            </p>

            <div className="grid md:grid-cols-3 gap-10">
              {[
                { icon: "📅", title: "Đặt lịch dễ dàng", desc: "Chọn bác sĩ, ngày giờ phù hợp chỉ trong vài cú click." },
                { icon: "🩺", title: "Tư vấn chuyên sâu", desc: "Nhận tư vấn cá nhân hóa từ bác sĩ giàu kinh nghiệm." },
                { icon: "💖", title: "Hồi phục năng lượng", desc: "Kế hoạch điều trị giúp bạn lấy lại sức sống tràn đầy." },
              ].map((item, i) => (
                <div
                  key={i}
                  className="bg-white p-10 rounded-3xl shadow-xl hover:shadow-2xl hover:scale-[1.05] transition-all duration-300 border border-pink-100"
                >
                  <div className="w-24 h-24 mx-auto mb-8 flex items-center justify-center bg-pink-100 rounded-full text-pink-500 text-6xl shadow-inner">
                    {item.icon}
                  </div>
                  <h3 className="text-2xl font-bold text-gray-800 mb-4">{item.title}</h3>
                  <p className="text-gray-600 text-lg">{item.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ===== TESTIMONIALS ===== */}
        <section className="py-20 bg-white">
          <div className="max-w-6xl mx-auto px-6 text-center">
            <h2 className="text-4xl font-bold text-gray-900 mb-16">Khách hàng nói gì về chúng tôi</h2>
            <div className="grid md:grid-cols-3 gap-10">
              {[
                { name: "Lan Anh", text: "Đặt lịch nhanh, bác sĩ tận tình. Mình đã lấy lại năng lượng sau 2 tháng!" },
                { name: "Minh Tuấn", text: "Giao diện đẹp, dễ dùng. Bảo mật tốt, rất yên tâm." },
                { name: "Hương Giang", text: "Dịch vụ tuyệt vời tại Cần Thơ. Mình recommend cho mọi người!" },
              ].map((t, i) => (
                <div key={i} className="bg-pink-50 p-8 rounded-2xl shadow-lg">
                  <p className="text-gray-700 italic text-lg mb-6">"{t.text}"</p>
                  <p className="font-bold text-pink-600">{t.name}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ===== FINAL CTA ===== */}
        <section className="bg-pink-500 py-24 text-center text-white">
          <div className="max-w-5xl mx-auto px-6">
            <h2 className="text-4xl md:text-6xl font-extrabold mb-8">
              Đừng chờ đợi sức khỏe tốt hơn nữa!
            </h2>
            <p className="text-pink-100 text-2xl mb-12 max-w-3xl mx-auto">
              Hàng ngàn người tại Cần Thơ đã tin tưởng BeHealthy. Bây giờ đến lượt bạn lấy lại năng lượng và sống trọn vẹn.
            </p>
            <Link
              to="/patient/appointment"
              className="bg-white text-pink-600 px-12 py-6 rounded-full font-bold text-2xl shadow-2xl hover:bg-pink-50 hover:shadow-3xl transition transform hover:scale-105"
            >
              Đặt lịch khám miễn phí hôm nay
            </Link>
          </div>
        </section>
      </div>
    </div>
  );
};

export default Home;