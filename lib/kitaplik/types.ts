export interface LibraryBook {
  id: string;
  slug: string;
  title: string;
  subtitle: string | null;
  description: string | null;
  author: string | null;
  cover_image_url: string | null;
  printed_wc_product_id: number | null;
  ebook_wc_product_id: number | null;
  ebook_storage_path: string | null;
  page_count: number | null;
  is_published: boolean;
  sort_order: number;
}

export interface LibraryBookWithPricing extends LibraryBook {
  printedPrice: number | null;
  printedSalePrice: number | null;
  printedInStock: boolean;
  ebookPrice: number | null;
  ebookSalePrice: number | null;
  ebookInStock: boolean;
}

export interface EbookEntitlement {
  id: string;
  user_id: string;
  library_book_id: string;
  wc_order_id: number;
  granted_at: string;
}

export interface OwnedLibraryBook extends LibraryBook {
  granted_at: string;
}
