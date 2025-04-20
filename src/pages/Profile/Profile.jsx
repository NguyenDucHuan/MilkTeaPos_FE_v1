import React from 'react';
import {
  Container,
  Typography,
  Avatar,
  Grid,
  Divider,
} from '@mui/material';
import {
  Email as EmailIcon,
  Phone as PhoneIcon,
  LocationOn as LocationIcon,
  Work as WorkIcon,
  CalendarToday as CalendarIcon,
} from '@mui/icons-material';

const Profile = () => {
  // Mock data - replace with actual user data from your auth state
  const userData = {
    fullName: 'Nguyễn Văn A',
    email: 'nguyenvana@example.com',
    phone: '0123456789',
    address: '123 Đường ABC, Quận 1, TP.HCM',
    position: 'Nhân viên bán hàng',
    joinDate: '01/01/2024',
  };

  const InfoItem = ({ icon: Icon, label, value }) => (
    <div className="flex items-center p-4 rounded-lg bg-white shadow-sm hover:shadow-md transition-all duration-300 mb-3">
      <div className="flex items-center justify-center w-10 h-10 rounded-full bg-primary/10 mr-4">
        <Icon className="text-primary" />
      </div>
      <div>
        <p className="text-sm text-gray-500">{label}</p>
        <p className="font-medium text-gray-900">{value}</p>
      </div>
    </div>
  );

  const StatItem = ({ value, label }) => (
    <div className="bg-primary/5 rounded-lg p-4 text-center transform hover:scale-105 transition-all duration-300">
      <h4 className="text-2xl font-bold text-primary mb-1">{value}</h4>
      <p className="text-sm text-gray-600">{label}</p>
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <Container maxWidth="lg">
        <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
          {/* Header Section */}
          <div className="relative h-32 bg-gradient-to-r from-primary to-secondary">
            <div className="absolute -bottom-16 left-1/2 transform -translate-x-1/2">
              <div className="relative">
                <Avatar
                  className="w-32 h-32 border-4 border-white shadow-lg"
                  sx={{ width: 128, height: 128, bgcolor: '#895a2a', fontSize: '3rem' }}
                >
                  {userData.fullName.charAt(0)}
                </Avatar>
                <div className="absolute -bottom-2 left-1/2 transform -translate-x-1/2">
                  <span className="px-3 py-1 text-xs font-medium text-white bg-green-500 rounded-full">
                    Online
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Profile Content */}
          <div className="pt-20 px-6 pb-6">
            <div className="text-center mb-8">
              <Typography variant="h4" className="text-gray-900 font-bold">
                {userData.fullName}
              </Typography>
              <div className="flex items-center justify-center mt-2 text-gray-600">
                <WorkIcon className="text-primary mr-2" />
                <span>{userData.position}</span>
              </div>
              <div className="flex items-center justify-center mt-1 text-sm text-gray-500">
                <CalendarIcon className="text-primary mr-2" />
                <span>Tham gia từ: {userData.joinDate}</span>
              </div>
            </div>

            <Divider className="my-6" />

            <Grid container spacing={4}>
              {/* Contact Information */}
              <Grid item xs={12} md={6}>
                <div className="bg-gray-50 rounded-xl p-6">
                  <h3 className="text-lg font-semibold text-primary mb-4 flex items-center">
                    <span className="w-1 h-6 bg-primary rounded mr-2"></span>
                    Thông tin liên hệ
                  </h3>
                  <InfoItem icon={EmailIcon} label="Email" value={userData.email} />
                  <InfoItem icon={PhoneIcon} label="Số điện thoại" value={userData.phone} />
                  <InfoItem icon={LocationIcon} label="Địa chỉ" value={userData.address} />
                </div>
              </Grid>

              {/* Statistics */}
              <Grid item xs={12} md={6}>
                <div className="bg-gray-50 rounded-xl p-6">
                  <h3 className="text-lg font-semibold text-primary mb-4 flex items-center">
                    <span className="w-1 h-6 bg-primary rounded mr-2"></span>
                    Thống kê hoạt động
                  </h3>
                  <div className="grid grid-cols-2 gap-4">
                    <StatItem value="128" label="Đơn hàng" />
                    <StatItem value="12.5M" label="Doanh thu" />
                    <StatItem value="98%" label="Tỷ lệ hoàn thành" />
                    <StatItem value="4.8" label="Đánh giá" />
                  </div>
                </div>
              </Grid>
            </Grid>
          </div>
        </div>
      </Container>
    </div>
  );
};

export default Profile; 