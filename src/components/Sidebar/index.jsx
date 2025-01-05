import React, { useState, useEffect } from "react";
import SidebarItem from "./item/SidebarItem";
import MenuItem from "./item/MenuItem";
import { useLocation } from "react-router-dom";
import Images from "../../assets";

const Sidebar = () => {
  const location = useLocation();
  const [activeIndex, setActiveIndex] = useState(0);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false); // สำหรับเปิด/ปิด Sidebar ใน Mobile

  useEffect(() => {
    const currentIndex = MenuItem.findIndex((item) =>
      Array.isArray(item.href)
        ? item.href.includes(location.pathname)
        : item.href === location.pathname
    );
    if (currentIndex !== -1) {
      setActiveIndex(currentIndex);
    }
  }, [location.pathname]);

  return (
    <div className="relative">
      {/* Hamburger Button สำหรับ Mobile */}
      {!isSidebarOpen && (
        <button
          onClick={() => setIsSidebarOpen(true)}
          className="lg:hidden fixed top-20 left-4 z-50 p-2 text-purple-700 text-2xl"
        >
          ☰
        </button>
      )}

      {/* Sidebar */}
      <div
        className={`fixed top-30 left-0 h-[calc(100vh-5rem)] bg-white border-r border-gray-200 shadow-lg transition-transform ${
          isSidebarOpen ? "translate-x-0 w-1/2" : "-translate-x-full w-1/2"
        } lg:translate-x-0 lg:w-full lg:static`}
      >
        {/* Close Button */}
        {isSidebarOpen && (
                <button
                    onClick={() => setIsSidebarOpen(false)}
                    className="absolute top-1 right-2 text-gray-700 text-xl z-50"
                >
                    ✖
                </button>
                )}


        {/* Sidebar Content */}
        <div
                className={`bg-white p-3 w-full rounded-lg border border-gray-200 h-full flex flex-col justify-between mb-6 font-sans ${
                    isSidebarOpen ? "pt-8" : "lg:pt-3"
                }`}
                >

      
            
          <ul className="space-y-2 list-none">
            {MenuItem.map((item, index) => (
              <SidebarItem
                key={index}
                icon={item.icon}
                text={item.text}
                href={Array.isArray(item.href) ? item.href[0] : item.href}
                isActive={activeIndex === index}
                onClick={() => setActiveIndex(index)}
              />
            ))}
          </ul>

          {/* Logout Button */}
          <div className="mt-6">
            <button
              onClick={() => console.log("User logged out")}
              className="flex items-center justify-start w-full p-3 rounded-md cursor-pointer font-medium text-gray-700 hover:bg-[#B6AFCA] hover:text-black"
            >
              <img src={Images.Logout} alt="Logout Icon" className="w-5 h-5" />
              <span className="ml-3">ออกจากระบบ</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Sidebar;
