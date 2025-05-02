import { useQuery } from "@tanstack/react-query";
import { IFilter } from "../../../interface/IFilter";
import { getRoles } from "../../../api/admin/roles";

export const useRolesQuery = () => {
  return useQuery({
    queryKey: ["roles-data"],
    queryFn: () => getRoles(),
  });
};
