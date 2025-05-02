"use client";
import { atom, useAtom } from "jotai";
import { useEffect } from "react";
import { getTestimonial } from "../../api/admin/testimonial";
import { useGetTestimonial } from "../forms/admin/useGetTestimonial";
import { useTestimonialQuery } from "../query/admin/useTestimonialQuery";

const limitAtom = atom(10);
const pageAtom = atom(1);
const totalPageAtom = atom(0);
const totalDataAtom = atom(0);
const searchAtom = atom("");

export const useTestimonialTable = () => {
  const [currentPage, setCurrentPage] = useAtom(pageAtom);
  const [pageSize, setPageSize] = useAtom(limitAtom);
  const [totalPage, setTotalPage] = useAtom(totalPageAtom);
  const [totalData, setTotalData] = useAtom(totalDataAtom);
  const [keyword, setKeyword] = useAtom(searchAtom);
  const { data, refetch, isLoading } = useTestimonialQuery({
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
