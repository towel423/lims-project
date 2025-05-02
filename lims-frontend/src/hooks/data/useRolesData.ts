import { useRolesQuery } from "../query/admin/useRolesQuery";

export const useRolesData = () => {
  const { data } = useRolesQuery();
  return {
    data,
  };
};
