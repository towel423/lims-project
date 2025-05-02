import { atom, useAtom } from "jotai";
import { useGetPublication } from "../forms/admin/useGetPublication";

const openAtom = atom(false);
const detailAtom = atom("");
export const usePublicationDetail = () => {
  const [open, setOpen] = useAtom(openAtom);
  const [id, setId] = useAtom(detailAtom);

  const { data } = useGetPublication(id);

  return {
    data,
    setId,
    id,
    open,
    setOpen,
  };
};
