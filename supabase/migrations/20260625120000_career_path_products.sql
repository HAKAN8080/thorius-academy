-- Kariyer yolu satılabilir paket: WooCommerce ürün eşlemesi + enrollment kaynağı

CREATE TABLE IF NOT EXISTS public.career_path_products (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  career_path_id UUID NOT NULL REFERENCES public.career_paths (id) ON DELETE CASCADE,
  career_path_slug TEXT NOT NULL,
  wc_product_id INTEGER NOT NULL,
  price_normal NUMERIC(10, 2),
  price_sale NUMERIC(10, 2),
  currency TEXT NOT NULL DEFAULT 'TRY',
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE (career_path_id),
  UNIQUE (career_path_slug),
  UNIQUE (wc_product_id)
);

CREATE INDEX IF NOT EXISTS career_path_products_wc_product_idx
  ON public.career_path_products (wc_product_id)
  WHERE is_active = true;

ALTER TABLE public.career_path_enrollments
  ADD COLUMN IF NOT EXISTS source TEXT NOT NULL DEFAULT 'free',
  ADD COLUMN IF NOT EXISTS wc_order_id INTEGER,
  ADD COLUMN IF NOT EXISTS purchased_at TIMESTAMPTZ;

CREATE UNIQUE INDEX IF NOT EXISTS career_path_enrollments_wc_order_id_key
  ON public.career_path_enrollments (wc_order_id)
  WHERE wc_order_id IS NOT NULL;

ALTER TABLE public.career_path_products ENABLE ROW LEVEL SECURITY;

CREATE POLICY "career_path_products_public_read"
  ON public.career_path_products
  FOR SELECT
  TO anon, authenticated
  USING (is_active = true);

GRANT SELECT ON public.career_path_products TO anon, authenticated;
GRANT ALL ON public.career_path_products TO service_role;

-- Pilot: retail-planning paketi (WC ürün ID admin panelden veya WP'den eşlendikten sonra is_active=true)
INSERT INTO public.career_path_products (
  career_path_id,
  career_path_slug,
  wc_product_id,
  price_normal,
  price_sale,
  currency,
  is_active
)
SELECT
  cp.id,
  cp.slug,
  0,
  NULL,
  NULL,
  'TRY',
  false
FROM public.career_paths cp
WHERE cp.slug = 'retail-planning'
ON CONFLICT (career_path_slug) DO NOTHING;
