"use server"

import { createClient } from "@/lib/supabase/server"

export async function getCustomerByCedula(cedula: string) {
    const supabase = await createClient()

    const { data, error } = await supabase
        .from("customers")
        .select("*")
        .eq("cedula", cedula)
        .single()

    if (error) {
        return { error: "Customer not found" }
    }

    return { customer: data }
}
