import { Box } from "@mui/material";
import React from "react";
import { Outlet } from "react-router-dom";
// import SideBar from "../../components/SideBar/SideBar";
import HeaderAdmin from "../../components/HeaderAdmin/HeaderAdmin";

import SideBarAdmin from "../../components/SideBarAdmin/SideBarAdmin";

export default function AdminLayout() {
  return (
    <Box sx={{ display: 'flex' }}>
      {/* Sidebar */}
      <SideBarAdmin /> 
      <Box
        sx={{
          flexGrow: 1,
          ml: '200px',
          backgroundColor: '#f5f1e8',
          minHeight: '100vh',
        }}
      >
        <HeaderAdmin />
        <Outlet />
      </Box>
    </Box>
  );
}