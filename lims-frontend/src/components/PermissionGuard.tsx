"use client";

import React from "react";
import { useSelector } from "react-redux";
import { RootState } from "../redux-store";

interface PermissionGuardProps {
  obj: string; // Resource
  act: string; // Action
  fallback?: React.ReactNode; // Optional fallback UI
  children: React.ReactNode;
}
const PermissionGuard: React.FC<PermissionGuardProps> = ({
  obj,
  act,
  fallback,
  children,
}) => {
  const { abilities } = useSelector((state: RootState) => state.ability);


  const find = abilities.find(
    (row: any) => row.rule_policy === obj && row.action[act] === true
  );

  return <>{find ? children : fallback}</>;
};

export default PermissionGuard;
