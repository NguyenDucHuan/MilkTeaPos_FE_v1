import React, { useState, useEffect } from 'react';
import {
    Box,
    Typography,
    Table,
    TableHead,
    TableRow,
    TableCell,
    TableBody,
    Paper,
    CircularProgress,
    TextField,
    InputAdornment,
    IconButton,
    TablePagination,
    Collapse,
    Grid,
    Alert,
    Snackbar // Thêm Snackbar để thông báo lỗi fetch items
} from "@mui/material";
import {
    Search as SearchIcon,
    ExpandLess as ExpandLessIcon,
    ExpandMore as ExpandMoreIcon,
    LocalShipping as ShippingIcon,
    CheckCircle as CheckCircleIcon,
    Cancel as CancelIcon,
    AccessTime as PendingIcon,
} from '@mui/icons-material';
import { useDispatch, useSelector } from 'react-redux';
import { fetchOrders } from '../../../store/slices/orderSlice';
import axios from 'axios'; // *** THÊM: Cần thư viện để gọi API (hoặc dùng fetch) ***

// --- Định nghĩa màu sắc và icon cho trạng thái ---
const statusColors = {
    Pending: { bgColor: '#fffbeb', textColor: '#b45309', icon: PendingIcon, label: 'Đang chờ xử lý' },
    Processing: { bgColor: '#eff6ff', textColor: '#1d4ed8', icon: ShippingIcon, label: 'Đang giao' },
    Completed: { bgColor: '#f0fdf4', textColor: '#15803d', icon: CheckCircleIcon, label: 'Hoàn thành' },
    Cancelled: { bgColor: '#fef2f2', textColor: '#b91c1c', icon: CancelIcon, label: 'Đã hủy' },
};

// --- Component hiển thị trạng thái ---
const OrderStatus = ({ status }) => {
    // ... (giữ nguyên)
    const statusInfo = statusColors[status] || statusColors.Pending;
    const StatusIcon = statusInfo.icon;
    return (
        <Box sx={{ display: 'inline-flex', alignItems: 'center', gap: 0.5, px: 1.5, py: 0.5, borderRadius: '16px', backgroundColor: statusInfo.bgColor, color: statusInfo.textColor }}>
            <StatusIcon sx={{ fontSize: '1rem' }} />
            <Typography variant="caption" sx={{ fontWeight: 500 }}>
                {statusInfo.label}
            </Typography>
        </Box>
    );
};

// --- Component chính ---
export default function OrderListAdmin() {
    const dispatch = useDispatch();
    const { orders: ordersData, isLoading: isLoadingOrders, error: errorOrders } = useSelector((state) => state.order);

    // --- State cho UI ---
    const [page, setPage] = useState(0);
    const [rowsPerPage, setRowsPerPage] = useState(10);
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedOrderId, setSelectedOrderId] = useState(null);

    // --- THÊM STATE: Lưu trữ chi tiết items của order đang chọn ---
    const [detailedItems, setDetailedItems] = useState({
        loading: false,
        error: null,
        data: [],
        orderId: null // Lưu ID của order đang xem chi tiết
    });
    const [snackbarOpen, setSnackbarOpen] = useState(false);
    const [snackbarMessage, setSnackbarMessage] = useState('');

    // --- Fetch danh sách orders ---
    useEffect(() => {
        dispatch(fetchOrders());
    }, [dispatch]);

    // --- Hàm gọi API lấy chi tiết items ---
    const fetchOrderItems = async (orderId) => {
        // Nếu đã có dữ liệu cho orderId này và không có lỗi, không fetch lại (tùy chọn)
        // if (detailedItems.orderId === orderId && detailedItems.data.length > 0 && !detailedItems.error) {
        //     setDetailedItems(prev => ({ ...prev, loading: false }));
        //     return;
        // }

        setDetailedItems({ loading: true, error: null, data: [], orderId: orderId });
        try {
            // *** THAY THẾ BẰNG URL API VÀ CẤU HÌNH AXIOS/FETCH CỦA BẠN ***
            // Giả sử base URL đã được cấu hình hoặc bạn dùng URL tuyệt đối
            const response = await axios.get(`/order-item/get-by-order-id/${orderId}`, {
                 // Thêm headers nếu cần (ví dụ: Authorization)
                 // headers: { Authorization: `Bearer ${your_token}` }
            });

             // *** KIỂM TRA CẤU TRÚC RESPONSE THỰC TẾ ***
             // Giả sử response.data là mảng items
            if (Array.isArray(response.data)) {
                 setDetailedItems({ loading: false, error: null, data: response.data, orderId: orderId });
            } else {
                 // Xử lý trường hợp response không như mong đợi
                 console.error("API response is not an array:", response.data);
                 setDetailedItems({ loading: false, error: 'Dữ liệu trả về không hợp lệ.', data: [], orderId: orderId });
                 setSnackbarMessage('Lỗi: Dữ liệu chi tiết đơn hàng không hợp lệ.');
                 setSnackbarOpen(true);
            }

        } catch (err) {
            console.error("Error fetching order items:", err);
            const errorMessage = err.response?.data?.message || err.message || 'Không thể tải chi tiết đơn hàng.';
            setDetailedItems({ loading: false, error: errorMessage, data: [], orderId: orderId });
            setSnackbarMessage(`Lỗi: ${errorMessage}`);
            setSnackbarOpen(true);
        }
    };

    // --- Xử lý UI ---
    const handleChangePage = (event, newPage) => setPage(newPage);
    const handleChangeRowsPerPage = (event) => {
        setRowsPerPage(parseInt(event.target.value, 10));
        setPage(0);
    };
    const handleSearch = (event) => {
        setSearchTerm(event.target.value);
        setPage(0);
    };

    // --- CẬP NHẬT: Xử lý xem chi tiết và gọi API items ---
    const handleViewDetails = (orderId) => {
        const newSelectedOrderId = selectedOrderId === orderId ? null : orderId;
        setSelectedOrderId(newSelectedOrderId);

        // Nếu mở collapse (newSelectedOrderId có giá trị) thì fetch items
        if (newSelectedOrderId) {
            fetchOrderItems(newSelectedOrderId);
        } else {
            // Nếu đóng collapse, có thể reset state items (tùy chọn)
             setDetailedItems({ loading: false, error: null, data: [], orderId: null });
        }
    };

    const handleCloseSnackbar = (event, reason) => {
        if (reason === 'clickaway') {
            return;
        }
        setSnackbarOpen(false);
    };


    // --- Chuẩn bị dữ liệu ---
    const ordersList = Array.isArray(ordersData?.items)
        ? ordersData.items
        : Array.isArray(ordersData)
            ? ordersData
            : [];

    // Lọc dữ liệu trên client
    const filteredOrders = ordersList.filter((order) => {
        // ... (giữ nguyên logic filter)
        if (!order) return false;
        const searchLower = searchTerm.toLowerCase();
        const id = order.id ?? order.orderId;
        const note = order.note ?? '';
        const staffName = order.staffName ?? '';
        const paymentMethod = order.paymentMethod ?? (order.paymentMethodId === 1 ? 'Tiền mặt' : (order.paymentMethodId === 2 ? 'Chuyển khoản' : '')); // Cập nhật nếu có nhiều phương thức
        const currentStatus = order.orderstatusupdates?.[0]?.orderStatus || 'Pending';
        const statusLabel = statusColors[currentStatus]?.label.toLowerCase() || '';

        // Thêm tìm kiếm sản phẩm nếu dữ liệu order gốc có items (hiện tại không có)
        // const productSearch = order.orderitems?.some(item =>
        //     item.product?.productName?.toLowerCase().includes(searchLower)
        // ) ?? false;

        return (
            id?.toString().toLowerCase().includes(searchLower) ||
            note.toLowerCase().includes(searchLower) ||
            staffName.toLowerCase().includes(searchLower) ||
            paymentMethod.toLowerCase().includes(searchLower) ||
            statusLabel.includes(searchLower) //||
            // productSearch // Bỏ tìm kiếm product ở đây vì items fetch sau
        );
    });

    // --- Hàm định dạng ---
    const formatDate = (dateString) => {
        // ... (giữ nguyên)
         if (!dateString) return 'N/A';
        try {
            const options = { year: 'numeric', month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit' };
            return new Date(dateString).toLocaleString('vi-VN', options);
        } catch (e) { return 'Invalid Date'; }
    };
    const formatCurrency = (amount) => {
        // ... (giữ nguyên)
        if (typeof amount !== 'number' && typeof amount !== 'string') return 'N/A';
         const numericAmount = Number(amount);
         if (isNaN(numericAmount)) return 'N/A';
         return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(numericAmount);
    };

    // --- Render ---
    return (
        <Box sx={{ p: 3 }}>
            {/* Header */}
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2, flexWrap: 'wrap', gap: 1 }}>
                <Typography variant="h5" fontWeight="bold">
                    Danh sách đơn hàng
                </Typography>
                <TextField
                    placeholder="Tìm kiếm ID, ghi chú, nhân viên..." // Cập nhật placeholder nếu cần
                    value={searchTerm}
                    onChange={handleSearch}
                    size="small"
                    InputProps={{ startAdornment: (<InputAdornment position="start"><SearchIcon fontSize="small" /></InputAdornment>), }}
                    sx={{ width: { xs: '100%', sm: 350 } }}
                />
            </Box>

            {/* Loading / Error cho danh sách orders */}
            {isLoadingOrders && (
                <Box sx={{ display: 'flex', justifyContent: 'center', py: 5 }}><CircularProgress /></Box>
            )}
            {errorOrders && !isLoadingOrders && (
                <Alert severity="error" sx={{ mb: 2 }}>
                    {typeof errorOrders === 'string' ? errorOrders : 'Có lỗi xảy ra khi tải danh sách đơn hàng.'}
                </Alert>
            )}

            {/* Table và Pagination */}
            {!isLoadingOrders && (
                <Paper sx={{ width: '100%', overflow: 'hidden' }}>
                    <Box sx={{ overflowX: 'auto' }}>
                        <Table stickyHeader size="small">
                            <TableHead>
                                <TableRow>
                                    {/* ... (giữ nguyên các header) ... */}
                                    <TableCell sx={{ fontWeight: 'bold' }}>STT</TableCell>
                                    <TableCell sx={{ fontWeight: 'bold' }}>ID</TableCell>
                                    <TableCell sx={{ fontWeight: 'bold' }}>Ngày tạo</TableCell>
                                    <TableCell sx={{ fontWeight: 'bold' }}>Tổng tiền</TableCell>
                                    <TableCell sx={{ fontWeight: 'bold', minWidth: 150 }}>Ghi chú</TableCell>
                                    <TableCell sx={{ fontWeight: 'bold' }}>Nhân viên</TableCell>
                                    <TableCell sx={{ fontWeight: 'bold' }}>Thanh toán</TableCell>
                                    <TableCell sx={{ fontWeight: 'bold' }}>Trạng thái</TableCell>
                                    <TableCell sx={{ fontWeight: 'bold', textAlign: 'center' }}>Chi tiết</TableCell>
                                </TableRow>
                            </TableHead>
                            <TableBody>
                                {filteredOrders.length === 0 && !isLoadingOrders ? (
                                    <TableRow>
                                        <TableCell colSpan={9} align="center">Không tìm thấy đơn hàng.</TableCell>
                                    </TableRow>
                                ) : (
                                    filteredOrders
                                        .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
                                        .map((order, index) => {
                                            const orderId = order.id ?? order.orderId; // Xác định orderId
                                            const currentStatus = order.orderstatusupdates?.[0]?.orderStatus || 'Pending';
                                            const isSelected = selectedOrderId === orderId; // Kiểm tra có đang chọn row này không

                                            return (
                                                <React.Fragment key={orderId}>
                                                    {/* === Hàng chính === */}
                                                    <TableRow hover sx={{ '& > *': { borderBottom: 'unset' } }}>
                                                        <TableCell>{page * rowsPerPage + index + 1}</TableCell>
                                                        <TableCell>#{orderId}</TableCell>
                                                        <TableCell sx={{ whiteSpace: 'nowrap' }}>{formatDate(order.createAt)}</TableCell>
                                                        <TableCell sx={{ whiteSpace: 'nowrap', fontWeight: 500 }}>{formatCurrency(order.totalAmount)}</TableCell>
                                                        <TableCell sx={{ maxWidth: 150, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                                                            {order.note || '-'}
                                                        </TableCell>
                                                        <TableCell>{order.staffName || 'N/A'}</TableCell>
                                                        <TableCell>
                                                            {order.paymentMethod || (order.paymentMethodId === 1 ? "Tiền mặt" : (order.paymentMethodId === 2 ? "Chuyển khoản" : "N/A"))}
                                                        </TableCell>
                                                        <TableCell>
                                                            <OrderStatus status={currentStatus} />
                                                        </TableCell>
                                                        <TableCell align="center">
                                                            <IconButton size="small" onClick={() => handleViewDetails(orderId)}>
                                                                {isSelected ? <ExpandLessIcon /> : <ExpandMoreIcon />}
                                                            </IconButton>
                                                        </TableCell>
                                                    </TableRow>

                                                    {/* === Hàng chi tiết (Collapse) === */}
                                                    <TableRow>
                                                        <TableCell style={{ paddingBottom: 0, paddingTop: 0 }} colSpan={9}>
                                                            <Collapse in={isSelected} timeout="auto" unmountOnExit>
                                                                <Box sx={{ m: 1, p: 2, bgcolor: 'grey.50', borderRadius: 1 }}>
                                                                    <Typography variant="h6" gutterBottom component="div">
                                                                        Chi tiết đơn hàng #{orderId}
                                                                    </Typography>
                                                                    <Grid container spacing={2}>
                                                                        {/* Thông tin cơ bản (Giữ nguyên) */}
                                                                        <Grid item xs={12} md={5}>
                                                                            <Typography variant="body2" ><strong>Ngày đặt:</strong> {formatDate(order.createAt)}</Typography>
                                                                            <Typography variant="body2" ><strong>Nhân viên:</strong> {order.staffName || 'N/A'}</Typography>
                                                                            <Typography variant="body2" ><strong>Thanh toán:</strong> {order.paymentMethod || (order.paymentMethodId === 1 ? "Tiền mặt" : (order.paymentMethodId === 2 ? "Chuyển khoản" : "N/A"))}</Typography>
                                                                            <Typography variant="body2" ><strong>Trạng thái:</strong> {statusColors[currentStatus]?.label || 'N/A'}</Typography>
                                                                            <Typography variant="body2" sx={{ mt: 1 }}><strong>Ghi chú:</strong></Typography>
                                                                            <Typography variant="body2" sx={{ pl: 1, whiteSpace: 'pre-wrap' /* Để xuống dòng nếu ghi chú dài */ }}>{order.note || 'Không có'}</Typography>
                                                                        </Grid>

                                                                        {/* === CẬP NHẬT: Chi tiết sản phẩm === */}
                                                                        <Grid item xs={12} md={7}>
                                                                            <Typography variant="subtitle1" fontWeight="bold" gutterBottom> {/* Đổi thành subtitle1 cho to hơn */}
                                                                                Sản phẩm:
                                                                            </Typography>

                                                                            {/* Hiển thị loading/error/danh sách items */}
                                                                            {detailedItems.loading && detailedItems.orderId === orderId && ( // Chỉ loading cho đúng order đang mở
                                                                                <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: 50 }}>
                                                                                    <CircularProgress size={24} />
                                                                                </Box>
                                                                            )}
                                                                            {detailedItems.error && detailedItems.orderId === orderId &&( // Chỉ báo lỗi cho đúng order đang mở
                                                                                <Alert severity="error" sx={{ mt: 1 }}>{detailedItems.error}</Alert>
                                                                            )}
                                                                            {!detailedItems.loading && !detailedItems.error && detailedItems.orderId === orderId && (
                                                                                <>
                                                                                    {detailedItems.data.length > 0 ? (
                                                                                        detailedItems.data.map((item) => ( // Không cần itemIndex nếu có ID
                                                                                            // *** KIỂM TRA LẠI KEY (dùng item.orderItemId hoặc item.id nếu có) ***
                                                                                            <Box key={item.orderItemId || item.id} sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', py: 0.8, borderBottom: '1px dashed #e0e0e0' }}>
                                                                                                <Box>
                                                                                                    <Typography variant="body2">
                                                                                                        {/* *** KIỂM TRA TÊN TRƯỜNG PRODUCT NAME *** */}
                                                                                                        {item.product?.productName || item.productName || 'N/A'}
                                                                                                    </Typography>
                                                                                                    <Typography variant="caption" color="text.secondary">
                                                                                                        {/* *** KIỂM TRA TÊN TRƯỜNG SỐ LƯỢNG *** */}
                                                                                                        Số lượng: {item.quantity ?? 0}
                                                                                                    </Typography>
                                                                                                </Box>
                                                                                                <Typography variant="body2" fontWeight={500} sx={{ whiteSpace: 'nowrap', ml: 2 }}>
                                                                                                    {/* *** KIỂM TRA TÊN TRƯỜNG GIÁ *** */}
                                                                                                    {formatCurrency((item.price ?? 0) * (item.quantity ?? 0))}
                                                                                                </Typography>
                                                                                            </Box>
                                                                                        ))
                                                                                    ) : (
                                                                                        <Typography variant="body2" sx={{ color: 'text.secondary', mt: 1 }}>
                                                                                            Không có sản phẩm trong đơn hàng này.
                                                                                        </Typography>
                                                                                    )}

                                                                                    {/* Tổng tiền (Giữ nguyên để đối chiếu) */}
                                                                                    <Box sx={{ display: 'flex', justifyContent: 'flex-end', mt: 1.5, pt: 1.5, borderTop: '1px solid #bdbdbd' }}>
                                                                                         <Typography variant="body1" fontWeight="bold" sx={{mr: 1}}>Tổng cộng:</Typography>
                                                                                         <Typography variant="body1" fontWeight="bold">{formatCurrency(order.totalAmount)}</Typography>
                                                                                    </Box>
                                                                                </>
                                                                            )}
                                                                        </Grid>
                                                                    </Grid>
                                                                </Box>
                                                            </Collapse>
                                                        </TableCell>
                                                    </TableRow>
                                                </React.Fragment>
                                            );
                                        })
                                )}
                            </TableBody>
                        </Table>
                    </Box>
                    {/* Phân trang */}
                    <TablePagination
                        rowsPerPageOptions={[5, 10, 25]}
                        component="div"
                        count={filteredOrders.length}
                        rowsPerPage={rowsPerPage}
                        page={page}
                        onPageChange={handleChangePage}
                        onRowsPerPageChange={handleChangeRowsPerPage}
                        labelRowsPerPage="Số hàng mỗi trang:"
                        labelDisplayedRows={({ from, to, count }) => `${from}–${to} trên ${count !== -1 ? count : `hơn ${to}`}`}
                    />
                </Paper>
            )}
             {/* Snackbar hiển thị lỗi fetch items */}
             <Snackbar
                open={snackbarOpen}
                autoHideDuration={6000}
                onClose={handleCloseSnackbar}
                message={snackbarMessage}
                anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
            />
        </Box>
    );
}