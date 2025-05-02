import { useQuery } from "@tanstack/react-query";
import { IFilter } from "../../../interface/IFilter";
import { getFooter } from "../../../api/admin/footer";

export const useFooterQuery = (filter: IFilter) => {
  return useQuery({
    queryKey: ["footer-data", filter],
    queryFn: () => getFooter(filter),
    enabled: !!filter,
  });
};
