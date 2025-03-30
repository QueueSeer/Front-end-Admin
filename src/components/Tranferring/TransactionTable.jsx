import React, { useState, useMemo } from "react";
import Images from "../../assets";

const TransactionTable = ({ transactions, activeTab, activeStatus, onActionClick }) => {
  const [selectedAction, setSelectedAction] = useState(null);

  // กรองรายการตามแท็บและสถานะวันที่
  const filteredTransactions = useMemo(() => {
    let filtered = [...transactions];

    // กรองตามแท็บ (ถ้าไม่ใช่ "ทั้งหมด")
    if (activeTab !== "ทั้งหมด") {
      switch (activeTab) {
        case "รอตรวจสอบ":
          filtered = filtered.filter((txn) => txn.status === "รอการอนุมัติ");
          break;
        case "อนุมัติแล้ว":
          filtered = filtered.filter((txn) => txn.status === "อนุมัติแล้ว");
          break;
        case "ปฏิเสธ":
          filtered = filtered.filter((txn) => txn.status === "ปฏิเสธ");
          break;
        default:
          break;
      }
    }

    // กรองตามสถานะวัน
    if (activeStatus !== "ทั้งหมด") {
      const today = new Date();
      today.setHours(0, 0, 0, 0);

      const startOfWeek = new Date(today);
      startOfWeek.setDate(today.getDate() - today.getDay());

      const startOfMonth = new Date(today);
      startOfMonth.setDate(1);

      filtered = filtered.filter((txn) => {
        // ถ้ามี raw_date จาก API ให้ใช้ raw_date แทน
        const txnDate = txn.raw_date ? new Date(txn.raw_date) : parseThaiDateTime(txn.date);
        
        switch (activeStatus) {
          case "วันนี้":
            return txnDate >= today;
          case "สัปดาห์นี้":
            return txnDate >= startOfWeek;
          case "เดือนนี้":
            return txnDate >= startOfMonth;
          default:
            return true;
        }
      });
    }

    return filtered;
  }, [transactions, activeTab, activeStatus]);

  // ฟังก์ชันแปลงวันที่ในรูปแบบไทยเป็น Date object
  const parseThaiDateTime = (thaiDateTimeStr) => {
    // รูปแบบคาดว่าจะเป็น "9 กันยายน 2567 04:30 น."
    try {
      // แยกวันที่และเวลา
      const parts = thaiDateTimeStr.split(' ');
      if (parts.length < 4) return new Date(); // รูปแบบไม่ถูกต้อง
      
      const day = parseInt(parts[0]);
      const monthNames = {
        'มกราคม': 0, 'กุมภาพันธ์': 1, 'มีนาคม': 2, 'เมษายน': 3,
        'พฤษภาคม': 4, 'มิถุนายน': 5, 'กรกฎาคม': 6, 'สิงหาคม': 7,
        'กันยายน': 8, 'ตุลาคม': 9, 'พฤศจิกายน': 10, 'ธันวาคม': 11
      };
      const month = monthNames[parts[1]];
      const year = parseInt(parts[2]) - 543; // แปลงปีพุทธศักราชเป็นคริสต์ศักราช
      
      // แยกชั่วโมงและนาที
      const timeParts = parts[3].split(':');
      const hour = parseInt(timeParts[0]);
      const minute = parseInt(timeParts[1]);
      
      return new Date(year, month, day, hour, minute);
    } catch (error) {
      console.error("Error parsing Thai date time:", error);
      return new Date(); // กรณีมีข้อผิดพลาดให้คืนค่าวันที่ปัจจุบัน
    }
  };

  // กำหนดไอคอนสำหรับช่องทางการเงิน
  const getChannelIcon = (channel) => {
    if (channel.includes("Promptpay") || channel.includes("PromptPay")) {
      return Images.promtpay;
    } else if (channel.includes("Bank") || channel.includes("ธนาคาร")) {
      return Images.bank || Images.promtpay; // ใช้ไอคอนธนาคาร หรือใช้ promptpay แทนถ้าไม่มี
    }
    return Images.promtpay; // ใช้ค่าเริ่มต้น
  };

  return (
    <div className="bg-white shadow-md rounded-lg p-6 overflow-x-auto">
      {filteredTransactions.length === 0 ? (
        <div className="text-center py-8 text-gray-500">
          ไม่พบข้อมูลธุรกรรม
        </div>
      ) : (
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
                    src={getChannelIcon(txn.channel)}
                    alt="Payment Channel Icon"
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
                      disabled={txn.status !== "รอการอนุมัติ"}
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
                          className="block px-4 py-2 text-gray-700 hover:bg-gray-100 w-full text-left"
                        >
                          อนุมัติ
                        </button>
                        <button
                          onClick={() => {
                            onActionClick("ปฏิเสธ", txn);
                            setSelectedAction(null); // Reset Action Menu
                          }}
                          className="block px-4 py-2 text-gray-700 hover:bg-gray-100 w-full text-left"
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
      )}
    </div>
  );
};

export default TransactionTable;