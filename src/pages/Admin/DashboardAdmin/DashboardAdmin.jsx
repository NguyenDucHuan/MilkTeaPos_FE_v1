import React, { useState, useEffect } from "react";
import {
  Box,
  Grid,
  Typography,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Snackbar,
  Alert,
} from "@mui/material";
import { Line, Bar, Pie } from "react-chartjs-2";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
} from "chart.js";
import "./DashboardAdmin.css";
import { useDispatch, useSelector } from "react-redux";
import {
  getStatisticByDateApi,
  getStatisticByMonthApi,
  getStatisticByYearApi,
  getStatisticByWeekApi,
  getBestSellerApi,
} from "../../../store/slices/statisticSlice";

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend
);

export default function DashboardAdmin() {
  const dispatch = useDispatch();
  const { statistic, isLoading, error } = useSelector(
    (state) => state.statistic
  );

  // Lấy ngày hiện tại để khởi tạo state
  const currentDate = new Date();

  // State cho display mode và filters
  const [displayMode, setDisplayMode] = useState("Daily");
  const [selectedMonth, setSelectedMonth] = useState(
    currentDate.getMonth() + 1
  );
  // Lấy năm hiện tại
  const [selectedYear, setSelectedYear] = useState(currentDate.getFullYear());

  // From day today
  const [fromDate, setFromDate] = useState(() => {
    const date = new Date(currentDate);
    date.setDate(currentDate.getDate() - currentDate.getDay());
    return date;
  });
  const [toDate, setToDate] = useState(() => {
    const date = new Date(currentDate);
    date.setDate(currentDate.getDate() - currentDate.getDay() + 6);
    return date;
  });

  const [toast, setToast] = useState({
    open: false,
    message: "",
    severity: "error",
  });

  // Giới hạn ngày tối thiểu và tối đa
  const minDate = new Date(2023, 0, 1); // 1/1/2023
  const maxDate = currentDate;

  // Hàm định dạng ngày để hiển thị
  const formatDate = (date) => {
    return date.toLocaleDateString("en-GB", {
      day: "2-digit",
      month: "long",
      year: "numeric",
    });
  };

  // Hàm định dạng ngày cho API
  const formatDateForApi = (date) => {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const day = String(date.getDate()).padStart(2, "0");
    return `${year}-${month}-${day}`;
  };

  // Hàm lấy khoảng thời gian để hiển thị trong biểu đồ
  const getDateRange = (mode, month, year) => {
    if (mode === "Daily") {
      return `on ${formatDate(currentDate)}`;
    } else if (mode === "Weekly") {
      return `from ${formatDate(fromDate)} to ${formatDate(toDate)}`;
    } else if (mode === "Monthly") {
      const startDate = new Date(year, month - 1, 1);
      const endDate = new Date(year, month, 0); // Ngày cuối tháng
      return `from ${formatDate(startDate)} to ${formatDate(endDate)}`;
    } else if (mode === "Yearly") {
      const startDate = new Date(year, 0, 1);
      const endDate = new Date(year, 11, 31);
      return `from ${formatDate(startDate)} to ${formatDate(endDate)}`;
    }
    return "";
  };

  // Dữ liệu cho biểu đồ
  const revenueLabels =
    statistic?.revenueChart?.map((item) => item.label) || [];
  const revenueValues =
    statistic?.revenueChart?.map((item) => item.value) || [];
  const ordersLabels = statistic?.orderChart?.map((item) => item.label) || [];
  const ordersValues = statistic?.orderChart?.map((item) => item.value) || [];

  // Dữ liệu và tùy chọn cho biểu đồ doanh thu (Line Chart)
  const revenueData = {
    labels: revenueLabels,
    datasets: [
      {
        label: "Revenue",
        data: revenueValues,
        fill: false,
        borderColor: "#ac8e6f",
        tension: 0.1,
      },
    ],
  };
  const revenueOptions = {
    responsive: true,
    plugins: {
      legend: { display: false },
      title: { display: true, text: "Revenue" },
      subtitle: {
        display: true,
        text: `Revenue ${getDateRange(
          displayMode,
          selectedMonth,
          selectedYear
        )}`,
        padding: { bottom: 10 },
      },
      tooltip: {
        callbacks: {
          label: function (context) {
            return `${context.parsed.y.toLocaleString("vi-VN")} VNĐ`;
          },
        },
      },
    },
    scales: {
      y: {
        beginAtZero: true,
        max: Math.max(...revenueValues, 1000),
        ticks: {
          callback: function (value) {
            return value.toLocaleString("vi-VN") + " VNĐ";
          },
        },
      },
    },
  };

  // Dữ liệu và tùy chọn cho biểu đồ đơn hàng (Bar Chart)
  const ordersData = {
    labels: ordersLabels,
    datasets: [
      {
        label: "Orders",
        data: ordersValues,
        backgroundColor: "#ac8e6f",
      },
    ],
  };
  const ordersOptions = {
    responsive: true,
    plugins: {
      legend: { display: false },
      title: { display: true, text: "Orders" },
      subtitle: {
        display: true,
        text: `Orders ${getDateRange(
          displayMode,
          selectedMonth,
          selectedYear
        )}`,
        padding: { bottom: 10 },
      },
    },
    scales: {
      y: {
        beginAtZero: true,
        max: Math.max(...ordersValues, 60),
      },
    },
  };

  // Dữ liệu và tùy chọn cho biểu đồ sản phẩm bán chạy (Pie Chart)
  const bestSellers = statistic?.bestSellers || [];
  const bestSellerLabels = bestSellers.map(
    (item) => item.product?.productName || "Unknown"
  );
  const bestSellerQuantities = bestSellers.map(
    (item) => item.totalQuantitySold || 0
  );

  const sanitizedQuantities = bestSellerQuantities.map((qty) =>
    Math.max(0, qty)
  );

  const bestSellerData = {
    labels: bestSellerLabels,
    datasets: [
      {
        label: "Quantity Sold",
        data: sanitizedQuantities,
        backgroundColor: [
          "#ac8e6f",
          "#d4a373",
          "#e6b98a",
          "#f2d1a3",
          "#fae8c8",
        ],
        borderColor: "#fff",
        borderWidth: 1,
      },
    ],
  };

  const bestSellerOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { position: "right" },
      title: { display: true, text: "Top 5 Best-Selling Products by Quantity" },
      subtitle: {
        display: true,
        text: `Sales ${getDateRange(displayMode, selectedMonth, selectedYear)}`,
        padding: { bottom: 10 },
      },
      tooltip: {
        callbacks: {
          label: function (context) {
            return `${context.parsed.toLocaleString()} units`;
          },
        },
      },
    },
  };

  // Gọi API dựa trên chế độ hiển thị
  useEffect(() => {
    const params = { number: 5 };
    if (displayMode === "Weekly") {
      params.fromDate = formatDateForApi(fromDate);
      params.toDate = formatDateForApi(toDate);
    } else if (displayMode === "Monthly") {
      params.month = selectedMonth;
      params.year = selectedYear;
    } else if (displayMode === "Yearly") {
      params.year = selectedYear;
    }

    console.log("Fetching best sellers with params:", params);

    if (displayMode === "Daily") {
      dispatch(getStatisticByDateApi());
      dispatch(getBestSellerApi(params));
    } else if (displayMode === "Weekly") {
      dispatch(
        getStatisticByWeekApi({
          fromDate: params.fromDate,
          toDate: params.toDate,
        })
      );
      dispatch(getBestSellerApi(params));
    } else if (displayMode === "Monthly") {
      dispatch(
        getStatisticByMonthApi({ month: params.month, year: params.year })
      );
      dispatch(getBestSellerApi(params));
    } else if (displayMode === "Yearly") {
      dispatch(getStatisticByYearApi({ year: params.year }));
      dispatch(getBestSellerApi(params));
    }
  }, [dispatch, displayMode, selectedMonth, selectedYear, fromDate, toDate]);

  // Debug: Log dữ liệu biểu đồ
  useEffect(() => {
    console.log("Best Sellers for Chart:", {
      labels: bestSellerLabels,
      data: sanitizedQuantities,
    });
  }, [statistic?.bestSellers]);

  // Xử lý thay đổi chế độ hiển thị
  const handleDisplayModeChange = (mode) => {
    setDisplayMode(mode);
  };

  // Xử lý đóng thông báo
  const handleToastClose = () => {
    setToast({ ...toast, open: false });
  };

  // Xử lý thay đổi tháng
  const handleMonthChange = (e) => {
    const newMonth = Number(e.target.value);
    if (
      selectedYear === currentDate.getFullYear() &&
      newMonth > currentDate.getMonth() + 1
    ) {
      setToast({
        open: true,
        message: `Cannot select a month after ${formatDate(currentDate)}.`,
        severity: "error",
      });
      return;
    }
    setSelectedMonth(newMonth);
  };

  // Xử lý thay đổi năm
  const handleYearChange = (e) => {
    const newYear = Number(e.target.value);
    if (newYear > currentDate.getFullYear()) {
      setToast({
        open: true,
        message: `Cannot select a year after ${currentDate.getFullYear()}.`,
        severity: "error",
      });
      return;
    }
    if (
      newYear === currentDate.getFullYear() &&
      selectedMonth > currentDate.getMonth() + 1
    ) {
      setSelectedMonth(currentDate.getMonth() + 1);
    }
    setSelectedYear(newYear);
  };

  // Xử lý thay đổi ngày bắt đầu
  const handleFromDateChange = (e) => {
    const newDate = new Date(e.target.value);
    if (!newDate || isNaN(newDate)) {
      setToast({
        open: true,
        message: "Invalid date selected.",
        severity: "error",
      });
      return;
    }
    if (newDate > maxDate) {
      setToast({
        open: true,
        message: `Cannot select a date after ${formatDate(maxDate)}.`,
        severity: "error",
      });
      return;
    }
    if (newDate < minDate) {
      setToast({
        open: true,
        message: `Cannot select a date before ${formatDate(minDate)}.`,
        severity: "error",
      });
      return;
    }
    setFromDate(newDate);
    if (toDate < newDate) {
      setToDate(newDate);
    }
  };

  // Xử lý thay đổi ngày kết thúc
  const handleToDateChange = (e) => {
    const newDate = new Date(e.target.value);
    if (!newDate || isNaN(newDate)) {
      setToast({
        open: true,
        message: "Invalid date selected.",
        severity: "error",
      });
      return;
    }
    if (newDate > maxDate) {
      setToast({
        open: true,
        message: `Cannot select a date after ${formatDate(maxDate)}.`,
        severity: "error",
      });
      return;
    }
    if (newDate < fromDate) {
      setToast({
        open: true,
        message: "To date cannot be before from date.",
        severity: "error",
      });
      return;
    }
    const diffTime = newDate - fromDate;
    const diffDays = diffTime / (1000 * 60 * 60 * 24);
    if (diffDays > 7) {
      setToast({
        open: true,
        message: "Date range cannot exceed 7 days in Weekly mode.",
        severity: "error",
      });
      return;
    }
    setToDate(newDate);
  };

  return (
    <Box className="dashboard-admin">
      {/* Filter Controls */}
      <Box sx={{ mb: 3, display: "flex", alignItems: "center", gap: 2 }}>
        <Box>
          <button
            className={`chart-button ${
              displayMode === "Daily" ? "active" : ""
            }`}
            onClick={() => handleDisplayModeChange("Daily")}
          >
            Daily
          </button>
          <button
            className={`chart-button ${
              displayMode === "Weekly" ? "active" : ""
            }`}
            onClick={() => handleDisplayModeChange("Weekly")}
          >
            Weekly
          </button>
          <button
            className={`chart-button ${
              displayMode === "Monthly" ? "active" : ""
            }`}
            onClick={() => handleDisplayModeChange("Monthly")}
          >
            Monthly
          </button>
          <button
            className={`chart-button ${
              displayMode === "Yearly" ? "active" : ""
            }`}
            onClick={() => handleDisplayModeChange("Yearly")}
          >
            Yearly
          </button>
        </Box>
        {displayMode === "Monthly" && (
          <Box sx={{ display: "flex", gap: 2 }}>
            <select value={selectedMonth} onChange={handleMonthChange}>
              {[...Array(12)].map((_, i) => (
                <option key={i + 1} value={i + 1}>
                  Month {i + 1}
                </option>
              ))}
            </select>
            <select value={selectedYear} onChange={handleYearChange}>
              {Array.from(
                { length: currentDate.getFullYear() - 2022 },
                (_, i) => 2023 + i
              ).map((year) => (
                <option key={year} value={year}>
                  {year}
                </option>
              ))}
            </select>
          </Box>
        )}
        {displayMode === "Yearly" && (
          <Box sx={{ display: "flex", gap: 2 }}>
            <select value={selectedYear} onChange={handleYearChange}>
              {Array.from(
                { length: currentDate.getFullYear() - 2022 },
                (_, i) => 2023 + i
              ).map((year) => (
                <option key={year} value={year}>
                  {year}
                </option>
              ))}
            </select>
          </Box>
        )}
        {displayMode === "Weekly" && (
          <Box sx={{ display: "flex", gap: 2 }}>
            <input
              type="date"
              value={formatDateForApi(fromDate)}
              onChange={handleFromDateChange}
              min={formatDateForApi(minDate)}
              max={formatDateForApi(maxDate)}
              style={{ padding: "8px", fontSize: "14px" }}
            />
            <input
              type="date"
              value={formatDateForApi(toDate)}
              onChange={handleToDateChange}
              min={formatDateForApi(fromDate)}
              max={formatDateForApi(maxDate)}
              style={{ padding: "8px", fontSize: "14px" }}
            />
          </Box>
        )}
      </Box>

      {/* Info Cards */}
      <Box className="dashboard-admin__cards">
        <Grid container spacing={2}>
          <Grid item size={6}>
            <Box className="dashboard-admin__card">
              <Box sx={{ marginTop: "20px" }}>
                <Typography className="dashboard__title">
                  Total Revenue
                </Typography>
                <Typography className="dashboard__number">
                  {statistic?.totalRevenue?.toLocaleString("vi-VN")} VNĐ
                </Typography>
              </Box>
            </Box>
          </Grid>
          <Grid item size={6}>
            <Box className="dashboard-admin__card">
              <Box sx={{ marginTop: "20px" }}>
                <Typography className="dashboard__title">
                  Total Orders
                </Typography>
                <Typography className="dashboard__number">
                  {statistic?.totalOrder || 0}
                </Typography>
              </Box>
            </Box>
          </Grid>
        </Grid>
      </Box>

      {/* Charts and Best-Seller List */}
      <Box className="dashboard-admin__charts">
        <Grid container spacing={2}>
          {/* Revenue Chart */}
          <Grid item size={6}>
            <Box className="dashboard-admin__chart">
              <Typography variant="h6" sx={{ mb: 1 }}>
                Revenue
              </Typography>
              <>
                {isLoading ? (
                  <Typography>Loading...</Typography>
                ) : error ? (
                  <Typography color="error">{error}</Typography>
                ) : (
                  <Line data={revenueData} options={revenueOptions} />
                )}
              </>
            </Box>
          </Grid>
          {/* Orders Chart */}
          <Grid item size={6}>
            <Box className="dashboard-admin__chart">
              <Typography variant="h6" sx={{ mb: 1 }}>
                Orders
              </Typography>
              <>
                {isLoading ? (
                  <Typography>Loading...</Typography>
                ) : error ? (
                  <Typography color="error">{error}</Typography>
                ) : (
                  <Bar data={ordersData} options={ordersOptions} />
                )}
              </>
            </Box>
          </Grid>
          {/* Best-Seller Pie Chart */}
          <Grid item size={6}>
            <Box className="dashboard-admin__chart" sx={{ height: 400 }}>
              <Typography variant="h6" sx={{ mb: 1 }}>
                Top 5 Best-Selling Products
              </Typography>
              {isLoading ? (
                <Typography>Loading...</Typography>
              ) : error ? (
                <Typography color="error">{error}</Typography>
              ) : bestSellerLabels.length === 0 ||
                sanitizedQuantities.length === 0 ? (
                <Typography>No best-selling products available</Typography>
              ) : (
                <Pie data={bestSellerData} options={bestSellerOptions} />
              )}
            </Box>
          </Grid>
          {/* Best-Seller List */}
          <Grid item size={6}>
            <Box className="dashboard-admin__chart">
              <Typography variant="h6" sx={{ mb: 2 }}>
                Top 5 Best-Selling Products List
              </Typography>
              <>
                {isLoading ? (
                  <Typography>Loading...</Typography>
                ) : error ? (
                  <Typography color="error">{error}</Typography>
                ) : (
                  <TableContainer component={Paper}>
                    <Table>
                      <TableHead>
                        <TableRow>
                          <TableCell>Rank</TableCell>
                          <TableCell>Product Name</TableCell>
                          <TableCell align="right">Quantity Sold</TableCell>
                        </TableRow>
                      </TableHead>
                      <TableBody>
                        {statistic?.bestSellers?.length > 0 ? (
                          statistic.bestSellers.map((item, index) => (
                            <TableRow key={item.product?.productId || index}>
                              <TableCell>{index + 1}</TableCell>
                              <TableCell>
                                {item.product?.productName || "Unknown Product"}
                              </TableCell>
                              <TableCell align="right">
                                {item.totalQuantitySold?.toLocaleString() || 0}
                              </TableCell>
                            </TableRow>
                          ))
                        ) : (
                          <TableRow>
                            <TableCell colSpan={3} align="center">
                              No best-selling products available
                            </TableCell>
                          </TableRow>
                        )}
                      </TableBody>
                    </Table>
                  </TableContainer>
                )}
              </>
            </Box>
          </Grid>
        </Grid>
      </Box>

      {/* Toast Notification */}
      <Snackbar
        open={toast.open}
        autoHideDuration={6000}
        onClose={handleToastClose}
        anchorOrigin={{ vertical: "top", horizontal: "center" }}
      >
        <Alert
          onClose={handleToastClose}
          severity={toast.severity}
          sx={{ width: "100%" }}
        >
          {toast.message}
        </Alert>
      </Snackbar>
    </Box>
  );
}
