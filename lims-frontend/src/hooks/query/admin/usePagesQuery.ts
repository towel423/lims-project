import { useQuery } from "@tanstack/react-query";
import { IFilter } from "../../../interface/IFilter";
import { getPages } from "../../../api/admin/pages";

export const usePagesQuery = (filter: IFilter) => {
  return useQuery({
    queryKey: ["pages-data", filter],
    queryFn: () => getPages(filter),
    enabled: !!filter,
  });
};
