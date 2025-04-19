import React from "react";
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

// Đăng ký các thành phần của Chart.js
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

// Dữ liệu và tùy chọn cho biểu đồ Revenue (Line Chart)
const revenueLabels = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
const revenueData = {
  labels: revenueLabels,
  datasets: [
    {
      label: "Revenue",
      data: [1000, 900, 750, 800, 1000, 850, 600], // Dữ liệu dựa trên hình
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
      display: false, // Không hiển thị chú thích
    },
    title: {
      display: true,
      text: "Revenue",
    },
  },
  scales: {
    y: {
      beginAtZero: true,
      max: 1000,
    },
  },
};

// Dữ liệu và tùy chọn cho biểu đồ Orders (Bar Chart)
const ordersLabels = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
const ordersData = {
  labels: ordersLabels,
  datasets: [
    {
      label: "Orders",
      data: [30, 25, 40, 45, 35, 50, 45], // Dữ liệu dựa trên hình
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
      max: 60,
    },
  },
};

// Dữ liệu và tùy chọn cho biểu đồ Sales by Category (Pie Chart)
const salesData = {
  labels: ["Classic", "Special", "Fruit", "Combo"],
  datasets: [
    {
      label: "Sales by Category",
      data: [35, 25, 20, 20], // Dữ liệu dựa trên hình
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
      data: [120, 90, 80, 70, 60], // Dữ liệu dựa trên hình
      backgroundColor: "#ac8e6f",
    },
  ],
};
const topProductsOptions = {
  indexAxis: "y", // Chuyển thành biểu đồ ngang
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
  return (
    <Box className="dashboard-admin">
      {/* Phần thẻ thông tin */}
      <Box className="dashboard-admin__cards">
        <Grid container spacing={2}>
          <Grid item size={4}>
            <Box className="dashboard-admin__card">
              <Box
                sx={{
                  marginTop: "20px",
                }}
              >
                <Typography className="dashboard__title">
                  Total Revenue
                </Typography>
                <Typography className="dashboard__number">$12,845</Typography>
              </Box>
            </Box>
          </Grid>
          <Grid item size={4}>
            <Box className="dashboard-admin__card">
              <Box
                sx={{
                  marginTop: "20px",
                }}
              >
                <Typography className="dashboard__title">
                Total Orders
                </Typography>
                <Typography className="dashboard__number"> $843</Typography>
              </Box>
            </Box>
          </Grid>
          <Grid item size={4}>
            <Box className="dashboard-admin__card">
              <Box
                sx={{
                  marginTop: "20px",
                }}
              >
                <Typography className="dashboard__title">
                Popular Category
                </Typography>
                <Typography className="dashboard__number">Classic</Typography>
              </Box>
            </Box>
          </Grid>
        </Grid>
      </Box>

      {/* Phần biểu đồ */}
      <Box className="dashboard-admin__charts">
        <Grid container spacing={2}>
          {/* Revenue Chart */}
          <Grid item size={6}>
            <Box className="dashboard-admin__chart">
              <Box
                sx={{ display: "flex", justifyContent: "space-between", mb: 1 }}
              >
                <Typography variant="h6">Revenue</Typography>
                <Box>
                  <button className="chart-button active">Daily</button>
                  <button className="chart-button">Monthly</button>
                  <button className="chart-button">Yearly</button>
                </Box>
              </Box>
              <Line data={revenueData} options={revenueOptions} />
            </Box>
          </Grid>
          {/* Orders Chart */}
          <Grid item size={6}>
            <Box className="dashboard-admin__chart">
              <Box
                sx={{ display: "flex", justifyContent: "space-between", mb: 1 }}
              >
                <Typography variant="h6">Orders</Typography>
                <Box>
                  <button className="chart-button active">Daily</button>
                  <button className="chart-button">Monthly</button>
                  <button className="chart-button">Yearly</button>
                </Box>
              </Box>
              <Bar data={ordersData} options={ordersOptions} />
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
