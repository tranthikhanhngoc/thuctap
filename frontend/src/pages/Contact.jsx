import React, { useState } from "react";
import axios from "axios";

const Contact = () => {
  const [form, setForm] = useState({ ho_ten: "", email: "", sdt: "", noi_dung: "" });
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null); // { type: "success"|"error", msg: "" }

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.ho_ten.trim() || !form.email.trim() || !form.noi_dung.trim()) {
      setResult({ type: "error", msg: "Vui lòng điền đầy đủ họ tên, email và nội dung." });
      return;
    }

    setLoading(true);
    setResult(null);

    try {
      const res = await axios.post("http://127.0.0.1:8000/contact/send", form);
      setResult({ type: "success", msg: res.data.message });
      setForm({ ho_ten: "", email: "", sdt: "", noi_dung: "" });
    } catch (err) {
      const msg = err.response?.data?.detail || "Gửi thất bại. Vui lòng thử lại.";
      setResult({ type: "error", msg });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-white py-16 px-6 md:px-10 relative overflow-hidden">
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
                Email: ngocb2204951@student.ctu.edu.vn
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

            {/* Result notification */}
            {result && (
              <div className={`p-4 rounded-lg text-sm font-medium ${
                result.type === "success"
                  ? "bg-green-50 border border-green-200 text-green-700"
                  : "bg-red-50 border border-red-200 text-red-700"
              }`}>
                {result.type === "success" ? "✅ " : "❌ "}{result.msg}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-5">
              <input
                type="text"
                name="ho_ten"
                value={form.ho_ten}
                onChange={handleChange}
                placeholder="Họ và tên *"
                required
                className="w-full border border-gray-300 p-4 rounded-lg focus:outline-none focus:ring-2 focus:ring-pink-400 focus:border-pink-400 transition"
              />

              <input
                type="email"
                name="email"
                value={form.email}
                onChange={handleChange}
                placeholder="Email *"
                required
                className="w-full border border-gray-300 p-4 rounded-lg focus:outline-none focus:ring-2 focus:ring-pink-400 focus:border-pink-400 transition"
              />

              <input
                type="text"
                name="sdt"
                value={form.sdt}
                onChange={handleChange}
                placeholder="Số điện thoại"
                className="w-full border border-gray-300 p-4 rounded-lg focus:outline-none focus:ring-2 focus:ring-pink-400 focus:border-pink-400 transition"
              />

              <textarea
                rows="5"
                name="noi_dung"
                value={form.noi_dung}
                onChange={handleChange}
                placeholder="Nội dung tin nhắn... *"
                required
                className="w-full border border-gray-300 p-4 rounded-lg focus:outline-none focus:ring-2 focus:ring-pink-400 focus:border-pink-400 transition"
              ></textarea>

              <button
                type="submit"
                disabled={loading}
                className={`w-full py-4 rounded-lg font-semibold transition shadow-md ${
                  loading
                    ? "bg-pink-300 cursor-not-allowed text-white"
                    : "bg-pink-500 hover:bg-pink-600 text-white"
                }`}
              >
                {loading ? (
                  <span className="flex items-center justify-center gap-2">
                    <span className="animate-spin h-5 w-5 border-2 border-white border-t-transparent rounded-full"></span>
                    Đang gửi...
                  </span>
                ) : (
                  "Gửi liên hệ"
                )}
              </button>
            </form>
          </div>
        </div>
      </div>

      {/* Background accent */}
      <div className="absolute inset-0 -z-10 opacity-30 pointer-events-none">
        <div className="absolute top-20 right-20 w-96 h-96 bg-pink-200 rounded-full blur-3xl"></div>
      </div>
    </div>
  );
};

export default Contact;