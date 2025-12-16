"use client"

import { Wifi, WifiOff } from "lucide-react"
import { useOffline } from "@/providers/offline-context"
import { cn } from "@/lib/utils"

export function ConnectionIndicator() {
    const { isOnline, queue } = useOffline()

    // if (isOnline && queue.length === 0) return null // Removed to make it always visible as per user request

    return (
        <div className={cn(
            "fixed bottom-4 right-4 z-50 flex items-center gap-2 px-3 py-2 rounded-full shadow-lg transition-all duration-300",
            isOnline ? "bg-emerald-500 text-white" : "bg-red-500 text-white"
        )}>
            {isOnline ? (
                <>
                    <Wifi className="h-4 w-4" />
                    {queue.length > 0 && <span className="text-xs font-bold">Syncing {queue.length}...</span>}
                </>
            ) : (
                <>
                    <WifiOff className="h-4 w-4 animate-pulse" />
                    <span className="text-xs font-bold">Offline</span>
                    {queue.length > 0 && (
                        <span className="ml-1 bg-white/20 px-1.5 rounded-full text-[10px]">
                            {queue.length}
                        </span>
                    )}
                </>
            )}
        </div>
    )
}
