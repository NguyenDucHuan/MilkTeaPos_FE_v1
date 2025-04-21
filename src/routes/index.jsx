import { useRoutes } from "react-router-dom";
import { PATH } from "./path";
import AuthLayout from "../layouts/AuthLayout/AuthLayout";
import StaffLayout from "../layouts/StaffLayout/StaffLayout";
import AdminLayout from "../layouts/AdminLayout/AdminLayout";
import Login from "../pages/Auth/Login/Login";
import Register from "../pages/Auth/Register/Register";
import Home from "../pages/Home/Home";
import OrderList from "../pages/orderlist/OrderList";
import ProtectedRoute from "../components/ProtectedRoute";

const useRouterElements = () => {
  const routeElements = useRoutes([
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
    {
      path: PATH.HOME,
      element: (
        <ProtectedRoute>
          <StaffLayout />
        </ProtectedRoute>
      ),
      children: [
        {
          path: "",
          element: <Home />,
        },
        {
          path: PATH.ORDERS,
          element: <OrderList />,
        },
      ],
    },
    {
      path: PATH.ADMIN,
      element: (
        <ProtectedRoute>
          <AdminLayout />
        </ProtectedRoute>
      ),
      children: [
        // Admin routes will be added here
      ],
    },
  ]);

  return routeElements;
};

export default useRouterElements; 