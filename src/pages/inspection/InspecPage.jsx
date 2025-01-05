import React, { useState } from "react";
import Images from "../../assets";
import SearchBar from "../../components/Information/SearchBar";
import Sidebar from "../../components/Sidebar";
import Fillterbar from "../../components/fillterbar";
import InspectionTable from "../../components/inspec/InspectionTable";

const InspecPage = () => {
  const [users, setUsers] = useState([
    {
      name: "John Doe",
      email: "john.doe@gmail.com",
      inspection: "Facebook",
      birthDate: "10/07/2002",
      phone: "0912589426",
      status: "",
    },
    {
      name: "Jane Doe",
      email: "jane.doe@gmail.com",
      inspection: "Google",
      birthDate: "12/12/1990",
      phone: "0912345678",
      status: "",
    },
  ]);

  return (
    <div className="min-h-screen bg-gray-100 flex flex-col">
      {/* Filter Bar */}
      <Fillterbar />

      {/* Main Layout */}
      <div className="flex px-12 pt-12 gap-14">
        {/* Sidebar */}
        <div className="lg:w-72">
          <Sidebar />
        </div>

        {/* Main Content */}
        <div className="flex-1 bg-white shadow-md rounded-lg p-6 border border-gray-200">
          <h1 className="text-xl font-bold text-[#65558F] mb-4 flex items-center">
            <img
              src={Images.inspection}
              alt="Inspection Icon"
              className="w-6 h-6 mr-2"
            />
            การตรวจสอบ
          </h1>
          <hr className="border-gray-300 mb-6" />

          {/* Search Bar */}
          <SearchBar />

          {/* Inspection Table */}
          <InspectionTable users={users} setUsers={setUsers} />
        </div>
      </div>
    </div>
  );
};

export default InspecPage;
