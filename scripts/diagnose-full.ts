
import { createClient } from '@supabase/supabase-js'
import dotenv from 'dotenv'

dotenv.config({ path: '.env.local' })

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY!

const adminDb = createClient(supabaseUrl, serviceRoleKey)

async function diagnoseFull() {
    console.log('--- FULL DIAGNOSIS ---')

    // 1. Check Buckets
    console.log('\n[1] Checking Buckets...')
    const { data: buckets, error: bucketError } = await adminDb.storage.listBuckets()
    if (bucketError) console.error('   ❌ List Buckets Error:', bucketError.message)
    else {
        console.log('   ✅ Buckets found:', buckets.map(b => `${b.name} (public: ${b.public})`))
    }

    // 2. Test Upload
    console.log('\n[2] Testing Storage Upload...')
    const fileName = `test-${Date.now()}.txt`
    const { data: upload, error: uploadError } = await adminDb
        .storage
        .from('products')
        .upload(fileName, 'Test Content', { contentType: 'text/plain', upsert: true })

    if (uploadError) {
        console.error('   ❌ Upload Error:', JSON.stringify(uploadError, null, 2))
    } else {
        console.log('   ✅ Upload Success:', upload.path)
    }

    // 3. Test Delete Specific Product
    console.log('\n[3] Testing Delete "Bebida Saludable"...')
    const { data: products } = await adminDb
        .from('products')
        .select('id, name')
        .eq('name', 'Bebida Saludable')

    if (products && products.length > 0) {
        for (const p of products) {
            console.log(`   Attempting to delete: ${p.name} (${p.id})`)
            const { error: deleteError } = await adminDb
                .from('products')
                .delete()
                .eq('id', p.id)

            if (deleteError) {
                console.error('   ❌ Delete Failed:', JSON.stringify(deleteError, null, 2))
            } else {
                console.log('   ✅ Delete Success')
            }
        }
    } else {
        console.log('   ⚠ Product "Bebida Saludable" not found.')
    }

    console.log('\n--- END DIAGNOSIS ---')
}

diagnoseFull()
