import { getCustomers } from "@/app/actions/customers"
import { CustomersClient } from "./customers-client"
import { getCurrentRole } from "@/lib/auth-checks"

export default async function CustomersPage() {
    const customers = await getCustomers() || []
    const role = await getCurrentRole()

    return <CustomersClient initialCustomers={customers} currentUserRole={role} />
}
