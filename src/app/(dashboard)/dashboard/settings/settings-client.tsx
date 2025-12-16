"use client"

import { useEffect, useState } from "react"
import { Save, Building2, Receipt, Percent } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { useToast } from "@/hooks/use-toast"
import { LanguageSwitcher } from "@/components/dashboard/language-switcher"

export function SettingsClient() {
    const { toast } = useToast()
    const [isLoading, setIsLoading] = useState(false)

    // Form State
    const [settings, setSettings] = useState({
        storeName: "",
        address: "",
        phone: "",
        taxRate: "0",
        footerMessage: "Thank you for your business!"
    })

    // Load from LocalStorage on mount
    useEffect(() => {
        const stored = localStorage.getItem("pos_settings")
        if (stored) {
            try {
                setSettings(JSON.parse(stored))
            } catch (e) {
                console.error("Failed to parse settings", e)
            }
        }
    }, [])

    const handleSave = () => {
        setIsLoading(true)
        // Simulate network delay for UX
        setTimeout(() => {
            localStorage.setItem("pos_settings", JSON.stringify(settings))
            setIsLoading(false)
            toast({
                title: "Settings Saved ✅",
                description: "Your terminal configuration has been updated.",
            })
        }, 800)
    }

    return (
        <div className="space-y-6">
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">

                {/* Store Information */}
                <Card className="col-span-2">
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <Building2 className="h-5 w-5 text-emerald-600" />
                            Store Information
                        </CardTitle>
                        <CardDescription>
                            These details will appear on your receipts and invoices.
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="space-y-2">
                            <Label htmlFor="storeName">Store Name</Label>
                            <Input
                                id="storeName"
                                placeholder="e.g. HotPOS Café"
                                value={settings.storeName}
                                onChange={(e) => setSettings({ ...settings, storeName: e.target.value })}
                            />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="address">Address</Label>
                            <Input
                                id="address"
                                placeholder="e.g. 123 Main St, City"
                                value={settings.address}
                                onChange={(e) => setSettings({ ...settings, address: e.target.value })}
                            />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="phone">Phone Number</Label>
                            <Input
                                id="phone"
                                placeholder="e.g. +1 234 567 890"
                                value={settings.phone}
                                onChange={(e) => setSettings({ ...settings, phone: e.target.value })}
                            />
                        </div>
                    </CardContent>
                </Card>

                {/* Configuration */}
                <div className="space-y-4">
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <Percent className="h-5 w-5 text-blue-600" />
                                Tax Configuration
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="space-y-2">
                                <Label htmlFor="tax">Default Tax Rate (%)</Label>
                                <Input
                                    id="tax"
                                    type="number"
                                    placeholder="0"
                                    value={settings.taxRate}
                                    onChange={(e) => setSettings({ ...settings, taxRate: e.target.value })}
                                />
                                <p className="text-xs text-muted-foreground">Applied to all taxable items.</p>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Language Settings */}
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <Building2 className="h-5 w-5 text-purple-600" />
                                Language Preferences
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="flex items-center justify-between">
                                <Label>Interface Language</Label>
                                <LanguageSwitcher />
                            </div>
                            <p className="text-xs text-muted-foreground">
                                Select your preferred language for the interface.
                            </p>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <Receipt className="h-5 w-5 text-orange-600" />
                                Receipt Footer
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="space-y-2">
                                <Label htmlFor="footer">Message</Label>
                                <Textarea
                                    id="footer"
                                    placeholder="Thank you for visiting!"
                                    className="resize-none h-24"
                                    value={settings.footerMessage}
                                    onChange={(e) => setSettings({ ...settings, footerMessage: e.target.value })}
                                />
                            </div>
                        </CardContent>
                    </Card>
                </div>
            </div>

            <div className="flex justify-end">
                <Button
                    size="lg"
                    className="bg-emerald-600 hover:bg-emerald-700 w-full md:w-auto"
                    onClick={handleSave}
                    disabled={isLoading}
                >
                    {isLoading ? "Saving..." : (
                        <>
                            <Save className="mr-2 h-4 w-4" />
                            Save Configuration
                        </>
                    )}
                </Button>
            </div>
        </div>
    )
}
