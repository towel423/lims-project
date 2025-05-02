import { useQuery } from "@tanstack/react-query";
import { IFilter } from "../../../interface/IFilter";
import { getSettings } from "../../../api/admin/settings";

export const useSettingsQuery = (filter: IFilter) => {
  return useQuery({
    queryKey: ["settings-data", filter],
    queryFn: () => getSettings(filter),
    enabled: !!filter,
  });
};
