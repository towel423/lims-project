import { yupResolver } from "@hookform/resolvers/yup";
import * as yup from "yup";

export const PasswordValidationSchema = yup.object({
  old_password: yup.string().required("Old Password required"),
  new_password: yup.string().required("New Password required"),
  confirm_password: yup.string().required("Confirm Password required"),
});

export const UserPasswordResolver = yupResolver(PasswordValidationSchema);

export interface UserPasswordValues
  extends yup.InferType<typeof PasswordValidationSchema> {}
