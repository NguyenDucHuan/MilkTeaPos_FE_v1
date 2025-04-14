import { Box } from "@mui/material";
import React from "react";
import { Outlet } from "react-router-dom";

export default function AdminLayout() {
  return (
    <Box>
      <Outlet />
    </Box>
  );
}