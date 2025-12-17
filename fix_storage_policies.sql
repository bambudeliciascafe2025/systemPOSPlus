
-- 1. Allow Public View (Images)
drop policy if exists "Public Access to Products" on storage.objects;
create policy "Public Access to Products"
on storage.objects for select
using ( bucket_id = 'products' );

-- 2. Allow Admin/Auth Insert (Upload)
drop policy if exists "Authenticated can upload products" on storage.objects;
create policy "Authenticated can upload products"
on storage.objects for insert
with check ( bucket_id = 'products' and auth.role() = 'authenticated' );

-- 3. Allow Admin Update/Delete
drop policy if exists "Authenticated can update/delete products" on storage.objects;
create policy "Authenticated can update/delete products"
on storage.objects for update
using ( bucket_id = 'products' and auth.role() = 'authenticated' );

drop policy if exists "Authenticated can delete products" on storage.objects;
create policy "Authenticated can delete products"
on storage.objects for delete
using ( bucket_id = 'products' and auth.role() = 'authenticated' );
