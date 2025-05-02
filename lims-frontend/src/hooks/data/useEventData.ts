"use client";
import { atom, useAtom } from "jotai";
import { useEffect } from "react";
import { getEvent } from "../../api/admin/event";
import { useGetEvent } from "../forms/admin/useGetEvent";
import { useEventQuery } from "../query/admin/useEventQuery";

const limitAtom = atom(10);
const pageAtom = atom(1);
const totalPageAtom = atom(0);
const totalDataAtom = atom(0);
const searchAtom = atom("");
const startDate = atom("");
const endDate = atom("");

export const useEventTable = () => {
  const [currentPage, setCurrentPage] = useAtom(pageAtom);
  const [pageSize, setPageSize] = useAtom(limitAtom);
  const [totalPage, setTotalPage] = useAtom(totalPageAtom);
  const [totalData, setTotalData] = useAtom(totalDataAtom);
  const [keyword, setKeyword] = useAtom(searchAtom);
  const [start, setStart] = useAtom(startDate);
  const [end, setEnd] = useAtom(endDate);
  const { data, refetch, isLoading } = useEventQuery({
    currentPage,
    pageSize,
    keyword,
    start,
    end,
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
    end,
    setStart,
    start,
    setEnd,
  };
};
