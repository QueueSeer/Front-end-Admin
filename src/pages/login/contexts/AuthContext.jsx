import React, { createContext, useState, useEffect, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import api, { setupApiClientHandlers } from './apiClient';

// สร้าง context
export const AuthContext = createContext(null);

// Hook สำหรับใช้งาน AuthContext
export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  // ฟังก์ชันรีเฟรช token
  const refreshToken = async () => {
    try {
      const userData = await api.refreshToken();
      
      if (userData) {
        setUser({
          id: userData.sub,
          roles: userData.roles || [],
          exp: userData.exp
        });
        return true;
      }
      return false;
    } catch (error) {
      console.error('Token refresh failed:', error);
      return false;
    }
  };

  // ฟังก์ชันล็อกเอาท์
  const logout = async () => {
    setLoading(true);
    try {
      await api.logout();
      setUser(null);
      navigate('/login');
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      setLoading(false);
    }
  };

  // ฟังก์ชันล็อกอิน
  const login = async (email, password) => {
    setLoading(true);
    setError(null);
    
    try {
      const userData = await api.login(email, password);
      
      setUser({
        id: userData.sub,
        roles: userData.roles || [],
        exp: userData.exp
      });
      
      return true;
    } catch (error) {
      console.error('Login error:', error);
      setError(error.response?.data?.message || 'การเข้าสู่ระบบล้มเหลว กรุณาลองอีกครั้ง');
      return false;
    } finally {
      setLoading(false);
    }
  };

  // ฟังก์ชันล็อกอินด้วย Google
  const googleLogin = async (credential) => {
    setLoading(true);
    setError(null);
    
    try {
      const userData = await api.googleLogin(credential);
      
      setUser({
        id: userData.sub,
        roles: userData.roles || [],
        exp: userData.exp
      });
      
      return true;
    } catch (error) {
      console.error('Google login error:', error);
      setError(error.response?.data?.message || 'การเข้าสู่ระบบด้วย Google ล้มเหลว กรุณาลองอีกครั้ง');
      return false;
    } finally {
      setLoading(false);
    }
  };

  // ตรวจสอบว่าผู้ใช้มีสิทธิ์ตามบทบาทที่กำหนดหรือไม่
  const hasRole = (requiredRole) => {
    if (!user || !user.roles) return false;
    return user.roles.includes(requiredRole);
  };

  // ตรวจสอบว่าผู้ใช้มีสิทธิ์ตามบทบาทใดบทบาทหนึ่งที่กำหนดหรือไม่
  const hasAnyRole = (requiredRoles) => {
    if (!user || !user.roles || user.roles.length === 0) return false;
    return requiredRoles.some(role => user.roles.includes(role));
  };

  // ตรวจสอบสถานะการล็อกอินเมื่อโหลดแอป
  useEffect(() => {
    const checkLoginStatus = async () => {
      // ตรวจสอบ localStorage ว่ามีข้อมูลการล็อกอินหรือไม่
      const isLoggedIn = localStorage.getItem('isLoggedIn') === 'true';
      
      if (isLoggedIn) {
        // ตรวจสอบว่า token หมดอายุหรือยัง
        const expTime = Number(localStorage.getItem('expiration') || '0');
        const now = Math.floor(Date.now() / 1000);

        if (expTime > now) {
          // Token ยังไม่หมดอายุ
          try {
            // เรียกใช้ API เพื่อตรวจสอบ token ว่ายังใช้งานได้
            const userData = await api.readToken();
            
            // อัปเดตข้อมูลผู้ใช้
            setUser({
              id: userData.sub,
              roles: userData.roles || [],
              exp: userData.exp
            });
          } catch (error) {
            // Token มีปัญหา ลองใช้ refresh
            try {
              const refreshed = await refreshToken();
              if (!refreshed) {
                // Refresh ไม่สำเร็จ ล้างข้อมูลผู้ใช้
                await logout();
              }
            } catch (refreshError) {
              await logout();
            }
          }
        } else {
          // Token หมดอายุ ลองใช้ refresh
          try {
            const refreshed = await refreshToken();
            if (!refreshed) {
              // Refresh ไม่สำเร็จ ล้างข้อมูลผู้ใช้
              await logout();
            }
          } catch (refreshError) {
            await logout();
          }
        }
      }
      
      setLoading(false);
    };

    // ตั้งค่า handlers สำหรับใช้ใน apiClient interceptors
    setupApiClientHandlers(refreshToken, logout);
    
    checkLoginStatus();
    
    // ตั้ง timer เพื่อรีเฟรช token เมื่อใกล้หมดอายุ
    const refreshInterval = setInterval(async () => {
      if (user) {
        const now = Math.floor(Date.now() / 1000);
        // หาก token จะหมดอายุภายใน 5 นาที (300 วินาที)
        if (user.exp - now < 300) {
          await refreshToken();
        }
      }
    }, 60000); // ตรวจสอบทุก 1 นาที
    
    return () => clearInterval(refreshInterval);
  }, []);

  return (
    <AuthContext.Provider value={{ 
      user, 
      loading, 
      error,
      setUser,
      refreshToken, 
      logout,
      login,
      googleLogin,
      hasRole,
      hasAnyRole,
      isAuthenticated: !!user
    }}>
      {children}
    </AuthContext.Provider>
  );
};