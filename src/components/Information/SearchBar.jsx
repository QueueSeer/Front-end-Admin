import React from "react";
import Images from "../../assets";

const SearchBar = ({ selectedRows }) => {
  return (
    <div className="flex justify-between items-center mt-6 font-sans">
      <div className="flex items-center gap-2">
        <button className="flex items-center px-4 py-2 bg-gray-100 border rounded-md text-gray-700 hover:bg-gray-200">
          <img src={Images.Filterslines} alt="Filter" className="w-5 h-5" />
          <span className="ml-2">Filters</span>
        </button>
        {/* แสดงจำนวนแถวที่เลือก */}
        <span className="text-gray-500 text-sm">
          {selectedRows} row{selectedRows === 1 ? "" : "s"} selected
        </span>
      </div>
      <div className="relative">
        <input
          type="text"
          placeholder="Search"
          className="pl-10 pr-4 py-2 border rounded-md w-72 focus:outline-none focus:ring-2 focus:ring-purple-500"
        />
        <img
          src={Images.search}
          alt="Search Icon"
          className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-500"
        />
      </div>
    </div>
  );
};

export default SearchBar;
