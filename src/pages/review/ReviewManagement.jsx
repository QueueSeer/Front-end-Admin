import React, { useState } from "react";
import Images from "../../assets";
import Sidebar from "../../components/Sidebar";
import Fillterbar from "../../components/fillterbar";
import Confirmreview from "../../components/popup/Confirmreview";
import ReviewTable from "../../components/Review/ReviewTable";

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
  <div className="lg:w-72 flex-shrink-0">
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

          {/* ใช้งาน ReviewTable */}
          <ReviewTable reviews={reviews} openModal={openModal} />
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
