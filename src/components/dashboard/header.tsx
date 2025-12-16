"use client"

import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Search, Bell, Moon, Sun, Menu } from "lucide-react"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { DateTimeDisplay } from "@/components/dashboard/date-time-display"
import { GlobalSearch } from "@/components/dashboard/global-search"
import { Sidebar } from "@/components/dashboard/sidebar"
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { useState } from "react"
import { Sheet, SheetContent, SheetTrigger, SheetTitle } from "@/components/ui/sheet"

export function Header({ role }: { role?: string }) {
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)

    return (
        <header className="flex h-16 items-center gap-4 border-b bg-background px-6">
            <Sheet open={isMobileMenuOpen} onOpenChange={setIsMobileMenuOpen}>
                <SheetTrigger asChild>
                    <Button variant="outline" size="icon" className="shrink-0 lg:hidden">
                        <Menu className="h-5 w-5" />
                        <span className="sr-only">Toggle navigation menu</span>
                    </Button>
                </SheetTrigger>
                <SheetContent side="left" className="flex flex-col p-0">
                    <div className="sr-only">
                        <SheetTitle>Navigation Menu</SheetTitle>
                    </div>
                    <Sidebar role={role} className="border-r-0" onNavigate={() => setIsMobileMenuOpen(false)} />
                </SheetContent>
            </Sheet>
            <div className="w-full flex-1">
                <GlobalSearch />
            </div>

            <div className="flex items-center gap-4">
                <DateTimeDisplay />
                <Button variant="ghost" size="icon" className="text-muted-foreground">
                    <Bell className="h-5 w-5" />
                    <span className="sr-only">Notifications</span>
                </Button>
                <Button variant="ghost" size="icon" className="text-muted-foreground">
                    <Moon className="h-5 w-5" />
                    <span className="sr-only">Toggle theme</span>
                </Button>

                <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                        <Button variant="secondary" size="icon" className="rounded-full overflow-hidden">
                            <Avatar>
                                <AvatarImage src="https://github.com/shadcn.png" />
                                <AvatarFallback>AD</AvatarFallback>
                            </Avatar>
                            <span className="sr-only">Toggle user menu</span>
                        </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                        <DropdownMenuLabel>My Account</DropdownMenuLabel>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem>Settings</DropdownMenuItem>
                        <DropdownMenuItem>Support</DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem className="text-red-500">Logout</DropdownMenuItem>
                    </DropdownMenuContent>
                </DropdownMenu>
            </div>
        </header>
    )
}
