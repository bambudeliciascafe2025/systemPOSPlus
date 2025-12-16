import { getCategories } from "@/app/actions/inventory"
import { CategoriesClient } from "./categories-client"

export default async function CategoriesPage() {
    const categories = await getCategories()

    return (
        <div className="flex flex-col gap-4">
            <div className="flex items-center justify-between">
                <h1 className="text-lg font-semibold md:text-2xl">Categories</h1>
            </div>
            <CategoriesClient initialCategories={categories || []} />
        </div>
    )
}
