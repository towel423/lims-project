import { atom, useAtom } from "jotai";
import { useForm } from "react-hook-form";
import {
  AdminPublicationResolver,
  AdminPublicationValues,
} from "../../../schema/admin/publication";
import { useGetPublication } from "./useGetPublication";
import { useMemo } from "react";

const defaultValues = {
  title: "",
  img: "",
  caption: "",
  description: "",
  CategoryID: "",
  position: "",
  status: "",
  slug: "",
  uuid: "",
  category_id: 0,
};

const openAtom = atom(false);
const selectedAtom = atom("");

export const usePublicationForm = () => {
  const [open, setOpen] = useAtom<boolean>(openAtom);
  const [selected, setSelected] = useAtom<string>(selectedAtom);
  const { data } = useGetPublication(selected);
  const values = useMemo(() => {
    if (!data) return defaultValues;
    return {
      title: data.title,
      caption: data.caption,
      img: data.img,
      description: data.description,
      CategoryID: data.category_id,
      position: data.position,
      status: data.status,
      slug: data.slug,
      uuid: data.uuid,
      category_id: parseInt(data.category_id),
    };
  }, [data]);

  const form = useForm<AdminPublicationValues>({
    resolver: AdminPublicationResolver,
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
