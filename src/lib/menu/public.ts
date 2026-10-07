import { getRestaurant } from "@/lib/db/restaurant";
import { listCategories } from "@/lib/menu/category";
import { listMenuItems } from "@/lib/menu/item";
import { applyItemPricing } from "@/lib/pricing";
import { fail, ok, type ActionResult } from "@/lib/menu/result";
import type { CategoryWithItems } from "@/types/menu";

export type PublicMenu = {
  restaurant: {
    id: string;
    name: string;
    slug: string;
  };
  categories: CategoryWithItems[];
};

export async function getPublicMenu(options?: {
  coffeeOnly?: boolean;
}): Promise<ActionResult<PublicMenu>> {
  try {
    const [restaurant, categories, items] = await Promise.all([
      getRestaurant(),
      listCategories(),
      listMenuItems(),
    ]);

    if (!categories.ok) {
      return categories;
    }

    if (!items.ok) {
      return items;
    }

    const grouped = categories.data
      .filter((category) => category.isActive)
      .map((category) => ({
        ...category,
        items: items.data
          .filter((item) => item.categoryId === category.id)
          .map((item) => {
            const pricedVariants = item.variants.map((variant) => {
              const priced = applyItemPricing(
                variant.price,
                restaurant,
                item.categoryId,
                variant.coffeeGrams || item.coffeeGrams,
              );

              return {
                ...variant,
                price: priced.price,
                compareAtPrice: priced.compareAtPrice,
              };
            });

            const priced = applyItemPricing(
              item.price,
              restaurant,
              item.categoryId,
              item.coffeeGrams,
            );
            const variantAmounts = pricedVariants.map((variant) =>
              Number(variant.price),
            );
            const minPrice =
              variantAmounts.length > 0
                ? String(Math.min(...variantAmounts))
                : priced.price;
            const maxPrice =
              variantAmounts.length > 1
                ? String(Math.max(...variantAmounts))
                : null;

            return {
              ...item,
              price: minPrice,
              priceMax: maxPrice,
              compareAtPrice: priced.compareAtPrice,
              variants: pricedVariants,
              coffeeGrams: item.coffeeGrams,
            };
          })
          .filter(
            (item) =>
              !options?.coffeeOnly ||
              item.coffeeGrams > 0 ||
              item.variants.some((variant) => variant.coffeeGrams > 0),
          ),
      }));

    return ok({
      restaurant: {
        id: restaurant.id,
        name: restaurant.name,
        slug: restaurant.slug,
      },
      categories: grouped,
    });
  } catch (error) {
    console.error(error);
    return fail("Unable to load menu");
  }
}
