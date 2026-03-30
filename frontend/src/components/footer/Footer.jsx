import React from "react";
import { Link } from "react-router-dom"; // Nếu dùng React Router

const Footer = () => {
  return (
    <footer className="bg-pink-50 border-t border-pink-100 text-gray-700">
      <div className="max-w-7xl mx-auto px-6 md:px-10 py-12 md:py-16">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-10 md:gap-8">
          
          {/* Column 1: Logo & About */}
          <div className="space-y-4">
            <Link to="/" className="flex items-center space-x-2">
              <span className="text-pink-500 text-2xl md:text-3xl font-bold">EvasPEL</span>
              <span className="text-gray-800 font-semibold text-lg">Clinic</span>
            </Link>
            <p className="text-gray-600 text-sm leading-relaxed">
              Nơi hồi phục sức sống và năng lượng. Chúng tôi đồng hành cùng bạn trên hành trình chăm sóc sức khỏe toàn diện và cá nhân hóa.
            </p>
            <p className="text-gray-500 text-xs">
              © {new Date().getFullYear()} EvasPEL Clinic. All rights reserved.
            </p>
          </div>

          {/* Column 2: Links nhanh */}
          <div className="space-y-4">
            <h3 className="text-gray-800 font-semibold text-lg">Liên kết nhanh</h3>
            <ul className="space-y-2 text-sm">
              <li>
                <Link to="/" className="hover:text-pink-500 transition">
                  Trang chủ
                </Link>
              </li>
              <li>
                <Link to="/dat-lich" className="hover:text-pink-500 transition">
                  Đặt lịch khám
                </Link>
              </li>
              <li>
                <Link to="/lich-su-dat-lich" className="hover:text-pink-500 transition">
                  Lịch sử đặt lịch
                </Link>
              </li>
              <li>
                <Link to="/contact" className="hover:text-pink-500 transition">
                  Liên hệ
                </Link>
              </li>
            </ul>
          </div>

          {/* Column 3: Dịch vụ */}
          <div className="space-y-4">
            <h3 className="text-gray-800 font-semibold text-lg">Dịch vụ</h3>
            <ul className="space-y-2 text-sm">
              <li className="hover:text-pink-500 transition cursor-pointer">
                Tư vấn sức khỏe
              </li>
              <li className="hover:text-pink-500 transition cursor-pointer">
                Điều trị cá nhân hóa
              </li>
              <li className="hover:text-pink-500 transition cursor-pointer">
                Kiểm tra & chẩn đoán
              </li>
              <li className="hover:text-pink-500 transition cursor-pointer">
                Theo dõi lâu dài
              </li>
            </ul>
          </div>

          {/* Column 4: Liên hệ */}
          <div className="space-y-4">
            <h3 className="text-gray-800 font-semibold text-lg">Liên hệ</h3>
            <ul className="space-y-3 text-sm">
              <li className="flex items-start gap-3">
                <span className="text-pink-500 text-xl">📍</span>
                <span>123 Đường 30/4, Ninh Kiều, Cần Thơ</span>
              </li>
              <li className="flex items-center gap-3">
                <span className="text-pink-500 text-xl">📞</span>
                <span>0292 123 4567</span>
              </li>
              <li className="flex items-center gap-3">
                <span className="text-pink-500 text-xl">📧</span>
                <span>support@evaspel.vn</span>
              </li>
              <li className="flex items-center gap-3">
                <span className="text-pink-500 text-xl">⏰</span>
                <span>7:00 - 17:00 (Thứ 2 - Thứ 7)</span>
              </li>
            </ul>

            {/* Social icons (có thể thêm link thật) */}
            <div className="flex space-x-4 mt-4">
              <a href="#" className="text-pink-500 hover:text-pink-600 text-2xl transition">
                <span>FB</span> {/* Thay bằng icon thật: react-icons */}
              </a>
              <a href="#" className="text-pink-500 hover:text-pink-600 text-2xl transition">
                <span>YT</span>
              </a>
              <a href="#" className="text-pink-500 hover:text-pink-600 text-2xl transition">
                <span>IG</span>
              </a>
            </div>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="mt-12 pt-8 border-t border-pink-100 text-center text-gray-500 text-sm">
          <p>Made with 🌸 care for your vitality • EvasPEL Clinic • Cần Thơ</p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;