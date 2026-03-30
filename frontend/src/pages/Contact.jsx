import React from "react";

const Contact = () => {
  return (
    <div className="min-h-screen bg-white py-16 px-6 md:px-10">
      <div className="max-w-6xl mx-auto bg-white shadow-lg rounded-xl p-8 md:p-12 border border-pink-100">
        {/* Title */}
        <h1 className="text-3xl md:text-4xl font-bold text-center text-gray-800 mb-10">
          Liên hệ phòng khám
        </h1>

        <div className="grid md:grid-cols-2 gap-10 md:gap-12">
          {/* Contact Info */}
          <div className="space-y-6">
            <h2 className="text-2xl font-semibold text-gray-800">
              Thông tin liên hệ
            </h2>

            <div className="space-y-4 text-gray-600">
              <p className="flex items-center gap-3">
                <span className="text-pink-500 text-xl">📍</span>
                Địa chỉ: 123 Đường 30/4, Ninh Kiều, Cần Thơ
              </p>

              <p className="flex items-center gap-3">
                <span className="text-pink-500 text-xl">📞</span>
                Điện thoại: 0292 123 4567
              </p>

              <p className="flex items-center gap-3">
                <span className="text-pink-500 text-xl">📧</span>
                Email: support@benhvien.vn
              </p>

              <p className="flex items-center gap-3">
                <span className="text-pink-500 text-xl">⏰</span>
                Giờ làm việc: 7:00 - 17:00 (Thứ 2 - Thứ 7)
              </p>
            </div>

            {/* Map */}
            <div className="mt-8">
              <iframe
                title="map"
                className="w-full h-64 rounded-lg border border-gray-200 shadow-sm"
                src="https://maps.google.com/maps?q=can%20tho&t=&z=13&ie=UTF8&iwloc=&output=embed"
              ></iframe>
            </div>
          </div>

          {/* Contact Form */}
          <div className="space-y-6">
            <h2 className="text-2xl font-semibold text-gray-800">
              Gửi tin nhắn cho chúng tôi
            </h2>

            <form className="space-y-5">
              <input
                type="text"
                placeholder="Họ và tên"
                className="w-full border border-gray-300 p-4 rounded-lg focus:outline-none focus:ring-2 focus:ring-pink-400 focus:border-pink-400 transition"
              />

              <input
                type="email"
                placeholder="Email"
                className="w-full border border-gray-300 p-4 rounded-lg focus:outline-none focus:ring-2 focus:ring-pink-400 focus:border-pink-400 transition"
              />

              <input
                type="text"
                placeholder="Số điện thoại"
                className="w-full border border-gray-300 p-4 rounded-lg focus:outline-none focus:ring-2 focus:ring-pink-400 focus:border-pink-400 transition"
              />

              <textarea
                rows="5"
                placeholder="Nội dung tin nhắn..."
                className="w-full border border-gray-300 p-4 rounded-lg focus:outline-none focus:ring-2 focus:ring-pink-400 focus:border-pink-400 transition"
              ></textarea>

              <button
                type="submit"
                className="w-full bg-pink-500 text-white py-4 rounded-lg hover:bg-pink-600 transition shadow-md font-semibold"
              >
                Gửi liên hệ
              </button>
            </form>
          </div>
        </div>
      </div>

      {/* Optional subtle background accent giống hero home */}
      <div className="absolute inset-0 -z-10 opacity-30 pointer-events-none">
        <div className="absolute top-20 right-20 w-96 h-96 bg-pink-200 rounded-full blur-3xl"></div>
      </div>
    </div>
  );
};

export default Contact;