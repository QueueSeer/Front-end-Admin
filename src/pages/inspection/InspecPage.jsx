import React, { useState, useEffect } from "react";
import axios from "axios";
import Images from "../../assets";
import SearchBar from "../../components/Information/SearchBar";
import Sidebar from "../../components/Sidebar";
import Fillterbar from "../../components/Fillterbar";
import InspectionTable from "../../components/inspec/InspectionTable";

// กำหนดค่า base URL
const API_BASE_URL = "https://backend.qseer.app";

const InspecPage = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [detailsLoading, setDetailsLoading] = useState({});
  const [error, setError] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [pagination, setPagination] = useState({
    lastId: null,
    limit: 20,
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

  /// ปรับปรุงฟังก์ชัน fetchSeerDetail
const fetchSeerDetail = async (seerId) => {
  try {
    // ตั้งค่า loading state สำหรับ seer นี้
    setDetailsLoading(prev => ({ ...prev, [seerId]: true }));
    
    console.log(`กำลังดึงข้อมูลเพิ่มเติมของหมอดู ID: ${seerId}`);
    
    // เรียก API เพื่อดึงข้อมูลรายละเอียด
    const response = await axios({
      method: 'GET',
      url: `${API_BASE_URL}/api/user/${seerId}`,
      headers: {
        'Accept': 'application/json',
      },
      withCredentials: true
    });
    
    console.log(`ได้รับข้อมูลเพิ่มเติมของหมอดู ID ${seerId}:`, response.data);
    
    // อัปเดตข้อมูลใน state
    setUsers(prevUsers => 
      prevUsers.map(user => 
        user.id === seerId ? {
          ...user,
          email: response.data.email || user.email || "-",
          birthDate: formatDate(response.data.birthdate) || user.birthDate || "-",
          phone: response.data.phone_number || user.phone || "-",
        } : user
      )
    );
    
    return response.data;
  } catch (error) {
    console.error(`เกิดข้อผิดพลาดในการดึงข้อมูลหมอดู ID: ${seerId}`, error);
    return null;
  } finally {
    // ยกเลิก loading state สำหรับ seer นี้
    setDetailsLoading(prev => ({ ...prev, [seerId]: false }));
  }
};

  // โหลดข้อมูลเพิ่มเติมของหมอดูทุกคนที่ได้จาก search
  const loadAllSeerDetails = async (seerList) => {
    // ดึงข้อมูลของหมอดูทีละคนเพื่อไม่ให้ส่ง request มากเกินไปพร้อมกัน
    for (const seer of seerList) {
      // ถ้ายังไม่มีข้อมูลอีเมล หรือเบอร์โทร ให้ดึงข้อมูลเพิ่มเติม
      if (!seer.email || seer.email === "-" || !seer.phone || seer.phone === "-" || !seer.birthDate || seer.birthDate === "-") {
        await fetchSeerDetail(seer.id);
        // หน่วงเวลาเล็กน้อยระหว่างการเรียก API
        await new Promise(resolve => setTimeout(resolve, 200));
      }
    }
  };

  // ฟังก์ชั่นสำหรับดึงข้อมูลหมอดูทั้งหมด
  const fetchSeers = async (query = "", resetPagination = false) => {
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
      
      // เพิ่ม display_name ถ้ามีการค้นหา
      if (query) {
        params.append('display_name', query);
      }
      
      // เพิ่ม is_available=false เพื่อดึงทั้งหมด (ไม่กรองเฉพาะที่พร้อมให้บริการ)
      params.append('is_available', false);
      
      console.log(`เรียกใช้ API: ${API_BASE_URL}/api/seer/search?${params}`);
      
      // เรียก API เพื่อดึงข้อมูลหมอดู
      const response = await axios({
        method: 'GET',
        url: `${API_BASE_URL}/api/seer/search?${params}`,
        headers: {
          'Accept': 'application/json'
        },
        withCredentials: true
      });
      
      if (Array.isArray(response.data)) {
        console.log("ได้รับข้อมูลหมอดู:", response.data);
        
        // แปลงข้อมูลให้อยู่ในรูปแบบที่ต้องการแสดงในตาราง
        const formattedUsers = response.data.map(seer => ({
          id: seer.id, // สำคัญมาก: ต้องมี id สำหรับการเรียก API
          name: seer.display_name || seer.username || "ไม่ระบุชื่อ",
          email: seer.email || "-",
          inspection: checkVerificationSource(seer),
          birthDate: formatDate(seer.birthdate) || "-",
          phone: seer.phone_number || "-",
          image: seer.image || "",
          status: determineVerificationStatus(seer),
          verified_at: seer.verified_at
        }));
        
        // อัปเดต state
        if (resetPagination) {
          setUsers(formattedUsers);
        } else {
          setUsers(prevUsers => [...prevUsers, ...formattedUsers]);
        }
        
        // อัปเดต pagination
        setPagination(prev => ({
          ...prev,
          lastId: response.data.length > 0 ? response.data[response.data.length - 1].id : prev.lastId,
          hasMore: response.data.length >= prev.limit
        }));
        
        setError(null);
        
        // โหลดข้อมูลเพิ่มเติมของหมอดูทุกคน
        await loadAllSeerDetails(formattedUsers);
      } else {
        console.error("ข้อมูลที่ได้รับไม่ใช่ array:", response.data);
        setError("รูปแบบข้อมูลไม่ถูกต้อง");
        // ใช้ข้อมูลจำลองแทน
        setUsers(mockUsers);
      }
    } catch (error) {
      console.error("Error fetching seers:", error);
      
      if (error.response) {
        if (error.response.status === 403 || error.response.status === 401) {
          setError("ไม่มีสิทธิ์ในการเข้าถึงข้อมูลหรือการยืนยันตัวตนหมดอายุ กรุณาเข้าสู่ระบบใหม่");
        } else {
          setError(`เกิดข้อผิดพลาด: ${error.message}`);
        }
      } else {
        setError("ไม่สามารถเชื่อมต่อกับเซิร์ฟเวอร์ได้");
      }
      
      // ใช้ข้อมูลจำลองแทนในกรณีเกิดข้อผิดพลาด
      setUsers(mockUsers);
    } finally {
      setLoading(false);
    }
  };
  
  // ฟังก์ชันตรวจสอบแหล่งที่มาของการยืนยันตัวตน
  const checkVerificationSource = (seer) => {
    if (seer.auth_provider) return seer.auth_provider;
    if (seer.google_id) return "Google";
    if (seer.facebook_id) return "Facebook";
    return "ไม่ระบุ";
  };
  
  // ฟังก์ชันกำหนดสถานะการยืนยัน
  const determineVerificationStatus = (seer) => {
    if (seer.verified_at) return "ผ่านการตรวจสอบ";
    if (seer.is_verified === false) return "ไม่ผ่านการตรวจสอบ";
    return "";
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

  // ฟังก์ชั่นสำหรับค้นหาหมอดูตามชื่อ
  const searchSeer = (query) => {
    setSearchQuery(query);
    // รีเซ็ต pagination
    setPagination(prev => ({
      ...prev,
      lastId: null,
      hasMore: true
    }));
    fetchSeers(query, true);
  };
  
  // ฟังก์ชันโหลดข้อมูลเพิ่มเติม
  const loadMoreSeers = () => {
    if (!loading && pagination.hasMore) {
      fetchSeers(searchQuery);
    }
  };

  // โหลดข้อมูลตอนเริ่มต้น
  useEffect(() => {
    const validateToken = async () => {
      const token = await readToken();
      if (!token) {
        setError("ไม่สามารถตรวจสอบการยืนยันตัวตนได้ กรุณาเข้าสู่ระบบใหม่");
        setUsers(mockUsers); // ใช้ข้อมูลจำลองแทน
      } else {
        fetchSeers();
      }
    };
    
    validateToken();
  }, []);

  // ข้อมูลจำลองสำหรับใช้ในกรณีที่ API ไม่ทำงาน
  const mockUsers = [
    {
      id: 1,
      name: "John Doe",
      email: "john.doe@gmail.com",
      inspection: "Facebook",
      birthDate: "10/07/2002",
      phone: "0912589426",
      status: "",
    },
    {
      id: 2,
      name: "Jane Doe",
      email: "jane.doe@gmail.com",
      inspection: "Google",
      birthDate: "12/12/1990",
      phone: "0912345678",
      status: "",
    },
  ];

  // ฟังก์ชั่นสำหรับเข้าสู่ระบบใหม่
  const handleRelogin = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('authToken');
    sessionStorage.removeItem('token');
    document.cookie = 'token=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;';
    window.location.href = '/login';
  };

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
            การตรวจสอบหมอดู
          </h1>
          <hr className="border-gray-300 mb-6" />

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

          {/* Search Bar */}
          <SearchBar onSearch={searchSeer} />

          {/* Loading Display */}
          {loading && users.length === 0 && (
            <div className="text-center p-4">
              <div className="inline-block animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-purple-500"></div>
              <p className="mt-2 text-gray-600">กำลังโหลดข้อมูล...</p>
            </div>
          )}

          {/* Inspection Table */}
          <InspectionTable 
            users={users} 
            setUsers={setUsers} 
            detailsLoading={detailsLoading}
          />
          
          {/* Load More Button */}
          {pagination.hasMore && (
            <div className="mt-4 text-center">
              <button
                onClick={loadMoreSeers}
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
};

export default InspecPage;