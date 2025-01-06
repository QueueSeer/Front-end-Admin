import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import UserInfor from "./pages/UserInformation/UserInfor";
import InspecPage from "./pages/inspection/InspecPage";
import Transferringmoney from "./pages/tranfer/Transferringmoney";
import "./index.css";


export default function App() {
  return (
    <Router>
      <Routes> 
        <Route path="/" element={<UserInfor/>} />  
        <Route path="/UserInfor" element={<UserInfor />} />
        <Route path="/InspecPage" element={<InspecPage />} />
        <Route path="/Transferringmoney" element={<Transferringmoney />} />
      </Routes>
    </Router>
  );
}