import React from "react";

const OverviewCard = ({ icon, title, amount }) => {
  return (
    <div className="bg-white shadow-md rounded-lg p-6 flex items-center gap-4">
      <img src={icon} alt={title} className="w-10 h-10" />
      <div>
        <h2 className="text-lg font-medium text-gray-700">{title}</h2>
        <p className="text-2xl font-bold text-[#65558F]">{amount}</p>
      </div>
    </div>
  );
};

export default OverviewCard;
