import type {
  CartValidationResult,
  CartValidationInputItem,
  Category,
  CreateOrderRequest,
  LoginRequest,
  LoginResponse,
  Order,
  PaymentDetails,
  PaymentRequest,
  PaymentResponse,
  Product,
  Promotion,
  PromotionValidation,
  RegisterRequest,
  User,
} from "./api.types";
import {clearAccessToken} from "./auth-token";
const API_BASE_URL = (
  process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:3001/api"
).replace(/\/$/, "");

/* ----------------------------- Errors ----------------------------- */

export class ApiError extends Error {
  constructor(
    message: string,
    public readonly status: number,
  ) {
    super(message);
    this.name = "ApiError";
  }

  get isUnauthorized() {
    return this.status === 401;
  }
}

/* ------------------- Xử lý 401 tập trung (session) ------------------- */

function handleSessionExpired() {
  if (typeof window === "undefined") return;
  clearAccessToken();

  const { pathname, search } = window.location;
  if (pathname === "/session-expired" || pathname === "/login") return;

  window.location.assign(
    `/session-expired?next=${encodeURIComponent(pathname + search)}`,
  );
}

/* ------------------------------ Core ------------------------------ */

interface RequestOptions {
  method?: "GET" | "POST" | "PUT" | "PATCH" | "DELETE";
  body?: unknown;
  token?: string;
  signal?: AbortSignal;
  headers?: Record<string, string>;
}

async function readErrorMessage(response: Response) {
  const responseBody: unknown = await response.json().catch(() => null);
  let message = `API request failed with status ${response.status}`;

  if (
    responseBody &&
    typeof responseBody === "object" &&
    "message" in responseBody
  ) {
    const raw = (responseBody as { message: unknown }).message;
    if (typeof raw === "string") {
      message = raw;
    } else if (Array.isArray(raw)) {
      const details = raw.filter(
        (part): part is string => typeof part === "string",
      );
      if (details.length > 0) message = details.join(" ");
    }
  }
  return message;
}

async function request<T>(
  path: string,
  { method = "GET", body, token, signal, headers: extraHeaders }: RequestOptions = {},
): Promise<T> {
  const headers: Record<string, string> = { Accept: "application/json" };
  if (body !== undefined) headers["Content-Type"] = "application/json";
  if (token) headers.Authorization = `Bearer ${token}`;
  Object.assign(headers, extraHeaders);

  let response: Response;
  try {
    response = await fetch(`${API_BASE_URL}${path}`, {
      method,
      headers,
      signal,
      body: body !== undefined ? JSON.stringify(body) : undefined,
    });
  } catch (error) {
    // Giữ nguyên AbortError để caller tự bỏ qua
    if (error instanceof DOMException && error.name === "AbortError") {
      throw error;
    }
      throw new ApiError(
      "Không thể kết nối máy chủ. Vui lòng kiểm tra mạng.",
      0,
    );
  }

  if (!response.ok) {
    const message = await readErrorMessage(response);

    // 401 khi ĐÃ gửi token => phiên hết hạn.
    // (401 của /auth/login không có token => là sai mật khẩu, không đi vào đây)
    if (response.status === 401 && token) {
    handleSessionExpired();
    throw new ApiError("Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại.", 401);
    }
    throw new ApiError(message, response.status);
  }

  if (response.status === 204) return undefined as T;
  return response.json() as Promise<T>;
}

/* ---------------------------- Catalog ---------------------------- */

export function getCategories(signal?: AbortSignal) {
  return request<Category[]>("/categories", { signal });
}

export function getProducts(
  filters?: { search?: string; category?: string; outOfStock?: boolean },
  signal?: AbortSignal,
) {
  const searchParams = new URLSearchParams();
  if (filters?.search) searchParams.set("search", filters.search);
  if (filters?.category && filters.category !== "all") {
    searchParams.set("category", filters.category);
  }
  if (typeof filters?.outOfStock === "boolean") {
    searchParams.set("outOfStock", String(filters.outOfStock));
  }

  const query = searchParams.toString();
  return request<Product[]>(`/products${query ? `?${query}` : ""}`, { signal });
}

/* ------------------------ Promotions / Cart ------------------------ */

export function getPromotions(token: string, signal?: AbortSignal) {
  return request<Promotion[]>("/promotions/me", { token, signal });
}

export function validatePromotion(
  code: string,
  items: CartValidationInputItem[],
  token?: string,
) {
  return request<PromotionValidation>("/promotions/validate", {
    method: "POST",
    body: { code, items },
    token,
  });
}

export function validateCart(items: CartValidationInputItem[]) {
  return request<CartValidationResult>("/cart/validate", {
    method: "POST",
    body: { items },
  });
}

export function submitPayment(
  payload: PaymentRequest,
  token: string,
  idempotencyKey: string,
  signal?: AbortSignal,
) {
  return request<PaymentResponse>("/payments", {
    method: "POST",
    token,
    signal,
    headers: { "Idempotency-Key": idempotencyKey },
    body: {
      orderId: payload.orderId,
      method: payload.method === "E_WALLET" ? "WALLET" : payload.method,
      idempotencyKey,
      ...(payload.cardNumber && { cardNumber: payload.cardNumber }),
    },
  });
}

export function confirmQrPayment(paymentId: string, token: string) {
  return request<PaymentResponse>(`/payments/${paymentId}/confirm`, {
    method: "POST",
    body: {},
    token,
  });
}

export function register(data: RegisterRequest, signal?: AbortSignal) {
  return request<User>("/auth/register", { method: "POST", body: data, signal });
}

export function login(data: LoginRequest, signal?: AbortSignal) {
  return request<LoginResponse>("/auth/login", {
    method: "POST",
    body: data,
    signal,
  });
}

export function getMe(token: string, signal?: AbortSignal) {
  return request<User>("/auth/me", { token, signal });
}

export function requestPasswordReset(email: string, signal?: AbortSignal) {
  return request<{ message: string }>("/auth/forgot-password", {
    method: "POST",
    body: { email },
    signal,
  });
}

export function resetPassword(
  token: string,
  password: string,
  signal?: AbortSignal,
) {
  return request<{ message: string }>("/auth/reset-password", {
    method: "POST",
    body: { token, password },
    signal,
  });
}

/* ----------------------------- Orders ----------------------------- */

export function createOrder(data: CreateOrderRequest, token: string) {
  return request<Order>("/orders", { method: "POST", body: data, token });
}

export function getMyOrders(token: string, signal?: AbortSignal) {
  return request<Order[]>("/orders/me", { token, signal });
}

export function getOrder(id: string, token: string, signal?: AbortSignal) {
  return request<Order>(`/orders/${id}`, { token, signal });
}

export function cancelOrder(id: string, token: string) {
  return request<{ message: string; orderId: string }>(
    `/orders/${id}/cancel`,
    { method: "POST", body: {}, token },
  );
}

export function getPayment(id: string, token: string, signal?: AbortSignal) {
  return request<PaymentDetails>(`/payments/${id}`, { token, signal });
}
export async function fetchJson<T>(
  path: string,
  options?: RequestInit,
): Promise<T> {
  const url = path.startsWith("http") ? path : `${API_BASE_URL}${path}`;

  const response = await fetch(url, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      Accept: "application/json",
      ...options?.headers,
    },
  });

  if (!response.ok) {
    const errorBody = await response.json().catch(() => null);
    const message = errorBody?.message || `API request failed with status ${response.status}`;
    throw new ApiError(message, response.status);
  }

  if (response.status === 204) return undefined as unknown as T;
  return (await response.json()) as T;
}