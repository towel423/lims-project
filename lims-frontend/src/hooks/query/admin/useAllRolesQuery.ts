import { useQuery } from "@tanstack/react-query";
import { IFilter } from "../../../interface/IFilter";
import { getBanner } from "../../../api/admin/banner";
import { getAllRoles } from "../../../api/admin/roles";

export const useAllRolesQuery = () => {
  return useQuery({
    queryKey: ["roles-all-data"],
    queryFn: () => getAllRoles(),
  });
};
