import "dotenv/config";

import { createCategory, listCategories } from "../src/lib/menu/category";
import {
  createMenuItem,
  deleteMenuItem,
  listMenuItems,
  updateMenuItem,
} from "../src/lib/menu/item";

async function run() {
  const createdCategory = await createCategory({ name: "Coffee" });
  if (!createdCategory.ok) {
    throw new Error(createdCategory.error);
  }

  const createdItem = await createMenuItem({
    categoryId: createdCategory.data.id,
    name: "Espresso",
    description: "Double shot",
    price: 120000,
  });
  if (!createdItem.ok) {
    throw new Error(createdItem.error);
  }

  const updatedItem = await updateMenuItem({
    id: createdItem.data.id,
    price: 135000,
    isAvailable: false,
  });
  if (!updatedItem.ok) {
    throw new Error(updatedItem.error);
  }

  const categories = await listCategories();
  const items = await listMenuItems();
  if (!categories.ok || !items.ok) {
    throw new Error("Unable to list records");
  }

  const deleted = await deleteMenuItem(createdItem.data.id);
  if (!deleted.ok) {
    throw new Error(deleted.error);
  }

  console.log(
    JSON.stringify(
      {
        category: createdCategory.data.name,
        itemUpdatedPrice: updatedItem.data.price,
        itemUpdatedAvailability: updatedItem.data.isAvailable,
        categoryCount: categories.data.length,
        itemCountBeforeDelete: items.data.length,
        deletedId: deleted.data.id,
      },
      null,
      2,
    ),
  );
}

run().catch((error: unknown) => {
  console.error(error);
  process.exit(1);
});
