"use client";
import { atom, useAtom } from "jotai";
import { useEffect } from "react";
import { getUser } from "../../api/admin/user";
import { useGetUser } from "../forms/admin/useGetUser";
import { useUserQuery } from "../query/admin/useUserQuery";

const limitAtom = atom(10);
const pageAtom = atom(0);
const totalPageAtom = atom(0);
const totalDataAtom = atom(0);
const searchAtom = atom("");
const roleAtom = atom("");
export const useUserTable = () => {
  const [currentPage, setCurrentPage] = useAtom(pageAtom);
  const [pageSize, setPageSize] = useAtom(limitAtom);
  const [totalPage, setTotalPage] = useAtom(totalPageAtom);
  const [totalData, setTotalData] = useAtom(totalDataAtom);
  const [keyword, setKeyword] = useAtom(searchAtom);
  const [filterRole, setFilterRole] = useAtom(roleAtom);
  const { data, refetch, isLoading } = useUserQuery({
    currentPage,
    pageSize,
    keyword,
    role: filterRole,
  });
  useEffect(() => {
    if (!data?.data) return;
    setTotalData(data?.pagination_data?.total_records);
    setTotalPage(data?.pagination_data?.total_pages);
  }, [data]);

  return {
    currentPage,
    keyword,
    setKeyword,
    setCurrentPage,
    pageSize,
    totalData,
    setTotalData,
    setPageSize,
    totalPage,
    setTotalPage,
    data,
    refetch,
    isLoading,
    filterRole,
    setFilterRole,
  };
};
