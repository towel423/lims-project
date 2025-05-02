"use client";

// React Imports
import { useState } from "react";

// MUI Imports
import Card from "@mui/material/Card";
import CardHeader from "@mui/material/CardHeader";
import CardContent from "@mui/material/CardContent";
import Grid from "@mui/material/Grid";
import InputAdornment from "@mui/material/InputAdornment";
import IconButton from "@mui/material/IconButton";
import Typography from "@mui/material/Typography";
import Button from "@mui/material/Button";

//Component Imports
import CustomTextField from "@core/components/mui/TextField";
import { uePasswordChangeForm } from "../../../hooks/forms/user/usePasswordChangeForm";
import { Controller } from "react-hook-form";
import { useUpdatePassword } from "../../../hooks/mutation/user/profile/useUpdatePassword";
import { UserPasswordValues } from "../../../schema/user/password";

const ChangePasswordCard = () => {
  // States
  const [isCurrentPasswordShown, setIsCurrentPasswordShown] = useState(false);
  const [isConfirmPasswordShown, setIsConfirmPasswordShown] = useState(false);
  const [isNewPasswordShown, setIsNewPasswordShown] = useState(false);

  const handleClickShowCurrentPassword = () => {
    setIsCurrentPasswordShown(!isCurrentPasswordShown);
  };

  const { form } = uePasswordChangeForm();
  const { errors } = form.formState; // Get errors from form state
  const { mutateAsync } = useUpdatePassword();
  const onSubmit = async (values: UserPasswordValues) => {
    mutateAsync(values);
    form.reset(); // Reset form setelah submit
  };

  return (
    <Card>
      <CardHeader title="Change Password" />
      <CardContent>
        <form onSubmit={form.handleSubmit(onSubmit)} {...form}>
          <Grid container spacing={6}>
            <Grid item xs={12} sm={6}>
              <Controller
                name="old_password"
                control={form.control}
                render={({ field }) => (
                  <CustomTextField
                    fullWidth
                    label="Old Password"
                    type={isCurrentPasswordShown ? "text" : "password"}
                    placeholder="············"
                    InputProps={{
                      endAdornment: (
                        <InputAdornment position="end">
                          <IconButton
                            edge="end"
                            onClick={handleClickShowCurrentPassword}
                            onMouseDown={e => e.preventDefault()}
                          >
                            <i
                              className={
                                isCurrentPasswordShown
                                  ? "tabler-eye-off"
                                  : "tabler-eye"
                              }
                            />
                          </IconButton>
                        </InputAdornment>
                      ),
                    }}
                    error={!!errors.old_password} // Show error state
                    helperText={errors.old_password?.message} // Display error message
                    {...field}
                  />
                )}
              />
            </Grid>
          </Grid>
          <Grid container className="mbs-0" spacing={6}>
            <Grid item xs={12} sm={6}>
              <Controller
                name="new_password"
                control={form.control}
                render={({ field }) => (
                  <CustomTextField
                    fullWidth
                    label="New Password"
                    type={isNewPasswordShown ? "text" : "password"}
                    placeholder="············"
                    InputProps={{
                      endAdornment: (
                        <InputAdornment position="end">
                          <IconButton
                            edge="end"
                            onClick={() =>
                              setIsNewPasswordShown(!isNewPasswordShown)
                            }
                            onMouseDown={e => e.preventDefault()}
                          >
                            <i
                              className={
                                isNewPasswordShown
                                  ? "tabler-eye-off"
                                  : "tabler-eye"
                              }
                            />
                          </IconButton>
                        </InputAdornment>
                      ),
                    }}
                    error={!!errors.new_password} // Show error state
                    helperText={errors.new_password?.message} // Display error message
                    {...field}
                  />
                )}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <Controller
                name="confirm_password"
                control={form.control}
                render={({ field }) => (
                  <CustomTextField
                    fullWidth
                    label="Confirm New Password"
                    type={isConfirmPasswordShown ? "text" : "password"}
                    placeholder="············"
                    InputProps={{
                      endAdornment: (
                        <InputAdornment position="end">
                          <IconButton
                            edge="end"
                            onClick={() =>
                              setIsConfirmPasswordShown(!isConfirmPasswordShown)
                            }
                            onMouseDown={e => e.preventDefault()}
                          >
                            <i
                              className={
                                isConfirmPasswordShown
                                  ? "tabler-eye-off"
                                  : "tabler-eye"
                              }
                            />
                          </IconButton>
                        </InputAdornment>
                      ),
                    }}
                    error={!!errors.confirm_password} // Show error state
                    helperText={errors.confirm_password?.message} // Display error message
                    {...field}
                  />
                )}
              />
            </Grid>
            <Grid item xs={12} className="flex flex-col gap-4">
              <Typography variant="h6">Password Requirements:</Typography>
              <div className="flex flex-col gap-4">
                <div className="flex items-center gap-2.5">
                  <i className="tabler-circle-filled text-[8px]" />
                  Minimum 8 characters long - the more, the better
                </div>
                <div className="flex items-center gap-2.5">
                  <i className="tabler-circle-filled text-[8px]" />
                  At least one lowercase & one uppercase character
                </div>
                <div className="flex items-center gap-2.5">
                  <i className="tabler-circle-filled text-[8px]" />
                  At least one number, symbol, or whitespace character
                </div>
              </div>
            </Grid>
            <Grid item xs={12} className="flex gap-4">
              <Button variant="contained" type="submit">
                Save Changes
              </Button>
              <Button variant="tonal" type="reset" color="secondary">
                Reset
              </Button>
            </Grid>
          </Grid>
        </form>
      </CardContent>
    </Card>
  );
};

export default ChangePasswordCard;
