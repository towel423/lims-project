import { useQuery } from "@tanstack/react-query";
import { findTestimonial } from "../../../api/admin/testimonial";

export const useGetTestimonial = (id: string) =>
  useQuery({
    queryKey: ["get-testimonial-data", id],
    queryFn: () => findTestimonial(id),
    enabled: !!id,
  });
