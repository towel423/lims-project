import { useAllRolesQuery } from "../query/admin/useAllRolesQuery";

export const useAllRoles = () => {
  const { data, isLoading, refetch } = useAllRolesQuery();

  return {
    data,
    isLoading,
    refetch,
  };
};
