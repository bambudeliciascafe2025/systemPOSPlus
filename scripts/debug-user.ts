
import { createClient } from '@supabase/supabase-js'
import dotenv from 'dotenv'
dotenv.config({ path: '.env.local' })

const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
)

async function checkUser() {
    const email = 'ezequielrodriguez1991@gmail.com'

    // Check Auth User
    const { data: { users }, error } = await supabase.auth.admin.listUsers()
    if (error) {
        console.error('Error listing users:', error)
        return
    }

    const user = users.find(u => u.email === email)

    if (!user) {
        console.log(`User ${email} NOT FOUND in auth.users`)
    } else {
        console.log(`User found in auth.users:`)
        console.log(`- ID: ${user.id}`)
        console.log(`- Email: ${user.email}`)
        console.log(`- Confirmed at: ${user.email_confirmed_at}`)
        console.log(`- Last My Sign In: ${user.last_sign_in_at}`)
        console.log(`- Metadata:`, user.user_metadata)

        // Check Profile
        const { data: profile, error: profileError } = await supabase
            .from('profiles')
            .select('*')
            .eq('id', user.id)
            .single()

        if (profileError) {
            console.log('Error fetching profile:', profileError.message)
        } else {
            console.log('Profile found:', profile)
        }
    }
}

checkUser()
