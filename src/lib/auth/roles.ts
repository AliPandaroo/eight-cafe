export type StaffRole = "manager" | "waiter";
export type PublicRole = StaffRole | "customer";

export function homeForRole(role: StaffRole) {
  return role === "waiter" ? "/admin/prefactors" : "/admin";
}

export function canBuildPrefactor(role: PublicRole) {
  return role === "manager" || role === "waiter";
}
