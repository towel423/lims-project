export interface IUser {
  createdAt?: string; // ISO 8601 format
  createdBy?: string | null;
  deletedAt?: string | null;
  email?: string;
  fullname?: string;
  id?: number;
  mobile?: string;
  role?: string;
  updatedAt?: string; // ISO 8601 format
  updatedBy?: string | null;
  username?: string;
  uuid?: string | null;
  verifiedAt?: string | null;
  role_guard_name?: string | null;
  password?: string | null;
}

export interface IUpdateUser {
  data: IUser;
  id: string;
}
