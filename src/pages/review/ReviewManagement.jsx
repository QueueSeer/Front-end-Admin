import React, { useState, useEffect } from "react";
import Images from "../../assets";
import Sidebar from "../../components/Sidebar";
import Fillterbar from "../../components/Fillterbar";
import Confirmreview from "../../components/popup/Confirmreview";
import ReviewTable from "../../components/Review/ReviewTable";
import axios from "axios";

const ReviewManagement = () => {
  const [reviews, setReviews] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedReview, setSelectedReview] = useState(null);

  // ดึงข้อมูลรีวิวจาก API
  useEffect(() => {
    const fetchReviews = async () => {
      setIsLoading(true);
      try {
        const response = await axios.get("/api/review?direction=desc&limit=10");
        
        console.log("API Response:", response.data); // เพิ่มการ log ข้อมูลที่ได้รับจาก API
        
        // ตรวจสอบโครงสร้างข้อมูล
        let reviewsData = response.data;
        
        // ตรวจสอบว่า reviewsData เป็นอาร์เรย์หรือไม่
        if (!Array.isArray(reviewsData)) {
          // ถ้าไม่ใช่อาร์เรย์ ลองตรวจสอบว่ามี property ที่เป็นอาร์เรย์หรือไม่
          if (reviewsData.results && Array.isArray(reviewsData.results)) {
            reviewsData = reviewsData.results;
          } else if (reviewsData.data && Array.isArray(reviewsData.data)) {
            reviewsData = reviewsData.data;
          } else if (reviewsData.items && Array.isArray(reviewsData.items)) {
            reviewsData = reviewsData.items;
          } else {
            // หากไม่พบอาร์เรย์ในรูปแบบทั่วไป ให้ใช้อาร์เรย์ว่าง
            reviewsData = [];
            console.warn("API did not return an array structure as expected");
          }
        }
        
        // แปลงข้อมูลจาก API เป็นรูปแบบที่ใช้ใน component
        const formattedReviews = reviewsData.map(item => ({
          id: item.id,
          name: item.client?.display_name || "ไม่ระบุชื่อ",
          email: item.client?.id ? `Client ID: ${item.client.id}` : "ไม่มีข้อมูล",
          review: item.text || "",
          comment: "เนื้อหาไม่เกี่ยวกับการทำนาย", // ค่าเริ่มต้นสำหรับคำอธิบาย
          score: item.score || 0,
          date: item.date_created ? new Date(item.date_created).toLocaleDateString('th-TH') : ""
        }));
        
        setReviews(formattedReviews);
      } catch (err) {
        console.error("Error fetching reviews:", err);
        setError("ไม่สามารถโหลดข้อมูลได้");
      } finally {
        setIsLoading(false);
      }
    };

    fetchReviews();
  }, []);

  // เพิ่มฟังก์ชันสำหรับโหลดข้อมูลอีกครั้ง
  const reloadReviews = () => {
    setError(null);
    setIsLoading(true);
    // เรียกใช้ useEffect อีกครั้ง
    const fetchReviews = async () => {
      try {
        const response = await axios.get("/api/review?direction=desc&limit=10");
        
        console.log("API Response on reload:", response.data);
        
        // ใช้ข้อมูลจำลองในกรณีที่ API ไม่ส่งข้อมูลที่ถูกต้องกลับมา
        if (!response.data || !Array.isArray(response.data)) {
          // ข้อมูลจำลอง
          setReviews([
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
        } else {
          // แปลงข้อมูลจาก API
          const formattedReviews = response.data.map(item => ({
            id: item.id,
            name: item.client?.display_name || "ไม่ระบุชื่อ",
            email: item.client?.id ? `Client ID: ${item.client.id}` : "ไม่มีข้อมูล",
            review: item.text || "",
            comment: "เนื้อหาไม่เกี่ยวกับการทำนาย",
            score: item.score || 0,
            date: item.date_created ? new Date(item.date_created).toLocaleDateString('th-TH') : ""
          }));
          
          setReviews(formattedReviews);
        }
      } catch (err) {
        console.error("Error reloading reviews:", err);
        setError("ไม่สามารถโหลดข้อมูลได้");
        
        // ในกรณีที่มีข้อผิดพลาด ใช้ข้อมูลจำลอง
        setReviews([
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
      } finally {
        setIsLoading(false);
      }
    };

    fetchReviews();
  };

  const openModal = (reviewId) => {
    setSelectedReview(reviewId);
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setSelectedReview(null);
    setIsModalOpen(false);
  };

  const confirmDelete = async () => {
    try {
      // เรียกใช้ API ลบรีวิว
      await axios.delete(`/api/review/${selectedReview}`);
      
      // อัปเดต UI หลังลบสำเร็จ
      setReviews(reviews.filter((review) => review.id !== selectedReview));
      closeModal();
    } catch (err) {
      console.error("Error deleting review:", err);
      // ตรงนี้อาจแสดงข้อความแจ้งเตือนเมื่อลบไม่สำเร็จ
      alert("ไม่สามารถลบรีวิวได้ โปรดลองอีกครั้ง");
    }
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

          {/* แสดงตัวแสดงการโหลด */}
          {isLoading && (
            <div className="flex justify-center items-center h-40">
              <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-purple-500"></div>
            </div>
          )}

          {/* แสดงข้อความเมื่อเกิดข้อผิดพลาด */}
          {error && (
            <div className="text-red-500 p-4 bg-red-50 rounded-md mb-4 flex justify-between items-center">
              <span>{error}</span>
              <button 
                onClick={reloadReviews}
                className="px-3 py-1 bg-red-100 hover:bg-red-200 text-red-700 rounded-md text-sm"
              >
                ลองใหม่
              </button>
            </div>
          )}

          {/* ใช้งาน ReviewTable เมื่อโหลดข้อมูลเสร็จแล้ว */}
          {!isLoading && <ReviewTable reviews={reviews} openModal={openModal} />}
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