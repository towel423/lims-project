import { atom, useAtom } from "jotai";
import { useForm } from "react-hook-form";
import {
  AdminGalleryResolver,
  AdminGalleryValues,
} from "../../../schema/admin/gallery";
import { useGetGallery } from "./useGetGallery";
import { useMemo } from "react";

const defaultValues = {
  year: "",
  category: "",
  image_url: "",
  uuid: "",
};

const openAtom = atom(false);
const selectedAtom = atom("");

export const useGalleryForm = () => {
  const [open, setOpen] = useAtom<boolean>(openAtom);
  const [selected, setSelected] = useAtom<string>(selectedAtom);
  const { data } = useGetGallery(selected);

  const values = useMemo(() => {
    if (!data) return defaultValues;
    return {
      year: data.year,
      category: data.category,
      image_url: data.image_url,
      uuid: data.uuid,
    };
  }, [data]);

  const form = useForm<AdminGalleryValues>({
    resolver: AdminGalleryResolver,
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
