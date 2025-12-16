import { getStaffUsers } from "@/app/actions/staff"
import { StaffClient } from "./staff-client"

export default async function StaffPage() {
    const staff = await getStaffUsers() || []

    return <StaffClient initialStaff={staff} />
}
