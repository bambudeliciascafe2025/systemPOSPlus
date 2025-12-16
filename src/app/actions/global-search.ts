"use server"

import { createClient } from "@/lib/supabase/server"

export type SearchResult = {
    type: "product" | "customer"
    id: string
    title: string
    subtitle: string
    url: string
}

export async function searchGlobal(query: string): Promise<SearchResult[]> {
    if (!query || query.length < 2) return []

    const supabase = await createClient()

    // Fuzzy Search Preparation
    const cleanTerm = query.trim().toLowerCase()

    // Generator for variations
    let variations = new Set<string>()
    variations.add(cleanTerm)

    // 1. Silent 'H' Handling (Start of word)
    if (cleanTerm.startsWith('h')) {
        variations.add(cleanTerm.slice(1)) // hagua -> agua
    }
    // Also add 'h' if not present? agua -> hagua 
    variations.add('h' + cleanTerm)

    // 3. B/V Swapping & S/C/Z Swapping (Consonant replacement)
    // approach: Create a "wildcard" version where uncertain chars are replaced by '_' (SQL single char matching)
    // sitrico -> _itrico

    let wildcardStart = cleanTerm // Default to original if no ambiguity found yet, or handle properly
    const ambiguousChars = /[bvcsqz]/g

    if (ambiguousChars.test(cleanTerm)) {
        // Replace FIRST ambiguous char with wildcard (most common error)
        wildcardStart = cleanTerm.replace(/^[bvcsqz]/, '_')
        variations.add(wildcardStart)

        // Also simple swaps for explicit strings
        if (cleanTerm.includes('v')) variations.add(cleanTerm.replace(/v/g, 'b'))
        if (cleanTerm.includes('b')) variations.add(cleanTerm.replace(/b/g, 'v'))

        // S/C/Z
        if (cleanTerm.includes('s')) variations.add(cleanTerm.replace(/s/g, 'c'))
        if (cleanTerm.includes('s')) variations.add(cleanTerm.replace(/s/g, 'z'))
        if (cleanTerm.includes('c')) variations.add(cleanTerm.replace(/c/g, 's'))
        if (cleanTerm.includes('z')) variations.add(cleanTerm.replace(/z/g, 's'))
    }

    // 3. Vowel Ambiguity (The "Super Fuzzy" mode)
    // Replace ALL vowels with '_' to handle accents and missing vowels?
    // This is risky for short words, but fine for longer ones (>3 chars).
    // sitrico -> s_tr_c_
    if (cleanTerm.length > 3) {
        // Replace vowels [aeiouáéíóú] with '_'
        const vowelWildcard = cleanTerm.replace(/[aeiouáéíóú]/g, '_')
        variations.add(vowelWildcard)

        // Also a version with FIRST char wild + vowels wild?
        // _itrico -> __tr_c_ 
        // This catches "Cítrico" from "Sitrico" (S->C match via _, i->í match via _)
        const superFuzzy = wildcardStart.replace(/[aeiouáéíóú]/g, '_')
        if (ambiguousChars.test(cleanTerm)) {
            variations.add(superFuzzy)
        }
    }

    // Filter out very short variations to prevent massive matching (e.g. "_" or "h")
    const validVariations = Array.from(variations).filter(v => v.length >= 2)

    const productOrQuery = validVariations.map(v => `name.ilike.%${v}%`).join(",")
    const customerOrQuery = validVariations.map(v => `full_name.ilike.%${v}%`).join(",") +
        "," + validVariations.map(v => `cedula.ilike.%${v}%`).join(",")

    const results: SearchResult[] = []

    // 1. Search Products
    try {
        const { data: productsData, error } = await supabase
            .from("products")
            .select("id, name, price")
            .or(productOrQuery)
            .limit(5)

        if (error) {
            console.error("Product Search Error:", error)
        } else if (productsData) {
            productsData.forEach(p => {
                // Avoid duplicates in result list if multiple variations matched same product
                if (!results.some(r => r.id === p.id)) {
                    results.push({
                        type: "product",
                        id: p.id,
                        title: p.name,
                        subtitle: `Stock Product • $${p.price.toFixed(2)}`,
                        url: `/dashboard/products?search=${encodeURIComponent(p.name)}`
                    })
                }
            })
        }
    } catch (e) {
        console.error("Search Exception (Products):", e)
    }

    // 2. Search Customers
    try {
        const { data: customersData, error } = await supabase
            .from("customers")
            .select("id, full_name, cedula")
            .or(customerOrQuery)
            .limit(5)

        if (error) {
            console.error("Customer Search Error:", error)
        } else if (customersData) {
            customersData.forEach(c => {
                if (!results.some(r => r.id === c.id)) {
                    results.push({
                        type: "customer",
                        id: c.id,
                        title: c.full_name,
                        subtitle: `Customer • ID: ${c.cedula}`,
                        url: `/dashboard/customers?search=${encodeURIComponent(c.full_name)}`
                    })
                }
            })
        }
    } catch (e) {
        console.error("Search Exception (Customers):", e)
    }

    return results
}
