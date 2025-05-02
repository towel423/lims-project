"use client";

import { atom, useAtom } from "jotai";
import { useRolesDetailQuery } from "../query/admin/useRolesDetailQuery";
import { useEffect } from "react";

const uuidAtom = atom("");
export const useDetailRolesData = () => {
  const [uuid, setUUUID] = useAtom(uuidAtom);
  const { data, isLoading, refetch } = useRolesDetailQuery(uuid);
  return {
    uuid,
    setUUUID,
    data,
    isLoading,
    refetch,
  };
};
