"use server"

import { createClient } from "@supabase/supabase-js"
import { startOfDay, endOfDay, startOfWeek, endOfWeek, startOfMonth, endOfMonth, subDays, format } from "date-fns"

export type ReportRange = "today" | "week" | "month"

export async function getSalesReport(range: ReportRange) {
    console.log(`[getSalesReport] Starting report for range: ${range}`)

    try {
        const url = process.env.NEXT_PUBLIC_SUPABASE_URL
        const key = process.env.SUPABASE_SERVICE_ROLE_KEY

        if (!url || !key) {
            console.error("[getSalesReport] Missing Env Vars:", { url: !!url, key: !!key })
            return { error: "Server Configuration Error: Missing Supabase Keys" }
        }

        const adminDb = createClient(url, key, {
            auth: {
                persistSession: false,
                autoRefreshToken: false,
                detectSessionInUrl: false
            }
        })

        // 1. Determine Date Range
        const now = new Date()
        let startDate: Date
        let endDate = endOfDay(now)

        switch (range) {
            case "today":
                startDate = startOfDay(now)
                break
            case "week":
                startDate = startOfWeek(now, { weekStartsOn: 1 })
                break
            case "month":
                startDate = startOfMonth(now)
                break
            default:
                startDate = startOfDay(now)
        }

        console.log(`[getSalesReport] Querying from ${startDate.toISOString()} to ${endDate.toISOString()}`)

        // 2. Query Orders (WITHOUT JOIN)
        // We fetch user_id directly to avoid "Could not find a relationship" error
        const { data: orders, error } = await adminDb
            .from("orders")
            .select(`
                id, total_amount, created_at, status, payment_method, user_id
            `)
            // .eq("status", "COMPLETED") <-- REMOVED to show all in table
            .gte("created_at", startDate.toISOString())
            .lte("created_at", endDate.toISOString())
            .order("created_at", { ascending: true }) // Ascending for Chart

        if (error) {
            console.error("[getSalesReport] Database Error:", error)
            return { error: `Database Error: ${error.message}` }
        }

        console.log(`[getSalesReport] Found ${orders?.length} orders`)

        // 2.5. FETCH PROFILES MANUALLY (Manual Join)
        // Collect all unique user_ids
        const userIds = Array.from(new Set(orders.map(o => o.user_id).filter(Boolean))) as string[]

        const profileMap = new Map<string, string>() // id -> full_name

        if (userIds.length > 0) {
            const { data: profiles, error: profilesError } = await adminDb
                .from("profiles")
                .select("id, full_name")
                .in("id", userIds)

            if (profilesError) {
                console.error("[getSalesReport] Profile Fetch Error:", profilesError)
                // Continue without profiles if this fails
            } else {
                profiles?.forEach(p => {
                    profileMap.set(p.id, p.full_name || "Staff")
                })
            }
        }

        // Attach profile names to orders in memory
        const enrichedOrders = orders.map(order => ({
            ...order,
            profiles: {
                full_name: profileMap.get(order.user_id) || "Administrador / Sistema"
            }
        }))

        // FILTER FOR METRICS (Only Completed)
        const validOrders = enrichedOrders.filter(o => o.status === "COMPLETED")

        // 3. Aggregate Metrics
        const totalSales = validOrders.reduce((sum, o) => sum + (o.total_amount || 0), 0)
        const orderCount = validOrders.length
        const averageTicket = orderCount > 0 ? totalSales / orderCount : 0

        // 4. Prepare Chart Data (Sales over Time)
        // Structure: { name: "Label", sales: 123 }
        const chartDataMap = new Map<string, number>()

        validOrders.forEach(order => {
            const date = new Date(order.created_at)
            let label = ""

            if (range === "today") {
                label = format(date, "HH:00") // 14:00
            } else if (range === "week") {
                label = format(date, "EEE") // Mon, Tue
            } else {
                label = format(date, "dd MMM") // 12 Dec
            }

            const current = chartDataMap.get(label) || 0
            chartDataMap.set(label, current + order.total_amount)
        })

        const salesTrend = Array.from(chartDataMap.entries()).map(([name, sales]) => ({
            name,
            sales
        }))

        // 5. Cashier Performance
        const cashierMap = new Map<string, number>()

        validOrders.forEach(order => {
            const cashierName = order.profiles.full_name
            const current = cashierMap.get(cashierName) || 0
            cashierMap.set(cashierName, current + order.total_amount)
        })

        const salesByCashier = Array.from(cashierMap.entries())
            .map(([name, value]) => ({ name, value }))
            .sort((a, b) => b.value - a.value)

        return {
            metrics: {
                totalSales,
                orderCount,
                averageTicket
            },
            charts: {
                salesTrend,
                salesByCashier
            },
            rawOrders: enrichedOrders // Return ALL orders for the table, including Cancelled
        }
    } catch (e: any) {
        console.error("[getSalesReport] CRITICAL ERROR:", e)
        return { error: `Server Exception: ${e.message || "Unknown error"}` }
    }
}
