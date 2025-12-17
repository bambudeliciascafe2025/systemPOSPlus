
import { createClient } from '@supabase/supabase-js'
import dotenv from 'dotenv'

dotenv.config({ path: '.env.local' })

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY!

const adminDb = createClient(supabaseUrl, serviceRoleKey)

async function diagnose() {
    console.log('--- STARTING DIAGNOSIS ---')
    console.log('Target URL:', supabaseUrl)

    // 1. Test Storage Upload
    console.log('\n[1] Testing Storage Upload...')
    const fileName = `diagnostic-${Date.now()}.txt`
    const fileBody = "Hello World via Node"

    const { data: uploadData, error: uploadError } = await adminDb
        .storage
        .from('products')
        .upload(fileName, fileBody, { upsert: true, contentType: 'text/plain' })

    if (uploadError) {
        console.error('❌ Upload Failed:', uploadError)
    } else {
        console.log('✅ Upload Success:', uploadData)
        // Get Public URL
        const { data: urlData } = adminDb.storage.from('products').getPublicUrl(fileName)
        console.log('   Public URL:', urlData.publicUrl)
    }

    // 2. Test DB Delete (Try to delete the diagnostic product if exists)
    // First, find a product to delete. Ideally specific one, but let's find the "Diagnostic Test Product" created earlier.
    console.log('\n[2] Testing DB Delete...')
    const { data: products } = await adminDb
        .from('products')
        .select('id, name')
        .ilike('name', '%Diagnostic%')
        .limit(1)

    if (products && products.length > 0) {
        const p = products[0]
        console.log(`   Found product to delete: ${p.name} (${p.id})`)

        const { error: deleteError } = await adminDb
            .from('products')
            .delete()
            .eq('id', p.id)

        if (deleteError) {
            console.error('❌ Delete Failed:', deleteError)
        } else {
            console.log('✅ Delete Success')
        }
    } else {
        console.log('   ⚠ No "Diagnostic" product found to test delete.')
    }

    console.log('\n--- END DIAGNOSIS ---')
}

diagnose()
