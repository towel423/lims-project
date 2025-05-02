import { useQuery } from "@tanstack/react-query";
import { findTeam } from "../../../api/admin/team";

export const useGetTeam = (id: string) =>
  useQuery({
    queryKey: ["get-team-data", id],
    queryFn: () => findTeam(id),
    enabled: !!id,
  });
