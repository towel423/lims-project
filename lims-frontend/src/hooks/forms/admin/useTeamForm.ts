import { atom, useAtom } from "jotai";
import { useForm } from "react-hook-form";
import {
  AdminTeamResolver,
  AdminTeamValues,
} from "../../../schema/admin/team";
import { useGetTeam } from "./useGetTeam";
import { useMemo } from "react";

const defaultValues = {
  name: "",
  position: "",
  content: "",
  photo: "",
};

const openAtom = atom(false);
const selectedAtom = atom("");

export const useTeamForm = () => {
  const [open, setOpen] = useAtom<boolean>(openAtom);
  const [selected, setSelected] = useAtom<string>(selectedAtom);
  const { data } = useGetTeam(selected);

  const values = useMemo(() => {
    if (!data) return defaultValues;
    return {
      name: data.name,
      position: data.position,
      content: data.content,
      photo: data.photo,
    };
  }, [data]);

  const form = useForm<AdminTeamValues>({
    resolver: AdminTeamResolver,
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
