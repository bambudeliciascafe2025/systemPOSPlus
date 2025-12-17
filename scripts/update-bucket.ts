
import { createClient } from '@supabase/supabase-js'
import dotenv from 'dotenv'

dotenv.config({ path: '.env.local' })

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY!

const adminDb = createClient(supabaseUrl, serviceRoleKey)

async function updateBucket() {
    console.log('Updating "products" bucket configuration...')

    const { data, error } = await adminDb.storage.updateBucket('products', {
        public: true,
        fileSizeLimit: 1024 * 1024 * 10, // Increase to 10MB
        allowedMimeTypes: [
            'image/png',
            'image/jpeg',
            'image/gif',
            'image/webp',
            'image/svg+xml',
            'image/avif'
        ]
    })

    if (error) {
        console.error('❌ Error updating bucket:', error.message)
    } else {
        console.log('✅ Bucket updated successfully! Limit: 10MB')
    }
}

updateBucket()
