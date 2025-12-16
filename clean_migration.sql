-- 0. Init Profiles and Auth Trigger
create table if not exists public.profiles (
  id uuid not null references auth.users(id) on delete cascade primary key,
  full_name text,
  avatar_url text
);

alter table public.profiles enable row level security;

create policy "Public profiles are viewable by everyone."
  on profiles for select
  using ( true );

create policy "Users can insert their own profile."
  on profiles for insert
  with check ( auth.uid() = id );

create policy "Users can update own profile."
  on profiles for update
  using ( auth.uid() = id );

-- Function to handle new user signup
create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id, full_name, avatar_url)
  values (new.id, new.raw_user_meta_data->>'full_name', new.raw_user_meta_data->>'avatar_url');
  return new;
end;
$$ language plpgsql security definer;

-- Trigger
drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();
-- 1. Add Role to Profiles
-- This allows us to distinguish between 'admin', 'cashier' (staff), etc.
-- We use a text check constraint to limit values.
alter table profiles 
add column if not exists role text default 'cashier' check (role in ('admin', 'cashier', 'manager'));

-- 2. Create Customers Table
-- This is for the CRM part. These are people who buy, not people who log in.
create table if not exists customers (
  id uuid default gen_random_uuid() primary key,
  created_at timestamp with time zone default now(),
  full_name text not null,
  email text, -- Optional, for marketing
  phone text, -- Important for lookup
  address text,
  total_spent numeric default 0,
  notes text
);

-- 3. Enable RLS on Customers
alter table customers enable row level security;

-- 4. Policies for Customers
-- Authenticated staff (anyone logged in) can view/create/edit customers.
create policy "Staff can view customers" 
  on customers for select 
  using ( auth.role() = 'authenticated' );

create policy "Staff can create customers" 
  on customers for insert 
  with check ( auth.role() = 'authenticated' );

create policy "Staff can update customers" 
  on customers for update 
  using ( auth.role() = 'authenticated' );
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
-- 1. Create Stock Movements Table
create type stock_movement_type as enum ('IN', 'OUT', 'ADJUSTMENT', 'SALE', 'RETURN');

create table if not exists stock_movements (
  id uuid default gen_random_uuid() primary key,
  created_at timestamp with time zone default now(),
  product_id uuid references products(id) on delete cascade not null,
  quantity integer not null, -- Positive value
  type stock_movement_type not null,
  reason text, -- Optional notes
  user_id uuid references auth.users(id) -- Who made the change
);

-- 2. RLS
alter table stock_movements enable row level security;

create policy "Staff can view stock movements" 
  on stock_movements for select 
  using ( auth.role() = 'authenticated' );

create policy "Staff can create stock movements" 
  on stock_movements for insert 
  with check ( auth.role() = 'authenticated' );

-- 3. (Optional) Trigger to update product stock automatically
-- Ideally application logic handles this to ensure validation, 
-- but a trigger is safer for data integrity. Let's start with App Logic for simplicity 
-- or add a simple function if the user wants robust SQL.
-- Let's stick to Application Logic in Server Actions for now to keep SQL simple 
-- unless performance requires it later.
-- 1. Orders Table
create type order_status as enum ('PENDING', 'COMPLETED', 'CANCELLED');
create type payment_method as enum ('CASH', 'CARD', 'TRANSFER', 'OTHER');

create table if not exists orders (
  id uuid default gen_random_uuid() primary key,
  created_at timestamp with time zone default now(),
  total_amount numeric not null default 0,
  status order_status default 'PENDING',
  payment_method payment_method default 'CASH',
  
  -- Links
  customer_id uuid references customers(id) on delete set null, -- Optional link to CRM
  user_id uuid references auth.users(id) -- Staff who processed it
);

-- 2. Order Items Table
create table if not exists order_items (
  id uuid default gen_random_uuid() primary key,
  created_at timestamp with time zone default now(),
  order_id uuid references orders(id) on delete cascade not null,
  product_id uuid references products(id) on delete set null, -- Keep record even if product deleted? maybe set null
  
  -- Snapshot of price at moment of sale is CRITICAL
  quantity integer not null default 1,
  unit_price numeric not null, 
  subtotal numeric not null -- stored for convenience/performance
);

-- 3. RLS
alter table orders enable row level security;
alter table order_items enable row level security;

create policy "Staff can manage orders" on orders 
  using (auth.role() = 'authenticated');

create policy "Staff can manage order items" on order_items 
  using (auth.role() = 'authenticated');
-- Add cedula column to customers table
ALTER TABLE customers 
ADD COLUMN IF NOT EXISTS cedula text;
-- 1. Enable RLS on all tables that were previously disabled
alter table products enable row level security;
alter table categories enable row level security;
alter table stock_movements enable row level security;
alter table customers enable row level security;
alter table orders enable row level security;
alter table order_items enable row level security;

-- 2. Ensure "Staff can view/manage" policies exist for these tables
-- We use DO blocks to avoid errors if policies already exist

do $$
begin
  if not exists (select 1 from pg_policies where tablename = 'products' and policyname = 'Staff can manage products') then
    create policy "Staff can manage products" on products using (auth.role() = 'authenticated');
  end if;
end $$;

do $$
begin
  if not exists (select 1 from pg_policies where tablename = 'categories' and policyname = 'Staff can manage categories') then
    create policy "Staff can manage categories" on categories using (auth.role() = 'authenticated');
  end if;
end $$;

do $$
begin
  if not exists (select 1 from pg_policies where tablename = 'stock_movements' and policyname = 'Staff can view stock movements') then
    create policy "Staff can view stock movements" on stock_movements for select using (auth.role() = 'authenticated');
  end if;
end $$;

do $$
begin
  if not exists (select 1 from pg_policies where tablename = 'stock_movements' and policyname = 'Staff can create stock movements') then
    create policy "Staff can create stock movements" on stock_movements for insert with check (auth.role() = 'authenticated');
  end if;
end $$;

do $$
begin
  if not exists (select 1 from pg_policies where tablename = 'customers' and policyname = 'Staff can view customers') then
    create policy "Staff can view customers" on customers for select using (auth.role() = 'authenticated');
  end if;
end $$;

do $$
begin
  if not exists (select 1 from pg_policies where tablename = 'customers' and policyname = 'Staff can create customers') then
    create policy "Staff can create customers" on customers for insert with check (auth.role() = 'authenticated');
  end if;
end $$;

do $$
begin
  if not exists (select 1 from pg_policies where tablename = 'customers' and policyname = 'Staff can update customers') then
    create policy "Staff can update customers" on customers for update using (auth.role() = 'authenticated');
  end if;
end $$;

do $$
begin
  if not exists (select 1 from pg_policies where tablename = 'orders' and policyname = 'Staff can manage orders') then
    create policy "Staff can manage orders" on orders using (auth.role() = 'authenticated');
  end if;
end $$;

do $$
begin
  if not exists (select 1 from pg_policies where tablename = 'order_items' and policyname = 'Staff can manage order items') then
    create policy "Staff can manage order items" on order_items using (auth.role() = 'authenticated');
  end if;
end $$;

-- 3. Fix "Function Search Path Mutable" warning
-- Re-create the function with specific search_path
create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id, full_name, avatar_url)
  values (new.id, new.raw_user_meta_data->>'full_name', new.raw_user_meta_data->>'avatar_url');
  return new;
end;
$$ language plpgsql security definer set search_path = public;
