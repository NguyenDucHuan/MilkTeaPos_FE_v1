import React, { useState, useEffect } from "react";
import { Box, Grid, Typography } from "@mui/material";
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

// Dữ liệu và tùy chọn cho biểu đồ Sales by Category (Pie Chart)
const salesData = {
  labels: ["Classic", "Special", "Fruit", "Combo"],
  datasets: [
    {
      label: "Sales by Category",
      data: [35, 25, 20, 20],
      backgroundColor: ["#ac8e6f", "#c4a484", "#e6d5b8", "#f5e8c7"],
      borderWidth: 1,
    },
  ],
};
const salesOptions = {
  responsive: true,
  plugins: {
    legend: {
      position: "bottom",
    },
    title: {
      display: true,
      text: "Sales by Category",
    },
  },
};

// Dữ liệu và tùy chọn cho biểu đồ Top Selling Products (Horizontal Bar Chart)
const topProductsData = {
  labels: [
    "Classic Milk-Tea",
    "Taro Milk-Tea",
    "Brown Sugar Milk-Tea",
    "Matcha Milk-Tea",
    "Couple",
  ],
  datasets: [
    {
      label: "Top Selling Products",
      data: [120, 90, 80, 70, 60],
      backgroundColor: "#ac8e6f",
    },
  ],
};
const topProductsOptions = {
  indexAxis: "y",
  responsive: true,
  plugins: {
    legend: {
      display: false,
    },
    title: {
      display: true,
      text: "Top Selling Products",
    },
  },
  scales: {
    x: {
      beginAtZero: true,
      max: 120,
    },
  },
};

export default function DashboardAdmin() {
  const dispatch = useDispatch();
  const { statistic, isLoading, error } = useSelector((state) => state.statistic);

  // Trạng thái cho chế độ hiển thị (Daily, Monthly, Yearly)
  const [revenueMode, setRevenueMode] = useState("Daily");
  const [ordersMode, setOrdersMode] = useState("Daily");
  const [selectedMonth, setSelectedMonth] = useState(4); // Mặc định tháng 4
  const [selectedYear, setSelectedYear] = useState(2025); // Mặc định năm 2025

  // Cập nhật dữ liệu biểu đồ từ API
  const revenueLabels = statistic?.revenueChart?.map((item) => item.label) || [];
  const revenueValues = statistic?.revenueChart?.map((item) => item.value) || [];
  const ordersLabels = statistic?.orderChart?.map((item) => item.label) || [];
  const ordersValues = statistic?.orderChart?.map((item) => item.value) || [];

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

  // Dữ liệu và tùy chọn cho biểu đồ Orders (Bar Chart)
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
      legend: {
        display: false,
      },
      title: {
        display: true,
        text: "Orders",
      },
    },
    scales: {
      y: {
        beginAtZero: true,
        max: Math.max(...ordersValues, 60),
      },
    },
  };

  // Gọi API khi thay đổi chế độ hoặc tháng/năm
  useEffect(() => {
    if (revenueMode === "Daily" || ordersMode === "Daily") {
      dispatch(getStatisticByDateApi());
    } else if (revenueMode === "Monthly" || ordersMode === "Monthly") {
      dispatch(getStatisticByMonthApi({ month: selectedMonth, year: selectedYear }));
    } else if (revenueMode === "Yearly" || ordersMode === "Yearly") {
      dispatch(getStatisticByYearApi({ year: selectedYear }));
    }
  }, [dispatch, revenueMode, ordersMode, selectedMonth, selectedYear]);

  // Xử lý khi nhấn nút Daily, Monthly, Yearly
  const handleRevenueModeChange = (mode) => {
    setRevenueMode(mode);
  };

  const handleOrdersModeChange = (mode) => {
    setOrdersMode(mode);
  };

  // Xử lý thay đổi tháng và năm (có thể thêm input để người dùng chọn)
  const handleMonthChange = (e) => {
    setSelectedMonth(Number(e.target.value));
  };

  const handleYearChange = (e) => {
    setSelectedYear(Number(e.target.value));
  };

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

      {/* Phần điều khiển tháng và năm */}
      {(revenueMode === "Monthly" || ordersMode === "Monthly" || revenueMode === "Yearly" || ordersMode === "Yearly") && (
        <Box sx={{ mb: 2, display: "flex", gap: 2 }}>
          {revenueMode === "Monthly" || ordersMode === "Monthly" ? (
            <select value={selectedMonth} onChange={handleMonthChange}>
              {[...Array(12)].map((_, i) => (
                <option key={i + 1} value={i + 1}>
                  Month {i + 1}
                </option>
              ))}
            </select>
          ) : null}
          <select value={selectedYear} onChange={handleYearChange}>
            {[2023, 2024, 2025].map((year) => (
              <option key={year} value={year}>
                {year}
              </option>
            ))}
          </select>
        </Box>
      )}

      {/* Phần biểu đồ */}
      <Box className="dashboard-admin__charts">
        <Grid container spacing={2}>
          {/* Revenue Chart */}
          <Grid item size={6}>
            <Box className="dashboard-admin__chart">
              <Box sx={{ display: "flex", justifyContent: "space-between", mb: 1 }}>
                <Typography variant="h6">Revenue</Typography>
                <Box>
                  <button
                    className={`chart-button ${revenueMode === "Daily" ? "active" : ""}`}
                    onClick={() => handleRevenueModeChange("Daily")}
                  >
                    Daily
                  </button>
                  <button
                    pedal to the metal
                    className={`chart-button ${revenueMode === "Monthly" ? "active" : ""}`}
                    onClick={() => handleRevenueModeChange("Monthly")}
                  >
                    Monthly
                  </button>
                  <button
                    className={`chart-button ${revenueMode === "Yearly" ? "active" : ""}`}
                    onClick={() => handleRevenueModeChange("Yearly")}
                  >
                    Yearly
                  </button>
                </Box>
              </Box>
              {isLoading ? (
                <Typography>Loading...</Typography>
              ) : error ? (
                <Typography color="error">{error}</Typography>
              ) : (
                <Line data={revenueData} options={revenueOptions} />
              )}
            </Box>
          </Grid>
          {/* Orders Chart */}
          <Grid item size={6}>
            <Box className="dashboard-admin__chart">
              <Box sx={{ display: "flex", justifyContent: "space-between", mb: 1 }}>
                <Typography variant="h6">Orders</Typography>
                <Box>
                  <button
                    className={`chart-button ${ordersMode === "Daily" ? "active" : ""}`}
                    onClick={() => handleOrdersModeChange("Daily")}
                  >
                    Daily
                  </button>
                  <button
                    className={`chart-button ${ordersMode === "Monthly" ? "active" : ""}`}
                    onClick={() => handleOrdersModeChange("Monthly")}
                  >
                    Monthly
                  </button>
                  <button
                    className={`chart-button ${ordersMode === "Yearly" ? "active" : ""}`}
                    onClick={() => handleOrdersModeChange("Yearly")}
                  >
                    Yearly
                  </button>
                </Box>
              </Box>
              {isLoading ? (
                <Typography>Loading...</Typography>
              ) : error ? (
                <Typography color="error">{error}</Typography>
              ) : (
                <Bar data={ordersData} options={ordersOptions} />
              )}
            </Box>
          </Grid>
          {/* Sales by Category Chart */}
          <Grid item size={6}>
            <Box className="dashboard-admin__chart">
              <Typography variant="h6" sx={{ mb: 2 }}>
                Sales by Category
              </Typography>
              <Pie data={salesData} options={salesOptions} />
            </Box>
          </Grid>
          {/* Top Selling Products Chart */}
          <Grid item size={6}>
            <Box className="dashboard-admin__chart">
              <Typography variant="h6" sx={{ mb: 2 }}>
                Top Selling Products
              </Typography>
              <Bar data={topProductsData} options={topProductsOptions} />
            </Box>
          </Grid>
        </Grid>
      </Box>
    </Box>
  );
}