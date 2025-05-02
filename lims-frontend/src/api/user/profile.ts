import {
  IProfileChangePassword,
  IProfileDTO,
} from "../../interface/user/profle";
import { axiosx } from "../axiosx";

const apiUrl = `${process.env.NEXT_PUBLIC_API_URL}user/`;

export const getProfileDetail = async () => {
  const res = await axiosx(true).get(`${apiUrl}profile/detail`);
  return res?.data;
};
export const updateUser = async (data: IProfileDTO) => {
  const res = await axiosx(true).post(`${apiUrl}profile/update`, data);
  return res.data;
};
export const updatePasswordUser = async (data: IProfileChangePassword) => {
  const res = await axiosx(true).post(`${apiUrl}change-password`, data);
  return res.data;
};
