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
import Profile from "../pages/Profile/Profile";
import ProtectedRoute from "../components/ProtectedRoute";

import AccountList from "../pages/Admin/Accounts/List";
import AccountForm from "../pages/Admin/Accounts/Form";
import CategoryList from "../pages/Admin/Categories/List";
import CategoryForm from "../pages/Admin/Categories/Form";
import ProductList from "../pages/Admin/Products/List";
import ProductForm from "../pages/Admin/Products/Form";
import PaymentList from "../pages/Admin/PaymentMethods/List";
import PaymentForm from "../pages/Admin/PaymentMethods/Form";
import OrderListAdmin from "../pages/Admin/Orders/List";


export default function useRouterElements() {
  const routeElements = useRoutes([
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
      element: (
        <ProtectedRoute>
          <StaffLayout />
        </ProtectedRoute>
      ),
      children: [
        {
          index: true,
          element: (
            <ProtectedRoute>
              <HomePage />
            </ProtectedRoute>
          ),
        },
        {
          path: PATH.ORDERS,
          element: (
            <ProtectedRoute>
              <OrderList />
            </ProtectedRoute>
          ),
        },
        {
          path: PATH.PROFILE,
          element: (
            <ProtectedRoute>
              <Profile />
            </ProtectedRoute>
          ),
        },
      ],
    },


    // Admin
    {
      path: PATH.ADMIN,
      element: (
        // --- ÁP DỤNG ProtectedRoute CHO ADMIN LAYOUT ---
        // Truyền vai trò yêu cầu vào ProtectedRoute
        <ProtectedRoute requiredRole="Manager">
          <AdminLayout />
        </ProtectedRoute>
        // -------------------------------------------
      ),
      children: [
        {
          index: true,
          path: PATH.ADMIN,
          element: <DashboardAdmin />,
        },
        {
          path: "accounts",
          element: <AccountList />,
        },
        {
          path: "accounts/new",
          element: <AccountForm />,
        },
        {
          path: "accounts/:id/edit",
          element: <AccountForm />,
        },
        {
          path: "categories",
          element: <CategoryList />,
        },
        {
          path: "categories/new",
          element: <CategoryForm />,
        },
        {
          path: "categories/:id/edit",
          element: <CategoryForm />,
        },
        {
          path: "products",
          element: <ProductList />,
        },
        {
          path: "products/new",
          element: <ProductForm />,
        },
        {
          path: "products/:id/edit",
          element: <ProductForm />,
        },
        {
          path: PATH.PAYMENTS,
          element: <PaymentList />,
        },
        {
          path: `${PATH.PAYMENTS}/new`,
          element: <PaymentForm />,
        },
        {
          path: `${PATH.PAYMENTS}/:id/edit`,
          element: <PaymentForm />,
        },
        {
          path: PATH.ORDERS_ADMIN,
          element: <OrderListAdmin />,
        },
      ],
    },
  ]);
  return routeElements;
}