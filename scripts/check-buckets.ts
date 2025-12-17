
import { createClient } from '@supabase/supabase-js'
import dotenv from 'dotenv'

dotenv.config({ path: '.env.local' })

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY! // Use service role to see everything

const supabase = createClient(supabaseUrl, supabaseKey)

async function checkBuckets() {
    const { data, error } = await supabase.storage.listBuckets()

    if (error) {
        console.error('Error fetching buckets:', error.message)
        return
    }

    console.log('Existing Buckets:', data.map(b => b.name))

    const hasProducts = data.some(b => b.name === 'products')
    console.log('Has "products" bucket?', hasProducts)
}

checkBuckets()
