
import { createClient } from '@supabase/supabase-js'
import dotenv from 'dotenv'

// Load environment variables from .env.local
dotenv.config({ path: '.env.local' })

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY

console.log('--- DIAGNOSTIC START ---')
console.log('URL:', supabaseUrl ? 'Defined' : 'MISSING')
console.log('Service Key:', serviceRoleKey ? 'Defined' : 'MISSING')

if (!supabaseUrl || !serviceRoleKey) {
    console.error('CRITICAL: Missing environment variables.')
    process.exit(1)
}

const adminDb = createClient(supabaseUrl, serviceRoleKey)

async function testCreateProduct() {
    console.log('Attempting to create a test product...')

    const product = {
        name: "Diagnostic Test Product " + Date.now(),
        price: 99.99,
        stock: 10,
        available: true
    }

    const { data, error } = await adminDb
        .from("products")
        .insert(product)
        .select()

    if (error) {
        console.error('❌ FAILED to create product:', error)
    } else {
        console.log('✅ SUCCESS! Product created:', data)
    }
    console.log('--- DIAGNOSTIC END ---')
}

testCreateProduct()
