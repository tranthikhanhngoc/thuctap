import React, { useState } from "react";
import axios from "axios";

const Register = () => {
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
      alert("Đăng ký thành công 💜");
    } catch (err) {
      setError(err.response?.data?.detail || "Đăng ký thất bại");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-purple-50 via-pink-50 to-indigo-100 px-4 py-12">
      <div className="w-full max-w-3xl bg-white/90 backdrop-blur-lg rounded-3xl shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="bg-gradient-to-r from-purple-600 to-indigo-600 px-10 py-12 text-center text-white">
          <h2 className="text-4xl font-extrabold tracking-tight">
            Đăng ký tài khoản
          </h2>
          <p className="mt-3 text-purple-100 text-lg">
            Quản lý hồ sơ bệnh nhân thông minh và an toàn
          </p>
        </div>

        <div className="px-10 py-12">
          {/* Error message */}
          {error && (
            <div className="mb-8 bg-red-50 border border-red-200 text-red-700 px-6 py-4 rounded-2xl">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-10">
            {/* Tài khoản */}
            <div>
              <h3 className="text-2xl font-bold text-gray-800 mb-6">
                🔐 Thông tin tài khoản
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Input
                  label="Username"
                  name="username"
                  value={formData.username}
                  onChange={handleChange}
                  placeholder="Nhập tên đăng nhập"
                  required
                />
                <Input
                  label="Mật khẩu"
                  name="password"
                  type="password"
                  value={formData.password}
                  onChange={handleChange}
                  placeholder="Nhập mật khẩu"
                  required
                />
              </div>
            </div>

            {/* Divider */}
            <div className="flex items-center">
              <div className="flex-1 border-t border-gray-300"></div>
              <span className="px-4 text-sm font-medium text-gray-500">
                Thông tin bệnh nhân
              </span>
              <div className="flex-1 border-t border-gray-300"></div>
            </div>

            {/* Thông tin bệnh nhân */}
            <div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Input
                  label="Họ và tên"
                  name="benhnhan.ho_ten"
                  value={formData.benhnhan.ho_ten}
                  onChange={handleChange}
                  placeholder="Nguyễn Văn A"
                  required
                />
                <Input
                  label="Năm sinh"
                  name="benhnhan.nam_sinh"
                  type="number"
                  value={formData.benhnhan.nam_sinh}
                  onChange={handleChange}
                  placeholder="1990"
                  required
                />

                <Select
                  label="Giới tính"
                  name="benhnhan.gioi_tinh"
                  value={formData.benhnhan.gioi_tinh}
                  onChange={handleChange}
                  required
                >
                  <option value="">Chọn giới tính</option>
                  <option value="Nam">Nam</option>
                  <option value="Nữ">Nữ</option>
                  <option value="Khác">Khác</option>
                </Select>

                <Input
                  label="Số điện thoại"
                  name="benhnhan.so_dien_thoai"
                  value={formData.benhnhan.so_dien_thoai}
                  onChange={handleChange}
                  placeholder="0901234567"
                  required
                />
                <Input
                  label="CCCD/CMND"
                  name="benhnhan.cccd"
                  value={formData.benhnhan.cccd}
                  onChange={handleChange}
                  placeholder="012345678901"
                  required
                />
                <div className="md:col-span-2">
                  <Input
                    label="Địa chỉ"
                    name="benhnhan.dia_chi"
                    value={formData.benhnhan.dia_chi}
                    onChange={handleChange}
                    placeholder="Số nhà, đường, phường/xã, quận/huyện, tỉnh/thành"
                    required
                  />
                </div>
              </div>
            </div>

            {/* Submit button */}
            <button
              type="submit"
              disabled={loading}
              className="w-full py-4 rounded-2xl text-white font-bold text-xl
                         bg-gradient-to-r from-purple-600 to-indigo-600
                         hover:from-purple-700 hover:to-indigo-700
                         focus:outline-none focus:ring-4 focus:ring-purple-300
                         shadow-xl transform transition hover:scale-[1.02] disabled:opacity-70 disabled:cursor-not-allowed"
            >
              {loading ? (
                <span className="flex items-center justify-center">
                  <svg
                    className="animate-spin -ml-1 mr-3 h-5 w-5 text-white"
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                  >
                    <circle
                      className="opacity-25"
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="currentColor"
                      strokeWidth="4"
                    ></circle>
                    <path
                      className="opacity-75"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                    ></path>
                  </svg>
                  Đang đăng ký...
                </span>
              ) : (
                "Đăng ký ngay"
              )}
            </button>

            <p className="text-center text-gray-600">
              Đã có tài khoản?{" "}
              <span className="text-purple-600 font-semibold hover:underline cursor-pointer">
                Đăng nhập
              </span>
            </p>
          </form>
        </div>
      </div>
    </div>
  );
};

/* Reusable Input Component */
const Input = ({
  label,
  type = "text",
  required = false,
  placeholder = "",
  ...props
}) => (
  <div>
    <label className="block text-sm font-semibold text-gray-700 mb-2">
      {label} {required && <span className="text-red-500">*</span>}
    </label>
    <input
      type={type}
      placeholder={placeholder}
      className="w-full px-5 py-4 bg-gray-50 border border-gray-300 rounded-2xl 
                 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent 
                 transition duration-200 placeholder-gray-400"
      {...props}
    />
  </div>
);

/* Reusable Select Component */
const Select = ({ label, required = false, children, ...props }) => (
  <div>
    <label className="block text-sm font-semibold text-gray-700 mb-2">
      {label} {required && <span className="text-red-500">*</span>}
    </label>
    <select
      className="w-full px-5 py-4 bg-gray-50 border border-gray-300 rounded-2xl 
                 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent 
                 transition duration-200"
      {...props}
    >
      {children}
    </select>
  </div>
);

export default Register;