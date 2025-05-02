import { atom, useAtom } from "jotai";
import { useForm } from "react-hook-form";
import { useMemo } from "react";
import { useQueryProfile } from "../../query/user/useQueryProfile";
import {
  UserPasswordResolver,
  UserPasswordValues,
} from "../../../schema/user/password";

const defaultValues = {
  old_password: "",
  new_password: "",
  confirm_password: "",
};

const openAtom = atom(false);

export const uePasswordChangeForm = () => {
  const [open, setOpen] = useAtom<boolean>(openAtom);

  const form = useForm<UserPasswordValues>({
    resolver: UserPasswordResolver,
    defaultValues,
  });

  return {
    open,
    setOpen,
    form,
  };
};
