import { yupResolver } from "@hookform/resolvers/yup";
import * as yup from "yup";

export const ProfileValidationSchema = yup.object({
  fullname: yup.string().required("Fullname is required"),
  mobile: yup.string().required("Mobile is required"),
  email: yup.string().required("Email is required"),
  password: yup.string().optional(),
});

export const UserProfileResolver = yupResolver(ProfileValidationSchema);

export interface UserProfileValues
  extends yup.InferType<typeof ProfileValidationSchema> {}
