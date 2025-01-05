import React from "react";
import Images from "../../assets";
import { Link } from "react-router-dom";

export default function Fillterbar() {
  return (
    <div className="navbar bg-base-100 shadow-md px-4">
      {/* โลโก้และชื่อโปรเจกต์ */}
      <div className="flex-1 flex items-center gap-2">
        <img src={Images.logo} alt="Logo" className="w-10 h-10 rounded-md mt-2" />
        <span
          className="text-2xl font-extrabold text-purple-800"
          style={{ fontFamily: "Playfair Display", fontSize: "32px" }}
        >
          Qseer
        </span>
        </div>
    </div>
  );
}