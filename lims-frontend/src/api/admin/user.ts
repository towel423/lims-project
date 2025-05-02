import { IFilter } from "@/interface/IFilter";
import { axiosx } from "../axiosx";
import { IUser } from "../../interface/admin/user";
import { useSelector } from "react-redux";
import { RootState } from "../../redux-store";
import { IUserFilter } from "../../hooks/query/admin/useUserQuery";

const apiUrl = `${process.env.NEXT_PUBLIC_API_URL}admin`;

export const getUser = async ({
  currentPage = 0,
  pageSize = 10,
  keyword = null,
  role,
}: IUserFilter) => {
  const params: {
    currentPage: number;
    pageSize: number;
    search?: string;
    role: string;
  } = {
    currentPage,
    pageSize,
    role,
  };

  if (keyword) {
    params.search = keyword;
  }
  if (role) {
    params.role = role;
  }
  const res = await axiosx(true).get(`${apiUrl}/users`, { params });
  return res.data;
};

export const findUser = async (id: string) => {
  const res = await axiosx(true).get(`${apiUrl}/users/detail/${id}`);
  return res.data.data;
};

export const createUser = async (data: IUser) => {
  const res = await axiosx(true).post(`${apiUrl}/create/users`, data);
  return res.data;
};
export const updateUser = async (data: IUser) => {
  console.log(data, 'data update User')
  const res = await axiosx(true).post(
    `${apiUrl}/update/users/${data.uuid}`,
    data
  );
  return res.data;
};
export const deleteUser = async (uuid: string) => {
  const res = await axiosx(true).delete(`${apiUrl}/delete/users/${uuid}`);
  return res.data;
};
