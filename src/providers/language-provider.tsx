"use client"

import React, { createContext, useContext, useState, useEffect } from "react"
import { dictionaries, Language } from "@/lib/i18n/dictionaries"

type LanguageContextType = {
    language: Language
    setLanguage: (lang: Language) => void
    t: typeof dictionaries['es']
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined)

export function LanguageProvider({ children }: { children: React.ReactNode }) {
    const [language, setLanguageState] = useState<Language>("es")

    // Load from local storage on mount
    useEffect(() => {
        const saved = localStorage.getItem("pos_language") as Language
        if (saved && (saved === "es" || saved === "en")) {
            setLanguageState(saved)
        }
    }, [])

    const setLanguage = (lang: Language) => {
        setLanguageState(lang)
        localStorage.setItem("pos_language", lang)
    }

    const t = dictionaries[language]

    return (
        <LanguageContext.Provider value={{ language, setLanguage, t }}>
            {children}
        </LanguageContext.Provider>
    )
}

export function useLanguage() {
    const context = useContext(LanguageContext)
    if (context === undefined) {
        throw new Error("useLanguage must be used within a LanguageProvider")
    }
    return context
}
