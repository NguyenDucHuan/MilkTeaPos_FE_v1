import React, { useEffect, useState } from "react";
import { Outlet } from "react-router-dom";
import Footer from "../../components/Footer/Footer";
import Header from "../../components/Header/Header";
import { useDispatch, useSelector } from "react-redux";
import { getallCategory } from "../../store/slices/categorySlice";
import "./StaffLayout.css";

export default function StaffLayout() {
  const [selectedCategory, setSelectedCategory] = useState(null);
  const dispatch = useDispatch();
  const {
    category: categories,
    isLoading,
    error,
  } = useSelector((state) => state.category);

  // Gọi API để lấy categories khi component mount
  useEffect(() => {
    dispatch(getallCategory());
  }, [dispatch]);

  return (
    <div className="staff-layout">
      <Header
        setSelectedCategory={setSelectedCategory}
        categories={categories}
        isLoading={isLoading}
        error={error}
      />
      <main className="staff-main">
        <Outlet context={{ selectedCategory, setSelectedCategory }} />
      </main>
      <Footer />
    </div>
  );
}
