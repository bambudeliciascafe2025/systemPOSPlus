"use server"

import { createClient } from "@supabase/supabase-js"
import { revalidatePath } from "next/cache"

// Lazy Init Admin Client
function getAdminDb() {
    return createClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.SUPABASE_SERVICE_ROLE_KEY!,
        {
            auth: {
                autoRefreshToken: false,
                persistSession: false,
            },
        }
    )
}

export async function getStaffUsers() {
    const supabaseAdmin = getAdminDb()
    const { data, error } = await supabaseAdmin
        .from("profiles")
        .select("*")
        .select("*")
    // .order("created_at", { ascending: false })

    if (error) throw error
    return data
}

import { requireRole } from "@/lib/auth-checks"

export async function createStaffUser(formData: FormData) {
    await requireRole(["admin", "manager"])
    const email = formData.get("email") as string
    const password = formData.get("password") as string
    const fullName = formData.get("fullName") as string
    const role = formData.get("role") as string

    if (!email || !password || !fullName || !role) {
        return { error: "All fields are required" }
    }

    try {
        const supabaseAdmin = getAdminDb()

        // 1. Create User in Supabase Auth
        const { data: userData, error: userError } = await supabaseAdmin.auth.admin.createUser({
            email,
            password,
            email_confirm: true, // Auto confirm
            user_metadata: {
                full_name: fullName,
            },
        })

        if (userError) throw userError

        // 2. Update Profile with Role
        const { error: profileError } = await supabaseAdmin
            .from("profiles")
            .update({ role: role })
            .eq("id", userData.user.id)

        if (profileError) throw profileError

        revalidatePath("/dashboard/staff")
        return { success: true }

    } catch (error: any) {
        console.error("Error creating staff:", error)
        return { error: error.message }
    }
}
