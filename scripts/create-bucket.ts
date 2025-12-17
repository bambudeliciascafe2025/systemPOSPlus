
import { createClient } from '@supabase/supabase-js'
import dotenv from 'dotenv'

dotenv.config({ path: '.env.local' })

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY!

const supabase = createClient(supabaseUrl, supabaseKey)

async function createBucket() {
    console.log('Attempting to create "products" bucket...')

    const { data, error } = await supabase.storage.createBucket('products', {
        public: true, // IMPORTANT: Images must be publicly accessible
        fileSizeLimit: 1024 * 1024 * 2, // 2MB
        allowedMimeTypes: ['image/png', 'image/jpeg', 'image/gif', 'image/webp']
    })

    if (error) {
        console.error('Error creating bucket:', error.message)
        return
    }

    console.log('Bucket "products" created successfully!')
}

createBucket()
