import React, { useState, useEffect } from "react";
import {
  Box,
  Button,
  MenuItem,
  TextField,
  Typography,
  FormControlLabel,
  Switch,
} from "@mui/material";
import { useNavigate, useParams } from "react-router-dom";
import mockAccounts from "./mockAccounts";

export default function AccountForm() {
  const navigate = useNavigate();
  const { id } = useParams();

  const isEditMode = Boolean(id);

  const [formData, setFormData] = useState({
    fullName: "",
    username: "",
    email: "",
    phone: "",
    role: "Staff",
    status: true,
  });

  useEffect(() => {
    if (isEditMode) {
      const accountToEdit = mockAccounts.find((acc) => acc.id === Number(id));
      if (accountToEdit) {
        setFormData(accountToEdit);
      }
    }
  }, [id, isEditMode]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData({
      ...formData,
      [name]: type === "checkbox" ? checked : value,
    });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (isEditMode) {
      console.log("Update account:", formData);
    } else {
      console.log("Create new account:", formData);
    }
    navigate("/admin/accounts");
  };

  return (
    <Box p={3} maxWidth="600px" mx="auto">
      <Typography variant="h5" mb={3}>
        {isEditMode ? "Edit Account" : "Add New Account"}
      </Typography>
      <form onSubmit={handleSubmit}>
        <TextField
          fullWidth
          label="Full Name"
          name="fullName"
          value={formData.fullName}
          onChange={handleChange}
          margin="normal"
          required
        />
        <TextField
          fullWidth
          label="Username"
          name="username"
          value={formData.username}
          onChange={handleChange}
          margin="normal"
          required
        />
        <TextField
          fullWidth
          label="Email"
          name="email"
          type="email"
          value={formData.email}
          onChange={handleChange}
          margin="normal"
          required
        />
        <TextField
          fullWidth
          label="Phone"
          name="phone"
          value={formData.phone}
          onChange={handleChange}
          margin="normal"
        />
        <TextField
          fullWidth
          select
          label="Role"
          name="role"
          value={formData.role}
          onChange={handleChange}
          margin="normal"
        >
          <MenuItem value="Manager">Manager</MenuItem>
          <MenuItem value="Staff">Staff</MenuItem>
        </TextField>
        <FormControlLabel
          control={
            <Switch
              checked={formData.status}
              onChange={handleChange}
              name="status"
            />
          }
          label="Active"
          sx={{ mt: 2 }}
        />

        <Box mt={3} display="flex" justifyContent="space-between">
          <Button variant="outlined" onClick={() => navigate("/admin/accounts")}>
            Cancel
          </Button>
          <Button type="submit" variant="contained">
            {isEditMode ? "Save Changes" : "Create"}
          </Button>
        </Box>
      </form>
    </Box>
  );
}
