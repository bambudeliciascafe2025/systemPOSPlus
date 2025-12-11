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
