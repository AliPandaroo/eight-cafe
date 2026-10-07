import type { StaffRole } from "@/lib/auth/roles";

export type PrefactorLineRecord = {
  id: string;
  prefactorId: string;
  itemId: string;
  name: string;
  unitPrice: string;
  quantity: number;
};

export type PrefactorRecord = {
  id: string;
  tableLabel: string;
  createdBy: StaffRole;
  isDelivered: boolean;
  createdAt: string;
  lines: PrefactorLineRecord[];
  total: string;
};
