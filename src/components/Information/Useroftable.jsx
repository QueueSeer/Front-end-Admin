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
      isEditing: false,
    },
    {
      name: "Jane Doe",
      email: "jane.doe@gmail.com",
      role: "ผู้ใช้บริการ",
      birthDate: "12/12/1990",
      phone: "0912345678",
      isSelected: false,
      isEditing: false,
    },
  ]);

  const [allSelected, setAllSelected] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalAction, setModalAction] = useState(null);
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
          updatedUsers[index].isEditing = false; // ปิดสถานะแก้ไข
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
    const updatedUsers = [...users].map((user) => {
      if (user.isSelected) {
        return { ...user, isEditing: true };
      }
      return user;
    });
    setUsers(updatedUsers);
    openModal("edit");
  };

  // Handle View History
  const handleViewHistory = (user) => {
    alert(`ประวัติของ ${user.name}`);
  };

  return (
    <div className="mt-6 overflow-x-auto">
  <table className="min-w-full table-auto border-collapse bg-white rounded-lg shadow-md">
    <thead>
      <tr className="bg-gray-100 text-[#8A92A6] font-sans">
        <th className="p-4 text-left min-w-[40px]">
        </th>
        <th className="p-4 text-left min-w-[200px] cursor-pointer">
          ชื่อผู้ใช้
          <img
            src={Images.FilterDown}
            alt="Filter"
            className="inline w-3 h-3 ml-2"
          />
        </th>
        <th className="p-4 text-left min-w-[150px] cursor-pointer">
          ผู้ใช้งาน
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
        <th className="p-4 text-left min-w-[100px] bg-gray-100">
          ดูประวัติ
        </th>
      </tr>
    </thead>
    <tbody>
      {users.map((user, index) => (
        <tr
          key={index}
          className="border-t hover:bg-gray-50 font-sans relative"
        >
          <td className="p-4 min-w-[40px]">
           
          </td>
          <td className="p-4 flex items-center gap-3 min-w-[200px]">
            <img
              src={Images.member}
              alt="User Avatar"
              className="w-12 h-12 rounded-full"
            />
            {user.isEditing ? (
              <input
                type="text"
                defaultValue={user.name}
                className="p-1 border rounded w-full"
              />
            ) : (
              <div>
                <p className="font-medium">{user.name}</p>
                <p className="text-gray-500 text-sm">{user.email}</p>
              </div>
            )}
          </td>
          <td className="p-4 min-w-[150px]">{user.role}</td>
          <td className="p-4 min-w-[150px]">{user.birthDate}</td>
          <td className="p-4 min-w-[150px]">{user.phone}</td>
          <td className="p-4 min-w-[100px]">
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
</div>

  );
};

export default Useroftable;
