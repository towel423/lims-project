import { useQuery } from "@tanstack/react-query";
import { findRoles } from "../../../api/admin/roles";

export const useGetRoles = (id: string) =>
  useQuery({
    queryKey: ["get-roles-data", id],
    queryFn: () => findRoles(id),
    enabled: !!id,
  });
