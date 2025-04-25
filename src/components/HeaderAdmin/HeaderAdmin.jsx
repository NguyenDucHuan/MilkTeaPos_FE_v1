import React, { useState } from 'react'; // 1. Thêm useState
import { useNavigate } from "react-router-dom"; // 2. Thêm useNavigate
import { useSelector, useDispatch } from 'react-redux'; // 3. Thêm useSelector, useDispatch
import { logout } from '../../store/slices/authSlice'; // 4. Import logout action
import { PATH } from "../../routes/path"; // 5. Import PATH
import {
  Avatar, Box, Typography, IconButton, Menu, MenuItem, Tooltip, ListItemIcon, ListItemText // 6. Thêm các components MUI cần thiết
} from "@mui/material";
import { Person as PersonIcon, Logout as LogoutIcon } from "@mui/icons-material"; // 7. Import Icons
import "./HeaderAdmin.css"; // Giữ CSS của bạn
import PageTitle from "../PageTitle"; // Giữ PageTitle

export default function HeaderAdmin() {
  // 8. Thêm hooks và state cần thiết
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { user } = useSelector((state) => state.auth); // Lấy user từ Redux
  const [anchorElUser, setAnchorElUser] = useState(null); // State cho menu

  // 9. Thêm các hàm xử lý sự kiện menu
  const handleOpenUserMenu = (event) => {
    setAnchorElUser(event.currentTarget);
  };

  const handleCloseUserMenu = () => {
    setAnchorElUser(null);
  };

  const handleLogout = () => {
    dispatch(logout());
    localStorage.removeItem("accessToken"); // Đảm bảo xóa token khi logout
    navigate(PATH.LOGIN, { replace: true });
    handleCloseUserMenu();
  };

  const handleNavigateProfile = () => {
     // Bạn cần đảm bảo PATH.PROFILE được định nghĩa và có route tương ứng
     // Nếu trang Profile của Admin khác Staff, bạn cần tạo PATH riêng (vd: PATH.ADMIN_PROFILE)
     // và điều hướng đến đó. Hiện tại dùng chung PATH.PROFILE
     navigate(PATH.PROFILE);
     handleCloseUserMenu();
  };


  return (
    <>
      <Box className="header-admin">
        <Box className="header-admin__title">
          {/* PageTitle component của bạn */}
          <PageTitle />
        </Box>

        {/* ----- THAY THẾ PHẦN USER CŨ BẰNG PHẦN MỚI ----- */}
        <Box className="header-admin__user"> {/* Giữ lại class để CSS nếu cần */}
          {/* Hiển thị tên nếu có */}
          {user && (
             <Typography
               variant="subtitle1" // Có thể dùng subtitle1 hoặc body2
               component="div" // Dùng div để chứa cả tên và role
               className="header-admin__user-name" // Giữ class nếu cần
               sx={{ textAlign: 'right', mr: 1.5 }} // Căn lề phải, thêm khoảng cách
             >
               {user.name || user.fullName || 'Admin'} {/* Lấy tên từ user */}
               <br />
               <span className="header-admin__user-role" style={{ color: "#857976", fontSize: '0.8rem' }}> {/* Giảm cỡ chữ role */}
                  {user.role || 'Administrator'} {/* Lấy role từ user */}
               </span>
             </Typography>
          )}

          {/* Nút bấm mở menu (Avatar) */}
          <Tooltip title="Open settings">
            <IconButton onClick={handleOpenUserMenu} sx={{ p: 0 }}>
              <Avatar
                alt={user?.name || user?.fullName || 'Admin'}
                src={user?.imageUrl || undefined} // Lấy ảnh từ user
                className="header-admin__user-avatar" // Giữ class nếu cần
              >
                 {!user?.imageUrl ? (user?.name || user?.fullName || 'A')[0].toUpperCase() : null}
              </Avatar>
            </IconButton>
          </Tooltip>

          {/* Menu Dropdown */}
          <Menu
            sx={{ mt: '45px' }}
            id="menu-appbar-admin" // Đổi ID cho khác biệt nếu cần
            anchorEl={anchorElUser}
            anchorOrigin={{ vertical: 'top', horizontal: 'right' }}
            keepMounted
            transformOrigin={{ vertical: 'top', horizontal: 'right' }}
            open={Boolean(anchorElUser)}
            onClose={handleCloseUserMenu}
            PaperProps={{ // Thêm style cho menu nếu muốn
                elevation: 3,
                sx: {
                  mt: 1.5,
                  minWidth: 180, // Điều chỉnh độ rộng
                  borderRadius: 1.5,
                  bgcolor: "#fff",
                  overflow: 'visible', // Để có thể thấy shadow
                   '& .MuiAvatar-root': { // Style cho avatar bên trong (nếu có)
                     width: 32,
                     height: 32,
                     ml: -0.5,
                     mr: 1,
                   },
                   '&:before': { // Tạo mũi tên nhỏ chỉ lên avatar (tùy chọn)
                     content: '""',
                     display: 'block',
                     position: 'absolute',
                     top: 0,
                     right: 14,
                     width: 10,
                     height: 10,
                     bgcolor: 'background.paper',
                     transform: 'translateY(-50%) rotate(45deg)',
                     zIndex: 0,
                   },
                }
            }}
          >
            {/* Menu Item Profile */}
            <MenuItem onClick={handleNavigateProfile} sx={{ py: 1.2, px: 2 }}>
              <ListItemIcon>
                <PersonIcon fontSize="small" />
              </ListItemIcon>
              <ListItemText primary="Profile" />
            </MenuItem>

            {/* Menu Item Logout */}
            <MenuItem onClick={handleLogout} sx={{ py: 1.2, px: 2 }}>
               <ListItemIcon>
                <LogoutIcon fontSize="small" />
              </ListItemIcon>
              <ListItemText primary="Logout" />
            </MenuItem>
          </Menu>
        </Box>
         {/* --------------------------------------------- */}
      </Box>
    </>
  );
}