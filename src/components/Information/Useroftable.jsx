import React, { useEffect, useState } from "react";
import Images from "../../assets";
import ConfirmationModal from "../popup/ConfirmationModal";

const Useroftable = ({ onRowSelected, users = [], onLoadDetails, loading }) => {
  const [selectedUsers, setSelectedUsers] = useState([]);
  const [allSelected, setAllSelected] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalAction, setModalAction] = useState(null);
  const [showDetailView, setShowDetailView] = useState(false);
  const [selectedUserDetail, setSelectedUserDetail] = useState(null);
  const [detailLoading, setDetailLoading] = useState(false);
  
  // อัปเดต selectedRows เมื่อมีการเปลี่ยนแปลงใน users หรือ selectedUsers
  useEffect(() => {
    if (onRowSelected) {
      onRowSelected(selectedUsers.length);
    }
  }, [selectedUsers, onRowSelected]);

  // แสดงข้อมูลจริงจาก API หรือข้อมูลเริ่มต้นถ้าไม่มี
  const displayUsers = users.length > 0 ? users : [
    {
      id: 1,
      display_name: "John Doe",
      email: "john.doe@gmail.com",
      role: "ผู้ให้บริการ",
      birthdate: "10/07/2002",
      phone_number: "0912589426",
      image: "",
      isSelected: false
    },
    {
      id: 2,
      display_name: "Jane Doe",
      email: "jane.doe@gmail.com",
      role: "ผู้ใช้บริการ",
      birthdate: "12/12/1990",
      phone_number: "0912345678",
      image: "",
      isSelected: false
    }
  ];

  // Handle Select All
  const handleSelectAll = () => {
    const newSelectedState = !allSelected;
    setAllSelected(newSelectedState);
    
    setSelectedUsers(newSelectedState ? [...displayUsers] : []);
    
    if (onRowSelected) {
      onRowSelected(newSelectedState ? displayUsers.length : 0);
    }
  };

  // Handle Row Select
  const handleRowSelect = (user) => {
    const isAlreadySelected = selectedUsers.some(selected => 
      selected.id === user.id
    );
    
    if (isAlreadySelected) {
      setSelectedUsers(selectedUsers.filter(selected => 
        selected.id !== user.id
      ));
    } else {
      setSelectedUsers([...selectedUsers, user]);
    }
    
    // ตรวจสอบว่าทั้งหมดถูกเลือกหรือไม่
    setAllSelected(!isAlreadySelected && selectedUsers.length === displayUsers.length - 1);
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
    // ดำเนินการตาม action (edit หรือ delete)
    closeModal();
  };

  // Handle View History
  const handleViewHistory = async (user) => {
    try {
      setDetailLoading(true); // แสดงการโหลดข้อมูล
      
      if (onLoadDetails) {
        // เรียกใช้ฟังก์ชัน onLoadDetails เพื่อโหลดข้อมูลเพิ่มเติม
        console.log(`กำลังโหลดข้อมูลเพิ่มเติมสำหรับผู้ใช้ ID: ${user.id}`);
        const detailData = await onLoadDetails(user.id);
        
        if (detailData) {
          console.log("ได้รับข้อมูลเพิ่มเติม:", detailData);
          
          // รวมข้อมูลเดิมกับข้อมูลใหม่
          const completeUserData = {
            ...user,
            ...detailData,
            // กำหนดค่าเริ่มต้นสำหรับฟิลด์ที่จำเป็น
            username: detailData.username || user.username || "-",
            display_name: detailData.display_name || user.display_name || "-",
            first_name: detailData.first_name || user.first_name || "-",
            last_name: detailData.last_name || user.last_name || "-",
            email: detailData.email || user.email || "-",
            birthdate: detailData.birthdate || user.birthdate || "-",
            phone_number: detailData.phone_number || user.phone_number || "-",
            image: detailData.image || user.image || "",
            coins: detailData.coins !== undefined ? detailData.coins : (user.coins !== undefined ? user.coins : 0)
          };
          
          console.log("ข้อมูลผู้ใช้ที่สมบูรณ์:", completeUserData);
          
          // บันทึกลงใน state
          setSelectedUserDetail(completeUserData);
          
          // แสดงหน้ารายละเอียด
          setShowDetailView(true);
        } else {
          console.log("ไม่สามารถดึงข้อมูลเพิ่มเติมได้ ใช้ข้อมูลที่มีอยู่:", user);
          setSelectedUserDetail(user);
          setShowDetailView(true);
        }
      } else {
        // ถ้าไม่มี onLoadDetails ให้แสดงข้อมูลที่มีอยู่
        console.log("ไม่มีฟังก์ชัน onLoadDetails ใช้ข้อมูลที่มีอยู่:", user);
        setSelectedUserDetail(user);
        setShowDetailView(true);
      }
    } catch (error) {
      console.error("Error in handleViewHistory:", error);
      // แม้จะมีข้อผิดพลาด ก็ยังแสดงข้อมูลที่มีอยู่
      setSelectedUserDetail(user);
      setShowDetailView(true);
    } finally {
      setDetailLoading(false);
    }
  };

  // ปิดหน้าแสดงรายละเอียด
  const closeDetailView = () => {
    setShowDetailView(false);
    setSelectedUserDetail(null);
  };

  // ตรวจสอบว่า user ถูกเลือกหรือไม่
  const isUserSelected = (user) => {
    return selectedUsers.some(selected => selected.id === user.id);
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
      console.error("Error formatting date:", error);
      return dateString;
    }
  };

  // หน้าแสดงรายละเอียดผู้ใช้
  const UserDetailView = () => {
    if (!selectedUserDetail) return null;

    // แปลงวันที่ให้อยู่ในรูปแบบที่อ่านง่าย
    const formatDetailDate = (dateString) => {
      if (!dateString || dateString === "-") return "-";
      
      try {
        const date = new Date(dateString);
        if (isNaN(date.getTime())) return dateString; // ถ้าแปลงไม่ได้ให้คืนค่าเดิม
        
        return date.toLocaleDateString('th-TH', {
          day: 'numeric',
          month: 'long',
          year: 'numeric'
        });
      } catch (error) {
        console.error("Error formatting date:", error);
        return dateString;
      }
    };
    
    // แสดงข้อมูลดีบัก
    console.log("UserDetailView - ข้อมูลผู้ใช้:", selectedUserDetail);
    
    // ตรวจสอบและฟอร์แมตวันเกิด
    const birthdate = formatDetailDate(selectedUserDetail.birthdate);
    console.log("Formatted birthdate:", birthdate);

    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
        <div className="bg-white rounded-lg shadow-xl p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
          <div className="flex justify-between items-start mb-6">
            <h2 className="text-2xl font-bold text-gray-800">รายละเอียดผู้ใช้งาน</h2>
            <button 
              onClick={closeDetailView}
              className="text-gray-500 hover:text-gray-700 text-xl"
            >
              &times;
            </button>
          </div>
          
          <div className="flex flex-col md:flex-row gap-6">
            <div className="md:w-1/3 flex flex-col items-center">
              {selectedUserDetail.image ? (
                <img 
                  src={selectedUserDetail.image} 
                  alt={selectedUserDetail.display_name} 
                  className="w-40 h-40 rounded-full object-cover border-4 border-purple-100"
                  onError={(e) => {
                    console.log("Error loading image, using fallback");
                    e.target.onerror = null;
                    e.target.src = Images.member; // ใช้รูปภาพสำรองเมื่อโหลดไม่สำเร็จ
                  }}
                />
              ) : (
                <img 
                  src={Images.member} 
                  alt="Default Avatar" 
                  className="w-40 h-40 rounded-full object-cover border-4 border-purple-100"
                />
              )}
              <h3 className="text-xl font-semibold mt-4 text-center">{selectedUserDetail.display_name || "ไม่ระบุชื่อ"}</h3>
              <p className="text-gray-500 text-center">{selectedUserDetail.email || "-"}</p>
              <p className="text-sm bg-purple-100 text-purple-700 px-3 py-1 rounded-full mt-2">
                {selectedUserDetail.role || "ผู้ใช้งานทั่วไป"}
              </p>
            </div>
            
            <div className="md:w-2/3">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="border-b pb-3">
                  <p className="text-sm text-gray-500">ID ผู้ใช้</p>
                  <p className="font-medium">{selectedUserDetail.id || "-"}</p>
                </div>
                
                <div className="border-b pb-3">
                  <p className="text-sm text-gray-500">ชื่อผู้ใช้ (Username)</p>
                  <p className="font-medium">{selectedUserDetail.username || "-"}</p>
                </div>
                
                <div className="border-b pb-3">
                  <p className="text-sm text-gray-500">ชื่อ</p>
                  <p className="font-medium">{selectedUserDetail.first_name || "-"}</p>
                </div>
                
                <div className="border-b pb-3">
                  <p className="text-sm text-gray-500">นามสกุล</p>
                  <p className="font-medium">{selectedUserDetail.last_name || "-"}</p>
                </div>
                
                <div className="border-b pb-3">
                  <p className="text-sm text-gray-500">เบอร์โทรศัพท์</p>
                  <p className="font-medium">{selectedUserDetail.phone_number || "-"}</p>
                </div>
                
                <div className="border-b pb-3">
                  <p className="text-sm text-gray-500">วันเกิด</p>
                  <p className="font-medium">{birthdate}</p>
                </div>
                
                <div className="border-b pb-3">
                  <p className="text-sm text-gray-500">Coins</p>
                  <p className="font-medium">{selectedUserDetail.coins !== undefined ? selectedUserDetail.coins : "-"}</p>
                </div>
                
                <div className="border-b pb-3">
                  <p className="text-sm text-gray-500">อีเมล</p>
                  <p className="font-medium">{selectedUserDetail.email || "-"}</p>
                </div>
              </div>
              
              <div className="mt-4 p-3 bg-gray-50 rounded-md">
                <h4 className="text-md font-medium text-gray-700 mb-2">ข้อมูลเพิ่มเติม</h4>
                <div className="text-sm text-gray-600">
                  <p>ข้อมูลนี้อัปเดตล่าสุดเมื่อ: {new Date().toLocaleString('th-TH')}</p>
                  {!selectedUserDetail.first_name && !selectedUserDetail.phone_number && (
                    <p className="text-yellow-600 mt-1">
                      ยังไม่มีข้อมูลส่วนตัวของผู้ใช้นี้ในระบบ
                    </p>
                  )}
                </div>
              </div>
            </div>
          </div>
          
          <div className="mt-6 flex justify-end">
            <button 
              onClick={closeDetailView}
              className="bg-gray-200 hover:bg-gray-300 text-gray-800 px-4 py-2 rounded mr-2"
            >
              ปิด
            </button>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="mt-6 overflow-x-auto">
      {loading && (
        <div className="text-center p-4">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-purple-500"></div>
          <p className="mt-2 text-gray-600">กำลังโหลดข้อมูล...</p>
        </div>
      )}
      
      {!loading && displayUsers.length === 0 && (
        <div className="text-center p-8 bg-gray-50 rounded-lg border border-gray-200">
          <div className="text-gray-500">ไม่พบข้อมูลผู้ใช้</div>
        </div>
      )}
      
      {!loading && displayUsers.length > 0 && (
        <table className="min-w-full table-auto border-collapse bg-white rounded-lg shadow-md">
          <thead>
            <tr className="bg-gray-100 text-[#8A92A6] font-sans">
              <th className="p-4 text-left min-w-[40px]">
                <input
                  type="checkbox"
                  checked={allSelected}
                  onChange={handleSelectAll}
                  className="form-checkbox h-5 w-5 text-purple-600 rounded focus:ring-purple-500"
                />
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
            {displayUsers.map((user, index) => {
              return (
                <tr
                  key={index}
                  className={`border-t hover:bg-gray-50 font-sans relative ${
                    isUserSelected(user) ? "bg-purple-50" : ""
                  }`}
                >
                  <td className="p-4 min-w-[40px]">
                    <input
                      type="checkbox"
                      checked={isUserSelected(user)}
                      onChange={() => handleRowSelect(user)}
                      className="form-checkbox h-5 w-5 text-purple-600 rounded focus:ring-purple-500"
                    />
                  </td>
                  <td className="p-4 flex items-center gap-3 min-w-[200px]">
                    {user.image ? (
                      <img
                        src={user.image}
                        alt={user.display_name}
                        className="w-12 h-12 rounded-full object-cover"
                        onError={(e) => {
                          e.target.onerror = null;
                          e.target.src = Images.member; // ใช้รูปภาพสำรองเมื่อโหลดไม่สำเร็จ
                        }}
                      />
                    ) : (
                      <img
                        src={Images.member}
                        alt="Default Avatar"
                        className="w-12 h-12 rounded-full"
                      />
                    )}
                    <div>
                      <p className="font-medium">{user.display_name || "ไม่ระบุชื่อ"}</p>
                      <p className="text-gray-500 text-sm">{user.email || "-"}</p>
                    </div>
                  </td>
                  <td className="p-4 min-w-[150px]">{user.role || "ผู้ใช้งานทั่วไป"}</td>
                  <td className="p-4 min-w-[150px]">
                    {/* แสดง birthdate หากมีข้อมูล หรือข้อความว่าง */}
                    <span className="whitespace-nowrap">
                      {formatDate(user.birthdate) || "-"}
                    </span>
                  </td>
                  <td className="p-4 min-w-[150px]">
                    {/* แสดงเบอร์โทรหากมีข้อมูล หรือข้อความว่าง */}
                    <span className="whitespace-nowrap">
                      {user.phone_number || "-"}
                    </span>
                  </td>
                  <td className="p-4 min-w-[100px]">
                    <button
                      onClick={() => handleViewHistory(user)}
                      className="text-purple-500 hover:underline"
                      disabled={detailLoading}
                    >
                      {detailLoading ? "กำลังโหลด..." : "ดูประวัติ"}
                    </button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      )}
      
      {showDetailView && <UserDetailView />}
      
      {isModalOpen && (
        <ConfirmationModal
          isOpen={isModalOpen}
          onClose={closeModal}
          onConfirm={confirmModalAction}
          title={modalAction === "edit" ? "ยืนยันการแก้ไข" : "ยืนยันการลบ"}
          message={
            modalAction === "edit"
              ? "คุณต้องการบันทึกการเปลี่ยนแปลงหรือไม่?"
              : "คุณต้องการลบผู้ใช้ที่เลือกหรือไม่?"
          }
        />
      )}
    </div>
  );
};

export default Useroftable;