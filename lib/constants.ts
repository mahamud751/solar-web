export const DISTRICTS = [
  "Dhaka",
  "Chattogram",
  "Sylhet",
  "Rajshahi",
  "Khulna",
  "Barishal",
  "Rangpur",
  "Mymensingh",
  "Gazipur",
  "Narayanganj",
  "Cumilla",
  "Noakhali",
  "Satkhira",
  "Sunamganj",
  "Other",
];

export const ORDER_STATUSES = [
  "PENDING",
  "CONFIRMED",
  "PROCESSING",
  "SHIPPED",
  "DELIVERED",
  "CANCELLED",
] as const;

export const SHIPPING_FEE = 300;
export const FREE_SHIPPING_FROM = 15000;

export function formatBdt(amount: number) {
  return new Intl.NumberFormat("en-BD", {
    style: "currency",
    currency: "BDT",
    maximumFractionDigits: 0,
  }).format(amount);
}

export function priceLabel(price: number | null, callForPrice: boolean) {
  if (callForPrice || price == null) return "Call for price";
  return formatBdt(price);
}

export function slugify(value: string) {
  return value
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 80);
}

export function quoteTotals(items: { price: number; quantity: number; callForPrice: boolean }[]) {
  const subtotal = items.reduce((sum, item) => sum + (item.callForPrice ? 0 : item.price * item.quantity), 0);
  const hasPricedItem = items.some((item) => !item.callForPrice);
  const shipping = !hasPricedItem || subtotal === 0 || subtotal >= FREE_SHIPPING_FROM ? 0 : SHIPPING_FEE;
  return { subtotal, shipping, total: subtotal + shipping };
}
