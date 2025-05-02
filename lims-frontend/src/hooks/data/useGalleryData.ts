"use client";
import { atom, useAtom } from "jotai";
import { useEffect } from "react";
import { getGallery } from "../../api/admin/gallery";
import { useGetGallery } from "../forms/admin/useGetGallery";
import { useGalleryQuery } from "../query/admin/useGalleryQuery";

const limitAtom = atom(10);
const pageAtom = atom(1);
const totalPageAtom = atom(0);
const totalDataAtom = atom(0);
const searchAtom = atom("");

export const useGalleryTable = () => {
  const [currentPage, setCurrentPage] = useAtom(pageAtom);
  const [pageSize, setPageSize] = useAtom(limitAtom);
  const [totalPage, setTotalPage] = useAtom(totalPageAtom);
  const [totalData, setTotalData] = useAtom(totalDataAtom);
  const [keyword, setKeyword] = useAtom(searchAtom);
  const { data, refetch, isLoading } = useGalleryQuery({
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
