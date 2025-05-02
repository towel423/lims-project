import { useQuery } from "@tanstack/react-query";
import { IFilter } from "../../../interface/IFilter";
import { getTestimonial } from "../../../api/admin/testimonial";

export const useTestimonialQuery = (filter: IFilter) => {
  return useQuery({
    queryKey: ["testimonial-data", filter],
    queryFn: () => getTestimonial(filter),
    enabled: !!filter,
  });
};
