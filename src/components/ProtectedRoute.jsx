import { Navigate, useLocation } from "react-router-dom";
import { useSelector } from "react-redux";
import { PATH } from "../routes/path"; // Đảm bảo các PATH (LOGIN, HOME) có giá trị chính xác

/**
 * Component ProtectedRoute để bảo vệ các route.
 * - Kiểm tra xem người dùng đã đăng nhập chưa.
 * - Nếu có prop `requiredRole`, kiểm tra xem vai trò người dùng có khớp không.
 *
 * @param {object} props
 * @param {React.ReactNode} props.children - Component con cần bảo vệ.
 * @param {string} [props.requiredRole] - Vai trò bắt buộc để truy cập route này (ví dụ: "Manager", "Admin"). Nếu không cung cấp, chỉ cần đăng nhập là đủ.
 */
const ProtectedRoute = ({ children, requiredRole }) => {
  // Lấy trạng thái đăng nhập và thông tin người dùng từ Redux
  // ----- QUAN TRỌNG: Đảm bảo `state.auth.user` chứa thông tin người dùng, bao gồm cả `role` -----
  const { isAuthenticated, user } = useSelector((state) => state.auth);
  const location = useLocation();

  // 1. Kiểm tra xem người dùng đã đăng nhập chưa
  if (!isAuthenticated) {
    // Nếu chưa đăng nhập, chuyển hướng về trang login
    // Lưu lại vị trí hiện tại để quay lại sau khi đăng nhập thành công
    console.log("ProtectedRoute: Not authenticated, redirecting to login.");
    return <Navigate to={PATH.LOGIN} state={{ from: location }} replace />;
  }

  // 2. Nếu đã đăng nhập, kiểm tra xem có yêu cầu vai trò cụ thể không
  if (requiredRole) {
    // ----- QUAN TRỌNG: Đảm bảo `user.role` là cách truy cập đúng vào vai trò người dùng -----
    const userRole = user?.role; // Lấy vai trò từ thông tin user

    if (!userRole) {
      // Xử lý trường hợp không tìm thấy role trong state (có thể đang tải hoặc lỗi state)
      console.warn("ProtectedRoute: User authenticated but role not found in state. Redirecting to HOME.");
      // Có thể chuyển hướng về HOME hoặc hiển thị trang lỗi/loading tùy logic
      // ----- SỬA Ở ĐÂY -----
      return <Navigate to={PATH.HOME} replace />; // Chuyển về HOME khi role sai
    }

    // So sánh vai trò người dùng với vai trò yêu cầu
    if (userRole !== requiredRole) {
      // Nếu vai trò không khớp, chuyển hướng về trang HOME (hoặc trang "Forbidden"/"Unauthorized")
      console.log(`ProtectedRoute: Role mismatch. Required: ${requiredRole}, User has: ${userRole}. Redirecting to HOME.`);
      // Bạn có thể tạo một trang lỗi 403 (Forbidden) riêng và chuyển hướng đến đó
      return <Navigate to={PATH.AUTH} replace />; // Chuyển hướng về trang chủ mặc định
    }
    console.log(`ProtectedRoute: Role matched. Required: ${requiredRole}, User has: ${userRole}. Allowing access.`);
  } else {
    console.log("ProtectedRoute: Authenticated and no specific role required. Allowing access.");
  }

  // 3. Nếu đã đăng nhập VÀ (không yêu cầu role HOẶC role khớp) => Cho phép truy cập
  return children;
};

export default ProtectedRoute;