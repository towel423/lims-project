import { useQuery } from "@tanstack/react-query";
import { IFilter } from "../../../interface/IFilter";
import { getUser } from "../../../api/admin/user";

export interface IUserFilter extends IFilter {
  role: string;
}

export const useUserQuery = (filter: IUserFilter) => {
  return useQuery({
    queryKey: ["user-data", filter],
    queryFn: () => getUser(filter),
    enabled: !!filter,
  });
};
