import { Navigate, useLocation } from "react-router-dom";
import { useSelector } from "react-redux";
import { PATH } from "../routes/path";  // Đảm bảo PATH.LOGIN có giá trị chính xác

const ProtectedRoute = ({ children }) => {
  // Kiểm tra trạng thái đăng nhập từ Redux
  const { isAuthenticated } = useSelector((state) => state.auth);
  const location = useLocation();

  // Kiểm tra xem người dùng đã đăng nhập chưa
  if (!isAuthenticated) {
    // Nếu chưa đăng nhập, chuyển hướng về trang login và lưu URL hiện tại để redirect sau khi login
    return <Navigate to={PATH.LOGIN} state={{ from: location }} replace />;
  }

  // Nếu đã đăng nhập, cho phép truy cập vào children (route con)
  return children;
};

export default ProtectedRoute;
