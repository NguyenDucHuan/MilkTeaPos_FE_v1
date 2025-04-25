import React, { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { getProfileApi } from "../../store/slices/profileSlice";
import {
  Box,
  Typography,
  Avatar,
  Paper,
  Grid,
  CircularProgress,
  Card,
  CardContent,
  Divider,
  IconButton,
  Tooltip,
} from "@mui/material";
import {
  Email as EmailIcon,
  Phone as PhoneIcon,
  Person as PersonIcon,
  CalendarToday as CalendarIcon,
  Edit as EditIcon,
  Verified as VerifiedIcon,
} from "@mui/icons-material";
import "./Profile.css";

const Profile = () => {
  const dispatch = useDispatch();
  const { profile, isLoading, error } = useSelector((state) => state.profile);

  useEffect(() => {
    dispatch(getProfileApi());
  }, [dispatch]);

  if (isLoading) {
    return (
      <Box className="profile-loading">
        <CircularProgress size={60} thickness={4} />
        <Typography variant="h6" sx={{ mt: 2, color: "#895a2a" }}>
          Loading profile...
        </Typography>
      </Box>
    );
  }

  if (error) {
    return (
      <Box className="profile-error">
        <Typography variant="h5" color="error">
          Error loading profile
        </Typography>
        <Typography variant="body1" color="error">
          {error}
        </Typography>
      </Box>
    );
  }

  return (
    <Box className="profile-container">
      <Paper elevation={3} className="profile-paper">
        {/* Header Section */}
        <Box className="profile-header">
          <Box className="profile-avatar-container">
            <Avatar
              src={profile?.imageUrl}
              alt={profile?.fullName}
              className="profile-avatar"
            />
            <Box className="profile-avatar-badge">
              <VerifiedIcon className="verified-icon" />
            </Box>
          </Box>
          <Typography variant="h4" className="profile-name">
            {profile?.fullName}
          </Typography>
          <Typography variant="subtitle1" className="profile-username">
            @{profile?.username}
          </Typography>
        </Box>

        {/* Stats Section */}
        <Box className="profile-stats">
          <Card className="profile-stat-card">
            <CardContent>
              <Typography variant="h6" className="stat-number">
                128
              </Typography>
              <Typography variant="body2" className="stat-label">
                Orders
              </Typography>
            </CardContent>
          </Card>
          <Card className="profile-stat-card">
            <CardContent>
              <Typography variant="h6" className="stat-number">
                4.8
              </Typography>
              <Typography variant="body2" className="stat-label">
                Rating
              </Typography>
            </CardContent>
          </Card>
          <Card className="profile-stat-card">
            <CardContent>
              <Typography variant="h6" className="stat-number">
                98%
              </Typography>
              <Typography variant="body2" className="stat-label">
                Success Rate
              </Typography>
            </CardContent>
          </Card>
        </Box>

        <Divider className="profile-divider" />

        {/* Details Section */}
        <Grid container spacing={3} className="profile-details">
          <Grid item xs={12} md={6}>
            <Card className="profile-detail-card">
              <CardContent>
                <Box className="detail-item">
                  <PersonIcon className="detail-icon" />
                  <Box className="detail-content">
                    <Typography variant="subtitle1" className="detail-label">
                      Account ID
                    </Typography>
                    <Typography variant="body1" className="detail-value">
                      {profile?.accountId}
                    </Typography>
                  </Box>
                </Box>
              </CardContent>
            </Card>
          </Grid>

          <Grid item xs={12} md={6}>
            <Card className="profile-detail-card">
              <CardContent>
                <Box className="detail-item">
                  <EmailIcon className="detail-icon" />
                  <Box className="detail-content">
                    <Typography variant="subtitle1" className="detail-label">
                      Email
                    </Typography>
                    <Typography variant="body1" className="detail-value">
                      {profile?.email}
                    </Typography>
                  </Box>
                </Box>
              </CardContent>
            </Card>
          </Grid>

          <Grid item xs={12} md={6}>
            <Card className="profile-detail-card">
              <CardContent>
                <Box className="detail-item">
                  <PhoneIcon className="detail-icon" />
                  <Box className="detail-content">
                    <Typography variant="subtitle1" className="detail-label">
                      Phone
                    </Typography>
                    <Typography variant="body1" className="detail-value">
                      {profile?.phone}
                    </Typography>
                  </Box>
                </Box>
              </CardContent>
            </Card>
          </Grid>

          <Grid item xs={12} md={6}>
            <Card className="profile-detail-card">
              <CardContent>
                <Box className="detail-item">
                  <CalendarIcon className="detail-icon" />
                  <Box className="detail-content">
                    <Typography variant="subtitle1" className="detail-label">
                      Member Since
                    </Typography>
                    <Typography variant="body1" className="detail-value">
                      {new Date(profile?.createdAt).toLocaleDateString()}
                    </Typography>
                  </Box>
                </Box>
              </CardContent>
            </Card>
          </Grid>
        </Grid>

        {/* Edit Button */}
        <Box className="profile-edit-button">
          <Tooltip title="Edit Profile">
            <IconButton className="edit-icon-button">
              <EditIcon />
            </IconButton>
          </Tooltip>
        </Box>
      </Paper>
    </Box>
  );
};

export default Profile; 