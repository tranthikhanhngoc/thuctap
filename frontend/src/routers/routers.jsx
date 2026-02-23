import React from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Navbar from "../components/navigation/nav";  
import Register from "../components/authentication/Register";
import Login from "../components/authentication/Login";
import Home from "../pages/home";


import BacSiHome from "../pages/BacSiHome";
import AdminHome from "../pages/AdminHome";
import UserHome from "../pages/UserHome";

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
        <Route path="/bacsi" element={<BacSiHome />} />
      </Routes>
    </BrowserRouter>
  );
};

export default Routers;
