import { getStaffUsers } from "@/app/actions/staff"
import { StaffClient } from "./staff-client"
import { getCurrentRole } from "@/lib/auth-checks"

export default async function StaffPage() {
    const staff = await getStaffUsers() || []
    const role = await getCurrentRole()

    return <StaffClient initialStaff={staff} currentUserRole={role} />
}
