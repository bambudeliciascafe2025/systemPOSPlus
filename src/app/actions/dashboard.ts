"use server"

import { createClient } from "@/lib/supabase/server"

export async function getDashboardStats() {
    const supabase = await createClient()

    try {
        // 1. Total Sales & Count
        const { data: orders, error: ordersError } = await supabase
            .from("orders")
            .select("total_amount, created_at, status")
            .eq("status", "COMPLETED")

        if (ordersError) throw ordersError

        // SAFEGUARD: orders might be null
        const safeOrders = orders || []

        const totalSales = safeOrders.reduce((sum, order) => sum + Number(order.total_amount), 0)
        const totalOrders = safeOrders.length

        // 2. Recent Orders
        const { data: recentOrders, error: recentError } = await supabase
            .from("orders")
            .select("*, customers(full_name)")
            .order("created_at", { ascending: false })
            .limit(50) // Increased to 50 to allow scrollable list on dashboard

        if (recentError) throw recentError

        const safeRecentOrders = recentOrders || []

        // 3. Chart Data (Last 7 Days)
        // Group orders by day. simple JS aggregation.
        const chartDataMap = new Map<string, number>()
        const days = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"]
        const today = new Date()

        // Initialize last 7 days with 0/
        for (let i = 6; i >= 0; i--) {
            const d = new Date(today)
            d.setDate(d.getDate() - i)
            const dayName = days[d.getDay()]
            chartDataMap.set(dayName, 0) // Basic keying by name, might duplicate if crossing weeks but simple for MVP
        }

        safeOrders.forEach(order => {
            const d = new Date(order.created_at)
            const dayName = days[d.getDay()]
            if (chartDataMap.has(dayName)) {
                chartDataMap.set(dayName, (chartDataMap.get(dayName) || 0) + Number(order.total_amount))
            }
        })

        const chartData = Array.from(chartDataMap).map(([name, total]) => ({ name, total }))

        // 4. Top Selling Items
        const { data: allOrderItems, error: itemsError } = await supabase
            .from("order_items")
            .select(`
                quantity,
                unit_price,
                products ( name, image_url )
            `)

        let topSelling: any[] = []

        if (!itemsError && allOrderItems) {
            const productStats = new Map<string, { name: string, image: string, count: number, revenue: number }>()

            allOrderItems.forEach((item: any) => {
                if (!item.products) return

                const key = item.products.name
                const stats = productStats.get(key) || {
                    name: item.products.name,
                    image: item.products.image_url,
                    count: 0,
                    revenue: 0
                }

                stats.count += item.quantity
                stats.revenue += (item.quantity * item.unit_price)
                productStats.set(key, stats)
            })

            topSelling = Array.from(productStats.values())
                .sort((a, b) => b.count - a.count)
                .slice(0, 5)
        }

        // 5. Sales Returns (Cancelled Orders)
        const { count: cancelledCount, error: cancelledError } = await supabase
            .from("orders")
            .select("*", { count: 'exact', head: true })
            .eq("status", "CANCELLED")

        // 6. Low Stock Alerts (Stock <= 40 as per user request)
        const { count: lowStockCount, error: lowStockError } = await supabase
            .from("products")
            .select("*", { count: 'exact', head: true })
            .lte("stock", 40)

        return {
            totalSales,
            totalOrders,
            recentOrders: safeRecentOrders,
            chartData,
            topSelling,
            cancelledCount: cancelledCount || 0,
            lowStockCount: lowStockCount || 0
        }

    } catch (e: any) {
        console.error("Dashboard Stats Error:", e)
        return null
    }
}
