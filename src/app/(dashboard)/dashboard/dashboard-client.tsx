"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table"
import { DollarSign, ShoppingCart, RefreshCcw, CalendarCheck, AlertTriangle } from "lucide-react"
import { OverviewChart } from "@/components/dashboard/overview-chart"
import { useLanguage } from "@/providers/language-provider"

export function DashboardClient({ stats }: { stats: any }) {
    const { t } = useLanguage()

    // Safety checks
    const chartData = stats?.chartData || []
    const recentOrders = stats?.recentOrders || []
    const totalSales = stats?.totalSales || 0
    const totalOrders = stats?.totalOrders || 0

    return (
        <div className="flex flex-col gap-4">
            <div className="flex items-center justify-between">
                <h1 className="text-lg font-semibold md:text-2xl">{t.dashboard}</h1>
            </div>

            {/* STATS CARDS */}
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                {/* Total Sales */}
                <Card className="cursor-pointer hover:shadow-md transition-all">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">{t.total_sales}</CardTitle>
                        <div className="h-8 w-8 rounded-full bg-cyan-100 flex items-center justify-center text-cyan-600">
                            <DollarSign className="h-4 w-4" />
                        </div>
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">${totalSales.toFixed(2)}</div>
                        <p className="text-xs text-muted-foreground">+20.1% from last month</p>
                    </CardContent>
                </Card>

                {/* Total Orders */}
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">{t.total_orders}</CardTitle>
                        <div className="h-8 w-8 rounded-full bg-pink-100 flex items-center justify-center text-pink-600">
                            <ShoppingCart className="h-4 w-4" />
                        </div>
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{totalOrders}</div>
                        <p className="text-xs text-muted-foreground">+180.1% from last month</p>
                    </CardContent>
                </Card>

                {/* Sales Return (Dynamically Linked) */}
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">{t.sales_return}</CardTitle>
                        <div className="h-8 w-8 rounded-full bg-blue-100 flex items-center justify-center text-blue-600">
                            <RefreshCcw className="h-4 w-4" />
                        </div>
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{stats?.cancelledCount || 0}</div>
                        <p className="text-xs text-muted-foreground">Orders Cancelled / Returned</p>
                    </CardContent>
                </Card>

                {/* Low Stock Alerts (Replaces Reservations) */}
                <Card className={stats?.lowStockCount && stats.lowStockCount > 0 ? "border-orange-500/50 bg-orange-50/10" : ""}>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">{t.low_stock}</CardTitle>
                        <div className={`h-8 w-8 rounded-full flex items-center justify-center ${stats?.lowStockCount && stats.lowStockCount > 0 ? "bg-orange-100 text-orange-600" : "bg-emerald-100 text-emerald-600"}`}>
                            {stats?.lowStockCount && stats.lowStockCount > 0 ? <AlertTriangle className="h-4 w-4" /> : <CalendarCheck className="h-4 w-4" />}
                        </div>
                    </CardHeader>
                    <CardContent>
                        <div className={`text-2xl font-bold ${stats?.lowStockCount && stats.lowStockCount > 0 ? "text-orange-600" : ""}`}>
                            {stats?.lowStockCount || 0}
                        </div>
                        <p className="text-xs text-muted-foreground">Products with stock ≤ 40</p>
                    </CardContent>
                </Card>
            </div>

            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">

                {/* CHART SECTION (Now Client Component) */}
                <OverviewChart data={chartData} />

                <Card className="col-span-3">
                    <CardHeader>
                        <CardTitle>{t.top_selling}</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-4">
                            {stats?.topSelling?.length === 0 ? (
                                <p className="text-sm text-muted-foreground text-center py-8">No sales yet.</p>
                            ) : (
                                stats?.topSelling?.map((product: any, idx: number) => (
                                    <div key={idx} className="flex items-center">
                                        <div className="h-9 w-9 rounded-full bg-muted flex items-center justify-center overflow-hidden border">
                                            {product.image ? (
                                                <img src={product.image} alt={product.name} className="h-full w-full object-cover" />
                                            ) : (
                                                <span className="text-xs font-bold">{product.name.charAt(0)}</span>
                                            )}
                                        </div>
                                        <div className="ml-4 space-y-1">
                                            <p className="text-sm font-medium leading-none">{product.name}</p>
                                            <p className="text-xs text-muted-foreground">
                                                {product.count} sales
                                            </p>
                                        </div>
                                        <div className="ml-auto font-medium text-sm">
                                            +${product.revenue.toFixed(2)}
                                        </div>
                                    </div>
                                ))
                            )}
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* RECENT ORDERS TABLE */}
            <Card>
                <CardHeader>
                    <CardTitle>{t.recent_orders}</CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="max-h-[400px] overflow-y-auto relative">
                        <Table>
                            <TableHeader className="sticky top-0 bg-background z-10 shadow-sm">
                                <TableRow>
                                    <TableHead>{t.order_id}</TableHead>
                                    <TableHead>{t.customer}</TableHead>
                                    <TableHead>{t.type}</TableHead>
                                    <TableHead>{t.status}</TableHead>
                                    <TableHead className="text-right">{t.amount}</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {recentOrders.length === 0 ? (
                                    <TableRow>
                                        <TableCell colSpan={5} className="text-center h-24">No orders yet.</TableCell>
                                    </TableRow>
                                ) : (
                                    recentOrders.map((order: any) => (
                                        <TableRow key={order.id}>
                                            <TableCell className="font-medium">#{order.id.slice(0, 7)}</TableCell>
                                            <TableCell>{order.customers?.full_name || "Walk-in"}</TableCell>
                                            <TableCell>{order.payment_method}</TableCell>
                                            <TableCell>
                                                <Badge className={
                                                    order.status === "CANCELLED" ? "bg-red-500 hover:bg-red-600" :
                                                        order.status === "PENDING" ? "bg-yellow-500 hover:bg-yellow-600" :
                                                            "bg-emerald-500 hover:bg-emerald-600"
                                                }>
                                                    {order.status === "COMPLETED" ? t.completed :
                                                        order.status === "CANCELLED" ? t.cancelled : t.pending}
                                                </Badge>
                                            </TableCell>
                                            <TableCell className="text-right">${Number(order.total_amount).toFixed(2)}</TableCell>
                                        </TableRow>
                                    ))
                                )}
                            </TableBody>
                        </Table>
                    </div>
                </CardContent>
            </Card>
        </div>
    )
}
