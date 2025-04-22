import { useLocation } from "react-router-dom";
import { Typography } from "@mui/material";

// Mapping path -> title
const pathToTitle = {
  "/admin": "Dashboard",
  "/admin/accounts": "Account Management",
  "/admin/accounts/new": "Add Account",
};

const getPageTitle = (pathname) => {
  if (pathname.match(/^\/admin\/accounts\/\d+\/edit$/)) {
    return "Edit Account";
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
