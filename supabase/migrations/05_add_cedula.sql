-- Add cedula column to customers table
ALTER TABLE customers 
ADD COLUMN IF NOT EXISTS cedula text;
