import { useQuery } from "@tanstack/react-query";
import { IFilter } from "../../../interface/IFilter";
import { getPerson } from "../../../api/admin/person";

export const usePersonQuery = (filter: IFilter) => {
  return useQuery({
    queryKey: ["person-data", filter],
    queryFn: () => getPerson(filter),
    enabled: !!filter,
  });
};
