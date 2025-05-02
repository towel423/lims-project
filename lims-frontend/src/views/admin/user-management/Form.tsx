import React, { useEffect, useState } from "react";
import { AdminUserValues } from "@/schema/admin/user";
import axios from "axios";
import {
  Avatar,
  Box,
  Button,
  Card,
  CardContent,
  CardHeader,
  Checkbox,
  Divider,
  FormControlLabel,
  FormHelperText,
  InputLabel,
  MenuItem,
  Typography,
} from "@mui/material";
import { Controller } from "react-hook-form";
import CustomTextField from "../../../@core/components/mui/TextField";
import { useUserForm } from "../../../hooks/forms/admin/useUserForm";
import { useCreateUser } from "../../../hooks/mutation/admin/user/useCreateUser";
import { useUpdateUser } from "../../../hooks/mutation/admin/user/useUpdateUser";
import { useRolesData } from "../../../hooks/data/useRolesData";
import { IRoles } from "../../../interface/admin/roles";
import { useAllRoles } from "../../../hooks/data/useAllRoles";
import { useUserTable } from "../../../hooks/data/useUserTable";

export default function AdminUserForm() {
  const { form, selected, setOpen, data } = useUserForm();
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const { mutateAsync: addUser } = useCreateUser();
  const { mutateAsync: updateUser } = useUpdateUser();
  const { refetch } = useUserTable();
  const { errors } = form.formState; // Get errors from form state
  const { data: roleList } = useRolesData();
  const onSubmit = async (values: AdminUserValues) => {
   
    setIsLoading(true);
    const newValues = {
      ...values,
      uuid: selected,
    };

    try {
      if (!selected) {
        await addUser(newValues); // Panggil API dengan data yang telah diubah
        form.reset();
      } else {
        await updateUser(newValues);
      }

      // form.reset(); // Reset setelah mutasi berhasil
    } catch (error) {
      console.error(error);
    } finally {
      setIsLoading(false);
    }

    refetch();
    // form.reset(); // Reset form setelah submit
  };

  return (
    <Card>
      <CardHeader title={selected ? "Edit User" : "Add User"} />
      <CardContent>
        <Box sx={{ display: "flex", flexDirection: "column", gap: "10px" }}>
          <form onSubmit={form.handleSubmit(onSubmit)} {...form}>
            {/* Title Field with Error Handling */}
            <Box sx={{ marginBottom: "1rem" }}>
              <Controller
                name="fullname"
                control={form.control}
                render={({ field }) => (
                  <CustomTextField
                    fullWidth
                    type="text"
                    label="Full Name"
                    placeholder="Please input a fullname of user"
                    error={!!errors.fullname} // Show error state
                    helperText={errors.fullname?.message} // Display error message
                    {...field}
                  />
                )}
              />
            </Box>
            <Box sx={{ marginBottom: "1rem" }}>
              <Controller
                name="email"
                control={form.control}
                render={({ field }) => (
                  <CustomTextField
                    fullWidth
                    type="email"
                    label="Email"
                    placeholder="Please input a email of user"
                    error={!!errors.email} // Show error state
                    helperText={errors.email?.message} // Display error message
                    {...field}
                  />
                )}
              />
            </Box>
            <Box sx={{ marginBottom: "1rem" }}>
              <Controller
                name="username"
                control={form.control}
                render={({ field }) => (
                  <CustomTextField
                    fullWidth
                    type="text"
                    label="Username"
                    placeholder="Please input a username of user"
                    error={!!errors.username} // Show error state
                    helperText={errors.username?.message} // Display error message
                    {...field}
                  />
                )}
              />
            </Box>
            {/* <Box sx={{ marginBottom: "1rem" }}>
              <Controller
                name="password"
                control={form.control}
                render={({ field }) => (
                  <CustomTextField
                    fullWidth
                    type="password"
                    label="Password"
                    placeholder="Please input a password of user"
                    error={!!errors.password} // Show error state
                    helperText={errors.password?.message} // Display error message
                    {...field}
                  />
                )}
              />
            </Box> */}
            <Box sx={{ marginBottom: "1rem" }}>
              <Controller
                name="password"
                control={form.control}
                render={({ field }) => (
                  <CustomTextField
                    fullWidth
                    type="password"
                    label="Password"
                    placeholder="Please input a password of user"
                    error={!!errors.password} // Show error state
                    helperText={errors.password?.message} // Display error message
                    {...field}
                  />
                )}
              />
            </Box>

            <Box sx={{ marginBottom: "1rem" }}>
              <Controller
                name="mobile"
                control={form.control}
                render={({ field }) => (
                  <CustomTextField
                    fullWidth
                    type="text"
                    label="Mobile Phone"
                    placeholder="Please input a mobile of user"
                    error={!!errors.mobile} // Show error state
                    helperText={errors.mobile?.message} // Display error message
                    {...field}
                  />
                )}
              />
            </Box>
            <Box sx={{ marginBottom: "1rem" }}>
              <Controller
                name="role_guard_name"
                control={form.control}
                render={({ field }) => (
                  <CustomTextField
                    select
                    fullWidth
                    {...field}
                    value={field.value}
                    label="Role"
                  >
                    <MenuItem value="">Select Role</MenuItem>
                    {roleList?.map((role: IRoles) => (
                      <MenuItem value={role.guard_name} key={role.uuid}>{role.name}</MenuItem>
                    ))}
                  </CustomTextField>
                )}
              />
            </Box>
            <Divider sx={{ my: "20px" }} />
            <Box
              sx={{
                display: "flex",
                width: "100%",
                justifyContent: "flex-end",
              }}
            >
              <Button
                variant="contained"
                color="error"
                sx={{ marginRight: "1.5rem" }}
                type="button"
                onClick={() => setOpen(false)}
              >
                Close
              </Button>
              <Button
                variant="contained"
                sx={{ backgroundColor: "primary.800" }}
                type="submit"
                disabled={isLoading}
              >
                {!selected ? "Create User" : "Update User"}
              </Button>
            </Box>
          </form>
        </Box>
      </CardContent>
    </Card>
  );
}
