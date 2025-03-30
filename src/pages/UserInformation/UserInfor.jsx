import Images from "../../assets";
import Fillterbar from "../../components/Fillterbar";
import Sidebar from "../../components/Sidebar";
import SearchBar from "../../components/Information/SearchBar";
import Useroftable from "../../components/Information/Useroftable";
import React, { useState, useEffect } from "react";
import axios from "axios";

// กำหนดค่า base URL ที่ถูกต้อง
const API_BASE_URL = "https://backend.qseer.app";

export default function UserInformation() {
  const [selectedRows, setSelectedRows] = useState(0);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [validToken, setValidToken] = useState(null);
  const [pagination, setPagination] = useState({
    lastId: null,
    limit: 10,
    hasMore: true,
    direction: 'asc'
  });
  
 

  // ฟังก์ชันอ่าน token
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
  

  // ตรวจสอบ token เมื่อเริ่มต้น
  useEffect(() => {
    const validateToken = async () => {
      setLoading(true);
      const token = await readToken();
      setValidToken(token);
      
      if (!token) {
        setError("ไม่สามารถตรวจสอบการยืนยันตัวตนได้ กรุณาเข้าสู่ระบบใหม่");
        setUsers(mockUsers); // ใช้ข้อมูลจำลองแทน
      } else {
        fetchUsers("", true);
      }
      
      setLoading(false);
    };
    
    validateToken();
  }, []);

  // ฟังก์ชั่นสำหรับดึงข้อมูลผู้ใช้รายบุคคล
  const fetchUserData = async (userId) => {
    try {
      setLoading(true);
      
      console.log(`กำลังดึงข้อมูลผู้ใช้ ID: ${userId}`);
      
      const response = await axios({
        method: 'GET',
        url: `${API_BASE_URL}/api/user/${userId}`,
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json',
        },
        withCredentials: true
      });
      
      console.log("ได้รับข้อมูลผู้ใช้:", response.data);
      return response.data;
    } catch (error) {
      console.error("Error fetching user data:", error);
      
      if (error.response && error.response.status === 403) {
        setError("ไม่มีสิทธิ์ในการเข้าถึงข้อมูล กรุณาเข้าสู่ระบบใหม่");
      } else if (error.response && error.response.status === 401) {
        setError("กรุณาเข้าสู่ระบบใหม่");
      } else {
        setError(`เกิดข้อผิดพลาด: ${error.message}`);
      }
      
      return null;
    } finally {
      setLoading(false);
    }
  };

  // ฟังก์ชั่นสำหรับดึงข้อมูลผู้ใช้หลายคน
  const fetchUsers = async (searchQuery = "", resetPagination = false) => {
    try {
      setLoading(true);

      // if (!validToken) {
      //   console.error("ไม่มี token ที่ถูกต้อง");
      //   setError("ไม่มี token ที่ถูกต้อง กรุณาเข้าสู่ระบบใหม่");
      //   setUsers(mockUsers);
      //   return;
      // }

      const paginationParams = resetPagination 
        ? { limit: pagination.limit, direction: pagination.direction } 
        : pagination;

      const params = new URLSearchParams();
      params.append('limit', paginationParams.limit);
      params.append('direction', paginationParams.direction);

      if (paginationParams.lastId && !resetPagination) {
        params.append('last_id', paginationParams.lastId);
      }

      if (searchQuery) {
        params.append('display_name', searchQuery);
      }
      
      console.log(`กำลังเรียก API: ${API_BASE_URL}/api/user/search?${params}`);
      
      const response = await axios({
        method: 'GET',
        url: `${API_BASE_URL}/api/user/search?${params}`,
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json',
        },
        withCredentials: true
      });
      
      const fetchedUsers = response.data;
      console.log("ได้รับข้อมูลผู้ใช้จาก search API:", fetchedUsers);

      // ตรวจสอบว่าได้ผลลัพธ์เป็น array หรือไม่
      if (!Array.isArray(fetchedUsers)) {
        console.error("ข้อมูลที่ได้รับไม่ใช่ array:", fetchedUsers);
        setError("รูปแบบข้อมูลไม่ถูกต้อง");
        return;
      }

      // ถ้าได้ข้อมูลว่างเปล่าและไม่ใช่การโหลดเพิ่ม
      if (fetchedUsers.length === 0 && resetPagination) {
        setError("ไม่พบข้อมูลผู้ใช้");
        setUsers([]); // ให้แสดงตารางว่าง ไม่ใช้ข้อมูลจำลอง
        setPagination(prev => ({
          ...prev,
          hasMore: false
        }));
        return;
      }

      // แปลงข้อมูลที่ได้รับเพื่อให้แน่ใจว่ามีฟิลด์ที่จำเป็นทั้งหมด
      const processedUsers = fetchedUsers.map(user => ({
        ...user,
        // ถ้าไม่มี email ให้ใส่ค่าว่าง
        email: user.email || "-"
      }));

      // อัปเดต state
      if (resetPagination) {
        setUsers(processedUsers);
      } else {
        setUsers(prevUsers => [...prevUsers, ...processedUsers]);
      }

      setPagination(prev => ({
        ...prev,
        lastId: fetchedUsers.length > 0 ? fetchedUsers[fetchedUsers.length - 1].id : prev.lastId,
        hasMore: fetchedUsers.length >= prev.limit
      }));

      setError(null);
    } catch (error) {
      console.error("Error fetching users:", error);
      
      if (error.response) {
        console.error("Response error:", error.response.status, error.response.data);
        
        if (error.response.status === 403 || error.response.status === 401) {
          setError("ไม่มีสิทธิ์ในการเข้าถึงข้อมูลหรือการยืนยันตัวตนหมดอายุ กรุณาเข้าสู่ระบบใหม่");
        } else {
          setError(`เกิดข้อผิดพลาด: ${error.response.status} - ${error.response.data.detail || error.message}`);
        }
      } else if (error.request) {
        // กรณีที่ไม่ได้รับการตอบกลับจากเซิร์ฟเวอร์
        console.error("No response received:", error.request);
        setError("ไม่สามารถเชื่อมต่อกับเซิร์ฟเวอร์ได้ โปรดตรวจสอบการเชื่อมต่อของคุณ");
      } else {
        // กรณีที่เกิดข้อผิดพลาดก่อนส่งคำขอ
        console.error("Request error:", error.message);
        setError(`เกิดข้อผิดพลาด: ${error.message}`);
      }
      
      // ใช้ข้อมูลจำลองแทนในกรณีเกิดข้อผิดพลาด (แต่แสดงข้อความเตือนด้วย)
      // setUsers(mockUsers);
    } finally {
      setLoading(false);
    }
  };

  // ฟังก์ชั่นสำหรับเข้าสู่ระบบใหม่
  const handleRelogin = () => {
    // ล้าง tokens ทั้งหมด
    localStorage.removeItem('token');
    localStorage.removeItem('authToken');
    sessionStorage.removeItem('token');
    document.cookie = 'token=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;';
    
    // นำผู้ใช้ไปยังหน้าเข้าสู่ระบบ
    window.location.href = '/login';
  };

  const searchUser = (query) => {
    setPagination(prev => ({
      ...prev,
      lastId: null
    }));
    fetchUsers(query, true);
  };

  const loadMore = () => {
    if (!loading && pagination.hasMore) {
      fetchUsers();
    }
  };

  const changeDirection = (direction) => {
    setPagination(prev => ({
      ...prev,
      direction,
      lastId: null
    }));
    fetchUsers("", true);
  };

  // ฟังก์ชันสำหรับใช้ใน onLoadDetails ของ Useroftable
  const loadUserDetails = async (userId) => {
    try {
      console.log(`เริ่มดึงข้อมูลรายละเอียดของผู้ใช้ ID: ${userId}`);
      
      // หาข้อมูลผู้ใช้จาก users array
      const existingUser = users.find(u => u.id === userId);
      if (!existingUser) {
        console.error(`ไม่พบผู้ใช้ ID: ${userId} ในรายการ`);
        return null;
      }
      
      // ดึงข้อมูลรายละเอียดจาก API
      const userData = await fetchUserData(userId);
      
      if (userData) {
        console.log(`ได้รับข้อมูลผู้ใช้ ID: ${userId} จาก API:`, userData);
        
        // อัปเดตข้อมูลในรายการผู้ใช้
        setUsers(prevUsers => prevUsers.map(user => 
          user.id === userId ? { ...user, ...userData } : user
        ));
        
        return userData; // ส่งคืนข้อมูลที่ได้จาก API
      } else {
        console.log(`ไม่สามารถดึงข้อมูลผู้ใช้ ID: ${userId} จาก API ได้`);
        return null;
      }
    } catch (error) {
      console.error(`เกิดข้อผิดพลาดในการดึงข้อมูลผู้ใช้ ID: ${userId}`, error);
      return null;
    }
  };
  

  return (
    <div className="min-h-screen bg-gray-100 flex flex-col font-sans">
   
      <div className="flex px-12 pt-12 gap-14">
        <div className="lg:w-72">
          <Sidebar />
        </div>
        <div className="flex-1 bg-white shadow-md rounded-lg p-6 border border-gray-200">
          <h1 className="text-xl font-bold text-[#65558F] dark:text-purple-400 mb-4 flex items-center">
            <img src={Images.UserInformation} alt="UserInformation Icon" className="w-6 h-6 mr-2" />
            ข้อมูลผู้ใช้งาน
          </h1>
          <hr className="border-gray-300 dark:border-gray-700 mb-6" />
          
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
          
        
          
          <SearchBar 
            selectedRows={selectedRows} 
            onSearch={searchUser}
          />
          
          <Useroftable 
            onRowSelected={setSelectedRows} 
            users={users}
            onLoadDetails={loadUserDetails}
            loading={loading}
          />
          
          {pagination.hasMore && (
            <div className="mt-4 text-center">
              <button
                onClick={loadMore}
                disabled={loading}
                className="bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded disabled:opacity-50"
              >
                {loading ? "กำลังโหลด..." : "โหลดเพิ่มเติม"}
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}