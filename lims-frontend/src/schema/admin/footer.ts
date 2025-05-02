import { yupResolver } from "@hookform/resolvers/yup";
import * as yup from "yup";

export const footerValidationSchema = yup.object({
  text: yup.string().required("Text must be fill"),
  link_type: yup.string().required("Link Type must be fill"),
  link: yup.string().required("Link must be fill"),
  icon: yup.mixed().required("Icon file is required"),
});

export const AdminFooterResolver = yupResolver(footerValidationSchema);

export interface AdminFooterValues
  extends yup.InferType<typeof footerValidationSchema> {}
