-- 1. Categories Table
create table if not exists categories (
  id uuid default gen_random_uuid() primary key,
  created_at timestamp with time zone default now(),
  name text not null,
  color text default '#10b981', -- Emerald-500 default
  icon text -- Optional: lucide icon name
);

-- 2. Products Table
create table if not exists products (
  id uuid default gen_random_uuid() primary key,
  created_at timestamp with time zone default now(),
  name text not null,
  description text,
  price numeric not null check (price >= 0),
  stock integer default 0,
  sku text,
  image_url text,
  category_id uuid references categories(id) on delete set null,
  available boolean default true
);

-- 3. Storage Bucket for Products
-- Note: Buckets are usually created via API or Dashboard, but we can try inserting if storage schema is available
-- or user will need to create 'products' bucket manually.
-- For now, we assume user might need to create 'products' public bucket in dashboard.

-- 4. RLS Policies
alter table categories enable row level security;
alter table products enable row level security;

-- Policies: Authenticated staff can do everything
create policy "Staff can manage categories" on categories using (auth.role() = 'authenticated');
create policy "Staff can manage products" on products using (auth.role() = 'authenticated');
