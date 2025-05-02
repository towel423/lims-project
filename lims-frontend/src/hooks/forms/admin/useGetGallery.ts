import { useQuery } from "@tanstack/react-query";
import { findGallery } from "../../../api/admin/gallery";

export const useGetGallery = (id: string) =>
  useQuery({
    queryKey: ["get-gallery-data", id],
    queryFn: () => findGallery(id),
    enabled: !!id,
  });
