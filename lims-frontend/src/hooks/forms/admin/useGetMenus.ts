import { useQuery } from "@tanstack/react-query";
import { findMenus } from "../../../api/admin/menus";

export const useGetMenus = (id: string) =>
  useQuery({
    queryKey: ["get-menus-data", id],
    queryFn: () => findMenus(id),
    enabled: !!id,
  });
