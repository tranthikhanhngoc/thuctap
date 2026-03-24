import React, { useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";

const Register = () => {
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    username: "",
    password: "",
    benhnhan: {
      ho_ten: "",
      nam_sinh: "",
      gioi_tinh: "",
      so_dien_thoai: "",
      cccd: "",
      dia_chi: "",
    },
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleChange = (e) => {
    const { name, value } = e.target;
    if (name.startsWith("benhnhan.")) {
      const field = name.split(".")[1];
      setFormData({
        ...formData,
        benhnhan: { ...formData.benhnhan, [field]: value },
      });
    } else {
      setFormData({ ...formData, [name]: value });
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      await axios.post("http://127.0.0.1:8000/users/register", formData);

      alert("Đăng ký thành công! Bạn có thể đăng nhập ngay.");
      navigate("/login"); // Chuyển về trang đăng nhập sau khi đăng ký thành công
    } catch (err) {
      const message =
        err.response?.data?.detail ||
        err.response?.data?.message ||
        "Đăng ký thất bại";
      setError(typeof message === "string" ? message : JSON.stringify(message));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-pink-50 via-white to-pink-100 px-4">

      {/* Card */}
      <div className="w-full max-w-2xl bg-white rounded-3xl shadow-2xl p-10">

        {/* Title */}
        <div className="text-center mb-8">
          <h2 className="text-4xl font-extrabold text-pink-500">
            BeHealthy
          </h2>
          <p className="text-gray-500 mt-2 text-lg">
            Tạo tài khoản mới để đặt lịch khám
          </p>
        </div>

        {/* Error */}
        {error && (
          <div className="mb-6 bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-xl text-sm">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">

          {/* Thông tin tài khoản */}
          <div>
            <h3 className="text-xl font-semibold text-gray-700 mb-4">
              Thông tin tài khoản
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="text-gray-700 font-medium block mb-2">
                  Username <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  name="username"
                  placeholder="Nhập username"
                  value={formData.username}
                  onChange={handleChange}
                  required
                  className="w-full px-4 py-3 border border-gray-200 rounded-xl
                  focus:outline-none focus:ring-2 focus:ring-pink-400
                  focus:border-pink-400 transition"
                />
              </div>

              <div>
                <label className="text-gray-700 font-medium block mb-2">
                  Mật khẩu <span className="text-red-500">*</span>
                </label>
                <input
                  type="password"
                  name="password"
                  placeholder="Nhập mật khẩu"
                  value={formData.password}
                  onChange={handleChange}
                  required
                  className="w-full px-4 py-3 border border-gray-200 rounded-xl
                  focus:outline-none focus:ring-2 focus:ring-pink-400
                  focus:border-pink-400 transition"
                />
              </div>
            </div>
          </div>

          {/* Thông tin bệnh nhân */}
          <div>
            <h3 className="text-xl font-semibold text-gray-700 mb-4">
              Thông tin bệnh nhân
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="text-gray-700 font-medium block mb-2">
                  Họ và tên <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  name="benhnhan.ho_ten"
                  placeholder="Nguyễn Văn A"
                  value={formData.benhnhan.ho_ten}
                  onChange={handleChange}
                  required
                  className="w-full px-4 py-3 border border-gray-200 rounded-xl
                  focus:outline-none focus:ring-2 focus:ring-pink-400
                  focus:border-pink-400 transition"
                />
              </div>

              <div>
                <label className="text-gray-700 font-medium block mb-2">
                  Năm sinh <span className="text-red-500">*</span>
                </label>
                <input
                  type="number"
                  name="benhnhan.nam_sinh"
                  placeholder="1995"
                  value={formData.benhnhan.nam_sinh}
                  onChange={handleChange}
                  required
                  className="w-full px-4 py-3 border border-gray-200 rounded-xl
                  focus:outline-none focus:ring-2 focus:ring-pink-400
                  focus:border-pink-400 transition"
                />
              </div>

              <div>
                <label className="text-gray-700 font-medium block mb-2">
                  Giới tính <span className="text-red-500">*</span>
                </label>
                <select
                  name="benhnhan.gioi_tinh"
                  value={formData.benhnhan.gioi_tinh}
                  onChange={handleChange}
                  required
                  className="w-full px-4 py-3 border border-gray-200 rounded-xl
                  focus:outline-none focus:ring-2 focus:ring-pink-400
                  focus:border-pink-400 transition bg-white"
                >
                  <option value="">Chọn giới tính</option>
                  <option value="Nam">Nam</option>
                  <option value="Nữ">Nữ</option>
                  <option value="Khác">Khác</option>
                </select>
              </div>

              <div>
                <label className="text-gray-700 font-medium block mb-2">
                  Số điện thoại <span className="text-red-500">*</span>
                </label>
                <input
                  type="tel"
                  name="benhnhan.so_dien_thoai"
                  placeholder="0901234567"
                  value={formData.benhnhan.so_dien_thoai}
                  onChange={handleChange}
                  required
                  className="w-full px-4 py-3 border border-gray-200 rounded-xl
                  focus:outline-none focus:ring-2 focus:ring-pink-400
                  focus:border-pink-400 transition"
                />
              </div>

              <div>
                <label className="text-gray-700 font-medium block mb-2">
                  CCCD/CMND <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  name="benhnhan.cccd"
                  placeholder="012345678901"
                  value={formData.benhnhan.cccd}
                  onChange={handleChange}
                  required
                  className="w-full px-4 py-3 border border-gray-200 rounded-xl
                  focus:outline-none focus:ring-2 focus:ring-pink-400
                  focus:border-pink-400 transition"
                />
              </div>

              <div className="md:col-span-2">
                <label className="text-gray-700 font-medium block mb-2">
                  Địa chỉ <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  name="benhnhan.dia_chi"
                  placeholder="Số nhà, đường, phường/xã, quận/huyện, tỉnh/thành phố"
                  value={formData.benhnhan.dia_chi}
                  onChange={handleChange}
                  required
                  className="w-full px-4 py-3 border border-gray-200 rounded-xl
                  focus:outline-none focus:ring-2 focus:ring-pink-400
                  focus:border-pink-400 transition"
                />
              </div>
            </div>
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={loading}
            className="w-full py-3.5 text-white font-bold rounded-xl
            bg-pink-500 hover:bg-pink-600 transition
            shadow-lg hover:shadow-xl mt-4"
          >
            {loading ? "Đang đăng ký..." : "Đăng ký tài khoản"}
          </button>

        </form>

        {/* Extra */}
        <p className="text-center text-gray-400 text-sm mt-8">
          © 2026 BeHealthy
        </p>

        <p className="text-center text-gray-500 text-sm mt-4">
          Đã có tài khoản?{" "}
          <span 
            onClick={() => navigate("/login")}
            className="text-pink-500 font-medium hover:underline cursor-pointer"
          >
            Đăng nhập ngay
          </span>
        </p>

      </div>
    </div>
  );
};

export default Register;