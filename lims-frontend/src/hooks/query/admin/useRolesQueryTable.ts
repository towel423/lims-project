import { useQuery } from "@tanstack/react-query";
import { IFilter } from "../../../interface/IFilter";
import { getBanner } from "../../../api/admin/banner";
import { getUserRoles } from "../../../api/admin/roles";

export const useRolesQueryTable = (filter: IFilter) => {
  return useQuery({
    queryKey: ["user-roles-data", filter],
    queryFn: () => getUserRoles(filter),
    enabled: !!filter,
  });
};
