import { atom, useAtom } from "jotai";
import { useForm } from "react-hook-form";
import { AdminUserResolver, AdminUserValues } from "../../../schema/admin/user";
import { useGetUser } from "./useGetUser";
import { useMemo } from "react";

const defaultValues = {
  fullname: "",
  username: "",
  password: "",
  mobile: "",
  email: "",
  role_guard_name: "",
  uuid: "",
};

const openAtom = atom(false);
const selectedAtom = atom("");

export const useUserForm = () => {
  const [open, setOpen] = useAtom<boolean>(openAtom);
  const [selected, setSelected] = useAtom<string>(selectedAtom);
  const { data } = useGetUser(selected);

  const values = useMemo(() => {
    if (!data) return defaultValues;
    return {
      fullname: data?.user?.fullname,
      username: data?.user?.username,
      password: data?.user?.password,
      mobile: data?.user?.mobile,
      email: data?.user?.email,
      role_guard_name: data?.user?.role_guard_name,
      uuid: data?.user?.uuid,
    };
  }, [data]);

  const form = useForm<AdminUserValues>({
    resolver: AdminUserResolver,
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
  };
};
