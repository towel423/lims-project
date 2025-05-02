import { atom, useAtom } from "jotai";
import { useForm } from "react-hook-form";
import {
  AdminTestimonialResolver,
  AdminTestimonialValues,
} from "../../../schema/admin/testimonial";
import { useGetTestimonial } from "./useGetTestimonial";
import { useMemo } from "react";

const defaultValues = {
  name: "",
  content: "",
  image_url: "",
};

const openAtom = atom(false);
const selectedAtom = atom("");

export const useTestimonialForm = () => {
  const [open, setOpen] = useAtom<boolean>(openAtom);
  const [selected, setSelected] = useAtom<string>(selectedAtom);
  const { data } = useGetTestimonial(selected);

  const values = useMemo(() => {
    if (!data) return defaultValues;
    return {
      name: data.name,
      content: data.content,
      image_url: data.image_url,
    };
  }, [data]);

  const form = useForm<AdminTestimonialValues>({
    resolver: AdminTestimonialResolver,
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
