import { getStaffSession } from "@/lib/admin/session";
import { fail, type ActionFailure } from "@/lib/menu/result";

export async function rejectUnlessManager(
  message = "فقط مدیر می‌تواند این کار را انجام دهد",
): Promise<ActionFailure | null> {
  const session = await getStaffSession();

  if (session?.role !== "manager") {
    return fail(message);
  }

  return null;
}
