import React from "react";

const Confirmreview = ({ isOpen, onClose, onConfirm }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
      <div className="bg-white w-[400px] p-6 rounded-lg shadow-lg">
        <h2 className="text-xl font-bold text-[#420F75] mb-4 text-center">
          คุณแน่ใจหรือไม่ว่าต้องการลบความคิดเห็นนี้?
        </h2>
        <p className="text-center text-gray-700 mb-4">
          การลบความคิดเห็นจะไม่สามารถกู้คืนได้
        </p>
        <div className="flex justify-center gap-4 mt-6">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-[#D9D9D9] text-gray-700 rounded hover:bg-gray-300"
          >
            ยกเลิก
          </button>
          <button
            onClick={onConfirm}
            className="px-4 py-2 bg-[#8677A7] text-white rounded hover:bg-[#6D5A90]"
          >
            ยืนยัน
          </button>
        </div>
      </div>
    </div>
  );
};

export default Confirmreview;
