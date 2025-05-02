import { atom, useAtom } from "jotai";
import { useForm } from "react-hook-form";
import {
  AdminEventResolver,
  AdminEventValues,
} from "../../../schema/admin/event";
import { useGetEvent } from "./useGetEvent";
import { useMemo } from "react";

const defaultValues = {
  title: "",
  image_url: "",
  content: "",
  description: "",
  slug: "",
  uuid: "",
  start_date: "",
  // start_time: "",
  end_date: "",
  location: "",
};

const openAtom = atom(false);
const selectedAtom = atom("");

export const useEventForm = () => {
  const [open, setOpen] = useAtom<boolean>(openAtom);
  const [selected, setSelected] = useAtom<string>(selectedAtom);
  const { data } = useGetEvent(selected);

  const values = useMemo(() => {
    if (!data) return defaultValues;
    return {
      title: data.title,
      content: data.content,
      image_url: data.image_url,
      description: data.description,
      slug: data.slug,
      uuid: data.uuid,
      start_date: data.start_date || new Date(),
      start_time: data.start_time || new Date(),
      end_date: data.end_date || new Date(),
      location: data.location,
    };
  }, [data]);

  const form = useForm<AdminEventValues>({
    resolver: AdminEventResolver,
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
