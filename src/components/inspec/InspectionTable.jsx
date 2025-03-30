import React, { useState } from "react";
import Images from "../../assets";
import ConfirmInspect from "../../components/popup/ConfirmInspect";
import axios from "axios"; // เพิ่ม import axios

// กำหนดค่า base URL
const API_BASE_URL = "https://backend.qseer.app";

const InspectionTable = ({ users, setUsers, detailsLoading = {} }) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedAction, setSelectedAction] = useState(null); // เก็บข้อมูลของผู้ใช้งานที่เลือก
  const [loading, setLoading] = useState(false);
  const [actionLoading, setActionLoading] = useState({});
  const [error, setError] = useState(null);
  const [editInspectionId, setEditInspectionId] = useState(null);
  const [editInspectionValue, setEditInspectionValue] = useState("");

  // ฟังก์ชันสำหรับเรียก API ยืนยันหมอดู
  const verifySeer = async (seerId, isVerified) => {
    try {
      // เริ่มโหลดสำหรับหมอดูนี้
      setActionLoading(prev => ({...prev, [seerId]: true}));
      
      console.log(`กำลังยืนยันหมอดู ID: ${seerId}, Verified: ${isVerified}`);
      
      // เรียก API PATCH /api/seer/{seer_id}/verify
      const response = await axios({
        method: 'PATCH',
        url: `${API_BASE_URL}/api/seer/${seerId}/verify`,
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json',
        },
        withCredentials: true, // ส่ง cookies ไปด้วย
        data: {
          is_verified: isVerified // ส่งค่า true หรือ false ตามสถานะการยืนยัน
        }
      });
      
      console.log(`ยืนยันหมอดู ID: ${seerId} สำเร็จ:`, response.data);
      return response.data;
    } catch (error) {
      console.error(`เกิดข้อผิดพลาดในการยืนยันหมอดู ID: ${seerId}`, error);
      
      if (error.response) {
        if (error.response.status === 403) {
          setError("ไม่มีสิทธิ์ในการยืนยันหมอดู กรุณาเข้าสู่ระบบใหม่ด้วยบัญชีผู้ดูแลระบบ");
        } else if (error.response.status === 401) {
          setError("กรุณาเข้าสู่ระบบใหม่");
        } else {
          setError(`เกิดข้อผิดพลาด: ${error.response.status} - ${error.response.data?.detail || error.message}`);
        }
      } else {
        setError(`เกิดข้อผิดพลาด: ${error.message}`);
      }
      
      throw error;
    } finally {
      // เสร็จสิ้นการโหลดสำหรับหมอดูนี้
      setActionLoading(prev => ({...prev, [seerId]: false}));
    }
  };

  const handleStatusChange = async (index, status) => {
    try {
      const user = users[index];
      
      if (!user || !user.id) {
        alert("ไม่พบ ID ของหมอดู ไม่สามารถดำเนินการได้");
        return;
      }
      
      const isVerified = status === "pass"; // ถ้า status เป็น "pass" ให้ส่ง is_verified เป็น true
      
      // เรียก API เพื่อยืนยันหมอดู
      await verifySeer(user.id, isVerified);
      
      // อัปเดตข้อมูลในตาราง
      const updatedUsers = [...users];
      updatedUsers[index].status = isVerified ? "ผ่านการตรวจสอบ" : "ไม่ผ่านการตรวจสอบ";
      updatedUsers[index].verified_at = isVerified ? new Date().toISOString() : null;
      setUsers(updatedUsers);
      
      // แสดงข้อความแจ้งเตือนสำเร็จ
      alert(`ยืนยันหมอดู ${user.name} ${isVerified ? "ผ่าน" : "ไม่ผ่าน"} การตรวจสอบเรียบร้อย`);
      
    } catch (error) {
      // แสดงข้อความแจ้งเตือนเมื่อเกิดข้อผิดพลาด
      alert(`เกิดข้อผิดพลาด: ${error.message}`);
    }
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

  // แปลงวันที่ให้อยู่ในรูปแบบที่อ่านง่าย
  const formatDate = (dateString) => {
    if (!dateString) return "-";
    
    try {
      const date = new Date(dateString);
      if (isNaN(date.getTime())) return dateString; // ถ้าแปลงไม่ได้ให้คืนค่าเดิม
      
      return date.toLocaleDateString('th-TH', {
        day: 'numeric',
        month: 'numeric',
        year: 'numeric'
      });
    } catch (error) {
      return dateString;
    }
  };
  
  // ฟังก์ชันจัดการการแก้ไขช่องทางตรวจสอบ
  const handleEditInspection = (userId, value) => {
    setEditInspectionId(userId);
    setEditInspectionValue(value);
  };
  
  // ฟังก์ชันบันทึกการเปลี่ยนแปลงช่องทางตรวจสอบ
  const saveInspectionChange = (index) => {
    // อัปเดตข้อมูลในตาราง
    const updatedUsers = [...users];
    updatedUsers[index].inspection = editInspectionValue;
    setUsers(updatedUsers);
    
    // ปิดโหมดแก้ไข
    setEditInspectionId(null);
    setEditInspectionValue("");
  };

  return (
    <div className="mt-6 overflow-x-auto">
      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4 flex justify-between items-center">
          <span>{error}</span>
          <button 
            className="font-bold text-xl" 
            onClick={() => setError(null)}
          >
            &times;
          </button>
        </div>
      )}
      
      {loading && (
        <div className="text-center p-4">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-purple-500"></div>
          <p className="mt-2 text-gray-600">กำลังดำเนินการ...</p>
        </div>
      )}
      
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
              ตรวจสอบผ่าน
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
          {users.length === 0 ? (
            <tr>
              <td colSpan="6" className="text-center py-4 text-gray-500">
                ไม่พบข้อมูลหมอดู
              </td>
            </tr>
          ) : (
            users.map((user, index) => (
              <tr
                key={index}
                className="border-t hover:bg-gray-50 font-sans relative"
              >
                {/* คอลัมน์ชื่อผู้ใช้ */}
                <td className="p-4 min-w-[40px]"></td>
                <td className="p-4 flex items-center gap-3 min-w-[200px]">
                  <img
                    src={user.image || Images.member}
                    alt="User Avatar"
                    className="w-12 h-12 rounded-full object-cover"
                    onError={(e) => {
                      e.target.onerror = null;
                      e.target.src = Images.member;
                    }}
                  />
                  <div>
                    <p className="font-medium">{user.name}</p>
                    {detailsLoading[user.id] ? (
                      <p className="text-gray-400 text-sm">กำลังโหลดข้อมูล...</p>
                    ) : (
                      <p className="text-gray-500 text-sm">{user.email || "-"}</p>
                    )}
                  </div>
                </td>

                {/* คอลัมน์ตรวจสอบ */}
                <td className="p-4 min-w-[120px]">
                  {editInspectionId === user.id ? (
                    <div className="flex items-center">
                      <select
                        className="border rounded px-2 py-1 w-[120px] text-sm"
                        value={editInspectionValue}
                        onChange={(e) => setEditInspectionValue(e.target.value)}
                      >
                        <option value="Facebook">Facebook</option>
                        <option value="Google">Google</option>
                        <option value="Twitter">Twitter</option>
                        <option value="Line">Line</option>
                        <option value="อื่นๆ">อื่นๆ</option>
                      </select>
                      <button 
                        className="ml-2 text-green-500 hover:text-green-700"
                        onClick={() => saveInspectionChange(index)}
                      >
                        ✓
                      </button>
                      <button 
                        className="ml-1 text-red-500 hover:text-red-700"
                        onClick={() => setEditInspectionId(null)}
                      >
                        ✕
                      </button>
                    </div>
                  ) : (
                    <div 
                      className="px-2 py-1 bg-gray-100 rounded text-sm cursor-pointer hover:bg-gray-200 inline-block"
                      onClick={() => handleEditInspection(user.id, user.inspection || "Facebook")}
                    >
                      {user.inspection || "ไม่ระบุ"}
                      <span className="ml-1 text-gray-400 text-xs">✎</span>
                    </div>
                  )}
                </td>

                {/* คอลัมน์วัน/เดือน/ปีเกิด */}
                <td className="p-4 min-w-[150px]">
                  {detailsLoading[user.id] ? (
                    <span className="text-gray-400 text-sm">กำลังโหลด...</span>
                  ) : (
                    user.birthDate || "-"
                  )}
                </td>

                {/* คอลัมน์เบอร์โทร */}
                <td className="p-4 min-w-[150px]">
                  {detailsLoading[user.id] ? (
                    <span className="text-gray-400 text-sm">กำลังโหลด...</span>
                  ) : (
                    user.phone || "-"
                  )}
                </td>

                {/* คอลัมน์สถานะ */}
                <td className="p-4 min-w-[150px]">
                  {actionLoading[user.id] ? (
                    <span className="text-sm text-gray-500">กำลังดำเนินการ...</span>
                  ) : user.status === "ผ่านการตรวจสอบ" || user.status === "ไม่ผ่านการตรวจสอบ" ? (
                    <div>
                      <span
                        className={`px-3 py-1 rounded-full text-white ${
                          user.status === "ผ่านการตรวจสอบ"
                            ? "bg-green-500"
                            : "bg-gray-400"
                        }`}
                      >
                        {user.status}
                      </span>
                      {user.verified_at && (
                        <div className="text-xs text-gray-500 mt-1">
                          {formatDate(user.verified_at)}
                        </div>
                      )}
                    </div>
                  ) : (
                    <div className="flex gap-2">
                      <button
                        onClick={() => openModal(index, "pass")}
                        className="px-3 py-1 text-white bg-green-500 rounded hover:bg-green-600"
                        disabled={actionLoading[user.id]}
                      >
                        ผ่าน
                      </button>
                      <button
                        onClick={() => openModal(index, "fail")}
                        className="px-3 py-1 text-white bg-gray-400 rounded hover:bg-gray-500"
                        disabled={actionLoading[user.id]}
                      >
                        ไม่ผ่าน
                      </button>
                    </div>
                  )}
                </td>
              </tr>
            ))
          )}
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