import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { PATH } from "../../routes/path";
import {
  AppBar,
  Toolbar,
  Typography,
  IconButton,
  Box,
  Button,
  Menu,
  MenuItem,
  ListItemIcon,
  ListItemText,
  Drawer,
  List,
  ListItem,
  Avatar,
  useTheme,
  useMediaQuery,
} from "@mui/material";
import {
  Home as HomeIcon,
  MenuBook as MenuBookIcon,
  Group as GroupIcon,
  Settings as SettingsIcon,
  Person as PersonIcon,
  ShoppingCart as ShoppingCartIcon,
  Logout as LogoutIcon,
  Menu as MenuIcon,
  Close as CloseIcon,
  ArrowDropDown as ArrowDropDownIcon,
  AccountBalanceWallet as AccountBalanceWalletIcon,
} from "@mui/icons-material";
import { useDispatch, useSelector } from "react-redux";
import { logout } from "../../store/slices/authSlice";

const HEADER_HEIGHT = 80;

const Header = ({ setSelectedCategory, isLoading, error }) => {
  const categories = useSelector((state) => state.category.category);
  const dispatch = useDispatch();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("md"));
  const navigate = useNavigate();
  const [isScrolled, setIsScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [anchorEl, setAnchorEl] = useState(null);
  const [categoryAnchorEl, setCategoryAnchorEl] = useState(null);
  const [mobileCategoryOpen, setMobileCategoryOpen] = useState(false);


  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 10) {
        setIsScrolled(true);
      } else {
        setIsScrolled(false);
      }
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const handleLogout = () => {
    dispatch(logout());
    localStorage.removeItem("accessToken");
    navigate(PATH.LOGIN);
  };

  const handleMenuOpen = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
  };

  const handleCategoryMenuOpen = (event) => {
    setCategoryAnchorEl(event.currentTarget);
  };

  const handleCategoryMenuClose = () => {
    setCategoryAnchorEl(null);
  };

  const handleMobileMenuToggle = () => {
    setMobileMenuOpen(!mobileMenuOpen);
    setMobileCategoryOpen(false);
  };

  const handleMobileCategoryToggle = () => {
    setMobileCategoryOpen(!mobileCategoryOpen);
  };

  const handleNavigation = (path) => {
    navigate(path);
    setMobileMenuOpen(false);
    setMobileCategoryOpen(false);
    handleMenuClose();
    handleCategoryMenuClose();
  };

  const handleCategorySelect = (categoryName) => {
    console.log("Selected category:", categoryName);
    setSelectedCategory(categoryName);
    navigate(PATH.HOME);
    setMobileMenuOpen(false);
    setMobileCategoryOpen(false);
    handleCategoryMenuClose();
  };

  const menuItems = [
    { text: "Trang chủ", icon: HomeIcon, path: PATH.HOME },
    {
      text: "Thực đơn",
      icon: MenuBookIcon,
      path: "/menu",
      hasSubmenu: true,
      submenu: Array.isArray(categories)
        ? categories.map((cat) => ({
            text: cat.categoryName,
          }))
        : [],
    },
    { text: "Đơn Hàng", icon: GroupIcon, path: "/orders" },
    { text: "Két Thu Ngân", icon: AccountBalanceWalletIcon, path: "/cash-register" },
  ];

  const userMenuItems = [
    { text: "Thông tin cá nhân", icon: PersonIcon, path: "/profile" },
    { text: "Đơn hàng", icon: ShoppingCartIcon, path: PATH.ORDERS },
    { text: "Đăng xuất", icon: LogoutIcon, path: "#", onClick: handleLogout },
  ];

  return (
    <>
      <AppBar
        position="fixed"
        sx={{
          backgroundColor: isScrolled
            ? "rgba(255, 255, 255, 0.95)"
            : "transparent",
          backdropFilter: isScrolled ? "blur(8px)" : "none",
          boxShadow: isScrolled ? 1 : 0,
          transition: "all 0.3s ease-in-out",
          zIndex: (theme) => theme.zIndex.drawer + 1,
        }}
      >
        <Toolbar sx={{ height: HEADER_HEIGHT }}>
          <Box sx={{ display: "flex", alignItems: "center", flexGrow: 0 }}>
            <Link
              to={PATH.HOME}
              style={{
                textDecoration: "none",
                display: "flex",
                alignItems: "center",
                gap: 16,
              }}
            >
              <Avatar
                sx={{
                  bgcolor: "#895a2a",
                  width: 40,
                  height: 40,
                  transition: "transform 0.2s",
                  "&:hover": {
                    transform: "scale(1.1)",
                  },
                }}
              >
                M
              </Avatar>
              <Typography
                variant="h5"
                sx={{
                  fontWeight: "bold",
                  color: "#895a2a",
                  transition: "color 0.2s",
                  "&:hover": {
                    color: "#6b4423",
                  },
                }}
              >
                Milk Tea Shop
              </Typography>
            </Link>
          </Box>

          {!isMobile && (
            <Box sx={{ ml: 4, display: "flex", gap: 2 }}>
              {menuItems.map((item) =>
                item.hasSubmenu ? (
                  <Box key={item.text}>
                    <Button
                      startIcon={<item.icon />}
                      endIcon={<ArrowDropDownIcon />}
                      onMouseEnter={handleCategoryMenuOpen}
                      onClick={() => handleNavigation(item.path)}
                      sx={{
                      
                        color: "#895a2a",
                        "&:hover": {
                          backgroundColor: "rgba(137, 90, 42, 0.08)",
                          
                        },
                      }}
                    >
                      {item.text}
                    </Button>
                    <Menu
                      anchorEl={categoryAnchorEl}
                      open={Boolean(categoryAnchorEl)}
                      onClose={handleCategoryMenuClose}
                      MenuListProps={{
                        onMouseLeave: handleCategoryMenuClose,
                      }}
                      PaperProps={{
                        elevation: 3,
                        sx: {
                     
                          mt: 1.5,
                          minWidth: 200,
                          borderRadius: 2,
                          bgcolor: "#fff",
                        },
                      }}
                    >
                      {isLoading ? (
                        <MenuItem disabled>
                          <ListItemText primary="Đang tải..." />
                        </MenuItem>
                      ) : error ? (
                        <MenuItem disabled>
                          <ListItemText primary="Lỗi tải danh mục" />
                        </MenuItem>
                      ) : item.submenu.length === 0 ? (
                        <MenuItem disabled>
                          <ListItemText primary="Không có danh mục" />
                        </MenuItem>
                      ) : (
                        item.submenu.map((subItem) => (
                          <MenuItem
                            key={subItem.text}
                            onClick={() => handleCategorySelect(subItem.text)}
                            sx={{
                              overflow: "hidden",
                              py: 1.5,
                              color: "#6b4423",
                              fontWeight: 500,
                              "&:hover": {
                                backgroundColor: "#b0855b",
                                color: "#fff",
                              },
                            }}
                          >
                            <ListItemText primary={subItem.text} />
                          </MenuItem>
                        ))
                      )}
                    </Menu>
                  </Box>
                ) : (
                  <Button
                    key={item.text}
                    startIcon={<item.icon />}
                    onClick={() => handleNavigation(item.path)}
                    sx={{
                      color: "#895a2a",
                      "&:hover": {
                        backgroundColor: "rgba(137, 90, 42, 0.08)",
                      },
                    }}
                  >
                    {item.text}
                  </Button>
                )
              )}
            </Box>
          )}

          <Box sx={{ flexGrow: 1 }} />

          {!isMobile ? (
            <>
              <IconButton
                onClick={handleMenuOpen}
                sx={{
                  ml: 2,
                  transition: "transform 0.2s",
                  "&:hover": {
                    transform: "scale(1.1)",
                  },
                }}
              >
                <Avatar sx={{ bgcolor: "#895a2a" }}>U</Avatar>
              </IconButton>
              <Menu
                anchorEl={anchorEl}
                open={Boolean(anchorEl)}
                onClose={handleMenuClose}
                PaperProps={{
                  elevation: 3,
                  sx: {
                    mt: 1.5,
                    minWidth: 200,
                    borderRadius: 2,
                    bgcolor: "#fff",
                  },
                }}
              >
                {userMenuItems.map((item) => (
                  <MenuItem
                    key={item.text}
                    onClick={
                      item.onClick || (() => handleNavigation(item.path))
                    }
                    sx={{
                      py: 1.5,
                      color: "#6b4423",
                      fontWeight: 500,
                      "&:hover": {
                        backgroundColor: "#b0855b",
                        color: "#fff",
                      },
                    }}
                  >
                    <ListItemIcon>
                      <item.icon sx={{ color: "#6b4423" }} />
                    </ListItemIcon>
                    <ListItemText primary={item.text} />
                  </MenuItem>
                ))}
              </Menu>
            </>
          ) : (
            <IconButton
              edge="end"
              color="inherit"
              onClick={handleMobileMenuToggle}
              sx={{ color: "#895a2a" }}
            >
              {mobileMenuOpen ? <CloseIcon /> : <MenuIcon />}
            </IconButton>
          )}
        </Toolbar>
      </AppBar>

      <Toolbar sx={{ height: HEADER_HEIGHT }} />

      <Drawer
        anchor="right"
        open={mobileMenuOpen}
        onClose={handleMobileMenuToggle}
        PaperProps={{
          sx: {
            width: 280,
            p: 2,
            mt: `${HEADER_HEIGHT}px`,
            bgcolor: "#fff",
          },
        }}
      >
        <List>
          {menuItems.map((item) =>
            item.hasSubmenu ? (
              <React.Fragment key={item.text}>
                <ListItem
                  button
                  onClick={handleMobileCategoryToggle}
                  sx={{
                    borderRadius: 1,
                    mb: 1,
                    color: "#6b4423",
                    "&:hover": {
                      backgroundColor: "#b0855b",
                      color: "#fff",
                    },
                  }}
                >
                  <ListItemIcon>
                    <item.icon sx={{ color: "#6b4423" }} />
                  </ListItemIcon>
                  <ListItemText primary={item.text} />
                  {mobileCategoryOpen ? (
                    <ArrowDropDownIcon />
                  ) : (
                    <ArrowDropDownIcon sx={{ transform: "rotate(-90deg)" }} />
                  )}
                </ListItem>
                {mobileCategoryOpen && (
                  <List sx={{ pl: 4 }}>
                    {isLoading ? (
                      <ListItem disabled>
                        <ListItemText primary="Đang tải..." />
                      </ListItem>
                    ) : error ? (
                      <ListItem disabled>
                        <ListItemText primary="Lỗi tải danh mục" />
                      </ListItem>
                    ) : item.submenu.length === 0 ? (
                      <ListItem disabled>
                        <ListItemText primary="Không có danh mục" />
                      </ListItem>
                    ) : (
                      item.submenu.map((subItem) => (
                        <ListItem
                          key={subItem.text}
                          button
                          onClick={() => handleCategorySelect(subItem.text)}
                          sx={{
                            borderRadius: 1,
                            mb: 1,
                            color: "#6b4423",
                            fontWeight: 500,
                            "&:hover": {
                              backgroundColor: "#b0855b",
                              color: "#fff",
                            },
                          }}
                        >
                          <ListItemText primary={subItem.text} />
                        </ListItem>
                      ))
                    )}
                  </List>
                )}
              </React.Fragment>
            ) : (
              <ListItem
                key={item.text}
                button
                onClick={() => handleNavigation(item.path)}
                sx={{
                  borderRadius: 1,
                  mb: 1,
                  color: "#6b4423",
                  fontWeight: 500,
                  "&:hover": {
                    backgroundColor: "#b0855b",
                    color: "#fff",
                  },
                }}
              >
                <ListItemIcon>
                  <item.icon sx={{ color: "#6b4423" }} />
                </ListItemIcon>
                <ListItemText primary={item.text} />
              </ListItem>
            )
          )}
          <Box sx={{ height: 1, bgcolor: "divider", my: 2 }} />
          {userMenuItems.map((item) => (
            <ListItem
              key={item.text}
              button
              onClick={item.onClick || (() => handleNavigation(item.path))}
              sx={{
                borderRadius: 1,
                mb: 1,
                color: "#6b4423",
                fontWeight: 500,
                "&:hover": {
                  backgroundColor: "#b0855b",
                  color: "#fff",
                },
              }}
            >
              <ListItemIcon>
                <item.icon sx={{ color: "#6b4423" }} />
              </ListItemIcon>
              <ListItemText primary={item.text} />
            </ListItem>
          ))}
        </List>
      </Drawer>
    </>
  );
};

export default Header;