import { useQuery } from "@tanstack/react-query";
import { IFilter } from "../../../interface/IFilter";
import { getPublication } from "../../../api/admin/publication";

export const usePublicationQuery = (filter: IFilter) => {
  return useQuery({
    queryKey: ["publication-data", filter],
    queryFn: () => getPublication(filter),
    enabled: !!filter,
  });
};
