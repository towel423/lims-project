import { useQuery } from "@tanstack/react-query";
import { IFilter } from "../../../interface/IFilter";
import { getTeam } from "../../../api/admin/team";

export const useTeamQuery = (filter: IFilter) => {
  return useQuery({
    queryKey: ["team-data", filter],
    queryFn: () => getTeam(filter),
    enabled: !!filter,
  });
};
