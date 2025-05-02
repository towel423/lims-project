import { useQuery } from "@tanstack/react-query";
import { IFilter } from "../../../interface/IFilter";
import { getMenus } from "../../../api/admin/menus";

export const useMenusQuery = (filter: IFilter) => {
  return useQuery({
    queryKey: ["menus-data", filter],
    queryFn: () => getMenus(filter),
    enabled: !!filter,
  });
};
