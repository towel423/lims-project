import { atom, useAtom } from "jotai";
import { useForm } from "react-hook-form";
import { useEffect, useMemo } from "react";
import {
  AdminRolesResolver,
  AdminRolesValues,
} from "../../../schema/admin/roles";
import { useGetRoles } from "./useGetRoles";
import { useAllRoles } from "../../data/useAllRoles";
import { useDataPermissionAction } from "../../data/useDataPermissionAction";

const defaultValues = {
  data: {
    name: "",
    permissions: [
      // You can define an empty object here if you want to initialize permissions
    ],
    role_guard_name: "",
  },
};

const openAtom = atom(false);
const selectedAtom = atom("");

export const useRolesForm = () => {
  const [open, setOpen] = useAtom<boolean>(openAtom);
  const [selected, setSelected] = useAtom<string>(selectedAtom);
  const { data, refetch, isError } = useGetRoles(selected);
  const { data: actiondata } = useDataPermissionAction();
  const { data: allRolesData } = useAllRoles();

  const values = useMemo(() => {
    let action: any = {};
    actiondata?.data.forEach((a: any) => {
      action[a] = false; // Initialize each action with a default value of false
    });

    if (!selected) {
      const permissions =
        allRolesData?.data?.map((menuList: string) => ({
          action: {
            ...action,
          },
          rule_policy: menuList,
        })) || [];
      return {
        data: {
          name: data?.data?.name || "", // Use a fallback if `name` is missing
          permissions,
          role_guard_name: data?.data?.role_guard_name || "",
        },
      };
    } else {
      return {
        data: {
          name: data?.name,
          permissions: data?.permissions,
          role_guard_name: data?.role_guard_name,
        },
      };
    }
  }, [data, allRolesData, selected]);

  const form = useForm<AdminRolesValues>({
    mode: "all",
    resolver: AdminRolesResolver,
    defaultValues,
    values,
  });

  return {
    open,
    setOpen,
    form,
    selected,
    setSelected,
    data,
    refetch,
    isError,
  };
};
