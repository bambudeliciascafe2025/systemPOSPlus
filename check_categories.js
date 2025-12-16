
const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseKey) {
    console.error("Missing env vars");
    process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function checkCategories() {
    const { data, error } = await supabase.from('categories').select('*');
    if (error) {
        console.error("Error:", error);
    } else {
        console.log("Categories in DB:", data);
        console.log("Count:", data.length);
    }
}

checkCategories();
