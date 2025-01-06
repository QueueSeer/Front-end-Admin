import React, { useState } from "react";
import Images from "../../assets";
import ConfirmInspect from "../../components/popup/ConfirmInspect";

const InspectionTable = ({ users, setUsers }) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedAction, setSelectedAction] = useState(null); // เก็บข้อมูลของผู้ใช้งานที่เลือก

  const handleStatusChange = (index, status) => {
    const updatedUsers = [...users];
    updatedUsers[index].status =
      status === "pass" ? "ผ่านการตรวจสอบ" : "ไม่ผ่านการตรวจสอบ";
    setUsers(updatedUsers);
  };

  const openModal = (index, action) => {
    setSelectedAction({ index, action });
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setSelectedAction(null);
    setIsModalOpen(false);
  };

  const confirmAction = () => {
    if (selectedAction) {
      handleStatusChange(
        selectedAction.index,
        selectedAction.action === "pass" ? "pass" : "fail"
      );
    }
    closeModal();
  };

  return (
    <div className="mt-6 overflow-x-auto">
      <table className="min-w-full table-auto border-collapse bg-white rounded-lg shadow-md">
        <thead>
          <tr className="bg-gray-100 text-[#8A92A6] font-sans">
            <th className="p-4 text-left min-w-[40px]"></th>
            <th className="p-4 text-left min-w-[200px] cursor-pointer">
              ชื่อผู้ใช้
              <img
                src={Images.FilterDown}
                alt="Filter"
                className="inline w-3 h-3 ml-2"
              />
            </th>
            <th className="p-4 text-left min-w-[120px] cursor-pointer">
              ตรวจสอบ
              <img
                src={Images.FilterDown}
                alt="Filter"
                className="inline w-3 h-3 ml-2"
              />
            </th>
            <th className="p-4 text-left min-w-[150px] cursor-pointer">
              วัน/เดือน/ปีเกิด
              <img
                src={Images.FilterDown}
                alt="Filter"
                className="inline w-3 h-3 ml-2"
              />
            </th>
            <th className="p-4 text-left min-w-[150px] cursor-pointer">
              เบอร์โทร
              <img
                src={Images.FilterDown}
                alt="Filter"
                className="inline w-3 h-3 ml-2"
              />
            </th>
            <th className="p-4 text-left min-w-[150px]">สถานะ</th>
          </tr>
        </thead>
        <tbody>
          {users.map((user, index) => (
            <tr
              key={index}
              className="border-t hover:bg-gray-50 font-sans relative"
            >
              {/* คอลัมน์ชื่อผู้ใช้ */}
              <td className="p-4 min-w-[40px]"></td>
              <td className="p-4 flex items-center gap-3 min-w-[200px]">
                <img
                  src={Images.member}
                  alt="User Avatar"
                  className="w-12 h-12 rounded-full"
                />
                <div>
                  <p className="font-medium">{user.name}</p>
                  <p className="text-gray-500 text-sm">{user.email}</p>
                </div>
              </td>

              {/* คอลัมน์ตรวจสอบ */}
              <td className="p-4 min-w-[120px]">
                <select
                  className="border rounded px-2 py-1 w-[120px] text-sm"
                  value={user.inspection || "Facebook"}
                  onChange={(e) => {
                    const updatedUsers = [...users];
                    updatedUsers[index].inspection = e.target.value;
                    setUsers(updatedUsers);
                  }}
                >
                  <option value="Facebook">Facebook</option>
                  <option value="Google">Google</option>
                  <option value="Twitter">Twitter</option>
                </select>
              </td>

              {/* คอลัมน์วัน/เดือน/ปีเกิด */}
              <td className="p-4 min-w-[150px]">{user.birthDate}</td>

              {/* คอลัมน์เบอร์โทร */}
              <td className="p-4 min-w-[150px]">{user.phone}</td>

              {/* คอลัมน์สถานะ */}
              <td className="p-4 min-w-[150px]">
                {user.status === "ผ่านการตรวจสอบ" ||
                user.status === "ไม่ผ่านการตรวจสอบ" ? (
                  <span
                    className={`px-3 py-1 rounded-full text-white ${
                      user.status === "ผ่านการตรวจสอบ"
                        ? "bg-green-500"
                        : "bg-gray-400"
                    }`}
                  >
                    {user.status}
                  </span>
                ) : (
                  <div className="flex gap-2">
                    <button
                      onClick={() => openModal(index, "pass")}
                      className="px-3 py-1 text-white bg-green-500 rounded hover:bg-green-600"
                    >
                      ผ่าน
                    </button>
                    <button
                      onClick={() => openModal(index, "fail")}
                      className="px-3 py-1 text-white bg-gray-400 rounded hover:bg-gray-500"
                    >
                      ไม่ผ่าน
                    </button>
                  </div>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      {/* ใช้ ConfirmationModal Component */}
      <ConfirmInspect
        isOpen={isModalOpen}
        action={selectedAction?.action}
        onClose={closeModal}
        onConfirm={confirmAction}
      />
    </div>
  );
};

export default InspectionTable;
