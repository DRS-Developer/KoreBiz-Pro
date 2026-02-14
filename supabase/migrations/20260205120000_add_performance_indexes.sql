-- Performance Indexes for List Views
-- Created at: 2026-02-05

-- Services List: filtered by published, ordered by order
-- Usage: .from('services').select(...).eq('published', true).order('order')
CREATE INDEX IF NOT EXISTS idx_services_published_order ON public.services (published, "order");

-- Services: filtered by category
-- Usage: Frontend filtering currently, but useful if moved to backend
CREATE INDEX IF NOT EXISTS idx_services_category ON public.services (category);

-- Portfolio List: filtered by published, ordered by created_at desc
-- Usage: .from('portfolios').select(...).eq('published', true).order('created_at', { ascending: false })
CREATE INDEX IF NOT EXISTS idx_portfolios_published_created_at ON public.portfolios (published, created_at DESC);

-- Portfolio: filtered by category
CREATE INDEX IF NOT EXISTS idx_portfolios_category ON public.portfolios (category);

-- Pages List: filtered by published, ordered by title
-- Usage: .from('pages').select(...).eq('published', true).order('title')
CREATE INDEX IF NOT EXISTS idx_pages_published_title ON public.pages (published, title);

-- Comments to verify usage
COMMENT ON INDEX idx_services_published_order IS 'Optimizes default services list view';
COMMENT ON INDEX idx_portfolios_published_created_at IS 'Optimizes default portfolio list view';
