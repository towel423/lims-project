import { IFilter } from "@/interface/IFilter";
import { axiosx } from "../axiosx";
import { RoleData } from "../../interface/admin/roles";

const apiUrl = `${process.env.NEXT_PUBLIC_API_URL}admin`;

export const getRoles = async () => {
  const res = await axiosx(true).get(`${apiUrl}/roles`);
  return res.data.data;
};

export const getUserRoles = async ({
  currentPage = 1,
  pageSize = 10,
  keyword = null,
}: IFilter) => {
  const params: { currentPage: number; pageSize: number; search?: string } = {
    currentPage,
    pageSize,
  };

  if (keyword) {
    params.search = keyword;
  }
  const res = await axiosx(true).get(`${apiUrl}/users`, { params });
  return res.data;
};

export const findRoles = async (id: string) => {
  const res = await axiosx(true).get(`${apiUrl}/roles/detail/${id}`);
  return res.data.data;
};

export const createRoles = async (data: RoleData) => {
  const res = await axiosx(true).post(`${apiUrl}/role-has-rule`, data);
  return res.data;
};
export const getRolesDetail = async (uuid: string) => {
  const res = await axiosx(true).get(`${apiUrl}/detail/${uuid}`);
  return res.data;
};
export const deleteRoles = async (uuid: string) => {
  const res = await axiosx(true).delete(`${apiUrl}/delete/${uuid}`);
  return res.data;
};

export const getAllRoles = async () => {
  const res = await axiosx(true).get(`${apiUrl}/rule-policy`);
  return res.data;
};
export const getAction = async () => {
  const res = await axiosx(true).get(`${apiUrl}/actions`);
  return res.data;
};
