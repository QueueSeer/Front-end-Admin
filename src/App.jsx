import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import UserInfor from "./pages/UserInformation/UserInfor";
import InspecPage from "./pages/inspection/InspecPage";
import Transferringmoney from "./pages/tranfer/Transferringmoney";
import ReviewManagement from "./pages/review/ReviewManagement";
import Loginpage from "./pages/login/Loginpage";
import ForgotPassword from "./pages/login/ForgotPassword";
import "./index.css";


export default function App() {
  return (
    <Router>
      <Routes> 
        <Route path="/" element={<Loginpage/>} />  
        <Route path="/UserInfor" element={<UserInfor />} />
        <Route path="/InspecPage" element={<InspecPage />} />
        <Route path="/Transferringmoney" element={<Transferringmoney />} />
        <Route path="/ReviewManagement" element={<ReviewManagement />} />
        <Route path="/Loginpage" element={<Loginpage />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />
      </Routes>
    </Router>
  );
}