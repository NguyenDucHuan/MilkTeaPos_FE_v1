import { Avatar, Box, Typography } from "@mui/material";
import React from "react";
import "./HeaderAdmin.css";
export default function HeaderAdmin() {
  return (
    <>
      <Box className="header-admin">
        <Box className="header-admin__title">
          <Typography
            variant="h5"
            component="h2"
            className="header-admin__title-text"
          >
            Dasboard
          </Typography>
        </Box>
        <Box className="header-admin__user">
          <Avatar
            alt="Remy Sharp"
            src="/static/images/avatar/1.jpg"
            className="header-admin__user-avatar"
          />
          <Typography
            variant="h6"
            component="h2"
            className="header-admin__user-name"
          >
            Admin <br />
            <span className="header-admin__user-role" style={{ color: "#857976" }}>
              Administrator
            </span>
          </Typography>
        </Box>
      </Box>
    </>
  );
}
