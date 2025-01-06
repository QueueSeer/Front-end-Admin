import React from "react";

const FilterTabs = ({ activeTab, setActiveTab, activeStatus, setActiveStatus }) => {
  const tabs = ["ทั้งหมด", "รอการอนุมัติ", "อนุมัติแล้ว", "ปฏิเสธ"];
  const statusFilters = ["วันนี้", "สัปดาห์นี้", "เดือนนี้"];

  return (
    <div className="flex items-center justify-between mb-4">
      {/* Tabs */}
      <div className="flex gap-4">
        {tabs.map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`text-sm font-medium ${
              activeTab === tab ? "text-purple-600 border-b-2 border-purple-600" : "text-gray-500"
            } pb-2`}
          >
            {tab}
          </button>
        ))}
      </div>

      {/* Status Dropdown */}
      <div className="flex items-center gap-2">
        <span className="text-sm text-gray-500">Filter:</span>
        <select
          className="border rounded px-2 py-1 text-sm text-gray-700"
          onChange={(e) => setActiveStatus(e.target.value)}
        >
          {statusFilters.map((status) => (
            <option key={status} value={status}>
              {status}
            </option>
          ))}
        </select>
      </div>
    </div>
  );
};

export default FilterTabs;
