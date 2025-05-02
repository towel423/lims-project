import { useGetPermissionAction } from "../query/admin/useGetPermissionAction";

export const useDataPermissionAction = () => {
  const { data } = useGetPermissionAction();

  return {
    data,
  };
};
