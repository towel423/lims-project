"use client";
import { atom, useAtom } from "jotai";
import { useEffect } from "react";
import { getBanner } from "../../api/admin/banner";
import { useGetBanner } from "../forms/admin/useGetBanner";
import { useBannerQuery } from "../query/admin/useBannerQuery";

const limitAtom = atom(10);
const pageAtom = atom(1);
const totalPageAtom = atom(0);
const totalDataAtom = atom(0);
const searchAtom = atom("");

export const useBannerTable = () => {
  const [currentPage, setCurrentPage] = useAtom(pageAtom);
  const [pageSize, setPageSize] = useAtom(limitAtom);
  const [totalPage, setTotalPage] = useAtom(totalPageAtom);
  const [totalData, setTotalData] = useAtom(totalDataAtom);
  const [keyword, setKeyword] = useAtom(searchAtom);
  const { data, refetch, isLoading } = useBannerQuery({
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
