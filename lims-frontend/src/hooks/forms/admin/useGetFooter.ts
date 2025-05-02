import { useQuery } from "@tanstack/react-query";
import { findFooter } from "../../../api/admin/footer";

export const useGetFooter = (id: string) =>
  useQuery({
    queryKey: ["get-footer-data", id],
    queryFn: () => findFooter(id),
    enabled: !!id,
  });
