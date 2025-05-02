import { atom, useAtom } from "jotai";
import { useForm } from "react-hook-form";
import {
  AdminFormResolver,
  AdminFormValues,
} from "../../../schema/admin/form";
import { useGetForm } from "./useGetForm";
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

export const useFormForm = () => {
  const [open, setOpen] = useAtom<boolean>(openAtom);
  const [selected, setSelected] = useAtom<string>(selectedAtom);
  const { data } = useGetForm(selected);

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

  const form = useForm<AdminFormValues>({
    resolver: AdminFormResolver,
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
