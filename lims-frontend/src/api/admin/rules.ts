import { axiosx } from "../axiosx";

const apiUrl = `${process.env.NEXT_PUBLIC_API_URL}admin`;

export const updateRules = async (data: any) => {
  const res = await axiosx(true).post(`${apiUrl}/rule/active/bulk`, data);
  return res.data;
};
