import { yupResolver } from "@hookform/resolvers/yup";
import * as yup from "yup";

export const testimonialValidationSchema = yup.object({
  name: yup.string().required("Name must be fill"),
  content: yup.string().required("Content must be fill"),
  image_url: yup.mixed().required("An image file is required"),
});

export const AdminTestimonialResolver = yupResolver(testimonialValidationSchema);

export interface AdminTestimonialValues
  extends yup.InferType<typeof testimonialValidationSchema> {}
