export type SizeCode = "S" | "M" | "L";
export type IceLevel = "NONE" | "LESS" | "NORMAL" | "EXTRA";
export type OrderItemIceLevel = Exclude<IceLevel, "EXTRA">;
export type DiscountType = "PERCENT" | "FIXED_AMOUNT";
export type OrderStatus =
  | "PENDING"
  | "PAID"
  | "PREPARING"
  | "READY"
  | "COMPLETED"
  | "PAYMENT_FAILED"
  | "CANCELLED";
export type PaymentMethod = "E_WALLET" | "CARD" | "QR" | "VNPAY";
export type PaymentStatus = "PENDING" | "SUCCEEDED" | "FAILED" | "REFUNDED";
export type ScreenState =
  | "SELECT_METHOD"
  | "CARD_FORM"
  | "QR_CODE"
  | "PROCESSING"
  | "FAILED"
  | "ORDER_SUCCESS";

export interface Category {
  id: number;
  name: string;
  slug: string;
  productCount: number;
}

export interface ProductSize {
  size: SizeCode;
  additionalPrice: number;
}

export interface Product {
  id: number;
  name: string;
  slug: string;
  description: string | null;
  basePrice: number;
  price: number;
  imageUrl: string;
  stock: number;
  isOutOfStock: boolean;
  category: Pick<Category, "id" | "name" | "slug">;
  sizes: ProductSize[];
}

export interface Promotion {
  id: number;
  code: string;
  description: string | null;
  discountType: DiscountType;
  value: number;
  minOrderValue: number;
  maxDiscount: number | null;
  startsAt: string;
  endsAt: string;
  isAvailable: boolean;
  availabilityMessage: string | null;
}

export interface PromotionValidation {
  valid: true;
  promotion: Promotion;
  discount: number;
  subtotal: number;
  total: number;
}

export interface CartValidationInputItem {
  productId: number;
  size: SizeCode;
  quantity: number;
  expectedUnitPrice: number;
}

export interface CartValidationResult {
  valid: boolean;
  subtotal: number;
  items: {
    productId: number;
    size: SizeCode;
    quantity: number;
    currentUnitPrice: number;
    availableStock: number;
    priceChanged: boolean;
  }[];
  issues: {
    productId: number;
    reason: "UNAVAILABLE" | "OUT_OF_STOCK" | "PRICE_CHANGED";
    message: string;
    productName: string;
    requestedQuantity: number;
    availableStock: number;
  }[];
}

export interface PaymentRequest {
  orderId: string;
  method: PaymentMethod;
  cardNumber?: string;
}

export interface PaymentResponse {
  id: string;
  orderId: string;
  method: "WALLET" | "CARD" | "QR" | "VNPAY";
  status: PaymentStatus;
  amount: number;
  failureReason: string | null;
  rewardPoints: number;
  qrExpiresAt: string | null;
  paymentUrl: string | null;
}

export interface PaymentDetails extends PaymentResponse {
  orderCode: string;
}

export interface RegisterRequest {
  email: string;
  password: string;
  fullName?: string;
  phone?: string;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface User {
  id: string;
  email: string;
  fullName: string | null;
  phone: string | null;
  loyaltyPoints: number;
}

export interface LoginResponse {
  accessToken: string;
  user: User;
}

export interface CreateOrderRequest {
  items: {
    productId: number;
    size: SizeCode;
    iceLevel: OrderItemIceLevel;
    quantity: number;
    toppingIds: number[];
  }[];
  discountCode?: string;
}

export interface OrderItem {
  id: number;
  productId: number;
  productName: string;
  size: SizeCode;
  iceLevel: OrderItemIceLevel;
  quantity: number;
  unitPrice: number;
  lineTotal: number;
  product?: { imageUrl: string };
  toppings?: {
    toppingId: number;
    toppingName: string;
    unitPrice: number;
  }[];
}

export interface OrderStatusHistoryEntry {
  id: number;
  fromStatus: OrderStatus | null;
  toStatus: OrderStatus;
  note: string | null;
  changedAt: string;
}

export interface Order {
  id: string;
  code: string;
  status: OrderStatus;
  subtotal: number;
  discount: number;
  total: number;
  expiresAt: string | null;
  createdAt: string;
  cancelledAt: string | null;
  cancelReason: string | null;
  items: OrderItem[];
  statusHistory?: OrderStatusHistoryEntry[];
}

export interface ProductDetails {
  id: number;
  name: string;
  category: string;
  price: number;
  sizePrices: Record<SizeCode, number>;
  imageUrl: string;
  stock: number;
  isAvailable: boolean;
}

export interface Topping {
  id: number;
  name: string;
  price: number;
  isAvailable: boolean;
}

export type BaristaOrderStatus = OrderStatus;

export interface BaristaOrder {
  id: string;
  status: BaristaOrderStatus;
  itemCount: number;
  total: number;
  placedAt: string;
}
