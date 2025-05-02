import { IFilter } from "@/interface/IFilter";
import { axiosx } from "../axiosx";
import { IForm } from "../../interface/admin/form";
import { useSelector } from "react-redux";
import { RootState } from "../../redux-store";

const apiUrl = `${process.env.NEXT_PUBLIC_API_URL}admin/form`;

export const getForm = async ({
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
  const res = await axiosx(true).get(`${apiUrl}`, { params });
  return res.data.data;
};

export const findForm = async (id: string) => {
  const res = await axiosx(true).get(`${apiUrl}/${id}`);
  return res.data.data;
};

export const createForm = async (data: IForm) => {
  const res = await axiosx(true).post(`${apiUrl}`, data, {
    headers: {
      "Content-Type": "multipart/form-data",
    },
  });
  return res.data;
};
export const updateForm = async (data: IForm) => {
  const res = await axiosx(true).post(`${apiUrl}/update/${data.uuid}`, data);
  return res.data;
};
export const deleteForm = async (uuid: string) => {
  const res = await axiosx(true).delete(`${apiUrl}/delete/${uuid}`);
  return res.data;
};
