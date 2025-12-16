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
