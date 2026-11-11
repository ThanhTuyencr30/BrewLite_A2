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

export function getProductDetails(
  id: string,
  signal?: AbortSignal,
): Promise<ProductDetails> {
  return fetchJson<ProductDetails>(`/products/${encodeURIComponent(id)}`, {
    signal,
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
    },
  );
}

export function getBaristaOrders(signal?: AbortSignal): Promise<BaristaOrder[]> {
  return fetchJson<BaristaOrder[]>("/orders/barista", { signal });
}
