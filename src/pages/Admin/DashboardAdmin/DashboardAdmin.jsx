import React, { useState, useEffect } from "react";
import { Box, Grid, Typography, Button, Select, MenuItem, CircularProgress } from "@mui/material";
import { Line, Bar } from "react-chartjs-2"; // Chỉ import Line và Bar
import {
    Chart as ChartJS,
    CategoryScale,
    LinearScale,
    PointElement,
    LineElement,
    BarElement,
    Title,
    Tooltip,
    Legend,
} from "chart.js";
import "./DashboardAdmin.css"; // Giữ lại CSS nếu cần
import { useDispatch, useSelector } from "react-redux";
import {
    getStatisticByDateApi,
    getStatisticByMonthApi,
    getStatisticByYearApi,
    getStatisticByRangeApi, // Thunk mới cho Custom Range
    resetError,
} from "../../../store/slices/statisticSlice"; // Đường dẫn tới slice

// --- Date Picker imports ---
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { format } from 'date-fns';
// ------------------------------

// Đăng ký các thành phần cần thiết cho Line và Bar chart
ChartJS.register(
    CategoryScale,
    LinearScale,
    PointElement,
    LineElement,
    BarElement,
    Title,
    Tooltip,
    Legend
);

// --- Tùy chọn biểu đồ cho Revenue và Orders ---
const revenueOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
        legend: { display: false },
        title: { display: true, text: "Revenue" },
    },
    scales: { y: { beginAtZero: true } },
};

const ordersOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
        legend: { display: false },
        title: { display: true, text: "Orders" },
    },
    scales: {
        y: {
            beginAtZero: true,
            ticks: { stepSize: 1, precision: 0 },
        },
    },
};
// --- Bỏ các options không cần thiết ---

// --- Component chính ---
export default function DashboardAdmin() {
    const dispatch = useDispatch();
    const {
        statisticOverview,
        isLoading,
        error
    } = useSelector((state) => state.statistic);

    const [viewMode, setViewMode] = useState("Daily");
    const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth() + 1);
    const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
    const [startDate, setStartDate] = useState(null);
    const [endDate, setEndDate] = useState(null);

    const revenueLabels = statisticOverview?.revenueChart?.map((item) => item.label) || [];
    const revenueValues = statisticOverview?.revenueChart?.map((item) => item.value) || [];
    const ordersLabels = statisticOverview?.orderChart?.map((item) => item.label) || [];
    const ordersValues = statisticOverview?.orderChart?.map((item) => item.value) || [];

<<<<<<< HEAD
    const revenueData = {
        labels: revenueLabels,
        datasets: [{ label: "Revenue", data: revenueValues, borderColor: "#ac8e6f", tension: 0.1, fill: false }],
    };
    const ordersData = {
        labels: ordersLabels,
        datasets: [{ label: "Orders", data: ordersValues, backgroundColor: "#ac8e6f" }],
    };
=======
  // Dữ liệu và tùy chọn cho biểu đồ Revenue (Line Chart)
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
      legend: {
        display: false,
      },
      title: {
        display: true,
        text: "Revenue",
      },
      tooltip: {
        callbacks: {
          label: function(context) {
            return `${context.parsed.y.toLocaleString('vi-VN')} VNĐ`;
          }
        }
      }
    },
    scales: {
      y: {
        beginAtZero: true,
        max: Math.max(...revenueValues, 1000),
        ticks: {
          callback: function(value) {
            return value.toLocaleString('vi-VN') + ' VNĐ';
          }
        }
      },
    },
  };
>>>>>>> 02004421398db2153e388f4fbb77e98f3c9098dd

    useEffect(() => {
        let apiAction;

        if (viewMode === "Daily") {
            apiAction = getStatisticByDateApi();
        } else if (viewMode === "Monthly") {
            apiAction = getStatisticByMonthApi({ month: selectedMonth, year: selectedYear });
        } else if (viewMode === "Yearly") {
            apiAction = getStatisticByYearApi({ year: selectedYear });
        } else if (viewMode === "CustomRange") {
            if (startDate && endDate) {
                if (startDate > endDate) {
                    console.error("Start date cannot be after end date.");
                    // Cân nhắc hiển thị lỗi cho người dùng thay vì chỉ log
                    // dispatch(setError("Start date cannot be after end date.")); // Ví dụ nếu có action setError
                    return;
                }
                const formattedStartDate = format(startDate, 'yyyy-MM-dd');
                const formattedEndDate = format(endDate, 'yyyy-MM-dd');
                apiAction = getStatisticByRangeApi({ fromDate: formattedStartDate, toDate: formattedEndDate });
            } else {
                return;
            }
        }

        if (apiAction) {
            // dispatch(resetError()); // Reset lỗi trước khi gọi (tùy chọn)
            dispatch(apiAction);
        }
    }, [dispatch, viewMode, selectedMonth, selectedYear, startDate, endDate]);

    const handleViewModeChange = (mode) => {
        setViewMode(mode);
        if (mode !== "CustomRange") {
            setStartDate(null);
            setEndDate(null);
        }
        // if (mode === 'Daily' || mode === 'CustomRange') { // Reset month/year?
        //   setSelectedMonth(new Date().getMonth() + 1);
        //   setSelectedYear(new Date().getFullYear());
        // }
    };

    const handleMonthChange = (event) => {
        setSelectedMonth(Number(event.target.value));
    };

    const handleYearChange = (event) => {
        setSelectedYear(Number(event.target.value));
    };

<<<<<<< HEAD
    const handleStartDateChange = (newValue) => {
        setStartDate(newValue);
        if (endDate && newValue && newValue > endDate) {
            setEndDate(null); // Reset end date if start date is now after it
        }
    };
=======
  return (
    <Box className="dashboard-admin">
      {/* Phần thẻ thông tin */}
      <Box className="dashboard-admin__cards">
        <Grid container spacing={2}>
          <Grid item size={4}>
            <Box className="dashboard-admin__card">
              <Box sx={{ marginTop: "20px" }}>
                <Typography className="dashboard__title">Total Revenue</Typography>
                <Typography className="dashboard__number">
                  {statistic?.totalRevenue?.toLocaleString('vi-VN')} VNĐ
                </Typography>
              </Box>
            </Box>
          </Grid>
          <Grid item size={4}>
            <Box className="dashboard-admin__card">
              <Box sx={{ marginTop: "20px" }}>
                <Typography className="dashboard__title">Total Orders</Typography>
                <Typography className="dashboard__number">
                  {statistic?.totalOrder || 0}
                </Typography>
              </Box>
            </Box>
          </Grid>
          <Grid item size={4}>
            <Box className="dashboard-admin__card">
              <Box sx={{ marginTop: "20px" }}>
                <Typography className="dashboard__title">Popular Category</Typography>
                <Typography className="dashboard__number">Classic</Typography>
              </Box>
            </Box>
          </Grid>
        </Grid>
      </Box>
>>>>>>> 02004421398db2153e388f4fbb77e98f3c9098dd

    const handleEndDateChange = (newValue) => {
         if (startDate && newValue && newValue < startDate) {
             console.warn("End date cannot be before start date.");
             // Không set giá trị mới nếu không hợp lệ
         } else {
             setEndDate(newValue);
         }
    };

    return (
        <LocalizationProvider dateAdapter={AdapterDateFns}>
            <Box className="dashboard-admin" sx={{ p: 3 }}>
                {/* Phần thẻ thông tin */}
                <Box className="dashboard-admin__cards" sx={{ mb: 3 }}>
                    <Grid container spacing={3}>
                        <Grid item xs={12} md={6}>
                            <Box className="dashboard-admin__card">
                                <Typography className="dashboard__title">Total Revenue</Typography>
                                <Typography className="dashboard__number">
                                    ${statisticOverview?.totalRevenue?.toFixed(2) || "0.00"}
                                </Typography>
                            </Box>
                        </Grid>
                        <Grid item xs={12} md={6}>
                            <Box className="dashboard-admin__card">
                                <Typography className="dashboard__title">Total Orders</Typography>
                                <Typography className="dashboard__number">
                                    {statisticOverview?.totalOrder || 0}
                                </Typography>
                            </Box>
                        </Grid>
                    </Grid>
                </Box>

                {/* Phần điều khiển */}
                <Box sx={{ mb: 3, display: 'flex', flexWrap: 'wrap', gap: 2, alignItems: 'center', borderBottom: '1px solid #eee', pb: 2 }}>
                    <Box sx={{ display: 'flex', gap: 1 }}>
                        <Button size="small" variant={viewMode === "Daily" ? "contained" : "outlined"} onClick={() => handleViewModeChange("Daily")}>Daily</Button>
                        <Button size="small" variant={viewMode === "Monthly" ? "contained" : "outlined"} onClick={() => handleViewModeChange("Monthly")}>Monthly</Button>
                        <Button size="small" variant={viewMode === "Yearly" ? "contained" : "outlined"} onClick={() => handleViewModeChange("Yearly")}>Yearly</Button>
                        <Button size="small" variant={viewMode === "CustomRange" ? "contained" : "outlined"} onClick={() => handleViewModeChange("CustomRange")}>Custom Range</Button>
                    </Box>
                    <Box sx={{ flexGrow: 1 }}></Box>

                    {viewMode === "Monthly" && (
                        <>
                            {/* SỬA LỖI Ở ĐÂY: size="small" thay vì size="" */}
                            <Select value={selectedMonth} onChange={handleMonthChange} size="small">
                                {[...Array(12)].map((_, i) => (
                                    <MenuItem key={i + 1} value={i + 1}>Month {i + 1}</MenuItem>
                                ))}
                            </Select>
                            <Select value={selectedYear} onChange={handleYearChange} size="small">
                                {[2023, 2024, 2025, 2026].map((year) => ( // Nên tạo danh sách năm động
                                    <MenuItem key={year} value={year}>{year}</MenuItem>
                                ))}
                            </Select>
                        </>
                    )}
                    {viewMode === "Yearly" && (
                        <Select value={selectedYear} onChange={handleYearChange} size="small">
                            {[2023, 2024, 2025, 2026].map((year) => (
                                <MenuItem key={year} value={year}>{year}</MenuItem>
                            ))}
                        </Select>
                    )}
                    {viewMode === "CustomRange" && (
                        <>
                            <DatePicker
                                label="From Date"
                                value={startDate}
                                onChange={handleStartDateChange}
                                maxDate={endDate || new Date()} // Ngăn chọn sau ngày kết thúc hoặc hôm nay
                                slotProps={{ textField: { size: 'small' } }}
                            />
                            <DatePicker
                                label="To Date"
                                value={endDate}
                                onChange={handleEndDateChange}
                                minDate={startDate} // Ngăn chọn trước ngày bắt đầu
                                maxDate={new Date()} // Ngăn chọn ngày tương lai
                                slotProps={{ textField: { size: 'small' } }}
                            />
                        </>
                    )}
                </Box>

                {/* Loading / Error */}
                {isLoading && <Box sx={{ display: 'flex', justifyContent: 'center', my: 3 }}><CircularProgress /></Box>}
                {error && <Typography color="error" sx={{ my: 3, textAlign: 'center' }}>Error: {typeof error === 'string' ? error : 'An unexpected error occurred. Please try again.'}</Typography>}

                {/* Phần biểu đồ */}
                {!isLoading && !error && (
                    <Box className="dashboard-admin__charts">
                        <Grid container spacing={3}>
                            <Grid item xs={12} md={6}>
                                <Box className="dashboard-admin__chart" sx={{ height: '400px',  position: 'relative' }}>
                                    {revenueLabels.length > 0 && revenueValues.length > 0 ? (
                                        <Line data={revenueData} options={revenueOptions} />
                                    ) : (
                                        <Typography sx={{ textAlign: 'center', pt: '20%' }}>No revenue data available for the selected period.</Typography>
                                    )}
                                </Box>
                            </Grid>
                            <Grid item xs={12} md={6}>
                                <Box className="dashboard-admin__chart" sx={{ height: '400px', position: 'relative' }}>
                                    {ordersLabels.length > 0 && ordersValues.length > 0 ? (
                                        <Bar data={ordersData} options={ordersOptions} />
                                    ) : (
                                        <Typography sx={{ textAlign: 'center', pt: '20%' }}>No order data available for the selected period.</Typography>
                                    )}
                                </Box>
                            </Grid>
                        </Grid>
                    </Box>
                )}
            </Box>
        </LocalizationProvider>
    );
}