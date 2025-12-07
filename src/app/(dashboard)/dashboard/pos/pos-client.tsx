"use client"

import { useState, useMemo } from "react"
import { Search, ShoppingCart, Plus, Minus, CreditCard, Banknote, User } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { Label } from "@/components/ui/label"
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogFooter,
} from "@/components/ui/dialog"
import { createOrder } from "@/app/actions/pos"
import { getCustomerByCedula } from "@/app/actions/customers"
import { useToast } from "@/hooks/use-toast"
import { cn } from "@/lib/utils"
import { useOffline } from "@/providers/offline-context"

export function POSInterface({ initialProducts, categories }: { initialProducts: any[], categories: any[] }) {
    const { toast } = useToast()
    const [cart, setCart] = useState<any[]>([])
    const [searchTerm, setSearchTerm] = useState("")
    const [activeCategory, setActiveCategory] = useState<string>("all")
    const [isCheckoutOpen, setIsCheckoutOpen] = useState(false)
    const [isProcessing, setIsProcessing] = useState(false)
    const [paymentMethod, setPaymentMethod] = useState("CASH")

    // Customer State
    const [cedula, setCedula] = useState("")
    const [customer, setCustomer] = useState<any>(null)
    const [isSearching, setIsSearching] = useState(false)

    async function handleSearchCustomer(term: string) {
        setCedula(term)
        if (term.length < 5) {
            setCustomer(null)
            return
        }

        setIsSearching(true)
        const { customer, error } = await getCustomerByCedula(term)
        setIsSearching(false)

        if (customer) {
            setCustomer(customer)
        } else {
            setCustomer(null)
        }
    }

    // Filter Products
    const filteredProducts = useMemo(() => {
        return initialProducts.filter(p => {
            const matchesSearch = p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                (p.sku && p.sku.toLowerCase().includes(searchTerm.toLowerCase()))
            const matchesCategory = activeCategory === "all" || p.category_id === activeCategory
            return matchesSearch && matchesCategory
        })
    }, [initialProducts, searchTerm, activeCategory])

    // Cart Calculations
    const cartTotal = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0)

    // Handlers
    const addToCart = (product: any) => {
        if (product.stock <= 0) {
            toast({ title: "Out of Stock", description: "Cannot sell items with 0 stock.", variant: "destructive" })
            return
        }

        setCart(prev => {
            const existing = prev.find(item => item.id === product.id)
            if (existing) {
                if (existing.quantity >= product.stock) {
                    toast({ title: "Stock Limit Reached", description: `Only ${product.stock} available.`, variant: "destructive" })
                    return prev
                }
                return prev.map(item => item.id === product.id ? { ...item, quantity: item.quantity + 1 } : item)
            }
            return [...prev, { ...product, quantity: 1 }]
        })
    }

    const updateQuantity = (id: string, delta: number) => {
        setCart(prev => {
            const existing = prev.find(item => item.id === id)
            if (!existing) return prev

            const newQty = existing.quantity + delta
            if (newQty <= 0) return prev.filter(item => item.id !== id)

            return prev.map(item => item.id === id ? { ...item, quantity: newQty } : item)
        })
    }

    const { isOnline, addOrderToQueue } = useOffline()

    const handleCheckout = async () => {
        setIsProcessing(true)

        if (!isOnline) {
            addOrderToQueue({
                items: cart,
                totalAmount: cartTotal,
                paymentMethod,
                customerId: customer?.id
            })
            setCart([])
            setIsCheckoutOpen(false)
            setCedula("")
            setCustomer(null)
            setIsProcessing(false)
            return
        }

        const result = await createOrder({
            items: cart,
            total: cartTotal,
            paymentMethod,
            customerId: customer?.id
        })

        setIsProcessing(false)
        if (result.error) {
            toast({ title: "Checkout Failed", description: result.error, variant: "destructive" })
        } else {
            toast({ title: "Order Completed", description: `Order #${result.orderId?.slice(0, 8)} processed.` })
            setCart([])
            setIsCheckoutOpen(false)
            // Reset customer and cedula after successful checkout
            setCedula("")
            setCustomer(null)
        }
    }

    return (
        <div className="flex h-full gap-4">
            {/* LEFT: Product Grid */}
            <div className="flex-1 flex flex-col gap-4 overflow-hidden">
                {/* Filters */}
                <div className="flex gap-2 pb-2 overflow-x-auto">
                    <Button
                        variant={activeCategory === "all" ? "default" : "outline"}
                        onClick={() => setActiveCategory("all")}
                        className={activeCategory === "all" ? "bg-emerald-600" : ""}
                    >
                        All
                    </Button>
                    {categories.map(cat => (
                        <Button
                            key={cat.id}
                            variant={activeCategory === cat.id ? "default" : "outline"}
                            onClick={() => setActiveCategory(cat.id)}
                            className={activeCategory === cat.id ? "bg-emerald-600" : ""}
                            style={activeCategory === cat.id ? { backgroundColor: cat.color } : { borderColor: cat.color, color: cat.color }}
                        >
                            {cat.name}
                        </Button>
                    ))}
                </div>

                {/* Search */}
                <div className="relative">
                    <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                    <Input
                        placeholder="Search products..."
                        className="pl-9 h-11"
                        value={searchTerm}
                        onChange={e => setSearchTerm(e.target.value)}
                    />
                </div>

                {/* Grid */}
                <div className="flex-1 overflow-y-auto">
                    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4 pb-20">
                        {filteredProducts.map(product => (
                            <Card
                                key={product.id}
                                className="cursor-pointer hover:border-emerald-500 transition-all active:scale-95 flex flex-col"
                                onClick={() => addToCart(product)}
                            >
                                <div className="aspect-square bg-muted relative overflow-hidden rounded-t-lg">
                                    {product.image_url ? (
                                        <img src={product.image_url} alt={product.name} className="object-cover w-full h-full" />
                                    ) : (
                                        <div className="flex items-center justify-center h-full text-muted-foreground opacity-20 text-4xl font-bold">
                                            {product.name.charAt(0)}
                                        </div>
                                    )}
                                    {product.stock <= 0 && (
                                        <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                                            <span className="text-white font-bold bg-red-500 px-2 py-1 rounded text-xs">OUT OF STOCK</span>
                                        </div>
                                    )}
                                    {product.stock > 0 && product.stock <= 10 && (
                                        <div className="absolute top-2 right-2">
                                            <Badge variant="destructive" className="shadow-sm opacity-90 text-[10px] h-5 px-1.5">
                                                Low: {product.stock}
                                            </Badge>
                                        </div>
                                    )}
                                </div>
                                <div className="p-3 flex flex-col flex-1">
                                    <h3 className="font-semibold text-sm line-clamp-2 leading-tight mb-1">{product.name}</h3>
                                    <div className="mt-auto flex items-center justify-between">
                                        <span className="font-bold text-emerald-700">${product.price.toFixed(2)}</span>
                                        <span className="text-xs text-muted-foreground">{product.stock} items</span>
                                    </div>
                                </div>
                            </Card>
                        ))}
                    </div>
                </div>
            </div>

            {/* RIGHT: Cart Sidebar */}
            <div className="w-[350px] md:w-[400px] flex flex-col bg-card border rounded-lg shadow-sm h-full">
                <div className="p-4 border-b flex items-center justify-between bg-muted/30">
                    <h2 className="font-semibold flex items-center gap-2">
                        <ShoppingCart className="h-5 w-5" />
                        Current Order
                    </h2>
                    <Button variant="ghost" size="sm" onClick={() => setCart([])} disabled={cart.length === 0} className="text-red-500 hover:text-red-600 hover:bg-red-50">
                        Clear
                    </Button>
                </div>

                <div className="flex-1 overflow-y-auto p-4 space-y-4">
                    {cart.length === 0 ? (
                        <div className="h-full flex flex-col items-center justify-center text-muted-foreground text-center opacity-50 space-y-2">
                            <ShoppingCart className="h-12 w-12" />
                            <p>Cart is empty</p>
                        </div>
                    ) : (
                        cart.map(item => (
                            <div key={item.id} className="flex gap-3 animate-in slide-in-from-right-2 duration-300">
                                <div className="h-14 w-14 bg-muted rounded overflow-hidden flex-shrink-0">
                                    {item.image_url && <img src={item.image_url} className="w-full h-full object-cover" />}
                                </div>
                                <div className="flex-1 flex flex-col justify-between">
                                    <div className="flex justify-between items-start">
                                        <p className="font-medium text-sm line-clamp-1">{item.name}</p>
                                        <p className="font-bold text-sm">${(item.price * item.quantity).toFixed(2)}</p>
                                    </div>
                                    <div className="flex items-center gap-3">
                                        <div className="flex items-center gap-1 bg-muted rounded-md border">
                                            <button className="h-6 w-6 flex items-center justify-center hover:bg-white rounded-l-md" onClick={() => updateQuantity(item.id, -1)}>
                                                <Minus className="h-3 w-3" />
                                            </button>
                                            <span className="w-6 text-center text-xs font-semibold">{item.quantity}</span>
                                            <button className="h-6 w-6 flex items-center justify-center hover:bg-white rounded-r-md" onClick={() => updateQuantity(item.id, 1)}>
                                                <Plus className="h-3 w-3" />
                                            </button>
                                        </div>
                                        <span className="text-xs text-muted-foreground">@ ${item.price}</span>
                                    </div>
                                </div>
                            </div>
                        ))
                    )}
                </div>

                <div className="p-4 border-t bg-muted/20 space-y-4">
                    <div className="space-y-2">
                        <div className="flex justify-between text-sm">
                            <span>Subtotal</span>
                            <span>${cartTotal.toFixed(2)}</span>
                        </div>
                        <div className="flex justify-between text-sm">
                            <span>Tax (0%)</span>
                            <span>$0.00</span>
                        </div>
                        <Separator />
                        <div className="flex justify-between font-bold text-lg">
                            <span>Total</span>
                            <span>${cartTotal.toFixed(2)}</span>
                        </div>
                    </div>

                    <Button
                        className="w-full h-12 text-lg font-bold bg-emerald-600 hover:bg-emerald-700 shadow-lg shadow-emerald-900/20"
                        disabled={cart.length === 0}
                        onClick={() => setIsCheckoutOpen(true)}
                    >
                        Checkout (${cartTotal.toFixed(2)})
                    </Button>
                </div>
            </div>

            {/* Checkout Dialog */}
            <Dialog open={isCheckoutOpen} onOpenChange={setIsCheckoutOpen}>
                <DialogContent className="sm:max-w-md">
                    <DialogHeader>
                        <DialogTitle>Complete Payment</DialogTitle>
                    </DialogHeader>
                    <div className="grid gap-4 py-4">
                        <div className="grid gap-2">
                            <Label htmlFor="cedula">Customer ID (Cédula)</Label>
                            <div className="flex gap-2">
                                <Input
                                    id="cedula"
                                    placeholder="Enter Cédula (e.g. 12345678)"
                                    value={cedula}
                                    onChange={(e) => handleSearchCustomer(e.target.value)}
                                    autoFocus
                                    className={!customer && cedula.length > 4 ? "border-red-500 focus-visible:ring-red-500" : ""}
                                />
                            </div>
                            {isSearching && <p className="text-xs text-muted-foreground">Searching...</p>}
                            {customer && (
                                <div className="flex items-center gap-2 text-sm text-emerald-600 font-medium bg-emerald-50 p-2 rounded">
                                    <User className="h-4 w-4" />
                                    {customer.full_name}
                                </div>
                            )}
                            {!customer && cedula.length > 4 && !isSearching && (
                                <p className="text-xs text-red-500 font-medium">Customer not found.</p>
                            )}
                        </div>

                        <div className="flex justify-center p-4 bg-muted/30 rounded-lg">
                            <div className="text-center">
                                <p className="text-sm text-muted-foreground">Total Amount</p>
                                <p className="text-4xl font-bold text-emerald-600">${cartTotal.toFixed(2)}</p>
                            </div>
                        </div>

                        <div className="grid grid-cols-2 gap-2">
                            {['CASH', 'CARD', 'TRANSFER', 'OTHER'].map(method => (
                                <div
                                    key={method}
                                    onClick={() => setPaymentMethod(method)}
                                    className={cn(
                                        "cursor-pointer border-2 rounded-lg p-3 flex flex-col items-center justify-center gap-2 hover:bg-emerald-50 hover:border-emerald-200 transition-all",
                                        paymentMethod === method ? "border-emerald-500 bg-emerald-50 text-emerald-700" : "border-muted"
                                    )}
                                >
                                    {method === 'CASH' && <Banknote className="h-6 w-6" />}
                                    {method === 'CARD' && <CreditCard className="h-6 w-6" />}
                                    {method === 'TRANSFER' && <CreditCard className="h-6 w-6" />}
                                    <span className="text-xs font-bold">{method}</span>
                                </div>
                            ))}
                        </div>
                    </div>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setIsCheckoutOpen(false)}>Cancel</Button>
                        <Button
                            className="bg-emerald-600 w-full md:w-auto"
                            onClick={handleCheckout}
                            disabled={isProcessing || !customer}
                        >
                            {isProcessing ? "Processing..." : "Pay & Print"}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    )
}
