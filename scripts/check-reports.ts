
import { createClient } from "@supabase/supabase-js"
import dotenv from "dotenv"
import path from "path"

// Load env from root
dotenv.config({ path: path.resolve(process.cwd(), ".env.local") })

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!

const supabase = createClient(supabaseUrl, supabaseServiceKey)

async function checkReports() {
    console.log("--- Checking Reports Data ---")

    // 1. Check Time
    const now = new Date()
    console.log("Current Server Time (Local Node):", now.toString())
    console.log("Current Server Time (ISO):", now.toISOString())

    // 2. Fetch Recent Orders
    const { data: orders, error } = await supabase
        .from("orders")
        .select("id, created_at, status, total_amount, user_id")
        .order("created_at", { ascending: false })
        .limit(10)

    if (error) {
        console.error("Error fetching orders:", error)
        return
    }

    console.log(`Found ${orders?.length} recent orders:`)
    orders?.forEach(o => {
        console.log(`[${o.created_at}] ID: ${o.id.slice(0, 6)}... | Status: ${o.status} | Amt: ${o.total_amount}`)
    })

    // 3. Test "Today" Query Logic
    const startOfToday = new Date()
    startOfToday.setHours(0, 0, 0, 0)

    const endOfToday = new Date()
    endOfToday.setHours(23, 59, 59, 999)

    console.log("\n--- Testing Today's Query Range ---")
    console.log("Start:", startOfToday.toISOString())
    console.log("End:  ", endOfToday.toISOString())

    const { count, error: countError } = await supabase
        .from("orders")
        .select("*", { count: 'exact', head: true })
        .eq("status", "COMPLETED")
        .gte("created_at", startOfToday.toISOString())
        .lte("created_at", endOfToday.toISOString())

    if (countError) {
        console.error("Count Error:", countError)
    } else {
        console.log(`\nOrders matching 'Today' logic: ${count}`)
    }
}

checkReports()
