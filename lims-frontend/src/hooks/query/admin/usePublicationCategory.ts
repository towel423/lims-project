import { useQuery } from "@tanstack/react-query";
import { getPublicationCategory } from "../../../api/admin/publication";

export const usePublicCategory = () => {
  return useQuery({
    queryKey: ["publication-category-list"],
    queryFn: getPublicationCategory,
  });
};
