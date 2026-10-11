export type Product = {
  id: string;
  name: string;
  description: string;
  image: string;
  position: number;
};
export type Item = { productId: string; quantity: number };
export type Draft = {
  name: string;
  email: string;
  notes: string;
  items: Item[];
  version: number;
  idempotencyKey: string;
};
export type SavedOrder = {
  token: string;
  name: string;
  email: string;
  notes: string;
  createdAt: string;
  items: { name: string; quantity: number }[];
};
