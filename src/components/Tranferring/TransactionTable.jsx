import React, { useState } from "react";
import Images from "../../assets";

const TransactionTable = ({ transactions, activeTab, activeStatus, onActionClick }) => {
  const [selectedAction, setSelectedAction] = useState(null);

  // Filter Transactions by Active Tab and Status
  const filteredTransactions = transactions.filter((txn) => {
    if (activeTab !== "ทั้งหมด" && activeTab !== "All" && txn.status !== activeTab) {
      return false;
    }
    return true;
  });

  return (
    <div className="bg-white shadow-md rounded-lg p-6">
      <table className="w-full table-auto border-collapse">
        <thead className="bg-gray-100 text-gray-600 text-sm">
          <tr>
            <th className="p-4 text-left">ไอดีผู้ใช้งาน</th>
            <th className="p-4 text-left">วันเวลาในการทำธุรกรรม</th>
            <th className="p-4 text-left">ช่องทางการเงิน</th>
            <th className="p-4 text-left">ประเภท</th>
            <th className="p-4 text-left">จำนวน</th>
            <th className="p-4 text-left">สถานะ</th>
            <th className="p-4 text-left">Actions</th>
          </tr>
        </thead>
        <tbody>
          {filteredTransactions.map((txn, index) => (
            <tr key={index} className="border-t text-sm text-gray-700">
              <td className="p-4">{txn.username}</td>
              <td className="p-4">{txn.date}</td>
              <td className="p-4 flex items-center gap-2">
                <img
                  src={Images.promtpay}
                  alt="PromptPay Icon"
                  className="w-5 h-5"
                />
                {txn.channel}
              </td>
              <td className="p-4">{txn.type}</td>
              <td className="p-4 text-left">{txn.amount}</td>
              <td className="p-4">
                <span
                  className={`px-3 py-1 rounded-full text-white ${
                    txn.status === "อนุมัติแล้ว"
                      ? "bg-green-500"
                      : txn.status === "รอการอนุมัติ"
                      ? "bg-yellow-500"
                      : "bg-red-500"
                  }`}
                >
                  {txn.status}
                </span>
              </td>
              <td className="p-4">
                <div className="relative">
                  <button
                    className={`p-2 ${
                      txn.status === "รอการอนุมัติ"
                        ? "text-gray-500 hover:text-gray-700"
                        : "text-gray-300 cursor-not-allowed"
                    }`}
                    onClick={() =>
                      txn.status === "รอการอนุมัติ"
                        ? setSelectedAction(
                            selectedAction === index ? null : index
                          )
                        : null
                    }
                  >
                    ⋮
                  </button>
                  {selectedAction === index && txn.status === "รอการอนุมัติ" && (
                    <div className="absolute top-full right-0 bg-white shadow-md rounded-md z-10">
                      <button
                        onClick={() => {
                          onActionClick("อนุมัติ", txn);
                          setSelectedAction(null); // Reset Action Menu
                        }}
                        className="block px-4 py-2 text-gray-700 hover:bg-gray-100"
                      >
                        อนุมัติ
                      </button>
                      <button
                        onClick={() => {
                          onActionClick("ปฏิเสธ", txn);
                          setSelectedAction(null); // Reset Action Menu
                        }}
                        className="block px-4 py-2 text-gray-700 hover:bg-gray-100"
                      >
                        ปฏิเสธ
                      </button>
                    </div>
                  )}
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default TransactionTable;
