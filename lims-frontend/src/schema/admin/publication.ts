import { yupResolver } from "@hookform/resolvers/yup";
import * as yup from "yup";

export const publicationValidationSchema = yup.object({
  title: yup.string().required("Title must be fill"),
  caption: yup.string().required("Caption must be fill"),
  description: yup.string().required("Description must be fill"),
  img: yup.mixed().required("An image file is required"),
  CategoryID: yup.string().required("Category must be choose"),
  // position: yup.string().required("Position must be fill"),
  status: yup.string().optional(),
  slug: yup.string().optional(),
  uuid: yup.string().optional(),
  category_id: yup.number().optional(),
});

export const AdminPublicationResolver = yupResolver(
  publicationValidationSchema
);

export interface AdminPublicationValues
  extends yup.InferType<typeof publicationValidationSchema> {}
