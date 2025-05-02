import { yupResolver } from "@hookform/resolvers/yup";
import * as yup from "yup";

export const settingsValidationSchema = yup.object({
  key: yup.string().required("Key must be fill"),
  value: yup.string().required("Value must be fill"),
  uuid: yup.string(),
});

export const AdminSettingsResolver = yupResolver(settingsValidationSchema);

export interface AdminSettingsValues
  extends yup.InferType<typeof settingsValidationSchema> {}
