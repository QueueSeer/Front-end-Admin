import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import UserInfor from "./pages/UserInformation/UserInfor";
import "./index.css";


export default function App() {
  return (
    <Router>
      <Routes> 
        <Route path="/" element={<UserInfor/>} />  
        <Route path="/UserInfor" element={<UserInfor />} />
      </Routes>
    </Router>
  );
}