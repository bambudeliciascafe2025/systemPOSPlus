
const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

const adminDb = createClient(supabaseUrl, supabaseKey);

async function cleanup() {
    console.log("Cleaning up test category...");
    const { error } = await adminDb
        .from('categories')
        .delete()
        .eq('name', 'Test Category Script');

    if (error) {
        console.error("❌ Cleanup FAILED:", error);
    } else {
        console.log("✅ Cleanup SUCCESS. Red category removed.");
    }
}

cleanup();
