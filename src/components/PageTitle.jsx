import { useLocation } from "react-router-dom";
import { Typography } from "@mui/material";

// Mapping path -> title
const pathToTitle = {
  "/admin": "Dashboard",

  // Accounts
  "/admin/accounts": "Account Management",
  "/admin/accounts/new": "Add Account",

  // Categories
  "/admin/categories": "Category Management",
  "/admin/categories/new": "Add Category",

  // Products
  "/admin/products": "Product Management",
  "/admin/products/new": "Add Product",

  //Payment Methods
  "/admin/payments": "Payment Method Management",
  "/admin/payments/new": "Add Payment Method",

  // Combos
  "/admin/combos": "Combo Management",

  // Toppings
  "/admin/toppings": "Topping Management",

  "/admin/orders": "Order Management",
};

const getPageTitle = (pathname) => {
  // Edit Account
  if (pathname.match(/^\/admin\/accounts\/\d+\/edit$/)) {
    return "Edit Account";
  }

  // Edit Category
  if (pathname.match(/^\/admin\/categories\/\d+\/edit$/)) {
    return "Edit Category";
  }

  // Edit Product
  if (pathname.match(/^\/admin\/products\/\d+\/edit$/)) {
    return "Edit Product";
  }

  // Edit Payment Methods
  if (pathname.match(/^\/admin\/payments\/\d+\/edit$/)) {
    return "Edit Payment Method";
  }

  return pathToTitle[pathname] || "Page";
};

export default function PageTitle() {
  const { pathname } = useLocation();
  const title = getPageTitle(pathname);

  return (
    <Typography variant="h5" fontWeight="bold" mb={3}>
      {title}
    </Typography>
  );
}
