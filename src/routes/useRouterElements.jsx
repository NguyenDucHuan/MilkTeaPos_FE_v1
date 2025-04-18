import { useRoutes } from "react-router-dom";
import { PATH } from "./path";
import Login from "../pages/Auth/Login/Login";
import Register from "../pages/Auth/Register/Register";
import HomePage from "../pages/Home/HomePage/HomePage";
import StaffLayout from "../layouts/StaffLayout/StaffLayout";
import AuthLayout from "../layouts/AuthLayout/AuthLayout";
import AdminLayout from "../layouts/AdminLayout/AdminLayout";
import OrderList from "../pages/orderlist/OrderList";
import DashboardAdmin from "../pages/Admin/DashboardAdmin/DashboardAdmin";

export default function useRouterElements() {
  const element = useRoutes([
    // auth
    {
      path: PATH.AUTH,
      element: <AuthLayout />,
      children: [
        {
          path: PATH.LOGIN,
          element: <Login />,
        },
        {
          path: PATH.REGISTER,
          element: <Register />,
        },
      ],
    },

    // Home (Staff)
    {
      path: PATH.HOME,
      element: <StaffLayout />,
      children: [
        {
          index: true,
          element: <HomePage />,
        },
        {
          path: PATH.ORDERS,
          element: <OrderList />,
        },
      ],
    },

    // Admin
    {
      path: PATH.ADMIN,
      element: <AdminLayout />,
      children: [
        {
          index: true,
          path: PATH.Dasboard,
          element: <DashboardAdmin />,
        },
      ],
    },
  ]);
  return element;
}