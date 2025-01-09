import React from "react";
import Images from "../../assets";

const ReviewTable = ({ reviews, openModal }) => {
  return (
    <div className="overflow-x-auto">
      <table className="min-w-full table-auto border-collapse bg-white rounded-lg shadow-md">
        <thead className="bg-gray-100 text-[#8A92A6] font-sans">
          <tr>
            <th className="p-4 text-left min-w-[40px]"></th>
            <th className="p-4 text-left min-w-[200px] cursor-pointer">
              ชื่อผู้ใช้
              <img
                src={Images.FilterDown}
                alt="Filter"
                className="inline w-3 h-3 ml-2"
              />
            </th>
            <th className="p-4 text-left min-w-[400px] cursor-pointer">
              รีวิวจากผู้ใช้งาน
              <img
                src={Images.FilterDown}
                alt="Filter"
                className="inline w-3 h-3 ml-2"
              />
            </th>
            <th className="p-4 text-left min-w-[300px] cursor-pointer">
              คำอธิบายของหมอดู
              <img
                src={Images.FilterDown}
                alt="Filter"
                className="inline w-3 h-3 ml-2"
              />
            </th>
            <th className="p-4 text-left min-w-[150px]"></th>
          </tr>
        </thead>
        <tbody>
          {reviews.map((review, index) => (
            <tr
              key={index}
              className="border-t hover:bg-gray-50 font-sans relative"
            >
              {/* คอลัมน์ชื่อผู้ใช้ */}
              <td className="p-4 min-w-[40px]"></td>
              <td className="p-4 flex items-center gap-3 min-w-[200px]">
                <img
                  src={Images.member}
                  alt="User Avatar"
                  className="w-12 h-12 rounded-full"
                />
                <div>
                  <p className="font-medium">{review.name}</p>
                  <p className="text-gray-500 text-sm">{review.email}</p>
                </div>
              </td>

              {/* รีวิว */}
              <td className="p-4 max-w-[400px] break-words">
                {review.review}
              </td>

              {/* คำอธิบาย */}
              <td className="p-4 max-w-[300px] break-words">
                {review.comment}
              </td>

              {/* การกระทำ */}
              <td className="p-4 text-center min-w-[150px]">
                <button
                  onClick={() => openModal(review.id)}
                  className="text-red-500 hover:text-red-700 flex items-center justify-center"
                >
                  <img
                    src={Images.Trash}
                    alt="Delete Icon"
                    className="w-12 h-12"
                  />
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default ReviewTable;
