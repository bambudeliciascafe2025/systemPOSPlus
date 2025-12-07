"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import {
    LayoutDashboard,
    ShoppingBasket,
    Package,
    ClipboardList,
    CalendarDays,
    Users,
    Settings,
    LifeBuoy,
    LogOut
} from "lucide-react"

import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"

const sidebarItems = [
    { icon: LayoutDashboard, label: "Dashboard", href: "/dashboard" },
    { icon: ShoppingBasket, label: "POS", href: "/dashboard/pos" },
    { icon: Package, label: "Products", href: "/dashboard/products" },
    { icon: Package, label: "Categories", href: "/dashboard/categories" },
    { icon: ClipboardList, label: "Stock", href: "/dashboard/stock" }, // Restored
    { icon: ClipboardList, label: "Orders", href: "/dashboard/orders" },
    { icon: CalendarDays, label: "Reservation", href: "/dashboard/reservation" },
    { icon: Users, label: "Staff", href: "/dashboard/staff" },
    { icon: Users, label: "Customers", href: "/dashboard/customers" }, // Added Customers
    { icon: Settings, label: "System Settings", href: "/dashboard/settings" },
]

import { logout } from "@/app/actions/auth"

export function Sidebar({ role = "cashier" }: { role?: string }) {
    const pathname = usePathname()

    const filteredItems = sidebarItems.filter(item => {
        // Cashiers only see: Dashboard, POS, Orders, Reservation, Customers
        // Exclude: Products, Categories, Stock, Staff, Settings
        if (role === "cashier") {
            const allowed = ["/dashboard", "/dashboard/pos", "/dashboard/orders", "/dashboard/reservation", "/dashboard/customers"]
            return allowed.includes(item.href)
        }
        // Managers/Admins see everything
        return true
    })

    return (
        <div className="flex h-full max-h-screen flex-col gap-2 border-r bg-background w-[240px]">
            <div className="flex h-16 items-center border-b px-6">
                <Link href="/dashboard" className="flex items-center gap-2 font-bold">
                    <div className="bg-emerald-600 text-white rounded-full p-1">
                        <ShoppingBasket className="h-5 w-5" />
                    </div>
                    <span className="text-xl tracking-tight">HotPOS</span>
                </Link>
            </div>

            <div className="flex-1 overflow-auto py-4 px-3">
                <nav className="grid items-start gap-2 px-2 text-sm font-medium">
                    {filteredItems.map((item, index) => (
                        <Link
                            key={index}
                            href={item.href}
                            className={cn(
                                "group flex items-center gap-3 rounded-lg px-3 py-2.5 transition-all hover:bg-emerald-50 text-muted-foreground hover:text-emerald-600",
                                pathname === item.href && "bg-emerald-50 text-emerald-600 font-semibold"
                            )}
                        >
                            <item.icon className="h-5 w-5" />
                            {item.label}
                        </Link>
                    ))}
                </nav>
            </div>

            <div className="mt-auto p-4 border-t">
                <div className="mb-2 px-2 text-xs text-muted-foreground uppercase font-bold tracking-wider">
                    Role: {role}
                </div>
                <Button
                    variant="ghost"
                    className="w-full justify-start gap-3 text-muted-foreground hover:text-red-500 hover:bg-red-50"
                    onClick={() => logout()}
                >
                    <LogOut className="h-5 w-5" />
                    Logout
                </Button>
            </div>
        </div>
    )
}
