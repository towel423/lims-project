"use client";
import { atom, useAtom } from "jotai";
import { useEffect } from "react";
import { getTeam } from "../../api/admin/team";
import { useGetTeam } from "../forms/admin/useGetTeam";
import { useTeamQuery } from "../query/admin/useTeamQuery";

const limitAtom = atom(10);
const pageAtom = atom(1);
const totalPageAtom = atom(0);
const totalDataAtom = atom(0);
const searchAtom = atom("");

export const useTeamTable = () => {
  const [currentPage, setCurrentPage] = useAtom(pageAtom);
  const [pageSize, setPageSize] = useAtom(limitAtom);
  const [totalPage, setTotalPage] = useAtom(totalPageAtom);
  const [totalData, setTotalData] = useAtom(totalDataAtom);
  const [keyword, setKeyword] = useAtom(searchAtom);
  const { data, refetch, isLoading } = useTeamQuery({
    currentPage,
    pageSize,
    keyword,
  });
  useEffect(() => {
    if (!data?.data) return;
    setTotalData(data?.total_records);
    setTotalPage(data?.total_pages);
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
