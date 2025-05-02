import { yupResolver } from "@hookform/resolvers/yup";
import * as yup from "yup";

export const teamValidationSchema = yup.object({
  name: yup.string().required("Name must be fill"),
  position: yup.string().required("Position must be fill"),
  content: yup.string().required("Content must be fill"),
  photo: yup.mixed().required("A Photo file is required"),
});

export const AdminTeamResolver = yupResolver(teamValidationSchema);

export interface AdminTeamValues
  extends yup.InferType<typeof teamValidationSchema> {}
