import { useQuery } from "@tanstack/react-query";
import { findPublication } from "../../../api/admin/publication";

export const useGetPublication = (id: string) =>
  useQuery({
    queryKey: ["get-publication-data", id],
    queryFn: () => findPublication(id),
    enabled: !!id,
  });
