"use client"

import React, { createContext, useContext, useEffect, useState, ReactNode } from "react"
import { createOrder } from "@/app/actions/pos"
import { useToast } from "@/hooks/use-toast"

interface OrderData {
    id: string; // Temp ID
    items: any[];
    paymentMethod: string;
    totalAmount: number;
    customerId?: string | null;
    timestamp: number;
}

interface OfflineContextType {
    isOnline: boolean;
    queue: OrderData[];
    addOrderToQueue: (order: Omit<OrderData, "id" | "timestamp">) => void;
    syncOrders: () => Promise<void>;
}

const OfflineContext = createContext<OfflineContextType>({
    isOnline: true,
    queue: [],
    addOrderToQueue: () => { },
    syncOrders: async () => { },
})

export function OfflineProvider({ children }: { children: ReactNode }) {
    const [isOnline, setIsOnline] = useState(typeof window !== "undefined" ? navigator.onLine : true)
    const [queue, setQueue] = useState<OrderData[]>([])
    const { toast } = useToast()

    // Load queue from local storage on mount
    useEffect(() => {
        const stored = localStorage.getItem("offlineOrdersQueue")
        if (stored) {
            try {
                setQueue(JSON.parse(stored))
            } catch (e) {
                console.error("Failed to parse offline queue", e)
            }
        }
    }, [])

    // Update Local Storage when queue changes
    useEffect(() => {
        localStorage.setItem("offlineOrdersQueue", JSON.stringify(queue))
    }, [queue])

    // Listen for network status
    useEffect(() => {
        const handleOnline = () => {
            setIsOnline(true)
            toast({
                title: "You are back online! 🟢",
                description: "Attempting to sync queued orders...",
            })
            // Wait a bit for connection to be stable
            setTimeout(() => syncOrders(), 1000)
        }
        const handleOffline = () => {
            setIsOnline(false)
            toast({
                title: "You are offline 🔴",
                description: "Orders will be saved locally until connection returns.",
                variant: "destructive"
            })
        }

        window.addEventListener("online", handleOnline)
        window.addEventListener("offline", handleOffline)

        return () => {
            window.removeEventListener("online", handleOnline)
            window.removeEventListener("offline", handleOffline)
        }
    }, []) // Logic uses "syncOrders" which we'll define below. The closure issue is handled by reading from localStorage inside syncOrders.

    const addOrderToQueue = (orderData: Omit<OrderData, "id" | "timestamp">) => {
        const newOrder: OrderData = {
            ...orderData,
            id: crypto.randomUUID(),
            timestamp: Date.now()
        }
        setQueue(prev => [...prev, newOrder])
        toast({
            title: "Order Saved Offline 💾",
            description: "It will sync automatically when internet returns.",
        })
    }

    const syncOrders = async () => {
        // Always read from LocalStorage to get the absolute latest state, preventing closure staleness
        const currentQueueStr = localStorage.getItem("offlineOrdersQueue")
        if (!currentQueueStr) return

        let currentQueue: OrderData[] = []
        try {
            currentQueue = JSON.parse(currentQueueStr)
        } catch (e) { console.error(e); return }

        if (currentQueue.length === 0) return

        let syncedCount = 0
        const failedQueue: OrderData[] = []

        toast({ title: "Syncing...", description: `Processing ${currentQueue.length} offline orders.` })

        for (const order of currentQueue) {
            try {
                // Corrected: passing object as single argument
                const result = await createOrder({
                    items: order.items,
                    paymentMethod: order.paymentMethod,
                    total: order.totalAmount,
                    customerId: order.customerId || undefined
                })

                if (result.success) {
                    syncedCount++
                } else {
                    console.error("Sync failed for order", order.id, result.error)
                    // If server rejected it (not network error), we probably shouldn't retry infinitely.
                    // But for safety, let's keep it in the queue for manual review or retry.
                    // Optimistic approach: if it fails with specific error, maybe remove? 
                    // Let's keep it for now.
                    failedQueue.push(order)
                }
            } catch (error) {
                console.error("Network error during sync", error)
                // If network fails (exception), definitely keep it
                failedQueue.push(order)
            }
        }

        setQueue(failedQueue)

        if (syncedCount > 0) {
            toast({
                title: "Sync Complete ✅",
                description: `Successfully uploaded ${syncedCount} orders.`,
            })
        }
    }

    return (
        <OfflineContext.Provider value={{ isOnline, queue, addOrderToQueue, syncOrders }}>
            {children}
        </OfflineContext.Provider>
    )
}

export const useOffline = () => useContext(OfflineContext)
