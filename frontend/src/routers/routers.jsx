import React from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Navbar from "../components/navigation/nav";  
import Register from "../components/authentication/Register";
import Login from "../components/authentication/Login";
import Home from "../pages/home";


import BacSiHome from "../pages/BacSiHome";
import AdminHome from "../pages/AdminHome";
import UserHome from "../pages/UserHome";
import DoctorManage from "../pages/Admin/DoctorManage";
import PatientProfile from "../pages/Patient/PatientProfile";
import PatientManage from "../pages/Admin/PatientManage";
import ScheduleManage from "../pages/Admin/ScheduleManage";
import Booking from "../pages/Patient/Booking";
import LichSuDatLich from "../pages/Patient/LichSuDatLich";
import BookingManage from "../pages/Admin/BookingManage";
import About from "../pages/About";

// Pages (ví dụ)
const DatLich = () => <div className="p-6">Trang Đặt lịch</div>;
const XemLich = () => <div className="p-6">Trang Xem lịch</div>;

const Routers = () => {
  return (
    <BrowserRouter>
      {/* Nav luôn hiển thị */}
        <Navbar />

      {/* Nội dung từng trang */}
      <Routes>
        
        <Route path="/" element={<Home />} />
        <Route path="/dat-lich" element={<DatLich />} />
        <Route path="/xem-lich" element={<XemLich />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />

        {/* Login chuyen theo role  */}
        <Route path="/home" element={<UserHome />} />
        <Route path="/admin" element={<AdminHome />} />
        <Route path="/about" element={<About />} />
        {/* Logic xu ly trong trang role admin */}
        <Route path="/admin/quan-ly-bac-si" element={<DoctorManage />} />
        <Route path="/admin/quan-ly-benh-nhan" element={<PatientManage />} />
        <Route path="/admin/quan-ly-lich-kham" element={<BookingManage />} />
        <Route path="/admin/quan-ly-bac-si" element={<AdminHome />} />
        <Route path="/admin/quan-ly-lich-hoc" element={<ScheduleManage />} />
        {/* Logic xu ly trong trang role patient */}
        <Route path="/appointment" element={<Booking />} />
        <Route path="/patient/quan-ly-benh-nhan" element={<AdminHome />} />
        <Route path="/patient/quan-ly-bac-si" element={<AdminHome />} />
        <Route
  path="/patient/lich-su-dat-lich"
  element={<LichSuDatLich />}
/>

      

        <Route path="/bacsi" element={<BacSiHome />} />



      </Routes>
    </BrowserRouter>
  );
};

export default Routers;
