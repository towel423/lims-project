export interface IRoles {
  id?: number;
  uuid: string;
  name: string;
  guard_name: string;
  created_at?: string;
  updated_at?: string;
}

export interface IUpdateRoles {
  data: IRoles;
  id: string;
}

export interface PermissionAction {
  create: boolean;
  delete: boolean;
  read: boolean;
  update: boolean;
}

export interface IRolesPermission {
  action: PermissionAction;
  rule_policy: string;
}

export interface RuleData {
  name: string;
  permission: IRolesPermission[];
}

export interface RoleData {
  role_guard_name: string;
  rules: Rule[];
}

interface Rule {
  rule_policy: string;
  action: string;
  active: boolean;
}
