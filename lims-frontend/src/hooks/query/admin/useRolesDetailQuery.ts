import { useQuery } from "@tanstack/react-query";
import { getRolesDetail } from "../../../api/admin/roles";

export const useRolesDetailQuery = (uuid: string) => {
  console.log("🚀 ~ useRolesDetailQuery ~ uuid:", uuid);
  return useQuery({
    queryKey: ["roles-detail-data", uuid],
    queryFn: () => getRolesDetail(uuid),
    enabled: !!uuid,
  });
};
