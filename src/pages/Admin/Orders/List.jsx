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
    Alert // Để hiển thị lỗi
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
// *** 1. KIỂM TRA ĐƯỜNG DẪN IMPORT ***
import { fetchOrders } from '../../../store/slices/orderSlice';

// --- Định nghĩa màu sắc và icon cho trạng thái ---
const statusColors = {
    Pending: { bgColor: '#fffbeb', textColor: '#b45309', icon: PendingIcon, label: 'Đang chờ xử lý' },
    Processing: { bgColor: '#eff6ff', textColor: '#1d4ed8', icon: ShippingIcon, label: 'Đang giao' },
    Completed: { bgColor: '#f0fdf4', textColor: '#15803d', icon: CheckCircleIcon, label: 'Hoàn thành' },
    Cancelled: { bgColor: '#fef2f2', textColor: '#b91c1c', icon: CancelIcon, label: 'Đã hủy' },
};

// --- Component hiển thị trạng thái ---
const OrderStatus = ({ status }) => {
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
    // --- Lấy state từ Redux ---
    // *** 2. KIỂM TRA TÊN SLICE 'order' ***
    const { orders: ordersData, isLoading, error } = useSelector((state) => state.order);

    // --- State cho UI ---
    const [page, setPage] = useState(0);
    const [rowsPerPage, setRowsPerPage] = useState(10);
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedOrderId, setSelectedOrderId] = useState(null);

    // --- Fetch dữ liệu ---
    useEffect(() => {
        // Nếu API không hỗ trợ phân trang, chỉ cần gọi dispatch(fetchOrders())
        // Nếu có, bạn có thể truyền page và rowsPerPage
        dispatch(fetchOrders()); // Giả sử fetch tất cả rồi lọc/phân trang ở client
    }, [dispatch]); // Chỉ fetch 1 lần khi mount

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
    const handleViewDetails = (orderId) => setSelectedOrderId(prevId => (prevId === orderId ? null : orderId));

    // --- Chuẩn bị dữ liệu ---
    // *** 3. KIỂM TRA CẤU TRÚC API RESPONSE (ordersData) ***
    // Chuyển đổi ordersData thành mảng ordersList một cách an toàn
    const ordersList = Array.isArray(ordersData?.items)
        ? ordersData.items
        : Array.isArray(ordersData)
            ? ordersData
            : [];

    // Lọc dữ liệu trên client
    const filteredOrders = ordersList.filter((order) => {
        if (!order) return false; // Bỏ qua nếu order là null/undefined
        const searchLower = searchTerm.toLowerCase();
        // *** 4. KIỂM TRA TÊN CÁC TRƯỜNG DỮ LIỆU TRONG 'order' ***
        const id = order.id ?? order.orderId; // Ưu tiên 'id', nếu không có thì dùng 'orderId'
        const note = order.note ?? '';
        const staffName = order.staffName ?? ''; // Cần API trả về trường này
        const paymentMethod = order.paymentMethod ?? (order.paymentMethodId === 1 ? 'Tiền mặt' : ''); // Cần API trả về paymentMethod hoặc logic từ ID
        const currentStatus = order.orderstatusupdates?.[0]?.orderStatus || 'Pending'; // Giả sử lấy trạng thái đầu tiên
        const statusLabel = statusColors[currentStatus]?.label.toLowerCase() || '';

        return (
            id?.toString().toLowerCase().includes(searchLower) ||
            note.toLowerCase().includes(searchLower) ||
            staffName.toLowerCase().includes(searchLower) ||
            paymentMethod.toLowerCase().includes(searchLower) ||
            statusLabel.includes(searchLower)
        );
    });

    // --- Hàm định dạng ---
    const formatDate = (dateString) => {
        // ... (Giữ nguyên hàm formatDate)
         if (!dateString) return 'N/A';
        try {
            const options = { year: 'numeric', month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit' };
            return new Date(dateString).toLocaleString('vi-VN', options);
        } catch (e) { return 'Invalid Date'; }
    };
    const formatCurrency = (amount) => {
        // ... (Giữ nguyên hàm formatCurrency)
        if (typeof amount !== 'number' && typeof amount !== 'string') return 'N/A'; // Cho phép cả string số
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
                    placeholder="Tìm kiếm..."
                    value={searchTerm}
                    onChange={handleSearch}
                    size="small"
                    InputProps={{ startAdornment: (<InputAdornment position="start"><SearchIcon fontSize="small" /></InputAdornment>), }}
                    sx={{ width: { xs: '100%', sm: 350 } }}
                />
            </Box>

            {/* Loading / Error */}
            {isLoading && (
                <Box sx={{ display: 'flex', justifyContent: 'center', py: 5 }}><CircularProgress /></Box>
            )}
            {error && !isLoading && ( // Chỉ hiển thị lỗi khi không loading
                <Alert severity="error" sx={{ mb: 2 }}>
                    {typeof error === 'string' ? error : 'Có lỗi xảy ra khi tải danh sách đơn hàng.'}
                </Alert>
            )}

            {/* Table và Pagination (chỉ hiển thị khi không loading) */}
            {!isLoading && (
                <Paper sx={{ width: '100%', overflow: 'hidden' }}>
                    <Box sx={{ overflowX: 'auto' }}>
                        <Table stickyHeader size="small">
                            <TableHead>
                                <TableRow>
                                    {/* Các cột header của Admin */}
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
                                {filteredOrders.length === 0 && !isLoading ? ( // Thêm điều kiện !isLoading
                                    <TableRow>
                                        <TableCell colSpan={9} align="center">Không tìm thấy đơn hàng.</TableCell>
                                    </TableRow>
                                ) : (
                                    filteredOrders
                                        .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
                                        .map((order, index) => {
                                            // *** 5. KIỂM TRA CÁCH LẤY TRẠNG THÁI ***
                                            const currentStatus = order.orderstatusupdates?.[0]?.orderStatus || 'Pending';
                                            const isSelected = selectedOrderId === (order.id ?? order.orderId); // Dùng ID đã xác định

                                            return (
                                                <React.Fragment key={order.id ?? order.orderId}>
                                                    <TableRow hover sx={{ '& > *': { borderBottom: 'unset' } }}>
                                                        <TableCell>{page * rowsPerPage + index + 1}</TableCell>
                                                        {/* *** 6. KIỂM TRA TÊN CÁC TRƯỜNG KHI HIỂN THỊ *** */}
                                                        <TableCell>#{order.id ?? order.orderId}</TableCell>
                                                        <TableCell sx={{ whiteSpace: 'nowrap' }}>{formatDate(order.createAt)}</TableCell>
                                                        <TableCell sx={{ whiteSpace: 'nowrap', fontWeight: 500 }}>{formatCurrency(order.totalAmount)}</TableCell>
                                                        <TableCell sx={{ maxWidth: 150, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                                                            {order.note || '-'}
                                                        </TableCell>
                                                        <TableCell>{order.staffName || 'N/A'}</TableCell>
                                                        <TableCell>
                                                            {order.paymentMethod || (order.paymentMethodId === 1 ? "Tiền mặt" : "Chuyển khoản")}
                                                        </TableCell>
                                                        <TableCell>
                                                            <OrderStatus status={currentStatus} />
                                                        </TableCell>
                                                        <TableCell align="center">
                                                            <IconButton size="small" onClick={() => handleViewDetails(order.id ?? order.orderId)}>
                                                                {isSelected ? <ExpandLessIcon /> : <ExpandMoreIcon />}
                                                            </IconButton>
                                                        </TableCell>
                                                    </TableRow>
                                                    {/* Hàng chi tiết (Collapse) */}
                                                    <TableRow>
                                                        <TableCell style={{ paddingBottom: 0, paddingTop: 0 }} colSpan={9}>
                                                            <Collapse in={isSelected} timeout="auto" unmountOnExit>
                                                                <Box sx={{ m: 1, p: 2, bgcolor: 'grey.50', borderRadius: 1 }}>
                                                                    <Typography variant="h6" gutterBottom component="div">
                                                                        Chi tiết đơn hàng #{order.id ?? order.orderId}
                                                                    </Typography>
                                                                    <Grid container spacing={2}>
                                                                        {/* Thông tin cơ bản */}
                                                                        <Grid item xs={12} md={5}>
                                                                            {/* ... (Hiển thị các thông tin cơ bản, kiểm tra tên trường) ... */}
                                                                            <Typography variant="body2" ><strong>Ngày đặt:</strong> {formatDate(order.createAt)}</Typography>
                                                                            <Typography variant="body2" ><strong>Nhân viên:</strong> {order.staffName || 'N/A'}</Typography>
                                                                            <Typography variant="body2" ><strong>Thanh toán:</strong> {order.paymentMethod || (order.paymentMethodId === 1 ? "Tiền mặt" : "Chuyển khoản")}</Typography>
                                                                            <Typography variant="body2" ><strong>Trạng thái:</strong> {statusColors[currentStatus]?.label || 'N/A'}</Typography>
                                                                            <Typography variant="body2" sx={{ mt: 1 }}><strong>Ghi chú:</strong></Typography>
                                                                            <Typography variant="body2" sx={{ pl: 1 }}>{order.note || 'Không có'}</Typography>
                                                                        </Grid>
                                                                        {/* Chi tiết sản phẩm */}
                                                                        <Grid item xs={12} md={7}>
                                                                            <Typography variant="subtitle2" fontWeight="bold">Sản phẩm:</Typography>
                                                                            {/* *** 7. KIỂM TRA CẤU TRÚC orderitems và item.product *** */}
                                                                            {order.orderitems?.length > 0 ? (
                                                                                order.orderitems.map((item, itemIndex) => (
                                                                                    <Box key={itemIndex} sx={{ display: 'flex', justifyContent: 'space-between', py: 0.5, borderBottom: '1px dashed #e0e0e0' }}>
                                                                                        <Typography variant="body2">
                                                                                            {item.product?.productName || 'N/A'} {/* Giả sử có item.product.productName */}
                                                                                            <span style={{ color: '#757575' }}> (x{item.quantity})</span> {/* Giả sử có item.quantity */}
                                                                                        </Typography>
                                                                                        {/* Giả sử có item.price */}
                                                                                        <Typography variant="body2">{formatCurrency((item.price ?? 0) * (item.quantity ?? 0))}</Typography>
                                                                                    </Box>
                                                                                ))
                                                                            ) : (<Typography variant="body2" sx={{ color: 'text.secondary' }}>Không có sản phẩm.</Typography>)}
                                                                            {/* Tổng tiền */}
                                                                            <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 1, pt: 1, borderTop: '1px solid #bdbdbd' }}>
                                                                                <Typography variant="body1" fontWeight="bold">Tổng cộng:</Typography>
                                                                                <Typography variant="body1" fontWeight="bold">{formatCurrency(order.totalAmount)}</Typography>
                                                                            </Box>
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
                    {/* *** 8. KIỂM TRA logic phân trang (client vs server) *** */}
                    {/* count nên là totalOrdersCount nếu API trả về tổng số */}
                    {/* Nếu lọc/phân trang ở client thì count={filteredOrders.length} */}
                    <TablePagination
                        rowsPerPageOptions={[5, 10, 25]}
                        component="div"
                        count={filteredOrders.length} // Giả định lọc client
                        rowsPerPage={rowsPerPage}
                        page={page}
                        onPageChange={handleChangePage}
                        onRowsPerPageChange={handleChangeRowsPerPage}
                    />
                </Paper>
            )}
        </Box>
    );
}