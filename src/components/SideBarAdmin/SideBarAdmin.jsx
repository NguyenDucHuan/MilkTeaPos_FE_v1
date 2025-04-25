import React from "react";
import { Box, List, ListItem, ListItemIcon, ListItemText } from "@mui/material";
import {
  Dashboard as DashboardIcon,
  Category as CategoryIcon,
  People as PeopleIcon,
  PointOfSale as PosIcon,
  ShoppingCart as OrderIcon,
} from "@mui/icons-material";
import { useNavigate, useLocation } from "react-router-dom";
import "./SidebarAdmin.css"; // import CSS riêng

import { Inventory2 as ProductIcon } from "@mui/icons-material";
import { Payment as PaymentIcon } from "@mui/icons-material";
import WorkspacesIcon from '@mui/icons-material/Workspaces';

const menuItems = [
  { text: "Dashboard", icon: <DashboardIcon />, path: "/admin" },
  { text: "Accounts", icon: <PeopleIcon />, path: "/admin/accounts" },
  { text: "Categories", icon: <CategoryIcon />, path: "/admin/categories" },
  { text: "Products", icon: <ProductIcon />, path: "/admin/products" },
  { text: "Combos", icon: <WorkspacesIcon />, path: "/admin/combos" },
  
  { text: "Payments", icon: <PaymentIcon />, path: "/admin/payments" },
  { text: "Orders", icon: <OrderIcon />, path: "/admin/orders" },
];

export default function AdminSidebar() {
  const navigate = useNavigate();
  const location = useLocation();

  return (
    <Box className="admin-sidebar">
      <Box className="admin-sidebar__title">BOBA</Box>

      <List>
        {menuItems.map((item) => (
          <ListItem
            key={item.text}
            onClick={() => navigate(item.path)}
            className={`admin-sidebar__item ${
              location.pathname === item.path ? "active" : ""
            }`}
          >
            <ListItemIcon className="admin-sidebar__icon">{item.icon}</ListItemIcon>
            <ListItemText primary={item.text} />
          </ListItem>
        ))}
      </List>
    </Box>
  );
}
