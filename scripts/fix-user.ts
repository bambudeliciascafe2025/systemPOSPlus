
import { createClient } from '@supabase/supabase-js'
import dotenv from 'dotenv'
dotenv.config({ path: '.env.local' })

const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
)

async function fixUser() {
    const email = 'ezequielrodriguez1991@gmail.com'

    const { data: { users }, error } = await supabase.auth.admin.listUsers()
    if (error) return console.error(error)

    const user = users.find(u => u.email === email)

    if (!user) {
        console.log(`User ${email} NOT FOUND`)
        return
    }

    console.log(`User found: ${user.id}`)
    console.log(`Confirmed at: ${user.email_confirmed_at}`)

    if (!user.email_confirmed_at) {
        console.log("User is NOT confirmed. Confirming now...")
        const { data, error: updateError } = await supabase.auth.admin.updateUserById(
            user.id,
            { email_confirm: true }
        )

        if (updateError) {
            console.error("Failed to confirm user:", updateError)
        } else {
            console.log("User confirmed successfully!", data.user.email_confirmed_at)
        }
    } else {
        console.log("User is already confirmed.")
    }

    // Also verify profile role
    const { data: profile } = await supabase
        .from('profiles')
        .select('role')
        .eq('id', user.id)
        .single()

    console.log("Profile Role:", profile?.role)
}

fixUser()
