import React from "react";

const ConfirmationModal = ({ data, onClose, onConfirm }) => {
  if (!data) return null;

  const { action, username, fullPromptpayNumber, accountName } = data;

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
      <div className="bg-white w-[450px] p-8 rounded-lg shadow-lg">
        <h2 className="text-2xl font-bold text-[#420F75] mb-6 text-center">
          ยืนยันการทำรายการ
        </h2>
        <p className="text-center text-gray-700 mb-4">
          คุณแน่ใจหรือไม่ว่าต้องการ <span className="font-bold">{action}</span> รายการนี้?
        </p>
        {action === "อนุมัติ" && (
          <div className="text-center text-gray-700 mb-4">
            <p>
              <span className="font-medium">ผู้ใช้งาน:</span> {username}
            </p>
            <p>
              <span className="font-medium">บัญชี:</span> Promptpay -{" "}
              <span className="font-bold">{fullPromptpayNumber}</span>
            </p>
            <p>
              <span className="font-medium">ชื่อบัญชี:</span> {accountName}
            </p>
          </div>
        )}
        <div className="flex justify-center gap-4 mt-6">
          <button
            onClick={onClose}
            className="px-6 py-2 bg-[#D9D9D9] text-gray-700 rounded hover:bg-gray-300"
          >
            ยกเลิก
          </button>
          <button
            onClick={onConfirm}
            className="px-6 py-2 bg-[#8677A7] text-white rounded hover:bg-[#6D5A90]"
          >
            ยืนยัน
          </button>
        </div>
      </div>
    </div>
  );
};

export default ConfirmationModal;
