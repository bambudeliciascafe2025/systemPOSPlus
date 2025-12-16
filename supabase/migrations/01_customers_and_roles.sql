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
