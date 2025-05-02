import { useQuery } from "@tanstack/react-query";
import { IFilter } from "../../../interface/IFilter";
import { getGallery } from "../../../api/admin/gallery";

export const useGalleryQuery = (filter: IFilter) => {
  return useQuery({
    queryKey: ["gallery-data", filter],
    queryFn: () => getGallery(filter),
    enabled: !!filter,
  });
};
