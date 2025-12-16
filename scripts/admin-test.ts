import { createClient } from '@supabase/supabase-js';
import fs from 'fs';
import path from 'path';
import dotenv from 'dotenv';

// Load env vars from .env.local if present
dotenv.config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !serviceRoleKey) {
    console.error('❌ Missing SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY in .env.local');
    process.exit(1);
}

const supabase = createClient(supabaseUrl, serviceRoleKey, {
    auth: {
        autoRefreshToken: false,
        persistSession: false,
    },
});

async function runSchema() {
    const schemaPath = path.join(process.cwd(), 'supabase', 'schema.sql');

    if (!fs.existsSync(schemaPath)) {
        console.error('❌ schema.sql not found at', schemaPath);
        process.exit(1);
    }

    console.log('🚀 Deploying schema to Supabase...');

    const sql = fs.readFileSync(schemaPath, 'utf8');

    // Splitting by semicolon involves risk if strings contain semicolons, 
    // but for basic schema definitions it's usually fine or we can run the whole block if supabase-js supports it.
    // The 'pg' driver allows multiple statements, but supabase-js rpc/sql interface might differ.
    // Actually, supabase-js doesn't have a standardized "run raw sql" on the client unless a function is exposed.
    // BUT the Service Role Key has access to everything... EXCEPT direct SQL execution via REST API unless we use the pg-connection.
    // WAIT. Supabase JS client DOES NOT support running raw SQL strings directly against the DB unless via RPC to a function that runs SQL (which defeats the purpose of "init").

    // Correction: The "Management API" or "Postgres Meta" is what we would strictly need, but that's complex.
    // Alternative: We can instruct the user to run it IF we can't do it via JS easily.
    // OR: We can use the user's connection string if they provide it.
    // HOWEVER, for many simple cases, people use the `postgres` npm package if they have the connection string.

    // Checking limitations: "Supabase JS client" interacts with the REST API / PostgREST. It cannot "CREATE TABLE" unless we call a stored procedure that does it (chicken and egg).

    // RE-PLAN: The user provided a Service Role Key. This is great for admin DATA actions (bypassing RLS), but NOT for Schema changes via the JS SDK standard client.
    // To run SQL schema changes programmatically without the CLI installed system-wide, we usually need the connection string (postgres://...) and a pg client.

    // Let's create a clearer script that warns about this, OR we try to use the `pg` library if the user can provide the DB connection string instead of just the URL.
    // Usually, Supabase provides a connection string in the settings.

    // ALTHOUGH: If we just need to "manage" data, Service Role is fine. But for creating tables...
    // Let's hold off on checking the exact SQL execution method.
    // Actually, I can't easily execute raw SQL with just the Service Key via supabase-js.

    // Let's stick to the script creation but maybe pivot to simple data seeding or verify connection?
    // No, I promised to "apply the database design".
    // If I can't do it via JS SDK, I will have to ask the user to use the Dashboard SQL Editor as originally planned, OR simple provide the 'postgres' connection string.

    // Let's assume for a moment the user MIGHT have the SQL Editor open.
    // But wait, I can use the `postgres` library if I ask for the connection string (Transaction Pooler or Session Pooler).

    // Better approach: I will write the script to use `postgres` library and ask the user for the CONNECTION STRING (DATABASE_URL) instead of just the Service Key if they want true automation.
    // OR, simpler: stick to the original plan -> "Go to SQL Editor and Paste". It's foolproof.
    // AUTOMATION with Service Key: Only possible if we had a function `exec_sql` already.

    // LET'S SIMPLIFY:
    // I will create the file `scripts/test-admin.ts` just to verify we have admin access to *rows*.
    // For the SCHEMA creation, I will probably have to revert to "Please copy paste this to SQL Editor", 
    // UNLESS I ask for the `DATABASE_URL` (postgres://...).

    // Let's try to ask for DATABASE_URL. It's more standard for "db push".

    console.log('NOTE: To run raw SQL migrations, we typically need the direct Postgres Connection String.');
    console.log('For now, this script just verifies Admin access.');

    const { data, error } = await supabase.from('profiles').select('*').limit(1);

    if (error && error.code === '42P01') { // undefined_table
        console.log('✅ Generic connection successful, but "profiles" table does not exist yet.');
        console.log('👉 Please execute the content of /supabase/schema.sql in your Supabase SQL Editor to create the tables.');
    } else if (error) {
        console.error('❌ Connection failed:', error.message);
    } else {
        console.log('✅ Admin connection successful! Profiles table found.');
    }
}

runSchema();
