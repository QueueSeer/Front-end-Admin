import React, { useState } from "react";
import Images from "../../assets";

const SearchBar = ({ selectedRows, onSearch }) => {
  const [searchQuery, setSearchQuery] = useState("");

  const handleSearch = (e) => {
    e.preventDefault();
    if (onSearch) {
      onSearch(searchQuery);
    }
  };

  return (
    <div className="flex justify-between items-center mt-6 font-sans">
      <div className="flex items-center gap-2">
        <button className="flex items-center px-4 py-2 bg-gray-100 border rounded-md text-gray-700 hover:bg-gray-200">
          <img src={Images.Filterslines} alt="Filter" className="w-5 h-5" />
          <span className="ml-2">Filters</span>
        </button>
        {selectedRows > 0 && (
          <span className="text-sm text-gray-600">
            เลือก {selectedRows} รายการ
          </span>
        )}
      </div>
      <form onSubmit={handleSearch} className="relative">
        <input
          type="text"
          placeholder="ค้นหาชื่อผู้ใช้"
          className="pl-10 pr-4 py-2 border rounded-md w-72 focus:outline-none focus:ring-2 focus:ring-purple-500"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
        <img
          src={Images.search}
          alt="Search Icon"
          className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-500"
        />
        <button
          type="submit"
          className="absolute right-3 top-1/2 transform -translate-y-1/2 text-purple-500 hover:text-purple-700"
        >
          ค้นหา
        </button>
      </form>
    </div>
  );
};

export default SearchBar;