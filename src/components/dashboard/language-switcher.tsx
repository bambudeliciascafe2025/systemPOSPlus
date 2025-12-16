"use client"

import { useLanguage } from "@/providers/language-provider"
import { Button } from "@/components/ui/button"
import { Languages } from "lucide-react"

export function LanguageSwitcher() {
    const { language, setLanguage, t } = useLanguage()

    return (
        <div className="flex items-center gap-2">
            <Languages className="h-4 w-4 text-muted-foreground" />
            <span className="text-sm font-medium">{t.language}:</span>
            <div className="flex bg-muted rounded-md p-1">
                <Button
                    variant={language === "es" ? "default" : "ghost"}
                    size="sm"
                    className="h-7 text-xs"
                    onClick={() => setLanguage("es")}
                >
                    Español
                </Button>
                <Button
                    variant={language === "en" ? "default" : "ghost"}
                    size="sm"
                    className="h-7 text-xs"
                    onClick={() => setLanguage("en")}
                >
                    English
                </Button>
            </div>
        </div>
    )
}
