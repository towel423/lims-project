import { useQuery } from "@tanstack/react-query";
import { findPerson } from "../../../api/admin/person";

export const useGetPerson = (id: string) =>
  useQuery({
    queryKey: ["get-person-data", id],
    queryFn: () => findPerson(id),
    enabled: !!id,
  });
