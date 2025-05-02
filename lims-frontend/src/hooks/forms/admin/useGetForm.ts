import { useQuery } from "@tanstack/react-query";
import { findForm } from "../../../api/admin/form";

export const useGetForm = (id: string) =>
  useQuery({
    queryKey: ["get-form-data", id],
    queryFn: () => findForm(id),
    enabled: !!id,
  });
