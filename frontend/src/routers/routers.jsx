import React from "react";
import { BrowserRouter, Routes, Route, Navigate, useLocation } from "react-router-dom";
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
import Contact from "../pages/Contact";
import Footer from "../components/footer/Footer";
import LichKham from "../pages/Doctor/LichKham";
import LichHoc from "../pages/Doctor/LichHoc";
import XemBacSiTruc from "../pages/Patient/XemBacSiTruc";
import PrescriptionManage from "../pages/Admin/PrescriptionManage";
import XemDanhSachThuoc from "../pages/Patient/XemDanhSachThuoc";

// ─── Role Guard ─────────────────────────────────────────────
const RoleGuard = ({ allowedRoles, children }) => {
  const token = localStorage.getItem("access_token");
  const role = localStorage.getItem("role");

  if (!token) {
    return <Navigate to="/login" replace />;
  }

  if (!allowedRoles.includes(role)) {
    // Redirect về trang phù hợp với role hiện tại
    if (role === "admin") return <Navigate to="/admin" replace />;
    if (role === "bacsi") return <Navigate to="/bacsi" replace />;
    return <Navigate to="/home" replace />;
  }

  return children;
};

// ─── Layout wrapper: ẩn Nav/Footer cho admin & bác sĩ ──────
const AppLayout = () => {
  const location = useLocation();

  const isAdminRoute = location.pathname.startsWith("/admin");
  const isBacSiRoute = location.pathname.startsWith("/bacsi");
  const hideNavFooter = isAdminRoute || isBacSiRoute;

  return (
    <>
      {!hideNavFooter && <Navbar />}

      <Routes>
        {/* ─── Public routes ─────────────────────────────── */}
        <Route path="/" element={<Home />} />
        <Route path="/home" element={<Home />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/about" element={<About />} />
        <Route path="/contact" element={<Contact />} />

        {/* ─── Admin routes (chỉ admin) ──────────────────── */}
        <Route path="/admin" element={
          <RoleGuard allowedRoles={["admin"]}>
            <AdminHome />
          </RoleGuard>
        } />
        <Route path="/admin/quan-ly-bac-si" element={
          <RoleGuard allowedRoles={["admin"]}>
            <DoctorManage />
          </RoleGuard>
        } />
        <Route path="/admin/quan-ly-benh-nhan" element={
          <RoleGuard allowedRoles={["admin"]}>
            <PatientManage />
          </RoleGuard>
        } />
        <Route path="/admin/quan-ly-lich-kham" element={
          <RoleGuard allowedRoles={["admin"]}>
            <BookingManage />
          </RoleGuard>
        } />
        <Route path="/admin/quan-ly-lich-hoc" element={
          <RoleGuard allowedRoles={["admin"]}>
            <ScheduleManage />
          </RoleGuard>
        } />
        <Route path="/admin/quan-ly-thuoc" element={
          <RoleGuard allowedRoles={["admin"]}>
            <PrescriptionManage />
          </RoleGuard>
        } />

        {/* ─── Bác sĩ routes (chỉ bác sĩ) ───────────────── */}
        <Route path="/bacsi" element={
          <RoleGuard allowedRoles={["bacsi"]}>
            <BacSiHome />
          </RoleGuard>
        } />
        <Route path="/bacsi/lich-kham" element={
          <RoleGuard allowedRoles={["bacsi"]}>
            <LichKham />
          </RoleGuard>
        } />
        <Route path="/bacsi/lich-hoc" element={
          <RoleGuard allowedRoles={["bacsi"]}>
            <LichHoc />
          </RoleGuard>
        } />
        <Route path="/bacsi/benh-an" element={
          <RoleGuard allowedRoles={["bacsi"]}>
            <BacSiHome />
          </RoleGuard>
        } />

        {/* ─── Patient routes (có đăng nhập) ─────────────── */}
        <Route path="/patient/appointment" element={<Booking />} />
        <Route path="/patient/lich-su-dat-lich" element={<LichSuDatLich />} />
        <Route path="/patient/xem-bac-si-truc" element={<XemBacSiTruc />} />
        <Route path="/patient/xem-danh-sach-thuoc" element={<XemDanhSachThuoc />} />
      </Routes>

      {!hideNavFooter && <Footer />}
    </>
  );
};

// ─── Root Router ────────────────────────────────────────────
const Routers = () => {
  return (
    <BrowserRouter>
      <AppLayout />
    </BrowserRouter>
  );
};

export default Routers;
