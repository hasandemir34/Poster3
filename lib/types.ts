export interface Profile {
  id: string;
  full_name: string | null;
  address_json: AddressJson | null;
  created_at: string;
}

export interface AddressJson {
  line1: string;
  line2?: string;
  city: string;
  state: string;
  postcode: string;
  country: string;
}

export interface Product {
  id: string;
  name: string;
  price: number;
  photo_count: number;
  cols: number;
}

export interface Order {
  id: string;
  user_id: string;
  total: number;
  status: "pending" | "paid" | "printing" | "shipped" | "delivered";
  created_at: string;
}

export interface OrderItem {
  id: string;
  order_id: string;
  product_id: string;
  print_ready_url: string | null;
}

export interface PhotoSlot {
  slotIndex: number;
  file: File | null;
  previewUrl: string | null;
  zoom: number;
  panX: number;
  panY: number;
}

export type FrameOption = "none" | "black" | "white";

export interface CreateOrderPayload {
  productId: string;
  printReadyUrl: string;
  addressJson: AddressJson;
  frameOption: FrameOption;
}

export interface CreateOrderResponse {
  orderId: string;
  error?: string;
}
export interface OrderWithItems extends Order {
  order_items: OrderItemWithProduct[];
}

export interface OrderItemWithProduct extends OrderItem {
  products: Product;
}
