import React from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Navbar from "../components/navigation/nav";  
import Register from "../components/authentication/Register";
import Login from "../components/authentication/Login";
import Home from "../pages/home";

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
      </Routes>
    </BrowserRouter>
  );
};

export default Routers;
