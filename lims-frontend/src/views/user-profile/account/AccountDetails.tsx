"use client";

// MUI Imports
import Grid from "@mui/material/Grid";
import Card from "@mui/material/Card";
import CardContent from "@mui/material/CardContent";
import Button from "@mui/material/Button";

// Component Imports
import CustomTextField from "@core/components/mui/TextField";
import { useProfileForm } from "../../../hooks/forms/user/useProfileForm";
import { UserProfileValues } from "../../../schema/user/profile";
import { Controller } from "react-hook-form";
import { useUpdateProfileUser } from "../../../hooks/mutation/user/profile/useUpdateProfile";

const AccountDetails = () => {
  const { data, form, refetch } = useProfileForm();
  const { errors } = form.formState; // Get errors from form state
  const { mutateAsync } = useUpdateProfileUser();
  const onSubmit = async (values: UserProfileValues) => {
    mutateAsync(values);
    // form.reset(); // Reset form setelah submit
    refetch();
  };
  return (
    <Card>
      <CardContent>
        <form onSubmit={form.handleSubmit(onSubmit)} {...form}>
          <Grid container spacing={6}>
            <Grid item xs={12} sm={12}>
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
            </Grid>
            <Grid item xs={12} sm={12}>
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
            </Grid>
            <Grid item xs={12} sm={12}>
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
                    disabled // Menjadikan field ini tidak dapat diisi
                    {...field}
                  />
                )}
              />
            </Grid>

            <Grid item xs={12} className="flex gap-4 flex-wrap">
              <Button variant="contained" type="submit">
                Save Changes
              </Button>
              <Button
                variant="tonal"
                type="reset"
                color="secondary"
                onClick={() => form.reset()}
              >
                Reset
              </Button>
            </Grid>
          </Grid>
        </form>
      </CardContent>
    </Card>
  );
};

export default AccountDetails;
