import React, { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";

const PatientManage = () => {
  const [patients, setPatients] = useState([]);
  const [search, setSearch] = useState("");
  const [selectedPatient, setSelectedPatient] = useState(null);
  const [editMode, setEditMode] = useState(false);
  const [loading, setLoading] = useState(true);

  const token = localStorage.getItem("access_token");
  const navigate = useNavigate();

  const api = axios.create({
    baseURL: "http://localhost:8000",
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  useEffect(() => {
    fetchPatients();
  }, []);

  const fetchPatients = async () => {
    setLoading(true);
    try {
      const res = await api.get("/benhnhan");
      setPatients(res.data || []);
    } catch (err) {
      console.error("Lỗi lấy danh sách bệnh nhân", err);
    } finally {
      setLoading(false);
    }
  };

  const deletePatient = async (id) => {
    if (!window.confirm("Bạn có chắc muốn xóa bệnh nhân này?")) return;

    try {
      await api.delete(`/benhnhan/${id}`);
      fetchPatients();
      alert("Xóa thành công!");
    } catch (err) {
      alert("Xóa thất bại!");
    }
  };

  const updatePatient = async () => {
    try {
      await api.put(`/benhnhan/${selectedPatient.id_benhnhan}`, selectedPatient);
      alert("Cập nhật thành công!");
      setEditMode(false);
      setSelectedPatient(null);
      fetchPatients();
    } catch (err) {
      alert("Cập nhật thất bại!");
    }
  };

  const filteredPatients = patients.filter((p) => {
    const keyword = search.toLowerCase();
    return (
      (p.username || "").toLowerCase().includes(keyword) ||
      (p.ho_ten || "").toLowerCase().includes(keyword) ||
      (p.so_dien_thoai || "").includes(keyword)
    );
  });

  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-50 via-white to-pink-50 relative overflow-hidden">
      {/* Background accents */}
      <div className="absolute inset-0 -z-10 opacity-30 pointer-events-none">
        <div className="absolute top-40 right-20 w-96 h-96 bg-pink-200 rounded-full blur-3xl"></div>
        <div className="absolute bottom-20 left-20 w-80 h-80 bg-pink-100 rounded-full blur-3xl"></div>
      </div>

      {/* Sidebar */}
      <aside className="fixed top-0 left-0 h-full w-64 bg-white shadow-xl border-r border-pink-100 z-40 hidden md:block">
        <div className="p-6 border-b border-pink-100">
          <h1 className="text-2xl font-bold text-pink-500">BeHealthy Admin</h1>
          <p className="text-gray-500 text-sm mt-1">Quản trị hệ thống</p>
        </div>

        <nav className="p-4 space-y-2">
          <button
            onClick={() => navigate("/admin")}
            className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-gray-700 hover:bg-pink-50 hover:text-pink-600 transition"
          >
            <span className="text-xl">🏠</span> Dashboard
          </button>
          <button
            onClick={() => navigate("/admin/quan-ly-benh-nhan")}
            className="w-full flex items-center gap-3 px-4 py-3 rounded-xl bg-pink-50 text-pink-600 font-medium hover:bg-pink-100 transition"
          >
            <span className="text-xl">🧑‍🤝‍🧑</span> Quản lý Bệnh nhân
          </button>
          {/* Các menu khác */}
        </nav>

        <div className="absolute bottom-8 left-4 right-4">
          <button
            onClick={() => {
              localStorage.clear();
              navigate("/login");
            }}
            className="w-full bg-red-500 hover:bg-red-600 text-white py-3 rounded-xl font-medium transition flex items-center justify-center gap-2"
          >
            <span>🚪</span> Đăng xuất
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <div className="md:ml-64 min-h-screen">
        {/* Header */}
        <header className="bg-white shadow-sm border-b border-pink-100 sticky top-0 z-30">
          <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
            <div className="flex items-center gap-4">
              <button
                onClick={() => navigate(-1)}
                className="flex items-center gap-2 bg-pink-100 hover:bg-pink-200 text-pink-700 px-5 py-2.5 rounded-xl font-medium transition shadow-sm"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7" />
                </svg>
                Quay về
              </button>

              <h1 className="text-2xl md:text-3xl font-bold text-gray-800">
                Quản lý bệnh nhân
              </h1>
            </div>
          </div>
        </header>

        <main className="p-6 md:p-10">
          {/* Search */}
          <div className="bg-white rounded-2xl shadow-lg p-6 mb-8 border border-pink-100">
            <input
              type="text"
              placeholder="Tìm theo username, tên, số điện thoại..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full border border-gray-300 p-4 rounded-xl focus:outline-none focus:ring-2 focus:ring-pink-400 transition text-lg"
            />
          </div>

          {/* Table */}
          <div className="bg-white rounded-2xl shadow-lg overflow-hidden border border-pink-100">
            {loading ? (
              <div className="p-10 text-center text-pink-500 text-xl font-semibold animate-pulse">
                Đang tải danh sách bệnh nhân...
              </div>
            ) : (
              <table className="w-full text-left">
                <thead className="bg-pink-500 text-white">
                  <tr>
                    <th className="p-4 font-semibold">ID</th>
                    <th className="p-4 font-semibold">Username</th>
                    <th className="p-4 font-semibold">Họ tên</th>
                    <th className="p-4 font-semibold">Năm sinh</th>
                    <th className="p-4 font-semibold">SĐT</th>
                    <th className="p-4 font-semibold text-center">Hành động</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredPatients.length > 0 ? (
                    filteredPatients.map((p) => (
                      <tr
                        key={p.id_benhnhan}
                        className="border-b border-gray-100 hover:bg-pink-50 transition duration-200"
                      >
                        <td className="p-4 text-gray-700 font-medium">{p.id_benhnhan}</td>
                        <td className="p-4 text-gray-600">{p.username || "—"}</td>
                        <td className="p-4 font-semibold text-gray-800">{p.ho_ten || "—"}</td>
                        <td className="p-4 text-gray-700">{p.nam_sinh || "—"}</td>
                        <td className="p-4 text-gray-700">{p.so_dien_thoai || "—"}</td>
                        <td className="p-4 text-center space-x-3">
                          <button
                            onClick={() => {
                              setSelectedPatient(p);
                              setEditMode(false);
                            }}
                            className="bg-pink-500 hover:bg-pink-600 text-white px-5 py-2 rounded-lg shadow-sm transition"
                          >
                            Xem
                          </button>
                          <button
                            onClick={() => {
                              setSelectedPatient(p);
                              setEditMode(true);
                            }}
                            className="bg-yellow-500 hover:bg-yellow-600 text-white px-5 py-2 rounded-lg shadow-sm transition"
                          >
                            Sửa
                          </button>
                          <button
                            onClick={() => deletePatient(p.id_benhnhan)}
                            className="bg-red-500 hover:bg-red-600 text-white px-5 py-2 rounded-lg shadow-sm transition"
                          >
                            Xóa
                          </button>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan="6" className="text-center p-10 text-gray-500 text-lg">
                        Không tìm thấy bệnh nhân nào phù hợp 🌸
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            )}
          </div>
        </main>
      </div>

      {/* Modal */}
      {selectedPatient && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="p-6 md:p-8">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-bold text-gray-800">
                  {editMode ? "Chỉnh sửa thông tin bệnh nhân" : "Thông tin bệnh nhân"}
                </h2>
                <button
                  onClick={() => setSelectedPatient(null)}
                  className="text-gray-500 hover:text-pink-600 text-2xl"
                >
                  ×
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-gray-700 font-medium mb-2">Username</label>
                  <p className="text-gray-600 bg-gray-50 p-3 rounded-xl">{selectedPatient.username || "—"}</p>
                </div>

                <div>
                  <label className="block text-gray-700 font-medium mb-2">Họ tên</label>
                  {editMode ? (
                    <input
                      className="w-full border border-gray-300 p-3 rounded-xl focus:outline-none focus:ring-2 focus:ring-pink-400 transition"
                      value={selectedPatient.ho_ten || ""}
                      onChange={(e) =>
                        setSelectedPatient({ ...selectedPatient, ho_ten: e.target.value })
                      }
                    />
                  ) : (
                    <p className="text-gray-800 font-semibold">{selectedPatient.ho_ten || "—"}</p>
                  )}
                </div>

                <div>
                  <label className="block text-gray-700 font-medium mb-2">Năm sinh</label>
                  {editMode ? (
                    <input
                      type="number"
                      className="w-full border border-gray-300 p-3 rounded-xl focus:outline-none focus:ring-2 focus:ring-pink-400 transition"
                      value={selectedPatient.nam_sinh || ""}
                      onChange={(e) =>
                        setSelectedPatient({ ...selectedPatient, nam_sinh: e.target.value })
                      }
                    />
                  ) : (
                    <p className="text-gray-600">{selectedPatient.nam_sinh || "—"}</p>
                  )}
                </div>

                <div>
                  <label className="block text-gray-700 font-medium mb-2">Giới tính</label>
                  {editMode ? (
                    <select
                      className="w-full border border-gray-300 p-3 rounded-xl focus:outline-none focus:ring-2 focus:ring-pink-400 transition bg-white"
                      value={selectedPatient.gioi_tinh || ""}
                      onChange={(e) =>
                        setSelectedPatient({ ...selectedPatient, gioi_tinh: e.target.value })
                      }
                    >
                      <option value="">-- Chọn --</option>
                      <option value="Nam">Nam</option>
                      <option value="Nữ">Nữ</option>
                      <option value="Khác">Khác</option>
                    </select>
                  ) : (
                    <p className="text-gray-600">{selectedPatient.gioi_tinh || "—"}</p>
                  )}
                </div>

                <div>
                  <label className="block text-gray-700 font-medium mb-2">Số điện thoại</label>
                  {editMode ? (
                    <input
                      className="w-full border border-gray-300 p-3 rounded-xl focus:outline-none focus:ring-2 focus:ring-pink-400 transition"
                      value={selectedPatient.so_dien_thoai || ""}
                      onChange={(e) =>
                        setSelectedPatient({ ...selectedPatient, so_dien_thoai: e.target.value })
                      }
                    />
                  ) : (
                    <p className="text-gray-600">{selectedPatient.so_dien_thoai || "—"}</p>
                  )}
                </div>

                <div>
                  <label className="block text-gray-700 font-medium mb-2">CCCD</label>
                  {editMode ? (
                    <input
                      className="w-full border border-gray-300 p-3 rounded-xl focus:outline-none focus:ring-2 focus:ring-pink-400 transition"
                      value={selectedPatient.cccd || ""}
                      onChange={(e) =>
                        setSelectedPatient({ ...selectedPatient, cccd: e.target.value })
                      }
                    />
                  ) : (
                    <p className="text-gray-600">{selectedPatient.cccd || "—"}</p>
                  )}
                </div>

                <div className="md:col-span-2">
                  <label className="block text-gray-700 font-medium mb-2">Địa chỉ</label>
                  {editMode ? (
                    <input
                      className="w-full border border-gray-300 p-3 rounded-xl focus:outline-none focus:ring-2 focus:ring-pink-400 transition"
                      value={selectedPatient.dia_chi || ""}
                      onChange={(e) =>
                        setSelectedPatient({ ...selectedPatient, dia_chi: e.target.value })
                      }
                    />
                  ) : (
                    <p className="text-gray-600">{selectedPatient.dia_chi || "—"}</p>
                  )}
                </div>
              </div>

              <div className="flex justify-end gap-4 mt-8">
                {editMode ? (
                  <>
                    <button
                      onClick={updatePatient}
                      className="bg-pink-500 hover:bg-pink-600 text-white px-8 py-3 rounded-xl font-semibold shadow-md transition"
                    >
                      Lưu thay đổi
                    </button>
                    <button
                      onClick={() => {
                        setEditMode(false);
                        // Có thể reset selectedPatient về dữ liệu gốc nếu cần
                      }}
                      className="bg-gray-400 hover:bg-gray-500 text-white px-8 py-3 rounded-xl font-semibold shadow-md transition"
                    >
                      Hủy
                    </button>
                  </>
                ) : (
                  <button
                    onClick={() => {
                      setSelectedPatient(null);
                    }}
                    className="bg-gray-500 hover:bg-gray-600 text-white px-8 py-3 rounded-xl font-semibold shadow-md transition"
                  >
                    Đóng
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default PatientManage;