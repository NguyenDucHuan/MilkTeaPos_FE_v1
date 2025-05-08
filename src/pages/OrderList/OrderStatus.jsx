import React, { useState } from 'react';
import {
  AccessTime as PendingIcon,
  Restaurant as PreparingIcon,
  CheckCircle as SuccessIcon,
  Cancel as CancelledIcon,
} from '@mui/icons-material';
import OrderStatusModal from './OrderStatusModal';
import axios from 'axios';
import { toast } from 'react-hot-toast';

const statusConfig = {
  Pending: {
    icon: PendingIcon,
    color: 'bg-yellow-100 text-yellow-800',
    label: 'Đang xử lý',
  },
  Preparing: {
    icon: PreparingIcon,
    color: 'bg-blue-100 text-blue-800',
    label: 'Đang pha chế',
  },
  Success: {
    icon: SuccessIcon,
    color: 'bg-green-100 text-green-800',
    label: 'Thành công',
  },
  Cancelled: {
    icon: CancelledIcon,
    color: 'bg-red-100 text-red-800',
    label: 'Đã hủy',
  },
};

const OrderStatus = ({ status, orderId, onStatusChange }) => {
  const [showModal, setShowModal] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);
  const statusInfo = statusConfig[status] || statusConfig.Pending;
  const StatusIcon = statusInfo.icon;

  const handleClick = () => {
    if (onStatusChange) {
      setShowModal(true);
    }
  };

  const handleStatusSelect = async (newStatus) => {
    try {
      setIsUpdating(true);
      // Lấy statusId từ tên trạng thái
      const statusId = newStatus === 'Pending' ? 1 :
                      newStatus === 'Preparing' ? 2 :
                      newStatus === 'Success' ? 3 :
                      newStatus === 'Cancelled' ? 4 : 1;

      const response = await axios.put(`https://localhost:7186/api/order/change-status/${orderId}?statusId=${statusId}`);
      console.log('Response:', response.data);
      onStatusChange(newStatus);
      toast.success('Cập nhật trạng thái thành công');
    } catch (error) {
      console.error('Error updating order status:', error);
      if (error.response) {
        console.error('Error response:', error.response.data);
        toast.error(error.response.data || 'Không thể cập nhật trạng thái đơn hàng');
      } else {
        toast.error('Không thể cập nhật trạng thái đơn hàng');
      }
    } finally {
      setIsUpdating(false);
      setShowModal(false);
    }
  };

  return (
    <>
      <div 
        className={`inline-flex items-center gap-2 px-3 py-1 rounded-full ${statusInfo.color} ${onStatusChange ? 'cursor-pointer hover:opacity-80' : ''}`}
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