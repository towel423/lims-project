import { atom, useAtom } from "jotai";
import { useForm } from "react-hook-form";
import { useMemo } from "react";
import { useQueryProfile } from "../../query/user/useQueryProfile";
import {
  UserProfileResolver,
  UserProfileValues,
} from "../../../schema/user/profile";

const defaultValues = {
  fullname: "",
  mobile: "",
  email: "",
};

const openAtom = atom(false);

export const useProfileForm = () => {
  const [open, setOpen] = useAtom<boolean>(openAtom);
  const { data, refetch } = useQueryProfile();

  const values = useMemo(() => {
    if (!data) return defaultValues;
    return {
      fullname: data?.data?.fullname,
      mobile: data?.data?.mobile,
      email: data?.data?.email,
    };
  }, [data]);

  const form = useForm<UserProfileValues>({
    resolver: UserProfileResolver,
    defaultValues,
    values,
  });

  return {
    open,
    setOpen,
    form,
    data,
    refetch,
  };
};
