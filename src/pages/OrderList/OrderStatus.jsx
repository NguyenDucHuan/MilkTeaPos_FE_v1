import React, { useState } from "react";
import {
  AccessTime as PendingIcon,
  Restaurant as PreparingIcon,
  CheckCircle as SuccessIcon,
  Cancel as CancelledIcon,
} from "@mui/icons-material";
import OrderStatusModal from "./OrderStatusModal";
import axios from "axios";
import { toast } from "react-hot-toast";

const statusConfig = {
  Pending: {
    icon: PendingIcon,
    color: "bg-yellow-100 text-yellow-800",
    label: "Chờ xử lý",
    statusId: 1,
  },
  Preparing: {
    icon: PreparingIcon,
    color: "bg-blue-100 text-blue-800",
    label: "Đang pha chế",
    statusId: 2,
  },
  Success: {
    icon: SuccessIcon,
    color: "bg-green-100 text-green-800",
    label: "Thành công",
    statusId: 3,
  },
  Cancelled: {
    icon: CancelledIcon,
    color: "bg-red-100 text-red-800",
    label: "Đã hủy",
    statusId: 4,
  },
};

const OrderStatus = ({ status, orderId, onStatusChange }) => {
  const [showModal, setShowModal] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);
  const statusInfo = statusConfig[status] || statusConfig.Pending;
  const StatusIcon = statusInfo.icon;

  console.log("OrderStatus - Received status:", status);

  const handleClick = () => {
    if (onStatusChange) {
      setShowModal(true);
    }
  };

  const handleStatusSelect = async (newStatus) => {
    try {
      setIsUpdating(true);
      const statusId = statusConfig[newStatus]?.statusId;
      if (!statusId) {
        throw new Error(`Không tìm thấy statusId cho trạng thái ${newStatus}`);
      }

      console.log("Sending PUT request with:", { orderId, statusId });
      const response = await axios.put(
        `https://localhost:7186/api/order/change-status/${orderId}`,
        { statusId },
        {
          headers: {
            "Content-Type": "application/json",
            // Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        }
      );
      console.log("API Response:", response.data);
      onStatusChange(newStatus);
      toast.success("Cập nhật trạng thái thành công");
    } catch (error) {
      console.error("Error updating order status:", {
        status: error.response?.status,
        data: error.response?.data,
        headers: error.response?.headers,
      });
      console.error("Error details:", error.response?.data);
      if (error.response?.status === 400) {
        toast.error(
          error.response?.data?.message ||
            "Yêu cầu không hợp lệ. Vui lòng kiểm tra dữ liệu."
        );
      } else if (error.response?.status === 404) {
        toast.error("Không tìm thấy đơn hàng hoặc endpoint không tồn tại");
      } else if (error.response?.status === 401) {
        toast.error("Không có quyền truy cập, vui lòng đăng nhập lại");
      } else {
        toast.error(
          error.response?.data?.message ||
            "Không thể cập nhật trạng thái đơn hàng"
        );
      }
    } finally {
      setIsUpdating(false);
      setShowModal(false);
    }
  };

  return (
    <>
      <div
        className={`inline-flex items-center gap-2 px-3 py-1 rounded-full ${
          statusInfo.color
        } ${onStatusChange ? "cursor-pointer hover:opacity-80" : ""}`}
        onClick={handleClick}
      >
        {isUpdating ? (
          <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
        ) : (
          <StatusIcon className="w-4 h-4" />
        )}
        <span className="text-sm font-medium">{statusInfo.label}</span>
      </div>

      <OrderStatusModal
        open={showModal}
        onClose={() => setShowModal(false)}
        currentStatus={status}
        onStatusSelect={handleStatusSelect}
      />
    </>
  );
};

export default OrderStatus;
