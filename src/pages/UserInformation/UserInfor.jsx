
import Images from "../../assets";
import Fillterbar from "../../components/fillterbar";
import Sidebar from "../../components/Sidebar";
import SearchBar from "../../components/Information/SearchBar";
import Useroftable from "../../components/Information/Useroftable";
import React, { useState } from "react"; 



export default function UserInformation() {
    const [selectedRows, setSelectedRows] = useState(0);
  return (
    <div className="min-h-screen bg-gray-100 flex flex-col font-sans">
    {/* Navbar */}
    <Fillterbar />
  
    {/* Main Layout */}
    <div className="flex px-12 pt-12 gap-14">
      {/* Sidebar */}
      <div className="lg:w-72">
        <Sidebar />
      </div>
  
      {/* Main Content */}
      <div className="flex-1 bg-white shadow-md rounded-lg p-6 border border-gray-200">
        <h1 className="text-xl font-bold text-[#65558F] dark:text-purple-400 mb-4 flex items-center">
          <img src={Images.UserInformation} alt="UserInformation Icon" className="w-6 h-6 mr-2" />
          ข้อมูลผู้ใช้งาน
        </h1>
  
        <hr className="border-gray-300 dark:border-gray-700 mb-6" />
  
        {/* เพิ่ม SearchBar และ UserTable */}
        <SearchBar selectedRows={selectedRows} />
        <Useroftable onRowSelected={setSelectedRows} />
      </div>
    </div>
  </div>
  );
}
