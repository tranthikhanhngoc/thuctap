import React, { useState, useEffect } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";

const Booking = () => {

  const navigate = useNavigate();

  const [doctors, setDoctors] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const [form, setForm] = useState({
    id_bacsi: "",
    ngay_hen: "",
    ca_lam_viec: "",
    ly_do: ""
  });

  // ==============================
  // 🔐 Check login
  // ==============================
  useEffect(() => {
    const token = localStorage.getItem("access_token");
    if (!token) {
      navigate("/login");
    }
  }, [navigate]);

  useEffect(() => {
    fetchDoctors();
  }, []);

  const fetchDoctors = async () => {
    try {
      const res = await axios.get("http://localhost:8000/doctors/");
      setDoctors(res.data);
    } catch (error) {
      setError("Không thể tải danh sách bác sĩ");
    }
  };

  const handleChange = (e) => {
    setForm({
      ...form,
      [e.target.name]: e.target.value
    });
  };

  const validateDate = (dateStr) => {
    const today = new Date();
    const selected = new Date(dateStr);

    today.setHours(0, 0, 0, 0);

    if (selected < today) {
      return "Không được chọn ngày trong quá khứ";
    }

    const day = selected.getDay();
    if (day === 0 || day === 6) {
      return "Không được đặt lịch vào Thứ 7 hoặc Chủ Nhật";
    }

    return null;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    const dateError = validateDate(form.ngay_hen);
    if (dateError) {
      setError(dateError);
      return;
    }

    try {
      setLoading(true);

      const id_benhnhan = localStorage.getItem("id_benhnhan");

      const payload = {
        id_bacsi: Number(form.id_bacsi),
        id_benhnhan: Number(id_benhnhan),
        ngay_hen: form.ngay_hen,
        ca_lam_viec: form.ca_lam_viec,
        ly_do: form.ly_do
      };

      await axios.post("http://localhost:8000/booking/", payload);

      navigate("/patient/lich-su-dat-lich");

    } catch (error) {
      setError(error.response?.data?.detail || "Đặt lịch thất bại");
    } finally {
      setLoading(false);
    }
  };

  const today = new Date().toISOString().split("T")[0];

  return (
    <div className="min-h-screen bg-pink-50 flex justify-center py-12 px-4">

      <div className="bg-white shadow-2xl rounded-2xl p-8 w-full max-w-xl relative">

        {/* Nút quay lại */}
        <button
          onClick={() => navigate(-1)}
          className="absolute left-6 top-6 text-gray-500 hover:text-pink-500"
        >
          ← Quay lại
        </button>

        <h2 className="text-3xl font-bold text-center text-pink-600 mb-6">
          📅 Đặt lịch khám
        </h2>

        {error && (
          <div className="bg-red-100 text-red-600 p-3 rounded mb-4 text-sm">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-5">

          {/* Bác sĩ */}
          <div>
            <label className="block mb-1 font-semibold">
              👨‍⚕️ Chọn bác sĩ
            </label>
            <select
              name="id_bacsi"
              value={form.id_bacsi}
              onChange={handleChange}
              required
              className="w-full border p-3 rounded-lg focus:ring-2 focus:ring-pink-400"
            >
              <option value="">-- Chọn bác sĩ --</option>
              {doctors.map((d) => (
                <option key={d.id_bacsi} value={d.id_bacsi}>
                  {d.ho_ten}
                </option>
              ))}
            </select>
          </div>

          {/* Ngày khám */}
          <div>
            <label className="block mb-1 font-semibold">
              📆 Ngày khám
            </label>
            <input
              type="date"
              name="ngay_hen"
              value={form.ngay_hen}
              min={today}
              onChange={handleChange}
              required
              className="w-full border p-3 rounded-lg focus:ring-2 focus:ring-pink-400"
            />
          </div>

          {/* Ca */}
          <div>
            <label className="block mb-1 font-semibold">
              🕐 Ca khám
            </label>
            <select
              name="ca_lam_viec"
              value={form.ca_lam_viec}
              onChange={handleChange}
              required
              className="w-full border p-3 rounded-lg focus:ring-2 focus:ring-pink-400"
            >
              <option value="">-- Chọn ca --</option>
              <option value="sang">Ca sáng (07:00 - 11:00)</option>
              <option value="chieu">Ca chiều (13:00 - 17:00)</option>
            </select>
          </div>

          {/* Lý do */}
          <div>
            <label className="block mb-1 font-semibold">
              📝 Lý do khám
            </label>
            <textarea
              name="ly_do"
              value={form.ly_do}
              onChange={handleChange}
              rows="3"
              className="w-full border p-3 rounded-lg focus:ring-2 focus:ring-pink-400"
            />
          </div>

          {/* Button đặt lịch */}
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-pink-500 hover:bg-pink-600 text-white py-3 rounded-lg font-semibold transition"
          >
            {loading ? "Đang đặt lịch..." : "Đặt lịch"}
          </button>

        </form>

        {/* Xem lịch đã đặt */}
        <div className="mt-6 text-center">
          <button
            onClick={() => navigate("/patient/lich-su-dat-lich")}
            className="text-pink-600 hover:underline font-medium"
          >
            📋 Xem danh sách lịch đã hẹn
          </button>
        </div>

      </div>
    </div>
  );
};

export default Booking;