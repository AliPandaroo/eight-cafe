export type BulkCoffeeTypeRecord = {
  id: string;
  name: string;
  pricePerKg: number;
  isActive: boolean;
  sortOrder: number;
  createdAt: string;
  updatedAt: string;
};

export type BulkCoffeeSaleRecord = {
  id: string;
  typeId: string | null;
  typeName: string;
  unit: "grams" | "toman";
  inputValue: string;
  grams: number;
  amount: number;
  pricePerKg: number;
  createdAt: string;
};
