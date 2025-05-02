import { useQuery } from "@tanstack/react-query";
import { findBanner } from "../../../api/admin/banner";

export const useGetBanner = (id: string) => {
  return useQuery({
    queryKey: ["get-banner-data", id],
    queryFn: () => findBanner(id),
    enabled: !!id,
  });
};
