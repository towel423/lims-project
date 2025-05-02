import { useQuery } from "@tanstack/react-query";
import { IFilter } from "../../../interface/IFilter";
import { getForm } from "../../../api/admin/form";

export const useFormQuery = (filter: IFilter) => {
  return useQuery({
    queryKey: ["form-data", filter],
    queryFn: () => getForm(filter),
    enabled: !!filter,
  });
};
