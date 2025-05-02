import { IFilter } from "@/interface/IFilter";
import { axiosx } from "../axiosx";
import { IBanner } from "../../interface/admin/banner";
import { useSelector } from "react-redux";
import { RootState } from "../../redux-store";

const apiUrl = `${process.env.NEXT_PUBLIC_API_URL}admin/banner`;

export const getBanner = async ({
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

export const findBanner = async (id: string) => {
  const res = await axiosx(true).get(`${apiUrl}/${id}`);
  return res.data.data;
};

export const createBanner = async (data: IBanner) => {
  const res = await axiosx(true).post(`${apiUrl}`, data, {
    headers: {
      "Content-Type": "multipart/form-data",
    },
  });
  return res.data;
};
// export const updateBanner = async (data: IBanner) => {
//   const res = await axiosx(true).post(`${apiUrl}/update/${data.uuid}`, data);
//   return res.data;
// };

export const updateBanner = async (data: IBanner) => {
  const formData = new FormData();

  // Append all fields from the data object to FormData
  Object.entries(data).forEach(([key, value]) => {
    if (value instanceof File) {
      formData.append(key, value); // Handle file uploads
    } else {
      formData.append(key, value as string); // Append other fields as strings
    }
  });

  // Log the FormData contents for debugging
  console.log("FormData contents:");
  for (const [key, value] of formData.entries()) {
    console.log(key, value);
  }

  // Send the FormData to the server
  const res = await axiosx(true).post(`${apiUrl}/update/${data.uuid}`, formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  });

  return res.data;
};

export const deleteBanner = async (uuid: string) => {
  const res = await axiosx(true).delete(`${apiUrl}/delete/${uuid}`);
  return res.data;
};
