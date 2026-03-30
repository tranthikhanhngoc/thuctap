// import React, { useEffect, useState } from "react";
// import axios from "axios";

// const LichSuDatLich = () => {

//   const [appointments, setAppointments] = useState([]);
//   const [loading, setLoading] = useState(true);
//   const [editingId, setEditingId] = useState(null);
//   const [newCa, setNewCa] = useState("");

//   useEffect(() => {
//     fetchHistory();
//   }, []);

//   const fetchHistory = async () => {
//     try {
//       const id_benhnhan = localStorage.getItem("id_benhnhan");

//       const res = await axios.get(
//         `http://localhost:8000/booking/history/${id_benhnhan}`
//       );

//       setAppointments(res.data);

//     } catch (error) {
//       console.error("Lỗi load lịch sử", error);
//     } finally {
//       setLoading(false);
//     }
//   };

//   const formatCa = (ca) => {
//     if (ca === "sang") return "Ca sáng (07:00 - 11:00)";
//     if (ca === "chieu") return "Ca chiều (13:00 - 17:00)";
//     return ca;
//   };

//   const formatStatus = (status) => {
//     if (status === "CHO_XAC_NHAN") return "🟡 Chờ xác nhận";
//     if (status === "DA_XAC_NHAN") return "🟢 Đã xác nhận";
//     if (status === "DA_HUY") return "🔴 Đã huỷ";
//     return status;
//   };

//   // ===== HỦY LỊCH =====
//   const handleCancel = async (id) => {
//     if (!window.confirm("Bạn có chắc muốn hủy lịch này?")) return;

//     try {
//       await axios.patch(
//         `http://localhost:8000/booking/cancel/${id}`
//       );

//       alert("Đã hủy lịch thành công!");
//       fetchHistory();

//     } catch (error) {
//       alert("Hủy thất bại!");
//     }
//   };

//   // ===== CHỈNH SỬA CA =====
//   const handleEdit = (item) => {
//     setEditingId(item.id_cuochen);
//     setNewCa(item.ca_lam_viec);
//   };
// const handleUpdate = async (item) => {
//   try {

//     const id_benhnhan = localStorage.getItem("id_benhnhan");
// console.log(item);
//     await axios.put(
//       `http://localhost:8000/booking/${item.id_cuochen}`,
//       {
//         id_bacsi: item.id_bacsi,
//         id_benhnhan: id_benhnhan,
//         ngay_hen: item.ngay_hen,
//         ca_lam_viec: newCa,
//         ly_do: item.ly_do
//       }
//     );

//     alert("Cập nhật thành công!");
//     setEditingId(null);
//     fetchHistory();

//   } catch (error) {
//     console.error(error);
//     alert("Cập nhật thất bại!");
//   }
// };

//   if (loading) {
//     return <div className="text-center mt-10">Đang tải...</div>;
//   }

//   return (
//     <div className="min-h-screen bg-gray-100 p-10">

//       <h1 className="text-3xl font-bold text-blue-600 mb-6">
//         📋 Lịch sử đặt lịch
//       </h1>

//       <div className="bg-white shadow rounded-lg overflow-hidden">

//         <table className="w-full">

//           <thead className="bg-blue-500 text-white">
//             <tr>
//               <th className="p-3">Ngày khám</th>
//               <th className="p-3">Ca</th>
//               <th className="p-3">Lý do</th>
//               <th className="p-3">Trạng thái</th>
//               <th className="p-3">Thao tác</th>
//             </tr>
//           </thead>

//           <tbody>

//             {appointments.length === 0 ? (
//               <tr>
//                 <td colSpan="5" className="text-center p-5">
//                   Chưa có lịch hẹn
//                 </td>
//               </tr>
//             ) : (

//               appointments.map((item) => (

//                 <tr
//                   key={item.id_cuochen}
//                   className="border-b hover:bg-gray-50"
//                 >

//                   <td className="p-3">
//                     {item.ngay_hen}
//                   </td>

//                   <td className="p-3">
//                     {editingId === item.id_cuochen ? (
//                       <select
//                         value={newCa}
//                         onChange={(e) => setNewCa(e.target.value)}
//                         className="border p-1 rounded"
//                       >
//                         <option value="sang">Ca sáng</option>
//                         <option value="chieu">Ca chiều</option>
//                       </select>
//                     ) : (
//                       formatCa(item.ca_lam_viec)
//                     )}
//                   </td>

//                   <td className="p-3">
//                     {item.ly_do}
//                   </td>

//                   <td className="p-3">
//                     {formatStatus(item.trang_thai)}
//                   </td>

//                   <td className="p-3 space-x-2">

//                     {item.trang_thai !== "DA_HUY" && (

//                       editingId === item.id_cuochen ? (
//                         <>
//                           <button
//                             onClick={() => handleUpdate(item)}
//                             className="bg-green-500 text-white px-3 py-1 rounded"
//                           >
//                             Lưu
//                           </button>

//                           <button
//                             onClick={() => setEditingId(null)}
//                             className="bg-gray-400 text-white px-3 py-1 rounded"
//                           >
//                             Hủy
//                           </button>
//                         </>
//                       ) : (
//                         <>
//                           <button
//                             onClick={() => handleEdit(item)}
//                             className="bg-yellow-500 text-white px-3 py-1 rounded"
//                           >
//                             Sửa
//                           </button>

//                           <button
//                             onClick={() => handleCancel(item.id_cuochen)}
//                             className="bg-red-500 text-white px-3 py-1 rounded"
//                           >
//                             Hủy lịch
//                           </button>
//                         </>
//                       )

//                     )}

//                   </td>

//                 </tr>

//               ))

//             )}

//           </tbody>

//         </table>

//       </div>

//     </div>
//   );
// };

// export default LichSuDatLich;

import React, { useEffect, useState } from "react";
import axios from "axios";

const LichSuDatLich = () => {
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editingId, setEditingId] = useState(null);
  const [newCa, setNewCa] = useState("");

  useEffect(() => {
    fetchHistory();
  }, []);

  const fetchHistory = async () => {
    try {
      const id_benhnhan = localStorage.getItem("id_benhnhan");

      const res = await axios.get(
        `http://localhost:8000/booking/history/${id_benhnhan}`
      );

      setAppointments(res.data);
    } catch (error) {
      console.error("Lỗi load lịch sử", error);
    } finally {
      setLoading(false);
    }
  };

  const formatCa = (ca) => {
    if (ca === "sang") return "Ca sáng (07:00 - 11:00)";
    if (ca === "chieu") return "Ca chiều (13:00 - 17:00)";
    return ca;
  };

  const formatStatus = (status) => {
    if (status === "CHO_XAC_NHAN") return "🟡 Chờ xác nhận";
    if (status === "DA_XAC_NHAN") return "🟢 Đã xác nhận";
    if (status === "DA_HUY") return "🔴 Đã huỷ";
    return status;
  };

  // ===== HỦY LỊCH =====
  const handleCancel = async (id) => {
    if (!window.confirm("Bạn có chắc muốn hủy lịch này?")) return;

    try {
      await axios.patch(`http://localhost:8000/booking/cancel/${id}`);

      alert("Đã hủy lịch thành công!");
      fetchHistory();
    } catch (error) {
      alert("Hủy thất bại!");
    }
  };

  // ===== CHỈNH SỬA CA =====
  const handleEdit = (item) => {
    setEditingId(item.id_cuochen);
    setNewCa(item.ca_lam_viec);
  };

  const handleUpdate = async (item) => {
    try {
      const id_benhnhan = localStorage.getItem("id_benhnhan");

      await axios.put(`http://localhost:8000/booking/${item.id_cuochen}`, {
        id_bacsi: item.id_bacsi,
        id_benhnhan: id_benhnhan,
        ngay_hen: item.ngay_hen,
        ca_lam_viec: newCa,
        ly_do: item.ly_do,
      });

      alert("Cập nhật thành công!");
      setEditingId(null);
      fetchHistory();
    } catch (error) {
      console.error(error);
      alert("Cập nhật thất bại!");
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-pink-500 text-xl font-semibold animate-pulse">
          Đang tải lịch sử...
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white py-16 px-6 md:px-10">
      {/* Optional background accent giống hero */}
      <div className="absolute inset-0 -z-10 opacity-30 pointer-events-none">
        <div className="absolute bottom-20 left-20 w-96 h-96 bg-pink-200 rounded-full blur-3xl"></div>
      </div>

      <div className="max-w-6xl mx-auto">
        <h1 className="text-3xl md:text-4xl font-bold text-gray-800 mb-10 text-center md:text-left">
          📋 Lịch sử đặt lịch
        </h1>

        <div className="bg-white shadow-lg rounded-xl overflow-hidden border border-pink-100">
          <table className="w-full text-left">
            <thead className="bg-pink-500 text-white">
              <tr>
                <th className="p-4 font-semibold">Ngày khám</th>
                <th className="p-4 font-semibold">Ca khám</th>
                <th className="p-4 font-semibold">Lý do</th>
                <th className="p-4 font-semibold">Trạng thái</th>
                <th className="p-4 font-semibold text-center">Thao tác</th>
              </tr>
            </thead>

            <tbody>
              {appointments.length === 0 ? (
                <tr>
                  <td
                    colSpan="5"
                    className="text-center p-10 text-gray-500 text-lg"
                  >
                    Chưa có lịch hẹn nào. Hãy đặt lịch ngay hôm nay! 🌸
                  </td>
                </tr>
              ) : (
                appointments.map((item) => (
                  <tr
                    key={item.id_cuochen}
                    className="border-b border-gray-100 hover:bg-pink-50 transition"
                  >
                    <td className="p-4 text-gray-700">{item.ngay_hen}</td>

                    <td className="p-4 text-gray-700">
                      {editingId === item.id_cuochen ? (
                        <select
                          value={newCa}
                          onChange={(e) => setNewCa(e.target.value)}
                          className="w-full border border-gray-300 p-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-pink-400"
                        >
                          <option value="sang">Ca sáng</option>
                          <option value="chieu">Ca chiều</option>
                        </select>
                      ) : (
                        formatCa(item.ca_lam_viec)
                      )}
                    </td>

                    <td className="p-4 text-gray-600">{item.ly_do}</td>

                    <td className="p-4">
                      <span className="font-medium">{formatStatus(item.trang_thai)}</span>
                    </td>

                    <td className="p-4 text-center space-x-3">
                      {item.trang_thai !== "DA_HUY" && (
                        <>
                          {editingId === item.id_cuochen ? (
                            <>
                              <button
                                onClick={() => handleUpdate(item)}
                                className="bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded-lg shadow-md transition"
                              >
                                Lưu
                              </button>
                              <button
                                onClick={() => setEditingId(null)}
                                className="bg-gray-400 hover:bg-gray-500 text-white px-4 py-2 rounded-lg shadow-md transition"
                              >
                                Hủy
                              </button>
                            </>
                          ) : (
                            <>
                              <button
                                onClick={() => handleEdit(item)}
                                className="bg-yellow-500 hover:bg-yellow-600 text-white px-4 py-2 rounded-lg shadow-md transition"
                              >
                                Sửa ca
                              </button>
                              <button
                                onClick={() => handleCancel(item.id_cuochen)}
                                className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-lg shadow-md transition"
                              >
                                Hủy lịch
                              </button>
                            </>
                          )}
                        </>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default LichSuDatLich;