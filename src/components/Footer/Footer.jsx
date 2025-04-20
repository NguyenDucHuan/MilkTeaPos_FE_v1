import React from 'react';
import { Facebook, Instagram, Phone, Email, LocationOn, AccessTime } from '@mui/icons-material';

const Footer = () => {
  return (
    <footer className="w-full bg-primary/10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Thông tin cửa hàng */}
          <div className="space-y-4">
            <h3 className="text-2xl font-bold text-primary">Milk Tea Shop</h3>
            <p className="text-secondary leading-relaxed">
              Chuyên phục vụ các loại trà sữa thơm ngon, chất lượng cao với giá cả phải chăng.
            </p>
            <div className="flex space-x-4">
              <a href="#" className="text-primary hover:text-secondary transition-colors">
                <Facebook className="w-6 h-6" />
              </a>
              <a href="#" className="text-primary hover:text-secondary transition-colors">
                <Instagram className="w-6 h-6" />
              </a>
            </div>
          </div>

          {/* Giờ mở cửa */}
          <div className="space-y-4">
            <h3 className="text-xl font-semibold text-primary">Giờ mở cửa</h3>
            <div className="space-y-2">
              <div className="flex items-center text-secondary">
                <AccessTime className="mr-2 text-primary" />
                <span>Thứ 2 - Thứ 6: 8:00 - 22:00</span>
              </div>
              <div className="flex items-center text-secondary">
                <AccessTime className="mr-2 text-primary" />
                <span>Thứ 7 - Chủ nhật: 9:00 - 23:00</span>
              </div>
            </div>
          </div>

          {/* Liên hệ */}
          <div className="space-y-4">
            <h3 className="text-xl font-semibold text-primary">Liên hệ</h3>
            <div className="space-y-2">
              <div className="flex items-center text-secondary">
                <LocationOn className="mr-2 text-primary" />
                <span>123 Đường ABC, Quận 1, TP.HCM</span>
              </div>
              <div className="flex items-center text-secondary">
                <Phone className="mr-2 text-primary" />
                <span>0123 456 789</span>
              </div>
              <div className="flex items-center text-secondary">
                <Email className="mr-2 text-primary" />
                <span>info@milkteashop.com</span>
              </div>
            </div>
          </div>
        </div>

        {/* Copyright */}
        <div className="mt-12 pt-8 border-t border-primary/20 text-center text-secondary">
          <p>&copy; {new Date().getFullYear()} Milk Tea Shop. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
