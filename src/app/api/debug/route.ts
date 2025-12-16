import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

export async function GET() {
    const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const key = process.env.SUPABASE_SERVICE_ROLE_KEY;

    console.log("Debug Route Hit");
    console.log("URL:", url);
    console.log("Key Exists:", !!key);

    if (!url || !key) {
        return NextResponse.json({ error: "Missing Env Vars interactively" }, { status: 500 });
    }

    const adminDb = createClient(url, key);

    const { data, error } = await adminDb.from('categories').select('*');

    if (error) {
        return NextResponse.json({ error: error.message, details: error }, { status: 500 });
    }

    return NextResponse.json({
        message: "Success",
        count: data.length,
        categories: data
    });
}
