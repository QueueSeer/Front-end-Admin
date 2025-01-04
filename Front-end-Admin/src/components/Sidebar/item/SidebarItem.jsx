import React from "react";
import { Link } from "react-router-dom";

const SidebarItem = ({ icon, text, href, isActive, onClick }) => {
  return (
    <li>
      <Link
        to={href}
        onClick={onClick}
        className={`flex items-center p-3 rounded-md cursor-pointer font-medium ${
          isActive
            ? "bg-[#B6AFCA] text-black font-bold" // Active State
            : "text-gray-700 hover:bg-[#B6AFCA] hover:text-black"
        }`}
      >
        <img src={icon} alt={text} className="w-5 h-5" />
        <span className="ml-3">{text}</span>
      </Link>
    </li>
  );
};

export default SidebarItem;
