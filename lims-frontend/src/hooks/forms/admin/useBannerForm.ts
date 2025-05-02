import { atom, useAtom } from "jotai";
import { useForm } from "react-hook-form";
import {
  AdminBannerResolver,
  AdminBannerValues,
} from "../../../schema/admin/banner";
import { useGetBanner } from "./useGetBanner";
import { useMemo } from "react";

const defaultValues = {
  title: "",
  subtitle: "",
  link: "",
  image_url: "",
  active: 0,
  uuid: "",
};

const openAtom = atom(false);
const selectedAtom = atom("");

export const useBannerForm = () => {
  const [open, setOpen] = useAtom<boolean>(openAtom);
  const [selected, setSelected] = useAtom<string>(selectedAtom);
  const { data } = useGetBanner(selected);

  const values = useMemo(() => {
    if (!data) return defaultValues;
    return {
      title: data.title,
      subtitle: data.subtitle,
      link: data.link,
      image_url: data.image_url,
      active: data.active,
      uuid: data.uuid,
    };
  }, [data]);

  const form = useForm<AdminBannerValues>({
    mode: "all",
    resolver: AdminBannerResolver,
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
