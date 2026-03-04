import React, { useEffect, useState } from "react";
import axios from "axios";

const PatientManage = () => {

  const [patients, setPatients] = useState([]);
  const [search, setSearch] = useState("");
  const [selectedPatient, setSelectedPatient] = useState(null);
  const [editMode, setEditMode] = useState(false);

  const token = localStorage.getItem("access_token");

  const api = axios.create({
    baseURL: "http://localhost:8000",
    headers: {
      Authorization: `Bearer ${token}`
    }
  });

  // ==========================
  // Lấy danh sách bệnh nhân
  // ==========================
  const fetchPatients = async () => {
    try {
      const res = await api.get("/benhnhan");
      setPatients(res.data);
    } catch (err) {
      console.error("Lỗi lấy danh sách bệnh nhân", err);
    }
  };

  useEffect(() => {
    fetchPatients();
  }, []);

  // ==========================
  // Xóa bệnh nhân
  // ==========================
  const deletePatient = async (id) => {

    if (!window.confirm("Bạn có chắc muốn xóa bệnh nhân này?")) return;

    try {
      await api.delete(`/benhnhan/${id}`);
      fetchPatients();
    } catch (err) {
      console.error("Lỗi xóa bệnh nhân", err);
    }
  };

  // ==========================
  // Update bệnh nhân
  // ==========================
  const updatePatient = async () => {

    try {

      await api.put(`/benhnhan/${selectedPatient.id_benhnhan}`, selectedPatient);

      alert("Cập nhật thành công");

      setEditMode(false);
      fetchPatients();

    } catch (err) {
      console.error("Lỗi update", err);
    }

  };

  // ==========================
  // Search username + name + phone
  // ==========================
  const filteredPatients = patients.filter((p) => {

    const keyword = search.toLowerCase();

    return (
      p.username?.toLowerCase().includes(keyword) ||
      p.ho_ten?.toLowerCase().includes(keyword) ||
      p.so_dien_thoai?.includes(keyword)
    );

  });

  return (

    <div className="p-8 bg-gray-100 min-h-screen">

      <h1 className="text-3xl font-bold mb-6 text-indigo-600">
        Quản lý bệnh nhân
      </h1>

      {/* SEARCH */}
      <input
        type="text"
        placeholder="Tìm theo username, tên, số điện thoại..."
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        className="border p-2 rounded w-full mb-4"
      />

      {/* TABLE */}
      <div className="bg-white shadow rounded-lg overflow-hidden">

        <table className="w-full">

          <thead className="bg-indigo-500 text-white">

            <tr>
              <th className="p-3">ID</th>
              <th>Username</th>
              <th>Họ tên</th>
              <th>Năm sinh</th>
              <th>SĐT</th>
              <th>Hành động</th>
            </tr>

          </thead>

          <tbody>

            {filteredPatients.map((p) => (

              <tr key={p.id_benhnhan} className="border-b text-center">

                <td className="p-2">{p.id_benhnhan}</td>
                <td>{p.username}</td>
                <td>{p.ho_ten}</td>
                <td>{p.nam_sinh}</td>
                <td>{p.so_dien_thoai}</td>

                <td className="space-x-2">

                  <button
                    onClick={() => {
                      setSelectedPatient(p);
                      setEditMode(false);
                    }}
                    className="bg-blue-500 text-white px-3 py-1 rounded"
                  >
                    Xem
                  </button>

                  <button
                    onClick={() => {
                      setSelectedPatient(p);
                      setEditMode(true);
                    }}
                    className="bg-yellow-500 text-white px-3 py-1 rounded"
                  >
                    Sửa
                  </button>

                  <button
                    onClick={() => deletePatient(p.id_benhnhan)}
                    className="bg-red-500 text-white px-3 py-1 rounded"
                  >
                    Xóa
                  </button>

                </td>

              </tr>

            ))}

          </tbody>

        </table>

      </div>

      {/* MODAL */}
      {selectedPatient && (

        <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center">

          <div className="bg-white p-6 rounded-lg w-96">

            <h2 className="text-xl font-bold mb-4">
              Thông tin bệnh nhân
            </h2>

            {/* username */}
            <div className="mb-3">
              <label className="font-semibold">Username</label>
              <p>{selectedPatient.username}</p>
            </div>

            {/* ho ten */}
            <div className="mb-3">
              <label className="font-semibold">Họ tên</label>

              {editMode ? (
                <input
                  className="border p-2 w-full rounded"
                  value={selectedPatient.ho_ten || ""}
                  onChange={(e) =>
                    setSelectedPatient({
                      ...selectedPatient,
                      ho_ten: e.target.value
                    })
                  }
                />
              ) : (
                <p>{selectedPatient.ho_ten}</p>
              )}

            </div>

            {/* nam sinh */}
            <div className="mb-3">

              <label className="font-semibold">Năm sinh</label>

              {editMode ? (
                <input
                  type="number"
                  className="border p-2 w-full rounded"
                  value={selectedPatient.nam_sinh || ""}
                  onChange={(e) =>
                    setSelectedPatient({
                      ...selectedPatient,
                      nam_sinh: e.target.value
                    })
                  }
                />
              ) : (
                <p>{selectedPatient.nam_sinh}</p>
              )}

            </div>

            {/* gioi tinh */}
            <div className="mb-3">

              <label className="font-semibold">Giới tính</label>

              {editMode ? (
                <select
                  className="border p-2 w-full rounded"
                  value={selectedPatient.gioi_tinh || ""}
                  onChange={(e) =>
                    setSelectedPatient({
                      ...selectedPatient,
                      gioi_tinh: e.target.value
                    })
                  }
                >
                  <option value="">-- Chọn --</option>
                  <option value="Nam">Nam</option>
                  <option value="Nữ">Nữ</option>
                  <option value="Khác">Khác</option>
                </select>
              ) : (
                <p>{selectedPatient.gioi_tinh}</p>
              )}

            </div>

            {/* so dien thoai */}
            <div className="mb-3">

              <label className="font-semibold">Số điện thoại</label>

              {editMode ? (
                <input
                  className="border p-2 w-full rounded"
                  value={selectedPatient.so_dien_thoai || ""}
                  onChange={(e) =>
                    setSelectedPatient({
                      ...selectedPatient,
                      so_dien_thoai: e.target.value
                    })
                  }
                />
              ) : (
                <p>{selectedPatient.so_dien_thoai}</p>
              )}

            </div>

            {/* CCCD */}
            <div className="mb-3">

              <label className="font-semibold">CCCD</label>

              {editMode ? (
                <input
                  className="border p-2 w-full rounded"
                  value={selectedPatient.cccd || ""}
                  onChange={(e) =>
                    setSelectedPatient({
                      ...selectedPatient,
                      cccd: e.target.value
                    })
                  }
                />
              ) : (
                <p>{selectedPatient.cccd}</p>
              )}

            </div>

            {/* dia chi */}
            <div className="mb-3">

              <label className="font-semibold">Địa chỉ</label>

              {editMode ? (
                <input
                  className="border p-2 w-full rounded"
                  value={selectedPatient.dia_chi || ""}
                  onChange={(e) =>
                    setSelectedPatient({
                      ...selectedPatient,
                      dia_chi: e.target.value
                    })
                  }
                />
              ) : (
                <p>{selectedPatient.dia_chi}</p>
              )}

            </div>

            <div className="flex gap-3 mt-4">

              {editMode && (

                <button
                  onClick={updatePatient}
                  className="bg-green-500 text-white px-4 py-2 rounded"
                >
                  Lưu
                </button>

              )}

              <button
                onClick={() => setSelectedPatient(null)}
                className="bg-gray-400 text-white px-4 py-2 rounded"
              >
                Đóng
              </button>

            </div>

          </div>

        </div>

      )}

    </div>

  );

};

export default PatientManage;