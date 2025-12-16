
const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

const adminDb = createClient(supabaseUrl, supabaseKey);

async function testInsert() {
    console.log("Attempting direct insert via script...");
    const { data, error } = await adminDb
        .from('categories')
        .insert({ name: 'Test Category Script', color: '#ff0000' })
        .select();

    if (error) {
        console.error("❌ Insert FAILED:", error);
    } else {
        console.log("✅ Insert SUCCESS:", data);
    }
}

testInsert();
