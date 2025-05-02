import { useQuery } from "@tanstack/react-query";
import { getAction } from "../../../api/admin/roles";

export const useGetPermissionAction = () => {
  return useQuery({
    queryKey: ["permission-action-list"],
    queryFn: () => getAction(),
  });
};
