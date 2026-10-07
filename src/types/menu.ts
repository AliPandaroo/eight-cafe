export type CategoryRecord = {
  id: string;
  restaurantId: string;
  name: string;
  slug: string;
  sortOrder: number;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
};

export type MenuItemVariantRecord = {
  id: string;
  title: string;
  price: string;
  coffeeGrams: number;
  compareAtPrice?: string | null;
  sortOrder: number;
};

export type MenuItemRecord = {
  id: string;
  categoryId: string;
  name: string;
  description: string;
  price: string;
  priceMax?: string | null;
  coffeeGrams: number;
  compareAtPrice?: string | null;
  imageUrl: string | null;
  isAvailable: boolean;
  sortOrder: number;
  createdAt: string;
  updatedAt: string;
  variants: MenuItemVariantRecord[];
};

export type CategoryWithItems = CategoryRecord & {
  items: MenuItemRecord[];
};
