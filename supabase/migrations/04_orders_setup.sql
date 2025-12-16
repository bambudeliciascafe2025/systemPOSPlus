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
