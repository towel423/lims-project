import { yupResolver } from "@hookform/resolvers/yup";
import * as yup from "yup";

export const galleryValidationSchema = yup.object({
  year: yup.string().required("Year must be fill"),
  category: yup.string().required("Category must be fill"),
  image_url: yup.mixed().required("An image file is required"),
});

export const AdminGalleryResolver = yupResolver(galleryValidationSchema);

export interface AdminGalleryValues
  extends yup.InferType<typeof galleryValidationSchema> {}
