import { IFilter } from "@/interface/IFilter";
import { axiosx } from "../axiosx";
import { IEvent } from "../../interface/admin/event";
import { useSelector } from "react-redux";
import { RootState } from "../../redux-store";
import { EventFilter } from "../../hooks/query/admin/useEventQuery";

const apiUrl = `${process.env.NEXT_PUBLIC_API_URL}admin/event`;

export const getEvent = async ({
  currentPage = 1,
  pageSize = 10,
  keyword = null,
  start = null,
  end = null,
}: EventFilter) => {
  const params: {
    currentPage: number;
    pageSize: number;
    search?: string;
    start_date?: string;
    end_date?: string;
  } = {
    currentPage,
    pageSize,
  };

  if (keyword) {
    params.search = keyword;
  }
  if (start) {
    params.start_date = start;
  }
  if (end) {
    params.end_date = end;
  }
  const res = await axiosx(true).get(`${apiUrl}`, { params });
  return res.data.data;
};

export const getEventCategory = async () => {
  const res = await axiosx(true).get(`${apiUrl}/category`);
  return res.data;
};

export const findEvent = async (id: string) => {
  const res = await axiosx(true).get(`${apiUrl}/${id}`);
  return res.data.data;
};

export const createEvent = async (data: IEvent) => {
  const res = await axiosx(true).post(`${apiUrl}`, data, {
    headers: {
      "Content-Type": "multipart/form-data",
    },
  });
  return res.data;
};
// export const updateEvent = async (data: IEvent) => {
//   const res = await axiosx(true).post(`${apiUrl}/update/${data.uuid}`, data);
//   return res.data;
// };

export const updateEvent = async (data: IEvent) => {
  const formData = new FormData();

  // Append all fields from the data object to FormData
  Object.entries(data).forEach(([key, value]) => {
    if (value instanceof File) {
      formData.append(key, value); // Handle file uploads if necessary
    } else {
      formData.append(key, value as string); // Cast other values to string
    }
  });

  console.log("FormData contents:");
  for (const [key, value] of formData.entries()) {
    console.log(key, value);
  }

  const res = await axiosx(true).post(`${apiUrl}/update/${data.uuid}`, formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  });

  return res.data;
};


export const deleteEvent = async (uuid: string) => {
  const res = await axiosx(true).delete(`${apiUrl}/delete/${uuid}`);
  return res.data;
};
