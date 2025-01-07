import React, { useState } from "react";
import Images from "../../assets";
import Sidebar from "../../components/Sidebar";
import Fillterbar from "../../components/fillterbar";
import Confirmreview from "../../components/popup/Confirmreview";

const ReviewManagement = () => {
  const [reviews, setReviews] = useState([
    {
      id: 1,
      name: "John Doe",
      email: "john.doe@gmail.com",
      review: "แนะนำแอปเกมใหม่ สนุกมาก เล่นแล้วได้รับรางวัลด้วย!",
      comment: "เนื้อหาไม่เกี่ยวกับการทำนาย",
    },
    {
      id: 2,
      name: "Jane Doe",
      email: "jane.doe@gmail.com",
      review: "แอปนี้ดีมาก ใช้งานง่ายสุดๆ!",
      comment: "เนื้อหาไม่เกี่ยวกับการทำนาย",
    },
    // เพิ่มข้อมูลผู้ใช้งานตามต้องการ
  ]);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedReview, setSelectedReview] = useState(null);

  const openModal = (reviewId) => {
    setSelectedReview(reviewId);
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setSelectedReview(null);
    setIsModalOpen(false);
  };

  const confirmDelete = () => {
    setReviews(reviews.filter((review) => review.id !== selectedReview));
    closeModal();
  };

  return (
    <div className="min-h-screen bg-gray-100 flex flex-col">
      {/* Navbar */}
      <Fillterbar />

      {/* Main Layout */}
      <div className="flex px-12 pt-12 gap-14">
        {/* Sidebar */}
        <div className="lg:w-72">
          <Sidebar />
        </div>

        {/* Main Content */}
        <div className="flex-1 bg-white shadow-md rounded-lg p-6 border border-gray-200">
          <h1 className="text-xl font-bold text-[#65558F] dark:text-purple-400 mb-4 flex items-center">
            <img
              src={Images.ReviewManagement}
              alt="Review Management Icon"
              className="w-6 h-6 mr-2"
            />
            การจัดการรีวิว
          </h1>
          <hr className="border-gray-300 dark:border-gray-700 mb-6" />

          <div className="overflow-x-auto p-6">
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
        </div>
      </div>

      {/* Confirmation Modal */}
      <Confirmreview
        isOpen={isModalOpen}
        onClose={closeModal}
        onConfirm={confirmDelete}
      />
    </div>
  );
};

export default ReviewManagement;
