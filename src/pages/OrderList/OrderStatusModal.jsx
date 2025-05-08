import React, { useState, useEffect } from 'react';
import {
  Modal,
  Box,
  Typography,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  IconButton,
  CircularProgress,
} from '@mui/material';
import {
  Close as CloseIcon,
  AccessTime as PendingIcon,
  Restaurant as PreparingIcon,
  CheckCircle as SuccessIcon,
  Cancel as CancelledIcon,
} from '@mui/icons-material';
import axios from 'axios';
import { toast } from 'react-hot-toast';

const statusConfig = {
  Pending: {
    icon: PendingIcon,
    color: 'text-yellow-600',
    label: 'Đang xử lý',
  },
  Preparing: {
    icon: PreparingIcon,
    color: 'text-blue-600',
    label: 'Đang pha chế',
  },
  Success: {
    icon: SuccessIcon,
    color: 'text-green-600',
    label: 'Thành công',
  },
  Cancelled: {
    icon: CancelledIcon,
    color: 'text-red-600',
    label: 'Đã hủy',
  },
};

const OrderStatusModal = ({ open, onClose, currentStatus, onStatusSelect }) => {
  const [statuses, setStatuses] = useState([]);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    const fetchStatuses = async () => {
      try {
        setIsLoading(true);
        const response = await axios.get('https://localhost:7186/api/order/order-status');
        console.log('Danh sách trạng thái:', response.data);
        setStatuses(response.data);
      } catch (error) {
        console.error('Error fetching order statuses:', error);
        toast.error('Không thể tải danh sách trạng thái');
      } finally {
        setIsLoading(false);
      }
    };

    if (open) {
      fetchStatuses();
    }
  }, [open]);

  return (
    <Modal
      open={open}
      onClose={onClose}
      aria-labelledby="order-status-modal"
    >
      <Box
        sx={{
          position: 'absolute',
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
          width: 400,
          bgcolor: 'background.paper',
          boxShadow: 24,
          p: 4,
          borderRadius: 2,
        }}
      >
        <div className="flex justify-between items-center mb-4">
          <Typography variant="h6" component="h2">
            Chọn trạng thái đơn hàng
          </Typography>
          <IconButton onClick={onClose}>
            <CloseIcon />
          </IconButton>
        </div>

        {isLoading ? (
          <div className="flex justify-center p-4">
            <CircularProgress />
          </div>
        ) : (
          <List>
            {statuses.map((status) => {
              const config = statusConfig[status.statusName];
              const StatusIcon = config?.icon;
              
              return (
                <ListItem
                  key={status.statusId}
                  button
                  onClick={() => onStatusSelect(status.statusName)}
                  className={`hover:bg-gray-50 rounded-lg ${
                    currentStatus === status.statusName ? 'bg-gray-100' : ''
                  }`}
                >
                  <ListItemIcon>
                    {StatusIcon && <StatusIcon className={config.color} />}
                  </ListItemIcon>
                  <ListItemText 
                    primary={config?.label || status.statusName}
                    className={config?.color}
                  />
                </ListItem>
              );
            })}
          </List>
        )}
      </Box>
    </Modal>
  );
};

export default OrderStatusModal; 