import { yupResolver } from "@hookform/resolvers/yup";
import * as yup from "yup";

export const userValidationSchema = yup.object({
  title: yup.string().required("Title must be fill"),
  subtitle: yup.string().required("SubTitle must be fill"),
  link: yup.string().required("Link must be fill"),
  image_url: yup.mixed().required("An image file is required"),
  active: yup.number().required("Active must be fill"),
  uuid: yup.string().optional(),
});

export const AdminBannerResolver = yupResolver(userValidationSchema);

export interface AdminBannerValues
  extends yup.InferType<typeof userValidationSchema> {}
