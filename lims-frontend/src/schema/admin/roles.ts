import { yupResolver } from "@hookform/resolvers/yup";
import * as yup from "yup";

const actionSchema = yup.object().shape({
  create: yup.boolean().required(),
  delete: yup.boolean().required(),
  read: yup.boolean().required(),
  update: yup.boolean().required(),
});

const permissionSchema = yup.object().shape({
  action: actionSchema.required(),
  rule_policy: yup.string().required(),
});

const rolesValidationSchema = yup.object().shape({
  data: yup
    .object()
    .shape({
      name: yup.string().required(),
      permissions: yup.array().of(permissionSchema).required(),
      role_guard_name: yup.string().required(),
    })
    .required(),
});

export const AdminRolesResolver = yupResolver(rolesValidationSchema);

export interface AdminRolesValues
  extends yup.InferType<typeof rolesValidationSchema> {}
