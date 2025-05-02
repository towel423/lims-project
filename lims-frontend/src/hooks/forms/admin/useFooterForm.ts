import { atom, useAtom } from "jotai";
import { useForm } from "react-hook-form";
import {
  AdminFooterResolver,
  AdminFooterValues,
} from "../../../schema/admin/footer";
import { useGetFooter } from "./useGetFooter";
import { useMemo } from "react";

const defaultValues = {
  text: "",
  link_type: "",
  link: "",
  icon: "",
};

const openAtom = atom(false);
const selectedAtom = atom("");

export const useFooterForm = () => {
  const [open, setOpen] = useAtom<boolean>(openAtom);
  const [selected, setSelected] = useAtom<string>(selectedAtom);
  const { data } = useGetFooter(selected);

  const values = useMemo(() => {
    if (!data) return defaultValues;
    return {
      text: data.text,
      link_type: data.linkType,
      link: data.link,
      icon: data.icon,
    };
  }, [data]);

  const form = useForm<AdminFooterValues>({
    resolver: AdminFooterResolver,
    defaultValues,
    values,
  });

  return {
    open,
    setOpen,
    form,
    selected,
    setSelected
  };
};
