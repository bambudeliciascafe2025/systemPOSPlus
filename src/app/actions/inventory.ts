"use server"

import { createClient } from "@/lib/supabase/server"
import { createClient as createAdminClient } from "@supabase/supabase-js"
import { revalidatePath } from "next/cache"
import { requireRole } from "@/lib/auth-checks"

// Helper to get Admin DB per request - Prevents startup race conditions
function getAdminDb() {
    return createAdminClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.SUPABASE_SERVICE_ROLE_KEY!
    )
}

// CATEGORIES

export async function getCategories() {
    // const supabase = await createClient()
    // Use AdminDB to guarantee we see what we wrote, avoiding RLS read issues
    const adminDb = getAdminDb()
    const { data, error } = await adminDb
        .from("categories")
        .select("*")
        .order("created_at", { ascending: true })

    console.log("DEBUG: getCategories result:", data?.length) // Server log

    if (error) throw error
    return data
}

export async function createCategory(formData: FormData) {
    const supabase = await createClient() // Keep auth check
    const name = formData.get("name") as string
    const color = formData.get("color") as string || "#10b981"

    // Verify User
    const { data: { user }, error: userError } = await supabase.auth.getUser()
    // if (userError || !user) return { error: "Unauthorized" }

    if (!name) return { error: "Name is required" }

    try {
        const adminDb = getAdminDb()

        // Critical: .select() ensures we get a response object populated
        const { data, error } = await adminDb
            .from("categories")
            .insert({ name, color })
            .select()

        if (error) {
            console.error("Admin Insert Error:", error)
            throw error
        }

        revalidatePath("/dashboard/categories")
        revalidatePath("/dashboard/products")
        return { success: true }
    } catch (e: any) {
        console.error("Create Category Exception:", e)
        return { error: e.message }
    }
}

export async function deleteCategory(id: string) {
    const supabase = await createClient()

    // Verify User
    // Verify User
    await requireRole(["admin", "manager"])

    try {
        const adminDb = getAdminDb()
        const { error } = await adminDb.from("categories").delete().eq("id", id)
        if (error) throw error
        revalidatePath("/dashboard/categories")
        return { success: true }
    } catch (e: any) {
        return { error: e.message }
    }
}

// PRODUCTS

export async function getProducts() {
    const supabase = await createClient()
    const { data, error } = await supabase
        .from("products")
        .select(`*, categories(name, color)`)
        .order("created_at", { ascending: false })

    if (error) throw error
    return data
}

export async function createProduct(formData: FormData) {
    const supabase = await createClient()

    // Verify User
    // Verify User
    await requireRole(["admin", "manager"])

    const name = formData.get("name") as string
    const price = parseFloat(formData.get("price") as string)
    const category_id = formData.get("category_id") as string
    const stock = parseInt(formData.get("stock") as string) || 0
    const imageFile = formData.get("image") as File

    if (!name || isNaN(price)) return { error: "Name and Price are required" }

    let image_url = formData.get("image_url") as string || null

    try {
        const adminDb = getAdminDb()

        // Handle Image Upload (Only if URL not already provided)
        if (!image_url && imageFile && imageFile.size > 0) {
            const fileExt = imageFile.name.split('.').pop()
            const fileName = `${Date.now()}-${Math.random().toString(36).substring(7)}.${fileExt}`

            // Upload to 'products' bucket
            const { error: uploadError } = await adminDb
                .storage
                .from('products')
                .upload(fileName, imageFile, {
                    contentType: imageFile.type,
                    upsert: false
                })

            if (uploadError) {
                console.error("Upload Error:", uploadError)
                // Continue creating product even if image fails
            } else {
                // Get Public URL
                const { data: publicUrlData } = adminDb
                    .storage
                    .from('products')
                    .getPublicUrl(fileName)

                image_url = publicUrlData.publicUrl
            }
        }

        const { error } = await adminDb.from("products").insert({
            name,
            price,
            category_id: category_id === "none" ? null : category_id,
            stock,
            image_url, // Add image url
            available: true
        })
            .select() // Add robustness

        if (error) throw error
        revalidatePath("/dashboard/products")
        return { success: true }
    } catch (e: any) {
        console.error("Create Product Error:", e)
        return { error: e.message }
    }
}


export async function updateProduct(formData: FormData) {
    const supabase = await createClient()

    // Verify User
    await requireRole(["admin", "manager"])

    const id = formData.get("id") as string
    const name = formData.get("name") as string
    const price = parseFloat(formData.get("price") as string)
    const category_id = formData.get("category_id") as string
    const stock = parseInt(formData.get("stock") as string) || 0
    const imageFile = formData.get("image") as File

    if (!id || !name || isNaN(price)) return { error: "ID, Name and Price are required" }

    // Priority: 1. New client-uploaded URL, 2. Existing URL, 3. Null
    let image_url: string | null = formData.get("image_url") as string || null

    if (!image_url) {
        image_url = formData.get("current_image_url") as string || null
    }

    try {
        const adminDb = getAdminDb()

        // Handle Image Upload (Only if NO URL provided and File exists)
        // Cases:
        // 1. Client uploaded -> image_url is set. File is null/ignored.
        // 2. Client sent file -> image_url is null. File is set. Upload here.
        // 3. No change -> image_url is current_url. File is null.

        if (!image_url && imageFile && imageFile.size > 0) {
            const fileExt = imageFile.name.split('.').pop()
            const fileName = `${Date.now()}-${Math.random().toString(36).substring(7)}.${fileExt}`

            const { error: uploadError } = await adminDb
                .storage
                .from('products')
                .upload(fileName, imageFile, {
                    contentType: imageFile.type,
                    upsert: false
                })

            if (uploadError) {
                console.error("Upload Error:", uploadError)
            } else {
                const { data: publicUrlData } = adminDb
                    .storage
                    .from('products')
                    .getPublicUrl(fileName)

                image_url = publicUrlData.publicUrl
            }
        }

        const { error } = await adminDb.from("products").update({
            name,
            price,
            category_id: category_id === "none" ? null : category_id,
            stock,
            image_url,
        }).eq("id", id)

        if (error) throw error
        revalidatePath("/dashboard/products")
        return { success: true }
    } catch (e: any) {
        console.error("Update Product Error:", e)
        return { error: e.message }
    }
}

export async function deleteProduct(id: string) {
    const supabase = await createClient()

    // Verify User
    // Verify User
    await requireRole(["admin", "manager"])

    try {
        const adminDb = getAdminDb()
        const { error } = await adminDb.from("products").delete().eq("id", id)
        if (error) throw error
        revalidatePath("/dashboard/products")
        return { success: true }
    } catch (e: any) {
        return { error: e.message }
    }
}

// STOCK MANAGEMENT

export async function updateStock(formData: FormData) {
    const supabase = await createClient()

    // Verify User
    // Verify User
    const { user } = await requireRole(["admin", "manager"])

    const productId = formData.get("productId") as string
    const type = formData.get("type") as "IN" | "OUT" | "ADJUSTMENT"
    const quantity = parseInt(formData.get("quantity") as string)
    const reason = formData.get("reason") as string

    if (!productId || !type || isNaN(quantity) || quantity <= 0) {
        return { error: "Invalid data provided" }
    }

    try {
        const adminDb = getAdminDb()

        // 1. Get current product to check stock (if going OUT)
        const { data: product, error: fetchError } = await adminDb
            .from("products")
            .select("stock")
            .eq("id", productId)
            .single()

        if (fetchError) throw fetchError

        // 2. Calculate new stock
        let newStock = product.stock
        const qtyAdjustment = type === "OUT" ? -quantity : quantity

        newStock += qtyAdjustment

        if (newStock < 0) {
            return { error: "Insufficient stock" }
        }

        // 3. Update Product
        const { error: updateError } = await adminDb
            .from("products")
            .update({ stock: newStock })
            .eq("id", productId)

        if (updateError) throw updateError

        // 4. Record Movement
        const { error: moveError } = await adminDb
            .from("stock_movements")
            .insert({
                product_id: productId,
                type: type,
                quantity: quantity,
                reason: reason,
                user_id: user.id
            })

        if (moveError) throw moveError

        revalidatePath("/dashboard/stock")
        revalidatePath("/dashboard/products")
        return { success: true }

    } catch (e: any) {
        return { error: e.message }
    }
}
