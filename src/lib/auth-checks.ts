import { createClient } from "./supabase/server";

export async function requireRole(allowedRoles: string[]) {
    const supabase = await createClient();
    const { data: { user }, error } = await supabase.auth.getUser();

    if (error || !user) {
        throw new Error("Unauthorized");
    }

    const { data: profile } = await supabase
        .from("profiles")
        .select("role")
        .eq("id", user.id)
        .single();

    const userRole = profile?.role || "cashier";

    if (!allowedRoles.includes(userRole)) {
        throw new Error(`Forbidden: Requires one of [${allowedRoles.join(", ")}]`);
    }

    return { user, role: userRole };
}
