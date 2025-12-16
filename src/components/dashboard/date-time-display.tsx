"use client"

import { useEffect, useState } from "react"

export function DateTimeDisplay() {
    const [date, setDate] = useState<Date | null>(null)

    useEffect(() => {
        setDate(new Date())
        const timer = setInterval(() => setDate(new Date()), 1000)
        return () => clearInterval(timer)
    }, [])

    if (!date) return null

    return (
        <div className="hidden md:flex flex-col items-end mr-4 text-xs text-muted-foreground leading-tight">
            <span className="font-bold text-foreground">
                {date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
            </span>
            <span>
                {date.toLocaleDateString([], { weekday: 'short', day: 'numeric', month: 'short' })}
            </span>
        </div>
    )
}
