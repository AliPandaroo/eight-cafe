"use server";

import { redirect } from "next/navigation";

import {
  clearAdminSession,
  createStaffSession,
  homeForRole,
  verifyStaffPassword,
  type StaffRole,
} from "@/lib/admin/session";
import { fail } from "@/lib/menu/result";

function parseRole(value: unknown): StaffRole | null {
  return value === "manager" || value === "waiter" ? value : null;
}

export async function loginAdminAction(_prev: unknown, formData: FormData) {
  const role = parseRole(formData.get("role"));
  const password = String(formData.get("password") ?? "");

  if (!role) {
    return fail("نقش را انتخاب کنید");
  }

  if (!verifyStaffPassword(role, password)) {
    return fail("رمز عبور نادرست است");
  }

  await createStaffSession(role);
  redirect(homeForRole(role));
}

export async function logoutAdminAction() {
  await clearAdminSession();
  redirect("/admin/login");
}
