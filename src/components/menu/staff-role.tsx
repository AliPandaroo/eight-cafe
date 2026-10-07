"use client";

import { createContext, useContext } from "react";

import type { PublicRole } from "@/lib/auth/roles";

export const StaffRoleContext = createContext<PublicRole>("customer");

export function useStaffRole() {
  return useContext(StaffRoleContext);
}
