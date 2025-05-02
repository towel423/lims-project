import { useQuery } from "@tanstack/react-query";
import { findEvent } from "../../../api/admin/event";

export const useGetEvent = (id: string) =>
  useQuery({
    queryKey: ["get-event-data", id],
    queryFn: () => findEvent(id),
    enabled: !!id,
  });
