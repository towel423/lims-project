import { useQuery } from "@tanstack/react-query";
import { findUser } from "../../../api/admin/user";

export const useGetUser = (id: string) =>
  useQuery({
    queryKey: ["get-user-data", id],
    queryFn: () => findUser(id),
    enabled: !!id,
  });
