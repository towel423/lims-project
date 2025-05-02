import { useQuery } from "@tanstack/react-query";
import { findSettings } from "../../../api/admin/settings";

export const useGetSettings = (id: string) =>
  useQuery({
    queryKey: ["get-settings-data", id],
    queryFn: () => findSettings(id),
    enabled: !!id,
  });
