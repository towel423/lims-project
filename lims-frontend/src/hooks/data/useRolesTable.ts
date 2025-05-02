"use client";
import { atom, useAtom } from "jotai";
import { useEffect } from "react";
import { useRolesQueryTable } from "../query/admin/useRolesQueryTable";

const limitAtom = atom(10);
const pageAtom = atom(1);
const totalPageAtom = atom(0);
const totalDataAtom = atom(0);
const searchAtom = atom("");

export const useRolesTable = () => {
  const [currentPage, setCurrentPage] = useAtom(pageAtom);
  const [pageSize, setPageSize] = useAtom(limitAtom);
  const [totalPage, setTotalPage] = useAtom(totalPageAtom);
  const [totalData, setTotalData] = useAtom(totalDataAtom);
  const [keyword, setKeyword] = useAtom(searchAtom);
  const { data, refetch, isLoading } = useRolesQueryTable({
    currentPage,
    pageSize,
    keyword,
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
  };
};
