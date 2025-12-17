-- 1. Create Store Settings Table (Singleton)
create table if not exists store_settings (
  id integer primary key default 1 check (id = 1), -- Enforce single row
  created_at timestamp with time zone default now(),
  updated_at timestamp with time zone default now(),
  store_name text default 'My Store',
  address text,
  phone text,
  email text,
  tax_rate numeric default 0,
  currency text default 'USD',
  footer_message text default 'Thank you for your business!',
  logo_url text -- URL to storage bucket
);

-- 2. Insert default row if not exists
insert into store_settings (id, store_name)
values (1, 'My Awesome Store')
on conflict (id) do nothing;

-- 3. Enable RLS
alter table store_settings enable row level security;

-- 4. Policies

-- Everyone (Authenticated) can view settings (to see logo, tax rate, etc)
create policy "Everyone can view store settings"
  on store_settings for select
  using ( auth.role() = 'authenticated' );

-- Only Admin can update
create policy "Admins can update store settings"
  on store_settings for update
  using ( 
    exists (
      select 1 from profiles
      where profiles.id = auth.uid()
      and profiles.role = 'admin'
    )
  );

-- Only Admin can insert (though it's a singleton, good practice)
create policy "Admins can insert store settings"
  on store_settings for insert
  with check (
    exists (
      select 1 from profiles
      where profiles.id = auth.uid()
      and profiles.role = 'admin'
    )
  );
