export interface WooCommerceBillingAddress {
  first_name?: string;
  last_name?: string;
  email?: string;
}

export interface WooCommerceLineItem {
  id: number;
  name: string;
  product_id: number;
  quantity: number;
}

export interface WooCommerceOrderWebhook {
  id: number;
  status: string;
  total: string;
  billing?: WooCommerceBillingAddress;
  line_items?: WooCommerceLineItem[];
}
