import { useQuery } from "@tanstack/react-query";
import { findPages } from "../../../api/admin/pages";

export const useGetPages = (id: string) =>
  useQuery({
    queryKey: ["get-pages-data", id],
    queryFn: () => findPages(id),
    enabled: !!id,
  });
