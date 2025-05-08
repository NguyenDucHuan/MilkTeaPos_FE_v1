import React from 'react';
import {
  Modal,
  Box,
  Typography,
  FormControl,
  Select,
  MenuItem,
  Button,
  CircularProgress,
  TextField,
  InputAdornment,
} from '@mui/material';
import { toast } from 'react-hot-toast';
import fetcher from '../../apis/fetcher';

const PaymentMethodModal = ({
  open,
  onClose,
  selectedOrder,
  onPaymentSuccess,
}) => {
  const [paymentMethods, setPaymentMethods] = React.useState([]);
  const [selectedPaymentMethod, setSelectedPaymentMethod] = React.useState('');
  const [isLoadingPaymentMethods, setIsLoadingPaymentMethods] = React.useState(false);
  const [amountPaid, setAmountPaid] = React.useState('');
  const [isProcessing, setIsProcessing] = React.useState(false);

  const fetchPaymentMethods = async () => {
    try {
      setIsLoadingPaymentMethods(true);
      const response = await fetcher.get('/payment-methods');
      setPaymentMethods(response.data);
    } catch (error) {
      console.error('Error fetching payment methods:', error);
      toast.error('Không thể tải danh sách phương thức thanh toán');
    } finally {
      setIsLoadingPaymentMethods(false);
    }
  };

  React.useEffect(() => {
    if (open) {
      fetchPaymentMethods();
    }
  }, [open]);

  const handlePaymentMethodSelect = async () => {
    if (!selectedPaymentMethod) {
      toast.error('Vui lòng chọn phương thức thanh toán');
      return;
    }

    const selectedMethod = paymentMethods.find(m => m.paymentMethodId === selectedPaymentMethod);

    if (selectedMethod.methodName === 'Cash') {
      if (!amountPaid) {
        toast.error('Vui lòng nhập số tiền khách đưa');
        return;
      }

      if (Number(amountPaid) < selectedOrder.totalAmount) {
        toast.error('Số tiền khách đưa phải lớn hơn hoặc bằng tổng tiền đơn hàng');
        return;
      }

      try {
        setIsProcessing(true);
        const formData = new FormData();
        formData.append('PaymentMethodId', selectedPaymentMethod);
        formData.append('AmountPaid', amountPaid);

        await fetcher.put(`/transactions?id=${selectedOrder.orderId}`, formData, {
          headers: {
            'Content-Type': 'multipart/form-data',
          },
        });
        
        toast.success('Thanh toán thành công');
        onPaymentSuccess();
        onClose();
      } catch (error) {
        console.error('Error processing cash payment:', error);
        const errorMessage = error.response?.data?.detail || 'Không thể xử lý thanh toán';
        toast.error(errorMessage);
      } finally {
        setIsProcessing(false);
      }
    } else if (selectedMethod.methodName === 'Online') {
      try {
        setIsProcessing(true);
        
        // Kiểm tra xem đơn hàng đã có giao dịch thanh toán chưa
        try {
          const checkResponse = await fetcher.get(`/transactions/order/${selectedOrder.orderId}`);
          if (checkResponse.data && checkResponse.data.paymentLink) {
            // Nếu đã có link thanh toán, mở link đó
            window.open(checkResponse.data.paymentLink, '_blank');
            toast.success('Đang chuyển hướng đến trang thanh toán');
            onClose();
            return;
          }
        } catch (checkError) {
          // Nếu không tìm thấy giao dịch, tiếp tục tạo mới
          console.log('No existing transaction found, creating new one');
        }

        // Tạo giao dịch mới
        const formData = new FormData();
        formData.append('PaymentMethodId', selectedPaymentMethod);
        formData.append('AmountPaid', '');

        const response = await fetcher.put(`/transactions?id=${selectedOrder.orderId}`, formData, {
          headers: {
            'Content-Type': 'multipart/form-data',
          },
        });
        
        if (response.data.paymentLink) {
          window.open(response.data.paymentLink, '_blank');
          toast.success('Đang chuyển hướng đến trang thanh toán');
          onClose();
        } else {
          toast.error('Không thể tạo link thanh toán');
        }
      } catch (error) {
        console.error('Error processing online payment:', error);
        const errorMessage = error.response?.data?.detail || 'Không thể xử lý thanh toán online';
        toast.error(errorMessage);
      } finally {
        setIsProcessing(false);
      }
    }
  };

  const handleClose = () => {
    setSelectedPaymentMethod('');
    setAmountPaid('');
    onClose();
  };

  const selectedMethod = paymentMethods.find(m => m.paymentMethodId === selectedPaymentMethod);

  return (
    <Modal
      open={open}
      onClose={handleClose}
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
        <Typography variant="h6" component="h2" gutterBottom>
          Chọn phương thức thanh toán
        </Typography>
        
        <FormControl fullWidth sx={{ mt: 2 }}>
          <Select
            value={selectedPaymentMethod}
            onChange={(e) => setSelectedPaymentMethod(e.target.value)}
            displayEmpty
            disabled={isLoadingPaymentMethods}
          >
            <MenuItem value="" disabled>
              {isLoadingPaymentMethods ? 'Đang tải...' : 'Chọn phương thức thanh toán'}
            </MenuItem>
            {paymentMethods.map((method) => (
              <MenuItem key={method.paymentMethodId} value={method.paymentMethodId}>
                {method.methodName}
              </MenuItem>
            ))}
          </Select>
        </FormControl>

        {selectedMethod?.methodName === 'Cash' && (
          <TextField
            fullWidth
            label="Số tiền khách đưa"
            type="number"
            value={amountPaid}
            onChange={(e) => setAmountPaid(e.target.value)}
            sx={{ mt: 2 }}
            InputProps={{
              startAdornment: <InputAdornment position="start">VNĐ</InputAdornment>,
            }}
            helperText={`Tổng tiền đơn hàng: ${selectedOrder.totalAmount.toLocaleString('vi-VN')} VNĐ`}
          />
        )}

        <Box sx={{ mt: 3, display: 'flex', justifyContent: 'flex-end', gap: 2 }}>
          <Button
            variant="outlined"
            onClick={handleClose}
            disabled={isProcessing}
          >
            Hủy
          </Button>
          <Button
            variant="contained"
            onClick={handlePaymentMethodSelect}
            disabled={!selectedPaymentMethod || isLoadingPaymentMethods || isProcessing || 
              (selectedMethod?.methodName === 'Cash' && !amountPaid)}
          >
            {isProcessing ? <CircularProgress size={24} /> : 'Xác nhận'}
          </Button>
        </Box>
      </Box>
    </Modal>
  );
};

export default PaymentMethodModal; 