import { fetchJson } from "./api";

import type {
  BaristaOrder,
  BaristaOrderStatus,
  ProductDetails,
  SizeCode,
  Topping,
} from "../../../../packages/types/src";

export type {
  BaristaOrder,
  BaristaOrderStatus,
  ProductDetails,
  Topping,
} from "../../../../packages/types/src";
export type ProductSize = SizeCode;
// Trong file web/src/lib/api.ts

interface ProductDetailsResponse {
  id: number;
  name: string;
  basePrice: number;
  imageUrl: string;
  stock: number;
  isAvailable: boolean;
  category: { name: string };
  sizes: Array<{ size: SizeCode; additionalPrice: number }>;
}

export function getProductDetails(
  id: string,
  signal?: AbortSignal,
): Promise<ProductDetails> {
  return fetchJson<ProductDetailsResponse>(
    `/products/${encodeURIComponent(id)}`,
    { signal },
  ).then((product) => {
    const sizePrices: Record<SizeCode, number> = {
      S: product.basePrice,
      M: product.basePrice,
      L: product.basePrice,
    };

    for (const size of product.sizes) {
      sizePrices[size.size] = product.basePrice + size.additionalPrice;
    }

    return {
      id: product.id,
      name: product.name,
      category: product.category.name,
      price: product.basePrice,
      sizePrices,
      imageUrl: product.imageUrl,
      stock: product.stock,
      isAvailable: product.isAvailable,
    };
  });
}

export function getToppings(signal?: AbortSignal): Promise<Topping[]> {
  return fetchJson<Topping[]>("/toppings", { signal });
}

export function updateOrderStatus(
  id: string,
  status: BaristaOrderStatus,
): Promise<BaristaOrder> {
  return fetchJson<BaristaOrder>(
    `/orders/${encodeURIComponent(id)}/status`,
    {
      method: "PATCH",
      body: JSON.stringify({ status }),
    }, // Không cần as any nữa vì fetchJson đã nhận RequestInit chuẩn TypeScript!
  );
}

export function getBaristaOrders(signal?: AbortSignal): Promise<BaristaOrder[]> {
  return fetchJson<BaristaOrder[]>("/orders/barista", { signal });
}
