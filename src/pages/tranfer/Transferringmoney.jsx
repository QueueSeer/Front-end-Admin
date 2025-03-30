import React, { useState, useEffect } from "react";
import axios from "axios";
import Images from "../../assets";
import Fillterbar from "../../components/Fillterbar";
import Sidebar from "../../components/Sidebar";
import FilterTabs from "../../components/Tranferring/FilterTabs";
import OverviewCard from "../../components/Tranferring/OverviewCard";
import TransactionTable from "../../components/Tranferring/TransactionTable";
import ConfirmationModal from "../../components/popup/ConfirmationModal";

// กำหนดค่า base URL
const API_BASE_URL = "https://backend.qseer.app";

export default function Transferringmoney() {
    const [activeTab, setActiveTab] = useState("ทั้งหมด");
    const [activeStatus, setActiveStatus] = useState("วันนี้");
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [modalData, setModalData] = useState(null);
    const [transactions, setTransactions] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [pagination, setPagination] = useState({
      lastId: null,
      limit: 10,
      hasMore: true,
      direction: 'desc' // เรียงจากใหม่ไปเก่า
    });
    
    // สถิติสรุป
    const [stats, setStats] = useState({
      totalAmount: 0,
      incomingAmount: 0,
      outgoingAmount: 0
    });

    // อ่าน token
    const readToken = async () => {
      try {
        // ลองอ่าน token จากทั้ง localStorage ทั้ง authToken และ token
        let rawToken = localStorage.getItem('authToken') || localStorage.getItem('token');
        
        if (!rawToken) {
          console.error("ไม่พบ token");
          return null;
        }
        
        // แปลง token เป็น object ถ้าเก็บในรูปแบบ JSON string
        try {
          return JSON.parse(rawToken);
        } catch (e) {
          return rawToken; // ถ้าไม่ใช่ JSON ให้ส่งคืนค่าเดิม
        }
      } catch (error) {
        console.error("เกิดข้อผิดพลาดในการอ่าน token:", error);
        return null;
      }
    };

    // ดึงข้อมูลคำขอถอนเงิน
    const fetchWithdrawals = async (status = null, resetPagination = false) => {
      try {
        setLoading(true);
        
        const paginationParams = resetPagination 
          ? { limit: pagination.limit, direction: pagination.direction } 
          : pagination;
        
        // สร้าง URL parameters
        const params = new URLSearchParams();
        params.append('limit', paginationParams.limit);
        params.append('direction', paginationParams.direction);
        
        // เพิ่ม last_id ถ้ามีและไม่ใช่การรีเซ็ต pagination
        if (paginationParams.lastId && !resetPagination) {
          params.append('last_id', paginationParams.lastId);
        }
        
        // เพิ่ม status ถ้ามีการกรอง
        if (status) {
          // แปลงสถานะจากภาษาไทยเป็น API status
          let apiStatus = "";
          switch (status) {
            case "รอการอนุมัติ":
              apiStatus = "pending";
              break;
            case "อนุมัติแล้ว":
              apiStatus = "completed";
              break;
            case "ปฏิเสธ":
              apiStatus = "rejected";
              break;
            default:
              apiStatus = "";
          }
          
          if (apiStatus) {
            params.append('status', apiStatus);
          }
        }
        
        console.log(`เรียกใช้ API: ${API_BASE_URL}/api/withdraw?${params}`);
        
        // เรียก API
        const response = await axios({
          method: 'GET',
          url: `${API_BASE_URL}/api/withdraw?${params}`,
          headers: {
            'Accept': 'application/json'
          },
          withCredentials: true // ส่ง cookies ไปด้วย
        });
        
        if (Array.isArray(response.data)) {
          console.log("ได้รับข้อมูลคำขอถอนเงิน:", response.data);
          
          // แปลงข้อมูลให้อยู่ในรูปแบบที่ตาราง TransactionTable ต้องการ
          const formattedTransactions = await Promise.all(
            response.data.map(async (item) => {
              // ดึงข้อมูลผู้ใช้เพิ่มเติมถ้ามี requester_id
              let username = `@User${item.requester_id}`;
              
              try {
                const userResponse = await axios({
                  method: 'GET',
                  url: `${API_BASE_URL}/api/user/${item.requester_id}`,
                  headers: {
                    'Accept': 'application/json'
                  },
                  withCredentials: true
                });
                
                if (userResponse.data) {
                  username = `@${userResponse.data.username || userResponse.data.display_name}`;
                }
              } catch (error) {
                console.warn(`ไม่สามารถดึงข้อมูลผู้ใช้ ID: ${item.requester_id}`, error);
              }
              
              // แปลงวันที่
              const date = new Date(item.date_created);
              const formattedDate = date.toLocaleDateString('th-TH', {
                day: 'numeric',
                month: 'long',
                year: 'numeric'
              }) + " " + date.toLocaleTimeString('th-TH', {
                hour: '2-digit',
                minute: '2-digit'
              }) + " น.";
              
              // แปลงสถานะ
              let status = "";
              switch (item.status) {
                case "pending":
                  status = "รอการอนุมัติ";
                  break;
                case "completed":
                  status = "อนุมัติแล้ว";
                  break;
                case "rejected":
                  status = "ปฏิเสธ";
                  break;
                default:
                  status = item.status;
              }
              
              // จัดรูปแบบจำนวนเงิน
              const amount = parseFloat(item.amount);
              const formattedAmount = `-฿${amount.toLocaleString(undefined, {
                minimumFractionDigits: 2,
                maximumFractionDigits: 2
              })}`;
              
              return {
                id: item.id, // เพิ่ม id เพื่อใช้สำหรับอนุมัติ/ปฏิเสธ
                username: username,
                date: formattedDate,
                channel: `${item.bank_name} - ${item.bank_no}`,
                type: "ยอดเงินออก",
                amount: formattedAmount,
                status: status,
                requester_id: item.requester_id,
                raw_amount: item.amount,
                raw_date: item.date_created
              };
            })
          );
          
          // อัปเดต transactions
          if (resetPagination) {
            setTransactions(formattedTransactions);
          } else {
            setTransactions(prevTransactions => [...prevTransactions, ...formattedTransactions]);
          }
          
          // อัปเดต pagination
          setPagination(prev => ({
            ...prev,
            lastId: response.data.length > 0 ? response.data[response.data.length - 1].id : prev.lastId,
            hasMore: response.data.length >= prev.limit
          }));
          
          // คำนวณสถิติสรุป
          calculateStats(resetPagination ? formattedTransactions : [...transactions, ...formattedTransactions]);
          
          setError(null);
        } else {
          console.error("ข้อมูลที่ได้รับไม่ใช่ array:", response.data);
          setError("รูปแบบข้อมูลไม่ถูกต้อง");
        }
      } catch (error) {
        console.error("Error fetching withdrawal requests:", error);
        
        if (error.response) {
          if (error.response.status === 403 || error.response.status === 401) {
            setError("ไม่มีสิทธิ์ในการเข้าถึงข้อมูลหรือการยืนยันตัวตนหมดอายุ กรุณาเข้าสู่ระบบใหม่");
          } else {
            setError(`เกิดข้อผิดพลาด: ${error.message}`);
          }
        } else {
          setError("ไม่สามารถเชื่อมต่อกับเซิร์ฟเวอร์ได้");
        }
      } finally {
        setLoading(false);
      }
    };

    // คำนวณสถิติสรุป
    const calculateStats = (transactions) => {
      let totalAmount = 0;
      let outgoingAmount = 0;
      
      transactions.forEach(transaction => {
        const amount = Math.abs(parseFloat(transaction.raw_amount));
        totalAmount += amount;
        
        if (transaction.type === "ยอดเงินออก") {
          outgoingAmount += amount;
        }
      });
      
      setStats({
        totalAmount,
        incomingAmount: totalAmount - outgoingAmount, // รายรับ
        outgoingAmount // รายจ่าย
      });
    };

    // อนุมัติคำขอถอนเงิน
    const completeWithdrawal = async (id) => {
      try {
        console.log(`กำลังอนุมัติคำขอถอนเงิน ID: ${id}`);
        
        const response = await axios({
          method: 'PATCH',
          url: `${API_BASE_URL}/api/withdraw/${id}/status/complete`,
          headers: {
            'Accept': 'application/json',
            'Content-Type': 'application/json'
          },
          withCredentials: true
        });
        
        console.log("ผลการอนุมัติคำขอถอนเงิน:", response.data);
        return response.data;
      } catch (error) {
        console.error(`เกิดข้อผิดพลาดในการอนุมัติคำขอถอนเงิน ID: ${id}`, error);
        throw error;
      }
    };

    // ปฏิเสธคำขอถอนเงิน
    const rejectWithdrawal = async (id) => {
      try {
        console.log(`กำลังปฏิเสธคำขอถอนเงิน ID: ${id}`);
        
        const response = await axios({
          method: 'PATCH',
          url: `${API_BASE_URL}/api/withdraw/${id}/status/reject`,
          headers: {
            'Accept': 'application/json',
            'Content-Type': 'application/json'
          },
          withCredentials: true
        });
        
        console.log("ผลการปฏิเสธคำขอถอนเงิน:", response.data);
        return response.data;
      } catch (error) {
        console.error(`เกิดข้อผิดพลาดในการปฏิเสธคำขอถอนเงิน ID: ${id}`, error);
        throw error;
      }
    };

    // โหลดข้อมูลเมื่อเปิดหน้า
    useEffect(() => {
      const validateToken = async () => {
        const token = await readToken();
        if (!token) {
          setError("ไม่สามารถตรวจสอบการยืนยันตัวตนได้ กรุณาเข้าสู่ระบบใหม่");
        } else {
          fetchWithdrawals(null, true);
        }
      };
      
      validateToken();
    }, []);

    // เมื่อเปลี่ยน active tab หรือ status
    useEffect(() => {
      // แปลง activeTab เป็นสถานะสำหรับ API
      let status = null;
      
      if (activeTab === "รอตรวจสอบ") {
        status = "รอการอนุมัติ";
      } else if (activeTab === "อนุมัติแล้ว") {
        status = "อนุมัติแล้ว";
      } else if (activeTab === "ปฏิเสธ") {
        status = "ปฏิเสธ";
      }
      
      // รีเซ็ต pagination และดึงข้อมูลใหม่
      setPagination(prev => ({
        ...prev,
        lastId: null,
        hasMore: true
      }));
      
      fetchWithdrawals(status, true);
    }, [activeTab]);
  
    const handleActionClick = (action, data) => {
      if (action === "ปฏิเสธ") {
        // Popup สำหรับปฏิเสธ
        setModalData({ ...data, action });
      } else if (action === "อนุมัติ") {
        // Popup สำหรับอนุมัติ
        const bankInfo = data.channel.split("-");
        const bankName = bankInfo[0].trim();
        const bankNo = bankInfo[1].trim();
        
        setModalData({
          ...data,
          action,
          accountName: "ชื่อบัญชีตัวอย่าง", // สมมติ (อาจจะต้องเรียก API เพิ่มเติม)
          fullBankNo: bankNo, // เลขบัญชีเต็ม
          bankName: bankName
        });
      }
      setIsModalOpen(true);
    };
      
    const handleModalConfirm = async () => {
      try {
        // เรียก API ตามการกระทำ
        if (modalData.action === "อนุมัติ") {
          await completeWithdrawal(modalData.id);
        } else if (modalData.action === "ปฏิเสธ") {
          await rejectWithdrawal(modalData.id);
        }
        
        // อัปเดตข้อมูลในตาราง
        const updatedTransactions = transactions.map((txn) => 
          txn.id === modalData.id
            ? { ...txn, status: modalData.action === "อนุมัติ" ? "อนุมัติแล้ว" : "ปฏิเสธ" }
            : txn
        );
        setTransactions(updatedTransactions);
        
        // แสดงข้อความแจ้งเตือนสำเร็จ
        alert(`${modalData.action}คำขอถอนเงินเรียบร้อยแล้ว`);
      } catch (error) {
        // แสดงข้อความแจ้งเตือนข้อผิดพลาด
        alert(`เกิดข้อผิดพลาด: ${error.message}`);
      } finally {
        // ปิด modal
        setIsModalOpen(false);
        setModalData(null);
      }
    };
  
    // โหลดข้อมูลเพิ่มเติม
    const loadMoreWithdrawals = () => {
      if (!loading && pagination.hasMore) {
        // แปลง activeTab เป็นสถานะสำหรับ API
        let status = null;
        
        if (activeTab === "รอตรวจสอบ") {
          status = "รอการอนุมัติ";
        } else if (activeTab === "อนุมัติแล้ว") {
          status = "อนุมัติแล้ว";
        } else if (activeTab === "ปฏิเสธ") {
          status = "ปฏิเสธ";
        }
        
        fetchWithdrawals(status);
      }
    };

    // ฟังก์ชันเข้าสู่ระบบใหม่
    const handleRelogin = () => {
      localStorage.removeItem('token');
      localStorage.removeItem('authToken');
      sessionStorage.removeItem('token');
      document.cookie = 'token=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;';
      window.location.href = '/login';
    };
  
    // จัดรูปแบบจำนวนเงิน
    const formatCurrency = (amount) => {
      return `฿${amount.toLocaleString(undefined, {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2
      })}`;
    };

    return (
      <div className="min-h-screen bg-gray-100 flex flex-col">
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
              <img
                src={Images.Transferringmoney}
                alt="Transferring Money Icon"
                className="w-6 h-6 mr-2"
              />
              การโอนเงิน
            </h1>
  
            <hr className="border-gray-300 dark:border-gray-700 mb-6" />
  
            {/* Error Display */}
            {error && (
              <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4 flex justify-between items-center">
                <div>
                  <span>{error}</span>
                  {(error.includes("เข้าสู่ระบบ") || error.includes("ยืนยันตัวตน")) && (
                    <button 
                      onClick={handleRelogin}
                      className="ml-4 bg-red-500 hover:bg-red-600 text-white px-3 py-1 rounded text-sm"
                    >
                      เข้าสู่ระบบใหม่
                    </button>
                  )}
                </div>
                <button 
                  className="font-bold text-xl" 
                  onClick={() => setError(null)}
                >
                  &times;
                </button>
              </div>
            )}
  
            {/* Overview Cards */}
            <div className="grid grid-cols-3 gap-6 mb-8">
              <OverviewCard
                icon={Images.TotalAmount}
                title="ยอดเงินทั้งหมด"
                amount={formatCurrency(stats.totalAmount)}
              />
              <OverviewCard
                icon={Images.IncomingAmount}
                title="ยอดเงินเข้า"
                amount={formatCurrency(stats.incomingAmount)}
              />
              <OverviewCard
                icon={Images.AmountIssued}
                title="ยอดเงินออก"
                amount={formatCurrency(stats.outgoingAmount)}
              />
            </div>
  
            {/* Filter Tabs */}
            <FilterTabs
              activeTab={activeTab}
              setActiveTab={setActiveTab}
              activeStatus={activeStatus}
              setActiveStatus={setActiveStatus}
            />
  
            {/* Loading Display */}
            {loading && transactions.length === 0 && (
              <div className="text-center p-8">
                <div className="inline-block animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-purple-500"></div>
                <p className="mt-2 text-gray-600">กำลังโหลดข้อมูล...</p>
              </div>
            )}

            {/* Transaction Table */}
            <TransactionTable
              transactions={transactions}
              activeTab={activeTab}
              activeStatus={activeStatus}
              onActionClick={handleActionClick}
            />
  
            {/* Load More Button */}
            {pagination.hasMore && (
              <div className="mt-4 text-center">
                <button
                  onClick={loadMoreWithdrawals}
                  disabled={loading}
                  className="bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded disabled:opacity-50"
                >
                  {loading ? "กำลังโหลด..." : "โหลดเพิ่มเติม"}
                </button>
              </div>
            )}
  
            {/* Confirmation Modal */}
            {isModalOpen && (
              <ConfirmationModal
                data={modalData}
                onClose={() => setIsModalOpen(false)}
                onConfirm={handleModalConfirm}
              />
            )}
          </div>
        </div>
      </div>
    );
  }