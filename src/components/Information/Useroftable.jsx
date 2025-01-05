import React, { useState } from "react";
import Images from "../../assets";
import ConfirmationModal from "../popup/ConfirmationModal";

const Useroftable = ({ onRowSelected }) => {
  const [users, setUsers] = useState([
    {
      name: "John Doe",
      email: "john.doe@gmail.com",
      role: "ผู้ให้บริการ",
      birthDate: "10/07/2002",
      phone: "0912589426",
      isSelected: false,
    },
    {
      name: "Jane Doe",
      email: "jane.doe@gmail.com",
      role: "ผู้ใช้บริการ",
      birthDate: "12/12/1990",
      phone: "0912345678",
      isSelected: false,
    },
  ]);

  const [allSelected, setAllSelected] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalAction, setModalAction] = useState(null);
  const [editRows, setEditRows] = useState([]);
  const [selectedUsers, setSelectedUsers] = useState([]);

  // Handle Select All
  const handleSelectAll = () => {
    const newSelectedState = !allSelected;
    setAllSelected(newSelectedState);
    setUsers((prevUsers) =>
      prevUsers.map((user) => ({ ...user, isSelected: newSelectedState }))
    );
    setSelectedUsers(newSelectedState ? [...users] : []);
    onRowSelected(newSelectedState ? users.length : 0);
  };

  // Handle Row Select
  const handleRowSelect = (index) => {
    const updatedUsers = [...users];
    updatedUsers[index].isSelected = !updatedUsers[index].isSelected;
    setUsers(updatedUsers);

    const selected = updatedUsers.filter((user) => user.isSelected);
    setSelectedUsers(selected);

    const selectedCount = selected.length;
    onRowSelected(selectedCount);

    setAllSelected(updatedUsers.every((user) => user.isSelected));
  };

  // เปิด Modal
  const openModal = (action) => {
    setModalAction(action);
    setIsModalOpen(true);
  };

  // ปิด Modal
  const closeModal = () => {
    setIsModalOpen(false);
    setModalAction(null);
    setEditRows([]);
  };

  // ยืนยันการกระทำ
  const confirmModalAction = () => {
    if (modalAction === "edit") {
      const updatedUsers = [...users];
      selectedUsers.forEach((selectedUser) => {
        const index = updatedUsers.findIndex(
          (user) => user.email === selectedUser.email
        );
        if (index !== -1) {
          updatedUsers[index] = { ...selectedUser };
        }
      });
      setUsers(updatedUsers);
    } else if (modalAction === "delete") {
      const updatedUsers = users.filter(
        (user) => !selectedUsers.some((selected) => selected.email === user.email)
      );
      setUsers(updatedUsers);
      setSelectedUsers([]);
    }
    closeModal();
  };

  // แก้ไข Row
  const handleEditRows = () => {
    const updatedEditRows = selectedUsers.map((user) => ({
      ...user,
      isEditing: true,
    }));
    setEditRows(updatedEditRows);
    openModal("edit");
  };

  // Handle View History
  const handleViewHistory = (user) => {
    alert(`ประวัติของ ${user.name}`);
  };

  return (
    <div className="mt-6 overflow-x-auto">
      <table className="w-full table-auto border-collapse bg-white rounded-lg shadow-md">
        <thead>
          <tr className="bg-gray-100 text-[#8A92A6] font-sans">
            <th className="p-4 text-left">
              <input
                type="checkbox"
                className="w-4 h-4"
                checked={allSelected}
                onChange={handleSelectAll}
              />
            </th>
            <th className="p-4 text-left cursor-pointer">
              ชื่อผู้ใช้
              <img
                src={Images.FilterDown}
                alt="Filter"
                className="inline w-3 h-3 ml-2"
              />
            </th>
            <th className="p-4 text-left cursor-pointer">
              ผู้ใช้งาน
              <img
                src={Images.FilterDown}
                alt="Filter"
                className="inline w-3 h-3 ml-2"
              />
            </th>
            <th className="p-4 text-left cursor-pointer">
              วัน/เดือน/ปีเกิด
              <img
                src={Images.FilterDown}
                alt="Filter"
                className="inline w-3 h-3 ml-2"
              />
            </th>
            <th className="p-4 text-left cursor-pointer">
              เบอร์โทร
              <img
                src={Images.FilterDown}
                alt="Filter"
                className="inline w-3 h-3 ml-2"
              />
            </th>
          </tr>
        </thead>
        <tbody>
          {users.map((user, index) => (
            <tr
              key={index}
              className="border-t hover:bg-gray-50 font-sans relative"
            >
              <td className="p-4">
                <input
                  type="checkbox"
                  className="w-4 h-4"
                  checked={user.isSelected}
                  onChange={() => handleRowSelect(index)}
                />
              </td>
              <td className="p-4 flex items-center gap-3">
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
              <td className="p-4">{user.role}</td>
              <td className="p-4">{user.birthDate}</td>
              <td className="p-4">{user.phone}</td>
              <td className="p-4">
                <button
                  onClick={() => handleViewHistory(user)}
                  className="text-purple-500 hover:underline"
                >
                  ดูประวัติ
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      {/* ปุ่มแก้ไขและลบ */}
      <div className="fixed bottom-4 right-4 flex gap-4">
        <button
          onClick={handleEditRows}
          className="flex items-center gap-2 px-4 py-2 bg-[#B6AFCA] text-black rounded-lg shadow hover:bg-[#a496be]"
        >
          แก้ไข
        </button>
        <button
          onClick={() => openModal("delete")}
          className="flex items-center gap-2 px-4 py-2 border border-[#B6AFCA] text-black rounded-lg shadow hover:bg-gray-100"
        >
          ลบ
        </button>
      </div>

      {/* Confirmation Modal */}
      <ConfirmationModal
        isOpen={isModalOpen}
        onClose={closeModal}
        onConfirm={confirmModalAction}
        title={
          modalAction === "edit"
            ? "ยืนยันการแก้ไขข้อมูล"
            : "ยืนยันการลบข้อมูล"
        }
        message={
          modalAction === "edit"
            ? "คุณต้องการบันทึกการแก้ไขข้อมูลหรือไม่?"
            : "คุณต้องการลบข้อมูลนี้หรือไม่?"
        }
      />
    </div>
  );
};

export default Useroftable;
