import { atom, useAtom } from "jotai";
import { useForm } from "react-hook-form";
import {
  AdminSettingsResolver,
  AdminSettingsValues,
} from "../../../schema/admin/settings";
import { useGetSettings } from "./useGetSettings";
import { useMemo } from "react";

const defaultValues = {
  key: "",
  value: "",
  uuid: "",
};

const openAtom = atom(false);
const selectedAtom = atom("");

export const useSettingsForm = () => {
  const [open, setOpen] = useAtom<boolean>(openAtom);
  const [selected, setSelected] = useAtom<string>(selectedAtom);
  const { data } = useGetSettings(selected);

  const values = useMemo(() => {
    if (!data) return defaultValues;
    return {
      key: data.key,
      value: data.value,
      uuid: data.uuid,
    };
  }, [data]);

  const form = useForm<AdminSettingsValues>({
    resolver: AdminSettingsResolver,
    defaultValues,
    values,
  });

  return {
    open,
    setOpen,
    form,
    selected,
    setSelected,
    data
  };
};
