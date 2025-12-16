-- Disable RLS on all main tables to allow full access
alter table products disable row level security;
alter table categories disable row level security;
alter table stock_movements disable row level security;
alter table customers disable row level security;
alter table orders disable row level security;
alter table order_items disable row level security;

-- Optionally, drop existing policies if re-enabling later to clear slate
-- drop policy if exists "Staff can manage categories" on categories;
-- drop policy if exists "Staff can manage products" on products;
