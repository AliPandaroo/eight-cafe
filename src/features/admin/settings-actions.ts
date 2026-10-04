"use server"

import { revalidatePath } from "next/cache"

import { getStaffSession } from "@/lib/admin/session"
import { updateRestaurantSettings } from "@/lib/db/restaurant"
import { fail, ok } from "@/lib/menu/result"
import { fieldErrorsFromZod } from "@/lib/menu/validation"
import { updateRestaurantSchema } from "@/lib/validation/restaurant"

export async function updateRestaurantAction(
  _prev: unknown,
  formData: FormData,
) {
  const session = await getStaffSession()

  if (session?.role !== "manager") {
    return fail("فقط مدیر می‌تواند تنظیمات را ذخیره کند")
  }

  const parsed = updateRestaurantSchema.safeParse({
    name: formData.get("name"),
    profitPercent: formData.get("profitPercent"),
    coffeePricePerKg: formData.get("coffeePricePerKg"),
    offerPercent: formData.get("offerPercent"),
    offerScope: formData.get("offerScope"),
    offerCategoryId: String(formData.get("offerCategoryId") ?? "") || undefined,
  })

  if (!parsed.success) {
    return fail("اطلاعات رستوران نامعتبر است", fieldErrorsFromZod(parsed.error))
  }

  try {
    const restaurant = await updateRestaurantSettings({
      name: parsed.data.name,
      profitPercent: parsed.data.profitPercent,
      coffeePricePerKg: parsed.data.coffeePricePerKg,
      offerPercent: parsed.data.offerPercent,
      offerScope: parsed.data.offerScope,
      offerCategoryId: parsed.data.offerCategoryId ?? null,
    })
    revalidatePath("/")
    revalidatePath("/admin")
    revalidatePath("/admin/settings")
    return ok(restaurant)
  } catch (error) {
    console.error(error)
    return fail("ذخیره تنظیمات ممکن نشد")
  }
}
