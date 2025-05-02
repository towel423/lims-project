import { useQuery } from "@tanstack/react-query";
import { IFilter } from "../../../interface/IFilter";
import { getEvent } from "../../../api/admin/event";
export interface EventFilter extends IFilter {
  start: string | null;
  end: string | null;
}
export const useEventQuery = (filter: EventFilter) => {
  return useQuery({
    queryKey: ["event-data", filter],
    queryFn: () => getEvent(filter),
    enabled: !!filter,
  });
};
