import { IFilter } from "@/interface/IFilter";
import { axiosx } from "../axiosx";
import { IPublication } from "../../interface/admin/publication";
import { useSelector } from "react-redux";
import { RootState } from "../../redux-store";

const apiUrl = `${process.env.NEXT_PUBLIC_API_URL}admin/publication`;

export const getPublication = async ({
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

export const getPublicationCategory = async () => {
  const res = await axiosx(true).get(`${apiUrl}/category`);
  return res.data;
};

export const findPublication = async (id: string) => {
  const res = await axiosx(true).get(`${apiUrl}/${id}`);
  return res.data.data;
};

export const createPublication = async (data: IPublication) => {
  const res = await axiosx(true).post(`${apiUrl}`, data, {
    headers: {
      "Content-Type": "multipart/form-data",
    },
  });
  return res.data;
};
export const updatePublication = async (data: IPublication) => {
  const res = await axiosx(true).post(`${apiUrl}/update/${data.uuid}`, data);
  return res.data;
};
export const deletePublication = async (uuid: string) => {
  const res = await axiosx(true).delete(`${apiUrl}/delete/${uuid}`);
  return res.data;
};
