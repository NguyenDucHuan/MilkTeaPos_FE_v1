import React, { useEffect } from 'react'; // <-- Thêm useEffect
import { useDispatch } from 'react-redux'; // <-- Thêm useDispatch
import { setUserFromToken } from './store/slices/authSlice'; // <-- Import action setUserFromToken (đảm bảo đường dẫn đúng)
import useRouterElements from './routes/useRouterElements'; // Đường dẫn đến router của bạn

function App() {
  const dispatch = useDispatch(); // <-- Lấy hàm dispatch
  const routeElements = useRouterElements(); // <-- Giữ nguyên router elements

  // --- THÊM useEffect ĐỂ KHÔI PHỤC SESSION ---
  useEffect(() => {
    console.log("[App] Component mounted. Checking for existing token...");
    const accessToken = localStorage.getItem('accessToken'); // Lấy token từ localStorage
    console.log("[App] Token found in localStorage:", !!accessToken);

    if (accessToken) {
      // Nếu có token, dispatch action để cập nhật user vào Redux state
      // Action này sẽ giải mã token và thiết lập user/isAuthenticated trong Redux
      console.log("[App] Dispatching setUserFromToken...");
      dispatch(setUserFromToken(accessToken));
    }
    // Dependency array là [dispatch] để chỉ chạy một lần khi component App được mount
    // Dispatch là hàm ổn định nên không gây chạy lại không cần thiết
  }, [dispatch]);
  // ------------------------------------------

  // Giữ nguyên phần return router
  return <>{routeElements}</>;
}

export default App;