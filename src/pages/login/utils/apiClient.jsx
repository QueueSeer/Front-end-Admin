import axios from 'axios';

// สร้าง Axios instance ส่วนกลางพร้อม default config
const apiClient = axios.create({
  baseURL: 'https://backend.qseer.app/api',
  withCredentials: true,
  timeout: 10000,
});

// สำหรับแจ้งในคอนโซลเมื่อเกิดการเรียก API (ใช้ในขั้นตอนการพัฒนา)
const logRequest = (config) => {
  console.log(`🚀 Request: ${config.method.toUpperCase()} ${config.url}`, config);
  return config;
};

// สำหรับจัดการกับสถานะการล็อกอินและการรีเฟรช token
const setupApiClientHandlers = (handleRefresh, handleLogout) => {
  window.apiClientHandlers = {
    refreshToken: handleRefresh,
    logout: handleLogout
  };
};

// Interceptor สำหรับการส่งคำขอ
apiClient.interceptors.request.use(
  (config) => {
    // ตรวจสอบว่าผู้ใช้ล็อกอินหรือไม่
    const isLoggedIn = localStorage.getItem('isLoggedIn') === 'true';
    
    // กำหนดค่า withCredentials เพื่อส่ง cookie ไปด้วย (จำเป็นสำหรับ JWT ที่อยู่ใน HttpOnly cookie)
    config.withCredentials = true;
    
    // ดึงข้อมูลบทบาทผู้ใช้เพื่อดูว่าผู้ใช้มีสิทธิ์เพียงพอหรือไม่
    const userRoles = JSON.parse(localStorage.getItem('userRoles') || '[]');
    
    // console log ข้อมูลการเรียก API ในกรณีพัฒนา
    if (process.env.NODE_ENV === 'development') {
      console.log(`API Request: ${config.method} ${config.url}`);
      console.log('User Roles:', userRoles);
    }
    
    // ในกรณีที่ใช้ token แบบ Bearer จาก localStorage
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Interceptor สำหรับการรับการตอบกลับ
apiClient.interceptors.response.use(
  (response) => {
    // console log ข้อมูลการตอบกลับจาก API ในกรณีพัฒนา
    if (process.env.NODE_ENV === 'development') {
      console.log(`API Response (${response.status}):`, response.data);
    }
    return response;
  },
  async (error) => {
    const originalRequest = error.config;
    
    // บันทึกข้อผิดพลาดในคอนโซล
    console.error('API Error:', {
      url: originalRequest?.url,
      status: error.response?.status,
      data: error.response?.data
    });
    
    // ตรวจสอบว่าเป็น 401 (Unauthorized) และยังไม่ได้ลองรีเฟรช token
    if (error.response && error.response.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;
      
      try {
        // ลองรีเฟรช token ถ้ามี apiClientHandlers หรือ AuthContext
        if (window.apiClientHandlers && window.apiClientHandlers.refreshToken) {
          console.log("Attempting to refresh token from interceptor");
          const refreshResult = await window.apiClientHandlers.refreshToken();
          
          if (refreshResult) {
            console.log("Token refreshed successfully, retrying request");
            // ส่งคำขอเดิมอีกครั้ง
            return apiClient(originalRequest);
          }
        } else {
          console.log("No refresh token handler available");
          // ถ้าไม่มี handler ให้ลองเรียก API refresh โดยตรง
          try {
            const response = await axios.post('https://backend.qseer.app/api/access/refresh', {}, {
              withCredentials: true
            });
            
            if (response.status === 200) {
              // บันทึกข้อมูลล่าสุด
              localStorage.setItem('userId', response.data.sub);
              localStorage.setItem('userRoles', JSON.stringify(response.data.roles || []));
              localStorage.setItem('isLoggedIn', 'true');
              localStorage.setItem('expiration', response.data.exp.toString());
              
              // อัปเดต token ถ้าจำเป็น
              if (response.data.token) {
                localStorage.setItem('token', response.data.token);
              }
              
              // ส่งคำขอเดิมอีกครั้ง
              return apiClient(originalRequest);
            }
          } catch (directRefreshError) {
            console.error("Direct token refresh failed:", directRefreshError);
          }
        }
      } catch (refreshError) {
        console.error("Token refresh failed in interceptor:", refreshError);
        
        // ล็อกเอาท์ถ้ามี handler
        if (window.apiClientHandlers && window.apiClientHandlers.logout) {
          await window.apiClientHandlers.logout();
        } else {
          // ล้างข้อมูลผู้ใช้จาก localStorage ถ้าไม่มี handler
          localStorage.removeItem('userId');
          localStorage.removeItem('userRoles');
          localStorage.removeItem('isLoggedIn');
          localStorage.removeItem('expiration');
          localStorage.removeItem('token');
          
          // นำผู้ใช้กลับไปยังหน้าล็อกอิน
          window.location.href = '/login';
        }
      }
    }
    
    // ในกรณีของข้อผิดพลาด 403 (Forbidden)
    if (error.response && error.response.status === 403) {
      console.error("Access forbidden (403):", originalRequest.url);
      
      // ตรวจสอบสิทธิ์ของผู้ใช้
      const userRoles = JSON.parse(localStorage.getItem('userRoles') || '[]');
      console.log("User roles when encountering 403:", userRoles);
      
      // ถ้าไม่มีสิทธิ์ใดๆ หรือสิทธิ์ไม่เพียงพอ
      if (!userRoles.length) {
        console.error("User has no roles assigned");
        // คุณอาจจะต้องการนำทางผู้ใช้ไปยังหน้าแจ้งเตือนหรือล็อกอินใหม่
      }
    }
    
    return Promise.reject(error);
  }
);

// API endpoints wrappers
const api = {
  // ฟังก์ชันล็อกอิน
  login: async (email, password) => {
    try {
      const response = await apiClient.post('/access/login', { email, password });
      
      if (response.data) {
        // บันทึกข้อมูลการล็อกอิน
        if (response.data.token) {
          localStorage.setItem('token', response.data.token);
        }
        
        localStorage.setItem('userId', response.data.sub);
        localStorage.setItem('userRoles', JSON.stringify(response.data.roles || []));
        localStorage.setItem('isLoggedIn', 'true');
        localStorage.setItem('expiration', response.data.exp.toString());
      }
      
      return response.data;
    } catch (error) {
      console.error('Login failed:', error);
      throw error;
    }
  },
  
  // ฟังก์ชันล็อกอินด้วย Google
  googleLogin: async (credential) => {
    try {
      const formData = new URLSearchParams();
      formData.append('credential', credential);
      
      const response = await apiClient.post('/access/google/signin', formData, {
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded'
        }
      });
      
      if (response.data) {
        // บันทึกข้อมูลการล็อกอิน
        localStorage.setItem('token', credential); // เก็บ Google credential
        localStorage.setItem('userId', response.data.sub);
        localStorage.setItem('userRoles', JSON.stringify(response.data.roles || []));
        localStorage.setItem('isLoggedIn', 'true');
        localStorage.setItem('expiration', response.data.exp.toString());
      }
      
      return response.data;
    } catch (error) {
      console.error('Google login failed:', error);
      throw error;
    }
  },
  
  // ฟังก์ชันล็อกเอาท์
  logout: async () => {
    try {
      await apiClient.delete('/access/logout');
    } catch (error) {
      console.error('Logout API error:', error);
    } finally {
      // ล้างข้อมูลผู้ใช้จาก localStorage
      localStorage.removeItem('userId');
      localStorage.removeItem('userRoles');
      localStorage.removeItem('isLoggedIn');
      localStorage.removeItem('expiration');
      localStorage.removeItem('token');
    }
  },
  
  // ฟังก์ชันอ่าน token
  readToken: async () => {
    try {
      const response = await apiClient.get('/access/read_token');
      return response.data;
    } catch (error) {
      console.error('Read token failed:', error);
      throw error;
    }
  },
  
  // ฟังก์ชันรีเฟรช token
  refreshToken: async () => {
    try {
      const response = await apiClient.post('/access/refresh');
      
      if (response.data) {
        // บันทึกข้อมูลล่าสุด
        localStorage.setItem('userId', response.data.sub);
        localStorage.setItem('userRoles', JSON.stringify(response.data.roles || []));
        localStorage.setItem('isLoggedIn', 'true');
        localStorage.setItem('expiration', response.data.exp.toString());
        
        // อัปเดต token ถ้าจำเป็น
        if (response.data.token) {
          localStorage.setItem('token', response.data.token);
        }
      }
      
      return response.data;
    } catch (error) {
      console.error('Refresh token failed:', error);
      throw error;
    }
  },
  
  // ฟังก์ชันสำหรับเรียกข้อมูลผู้ใช้
  getUsers: async (params = {}) => {
    return apiClient.get('/user/search', { params });
  },
  
  // ฟังก์ชันสำหรับเรียกข้อมูลผู้ใช้รายบุคคล
  getUser: async (userId) => {
    return apiClient.get(`/user/${userId}`);
  },
  
  // เพิ่มฟังก์ชันอื่นๆ ตามต้องการ...
};

export { setupApiClientHandlers };
export default apiClienti;