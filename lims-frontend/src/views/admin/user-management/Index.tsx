import {
  Box,
  Button,
  Card,
  CardContent,
  CardHeader,
  Grid,
} from "@mui/material";
import React from "react";
import UsersTable from "./Table";
import AdminUserForm from "./Form";
import { useUserForm } from "../../../hooks/forms/admin/useUserForm";

export default function ViewAdminUserManagement() {
  const { setOpen, open, setSelected } = useUserForm();

  const handleFormOpen = () => {
    setSelected("");
    setOpen(!open);
  };
  return (
    <Grid container columnGap={open ? 4 : 0} rowGap={open ? 4 : 0}>
      {open ? (
        <Grid item xs={12} lg={12} md={12}>
          <AdminUserForm />
        </Grid>
      ) : null}
      <Grid item xs={12} lg={12} md={12}>
        <Card
          sx={{
            width: "100%",
          }}
        >
          <CardHeader
            title="User Management"
            action={
              <Box
                sx={{
                  display: "flex",
                  justifyContent: "center",
                  alignItems: "center",
                  width: "100%",
                }}
              >
                <Button
                  variant="contained"
                  sx={{ padding: "8px 40px", gap: "4px" }}
                  onClick={handleFormOpen}
                >
                  Add User
                </Button>
              </Box>
            }
          >
            <Box
              sx={{ display: "flex", flexDirection: "column", gap: "10px" }}
            ></Box>
          </CardHeader>
          <CardContent>
            <UsersTable />
          </CardContent>
        </Card>
      </Grid>
    </Grid>
  );
}
