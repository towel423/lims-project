import { atom, useAtom } from "jotai";
import { useForm } from "react-hook-form";
import {
  AdminMenusResolver,
  AdminMenusValues,
} from "../../../schema/admin/menus";
import { useGetMenus } from "./useGetMenus";
import { useMemo } from "react";

const defaultValues = {
  title: "",
  subtitle: "",
  link: "",
  image_url: "",
  active: false,
};

const openAtom = atom(false);
const selectedAtom = atom("");

export const useMenusForm = () => {
  const [open, setOpen] = useAtom<boolean>(openAtom);
  const [selected, setSelected] = useAtom<string>(selectedAtom);
  const { data } = useGetMenus(selected);

  const values = useMemo(() => {
    if (!data) return defaultValues;
    return {
      title: data.title,
      subtitle: data.subtitle,
      link: data.link,
      image_url: data.image_url,
      active: data.active,
    };
  }, [data]);

  const form = useForm<AdminMenusValues>({
    resolver: AdminMenusResolver,
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
