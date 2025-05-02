import { useQuery } from "@tanstack/react-query";
import { IFilter } from "../../../interface/IFilter";
import { getBanner } from "../../../api/admin/banner";

export const useBannerQuery = (filter: IFilter) => {
  return useQuery({
    queryKey: ["banner-data", filter],
    queryFn: () => getBanner(filter),
    enabled: !!filter,
  });
};
