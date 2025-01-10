import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { GoogleOAuthProvider, GoogleLogin } from "@react-oauth/google";
import axios from "axios";
import Images from "../../assets";
import Fillterbar from "../../components/Fillterbar";




const GOOGLE_CLIENT_ID = "482872878938-qln7jlcv0elrffnnaqd4qpqs43jh4ob9.apps.googleusercontent.com";

export default function Loginpage() {
  const [showPassword, setShowPassword] = useState(false);
  const [isDarkMode, setIsDarkMode] = useState(false);
  const navigate = useNavigate();
  const [emailError, setEmailError] = useState(""); // สำหรับอีเมล
  const [passwordError, setPasswordError] = useState(""); // สำหรับรหัสผ่าน
  
  

  useEffect(() => {
    const matchMedia = window.matchMedia("(prefers-color-scheme: dark)");
    setIsDarkMode(matchMedia.matches);

    const handleChange = (e) => setIsDarkMode(e.matches);
    matchMedia.addEventListener("change", handleChange);

    return () => matchMedia.removeEventListener("change", handleChange);
  }, []);

  const handleGoogleLoginSuccess = async (credentialResponse) => {
    const idToken = credentialResponse.credential;
  
    try {
      const formData = new URLSearchParams();
      formData.append("credential", idToken);
  
      const response = await axios.post(
        "https://backend.qseer.app/api/access/google/signin",
        formData,
        {
          headers: {
            "Content-Type": "application/x-www-form-urlencoded",
          },
        }
      );
  
      if (response.status === 200) {
        console.log("Login Successful:", response.data);
        localStorage.setItem("token", response.data.token); // บันทึก token
        navigate("/UserInfor"); // ย้ายไปยังหน้าฟิลเตอร์
      }
    } catch (error) {
      console.error("Error:", error.response?.data || error.message);
    }
  };
  

  const handleGoogleLoginError = () => {
    alert("Google login failed. Please try again.");
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    setEmailError(""); // รีเซ็ตข้อความข้อผิดพลาดอีเมล
    setPasswordError(""); // รีเซ็ตข้อความข้อผิดพลาดรหัสผ่าน
  
    const email = document.getElementById("email").value.trim();
    const password = document.getElementById("password").value;
  
    let hasError = false; // ใช้ตรวจสอบว่ามีข้อผิดพลาดหรือไม่
  
    // ตรวจสอบอีเมล
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/; // รูปแบบอีเมลที่ถูกต้อง
    if (!email) {
      setEmailError("กรุณากรอกอีเมล");
      hasError = true; // ตั้งค่าว่ามีข้อผิดพลาด
    } else if (!emailRegex.test(email)) {
      setEmailError("กรุณากรอกอีเมลให้ถูกต้อง");
      hasError = true;
    }
  
    // ตรวจสอบรหัสผ่าน
    if (!password) {
      setPasswordError("กรุณากรอกรหัสผ่าน");
      hasError = true;
    }
  
    // ถ้ามีข้อผิดพลาด ไม่ดำเนินการต่อ
    if (hasError) {
      return;
    }
  
    // ถ้าข้อมูลถูกต้อง
    try {
      const response = await axios.post(
        "https://backend.qseer.app/api/access/login",
        { email, password },
        { headers: { "Content-Type": "application/json" } }
      );
  
      if (response.status === 200) {
        console.log("Login Successful:", response.data);
        localStorage.setItem("token", response.data.token); // เก็บ token
        navigate("/UserInfor"); // ไปที่หน้า fillter
      }
    } catch (error) {
      console.error("Login error:", error.response?.data || error.message);
    }
  };
  
  
  

  return (
    <GoogleOAuthProvider clientId={GOOGLE_CLIENT_ID}>
      <div className={isDarkMode ? "dark" : ""}>
      <Fillterbar />
        <div
          className={`flex h-screen font-notosans lg:flex-row flex-col ${isDarkMode ? "bg-gray-900 text-white" : "bg-gray-50 text-black"}`}
        >
          {/* ด้านซ้าย: พื้นหลังเบลอ */}
          <div
            className={`w-full lg:w-1/2 relative flex flex-col p-8 ${
              isDarkMode ? "bg-gray-900" : "bg-gray-50"
            }`}
          >
            <div
              className={`absolute top-5 left-10 rounded-full w-96 h-96 ${
                isDarkMode ? "bg-yellow-300" : "bg-yellow-100"
              } opacity-40 blur-2xl hidden lg:block`}
            ></div>
            <div
              className={`absolute top-1/2 right-[25%] transform -translate-y-1/2 rounded-full w-96 h-96 ${
                isDarkMode ? "bg-purple-500" : "bg-purple-300"
              } opacity-40 blur-2xl hidden lg:block`}
            ></div>
            <div
              className={`absolute top-1/2 right-[1%] transform -translate-y-1/2 rounded-full w-96 h-96 ${
                isDarkMode ? "bg-purple-400" : "bg-purple-200"
              } opacity-40 blur-2xl hidden lg:block`}
            ></div>
            <img
              src={Images.marble}
              alt="marble"
              className="w-36 h-36 mx-auto mt-1 lg:absolute lg:top-[calc(50%-60px)] lg:right-[calc(30px)] lg:left-30 lg:transform lg:-translate-y-1/2 lg:translate-x-[calc(10px)] lg:w-[28rem] lg:h-[28rem] lg:mx-0"
            />
            <div className="relative z-10 ml-10 mt-10 hidden lg:block">
              <h2 className="text-2xl lg:text-4xl font-bold">
              Sign in to aseamlessly manage <br />the Admin system
              </h2>
             
            </div>
          </div>

          {/* ฟอร์ม Login */}
          <div
            className={`w-full lg:w-1/2 flex flex-col justify-center items-center p-1 lg:p-8 -mt-10 lg:mt-0 mb-20 ${
              isDarkMode ? "bg-gray-900" : "bg-gray-50"
            }`}
          >
            <div
              className={`w-full max-w-lg p-6 md:p-10 shadow-md rounded-lg ${
                isDarkMode ? "bg-gray-800 text-white" : "bg-white text-black"
              }`}
            >
              <h2 className="text-2xl font-bold mb-8 text-center mt-4 lg:mt-0">
                เข้าสู่ระบบ
              </h2>
              <form className="space-y-4" onSubmit={handleLogin}>
           {/* Email Field */}
                <div className="mb-6">
                  <div className="relative flex items-center">
                    {/* ไอคอน */}
                    <span className="absolute left-4 top-1/2 -translate-y-1/2">
                      <img src={Images.letterIcon} alt="Email Icon" className="w-5 h-5" />
                    </span>
                    {/* ช่องกรอกอีเมล */}
                    <input
                      type="text"
                      id="email"
                      placeholder="Email"
                      className={`w-full pl-12 pr-4 py-2 border rounded-lg focus:outline-none focus:ring-2 ${
                        isDarkMode
                          ? "bg-gray-700 text-white border-gray-600 focus:ring-purple-400"
                          : "bg-gray-50 text-black border-gray-300 focus:ring-purple-600"
                      }`}
                    />
                  </div>
                  {/* ข้อความข้อผิดพลาดอีเมล */}
                  {emailError && <p className="text-red-500 text-sm mt-1 pl-12">{emailError}</p>}
                </div>

                {/* Password Field */}
                <div className="mb-6">
                  <div className="relative flex items-center">
                    {/* ไอคอน */}
                    <span className="absolute left-4 top-1/2 -translate-y-1/2">
                      <img src={Images.keyIcon} alt="Password Icon" className="w-5 h-5" />
                    </span>
                    {/* ช่องกรอกรหัสผ่าน */}
                    <input
                      type={showPassword ? "text" : "password"}
                      id="password"
                      placeholder="Password"
                      className={`w-full pl-12 pr-12 py-2 border rounded-lg focus:outline-none focus:ring-2 ${
                        isDarkMode
                          ? "bg-gray-700 text-white border-gray-600 focus:ring-purple-400"
                          : "bg-gray-50 text-black border-gray-300 focus:ring-purple-600"
                      }`}
                    />
                    {/* ไอคอน toggle password */}
                    <span
                      className="absolute right-4 top-1/2 -translate-y-1/2 cursor-pointer"
                      onClick={() => setShowPassword(!showPassword)}
                    >
                      <img
                        src={showPassword ? Images.eyeopenIcon : Images.eyeIcon}
                        alt="Toggle Password Visibility"
                        className="w-5 h-5"
                      />
                    </span>
                  </div>
                  {/* ข้อความข้อผิดพลาดรหัสผ่าน */}
                  {passwordError && <p className="text-red-500 text-sm mt-1 pl-12">{passwordError}</p>}
                </div>





                <div className="flex items-end text-sm">
                  <Link to="/forgot-password" className={`ml-auto hover:underline ${isDarkMode ? "text-purple-300" : "text-purple-500"}`}>
                    Forgot Password?
                  </Link>
                </div>

                <button
                  type="submit"
                  className={`w-full py-2 rounded-lg hover:bg-opacity-90 transition duration-200 relative z-10 ${
                    isDarkMode ? "bg-purple-500 text-white" : "bg-purple-700 text-white"
                  }`}
                >
                  เข้าสู่ระบบ
                </button>
              </form>

           

              {/* ปุ่ม Login with Google */}
              <div className="flex items-center my-6">
                <div className="flex-grow border-t border-gray-300"></div>
                <span className="mx-4">OR Sign in with</span>
                <div className="flex-grow border-t border-gray-300"></div>
              </div>
              <div className="w-full flex justify-center">
                <GoogleLogin
                  onSuccess={handleGoogleLoginSuccess}
                  onError={handleGoogleLoginError}
                  className="w-full py-2 rounded-lg"
                  style={{
                    background: "transparent",
                    border: "none",
                    boxShadow: "none",
                    fontSize: "14px",
                    color: isDarkMode ? "white" : "black",
                  }}
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </GoogleOAuthProvider>
  );
}
