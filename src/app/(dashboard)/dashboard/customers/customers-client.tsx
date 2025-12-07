"use client"

import { useState } from "react"
import { Plus, Search, MoreHorizontal, Pencil, Trash } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table"
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog"
import {
    Sheet,
    SheetContent,
    SheetHeader,
    SheetTitle,
    SheetDescription,
} from "@/components/ui/sheet"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { Label } from "@/components/ui/label"
import { createCustomer, deleteCustomer, getCustomerDetails } from "@/app/actions/customers"

export function CustomersClient({ initialCustomers }: { initialCustomers: any[] }) {
    const [isOpen, setIsOpen] = useState(false)
    const [isLoading, setIsLoading] = useState(false)
    const [searchTerm, setSearchTerm] = useState("")

    const [detailsOpen, setDetailsOpen] = useState(false)
    const [selectedCustomer, setSelectedCustomer] = useState<any>(null)
    const [customerStats, setCustomerStats] = useState<any>(null)
    const [loadingStats, setLoadingStats] = useState(false)

    // Use passed data instead of mock
    const customers = initialCustomers.filter(c =>
        c.full_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (c.cedula && c.cedula.includes(searchTerm))
    )

    async function handleRowClick(customer: any) {
        setSelectedCustomer(customer)
        setDetailsOpen(true)
        setLoadingStats(true)

        const { customer: fullProfile, stats, history, topProducts, error } = await getCustomerDetails(customer.id)

        if (!error) {
            setCustomerStats({ stats, history, topProducts })
        }
        setLoadingStats(false)
    }

    async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
        event.preventDefault()
        setIsLoading(true)
        const formData = new FormData(event.currentTarget)

        const result = await createCustomer(formData)

        setIsLoading(false)
        if (result.error) {
            alert("Error: " + result.error)
        } else {
            setIsOpen(false)
        }
    }

    async function handleDelete(id: string) {
        if (confirm("Are you sure?")) {
            await deleteCustomer(id)
        }
    }

    return (
        <div className="flex flex-col gap-4">
            <div className="flex items-center justify-between">
                <h1 className="text-lg font-semibold md:text-2xl">Customers</h1>
                <Dialog open={isOpen} onOpenChange={setIsOpen}>
                    <DialogTrigger asChild>
                        <Button className="bg-emerald-600 hover:bg-emerald-700">
                            <Plus className="mr-2 h-4 w-4" /> Add Customer
                        </Button>
                    </DialogTrigger>
                    <DialogContent>
                        <DialogHeader>
                            <DialogTitle>Add New Customer</DialogTitle>
                        </DialogHeader>
                        <form onSubmit={handleSubmit} className="grid gap-4 py-4">
                            <div className="grid gap-2">
                                <Label htmlFor="fullName">Full Name</Label>
                                <Input id="fullName" name="fullName" placeholder="Jane Doe" required />
                            </div>
                            <div className="grid gap-2">
                                <Label htmlFor="cedula">Cédula (ID)</Label>
                                <Input id="cedula" name="cedula" placeholder="12.345.678" />
                            </div>
                            <div className="grid gap-2">
                                <Label htmlFor="phone">Phone Number</Label>
                                <Input id="phone" name="phone" placeholder="(555) 555-5555" />
                            </div>
                            <div className="grid gap-2">
                                <Label htmlFor="email">Email</Label>
                                <Input id="email" name="email" type="email" placeholder="jane@example.com" />
                            </div>
                            <div className="grid gap-2">
                                <Label htmlFor="notes">Notes</Label>
                                <Input id="notes" name="notes" placeholder="VIP, Allergies, etc." />
                            </div>
                            <Button type="submit" className="mt-4 bg-emerald-600" disabled={isLoading}>
                                Save Customer
                            </Button>
                        </form>
                    </DialogContent>
                </Dialog>
            </div>

            <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <div className="relative w-full max-w-sm">
                        <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                        <Input
                            type="search"
                            placeholder="Search customers..."
                            className="pl-8"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>
                </CardHeader>
                <CardContent>
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Client Name</TableHead>
                                <TableHead>Cédula</TableHead>
                                <TableHead>Contact</TableHead>
                                <TableHead>Total Spent</TableHead>
                                <TableHead>Notes</TableHead>
                                <TableHead className="text-right">Actions</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {customers.length === 0 ? (
                                <TableRow>
                                    <TableCell colSpan={6} className="text-center h-24">
                                        No customers found.
                                    </TableCell>
                                </TableRow>
                            ) : (
                                customers.map((customer) => (
                                    <TableRow
                                        key={customer.id}
                                        className="cursor-pointer hover:bg-muted/50"
                                        onClick={() => handleRowClick(customer)}
                                    >
                                        <TableCell className="font-medium">{customer.full_name}</TableCell>
                                        <TableCell>{customer.cedula || "-"}</TableCell>
                                        <TableCell>
                                            <div className="flex flex-col text-xs">
                                                <span>{customer.phone || "-"}</span>
                                                <span className="text-muted-foreground">{customer.email}</span>
                                            </div>
                                        </TableCell>
                                        <TableCell>${Number(customer.total_spent || 0).toFixed(2)}</TableCell>
                                        <TableCell>{customer.notes}</TableCell>
                                        <TableCell className="text-right">
                                            <DropdownMenu>
                                                <DropdownMenuTrigger asChild>
                                                    <Button variant="ghost" className="h-8 w-8 p-0">
                                                        <span className="sr-only">Open menu</span>
                                                        <MoreHorizontal className="h-4 w-4" />
                                                    </Button>
                                                </DropdownMenuTrigger>
                                                <DropdownMenuContent align="end">
                                                    <DropdownMenuLabel>Actions</DropdownMenuLabel>
                                                    <DropdownMenuItem>
                                                        <Pencil className="mr-2 h-4 w-4" /> Edit
                                                    </DropdownMenuItem>
                                                    <DropdownMenuSeparator />
                                                    <DropdownMenuItem onClick={() => handleDelete(customer.id)} className="text-red-600">
                                                        <Trash className="mr-2 h-4 w-4" /> Delete
                                                    </DropdownMenuItem>
                                                </DropdownMenuContent>
                                            </DropdownMenu>
                                        </TableCell>
                                    </TableRow>
                                ))
                            )}
                        </TableBody>
                    </Table>
                </CardContent>
            </Card>

            <Sheet open={detailsOpen} onOpenChange={setDetailsOpen}>
                <SheetContent className="w-[400px] sm:w-[540px] overflow-y-auto">
                    <SheetHeader className="mb-6">
                        <SheetTitle className="text-2xl font-bold text-emerald-800">
                            {selectedCustomer?.full_name}
                        </SheetTitle>
                        <SheetDescription>
                            Customer Details & Analytics
                        </SheetDescription>
                    </SheetHeader>

                    {loadingStats ? (
                        <div className="flex items-center justify-center h-48">
                            <p className="text-muted-foreground animate-pulse">Loading insights...</p>
                        </div>
                    ) : customerStats ? (
                        <div className="space-y-6">
                            {/* Key Metrics */}
                            <div className="grid grid-cols-2 gap-4">
                                <div className="p-4 bg-emerald-50 rounded-lg border border-emerald-100">
                                    <p className="text-xs text-muted-foreground uppercase font-bold">Total Spent</p>
                                    <p className="text-2xl font-bold text-emerald-700">
                                        ${customerStats.stats?.totalSpent.toFixed(2)}
                                    </p>
                                </div>
                                <div className="p-4 bg-blue-50 rounded-lg border border-blue-100">
                                    <p className="text-xs text-muted-foreground uppercase font-bold">Average Order</p>
                                    <p className="text-2xl font-bold text-blue-700">
                                        ${customerStats.stats?.averageOrderValue.toFixed(2)}
                                    </p>
                                </div>
                                <div className="p-4 bg-orange-50 rounded-lg border border-orange-100">
                                    <p className="text-xs text-muted-foreground uppercase font-bold">Total Orders</p>
                                    <p className="text-2xl font-bold text-orange-700">
                                        {customerStats.stats?.orderCount}
                                    </p>
                                </div>
                                <div className="p-4 bg-gray-50 rounded-lg border border-gray-100">
                                    <p className="text-xs text-muted-foreground uppercase font-bold">Last Active</p>
                                    <p className="text-lg font-bold text-gray-700">
                                        {customerStats.history?.[0]
                                            ? new Date(customerStats.history[0].created_at).toLocaleDateString()
                                            : "N/A"
                                        }
                                    </p>
                                </div>
                            </div>

                            <Separator />

                            {/* Top Products */}
                            <div>
                                <h3 className="text-lg font-semibold mb-3 flex items-center gap-2">
                                    <Badge variant="secondary" className="rounded-full">★</Badge>
                                    Top Products
                                </h3>
                                <div className="space-y-3">
                                    {customerStats.topProducts?.length === 0 ? (
                                        <p className="text-sm text-muted-foreground">No purchases yet.</p>
                                    ) : (
                                        customerStats.topProducts?.map((product: any, idx: number) => (
                                            <div key={idx} className="flex items-center justify-between p-2 rounded hover:bg-muted/50 transition-colors">
                                                <div className="flex items-center gap-3">
                                                    <div className="h-8 w-8 bg-muted rounded flex items-center justify-center text-xs font-bold overflow-hidden">
                                                        {product.image ? (
                                                            <img src={product.image} className="w-full h-full object-cover" />
                                                        ) : (
                                                            product.name.charAt(0)
                                                        )}
                                                    </div>
                                                    <div>
                                                        <p className="text-sm font-medium">{product.name}</p>
                                                        <p className="text-xs text-muted-foreground">{product.count} units purchased</p>
                                                    </div>
                                                </div>
                                                <span className="font-bold text-sm bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded-full">
                                                    ${product.spent.toFixed(2)}
                                                </span>
                                            </div>
                                        ))
                                    )}
                                </div>
                            </div>

                            <Separator />

                            {/* Recent History */}
                            <div>
                                <h3 className="text-lg font-semibold mb-3">Order History</h3>
                                <ScrollArea className="h-[200px] rounded-md border p-2">
                                    <div className="space-y-2">
                                        {customerStats.history?.map((order: any) => (
                                            <div key={order.id} className="flex items-center justify-between p-2 border-b last:border-0">
                                                <div>
                                                    <p className="text-sm font-bold">Order #{order.id.slice(0, 8)}</p>
                                                    <p className="text-xs text-muted-foreground">
                                                        {new Date(order.created_at).toLocaleDateString()} at {new Date(order.created_at).toLocaleTimeString()}
                                                    </p>
                                                </div>
                                                <div className="text-right">
                                                    <p className="font-bold text-emerald-600">${order.total_amount.toFixed(2)}</p>
                                                    <Badge variant="outline" className="text-[10px] h-5">{order.payment_method}</Badge>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </ScrollArea>
                            </div>
                        </div>
                    ) : null}
                </SheetContent>
            </Sheet>
        </div >
    )
}
