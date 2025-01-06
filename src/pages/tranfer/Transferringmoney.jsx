import React, { useState } from "react";
import Images from "../../assets";
import Fillterbar from "../../components/fillterbar";
import Sidebar from "../../components/Sidebar";
import FilterTabs from "../../components/Tranferring/FilterTabs";
import OverviewCard from "../../components/Tranferring/OverviewCard";
import TransactionTable from "../../components/Tranferring/TransactionTable";
import ConfirmationModal from "../../components/popup/ConfirmationModal";

export default function Transferringmoney() {
    const [activeTab, setActiveTab] = useState("ทั้งหมด");
    const [activeStatus, setActiveStatus] = useState("วันนี้");
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [modalData, setModalData] = useState(null);
    const [transactions, setTransactions] = useState([
      {
        username: "@Mamfkljmvro",
        date: "9 กันยายน 2567 04:30 น.",
        channel: "Promptpay - 3345xxxx",
        type: "ยอดเงินออก",
        amount: "-฿5,670.00",
        status: "รอการอนุมัติ",
      },
      {
        username: "@Mamfkljmvro",
        date: "8 กันยายน 2567 03:13 น.",
        channel: "Promptpay - 3345xxxx",
        type: "ยอดเงินออก",
        amount: "-฿15,000.00",
        status: "อนุมัติแล้ว",
      },
      {
        username: "@Mamfkljmvro",
        date: "7 กันยายน 2567 01:00 น.",
        channel: "Promptpay - 3345xxxx",
        type: "ยอดเงินออก",
        amount: "-฿3,456.00",
        status: "ปฏิเสธ",
      },
    ]);
  
    const handleActionClick = (action, data) => {
        if (action === "ปฏิเสธ") {
          // Popup สำหรับปฏิเสธ (ไม่มีข้อมูลผู้ใช้งาน)
          setModalData({ action });
        } else if (action === "อนุมัติ") {
          // Popup สำหรับอนุมัติ (มีข้อมูลผู้ใช้งาน)
          const prefix = data.channel.split("-")[1].slice(0, 4); // เลขต้น เช่น '3345'
          const hiddenPart = "89625"; // เลขจริงที่ใช้แทน 'xxxx'
          const fullPromptpayNumber = `0${prefix}${hiddenPart}`; // รวมเลขเต็ม เช่น '0334589625'
      
          setModalData({
            ...data,
            action,
            accountName: "ชื่อบัญชีตัวอย่าง", // สมมติ
            fullPromptpayNumber,
          });
        }
        setIsModalOpen(true);
      };
      
      
      
      
  
    const handleModalConfirm = () => {
        const updatedTransactions = transactions.map((txn) =>
          txn.username === modalData.username && txn.date === modalData.date
            ? { ...txn, status: modalData.action === "อนุมัติ" ? "อนุมัติแล้ว" : "ปฏิเสธ" }
            : txn
        );
        setTransactions(updatedTransactions);
      
        // Reset modal state
        setIsModalOpen(false);
        setModalData(null);
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
                src={Images.Transferringmoney}
                alt="Transferring Money Icon"
                className="w-6 h-6 mr-2"
              />
              การโอนเงิน
            </h1>
  
            <hr className="border-gray-300 dark:border-gray-700 mb-6" />
  
            {/* Overview Cards */}
            <div className="grid grid-cols-3 gap-6 mb-8">
              <OverviewCard
                icon={Images.TotalAmount}
                title="ยอดเงินทั้งหมด"
                amount="฿25,214.00"
              />
              <OverviewCard
                icon={Images.IncomingAmount}
                title="ยอดเงินเข้า"
                amount="฿28,670.00"
              />
              <OverviewCard
                icon={Images.AmountIssued}
                title="ยอดเงินออก"
                amount="฿3,456.00"
              />
            </div>
  
            {/* Filter Tabs */}
            <FilterTabs
              activeTab={activeTab}
              setActiveTab={setActiveTab}
              activeStatus={activeStatus}
              setActiveStatus={setActiveStatus}
            />
  
            {/* Transaction Table */}
            <TransactionTable
              transactions={transactions}
              activeTab={activeTab}
              activeStatus={activeStatus}
              onActionClick={handleActionClick}
            />
  
            {/* Confirmation Modal */}
            {isModalOpen && (
              <ConfirmationModal
                data={modalData}
                onClose={() => setIsModalOpen(false)}
                onConfirm={handleModalConfirm}
              />
            )}
          </div>
        </div>
      </div>
    );
  }