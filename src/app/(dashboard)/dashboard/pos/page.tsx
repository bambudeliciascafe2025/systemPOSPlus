import { getProducts, getCategories } from "@/app/actions/inventory"
import { POSInterface } from "./pos-client"

export default async function POSPage() {
    const products = await getProducts()
    const categories = await getCategories()

    return (
        <div className="h-[calc(100vh-80px)] overflow-hidden">
            {/* Height calc assumes header ~64-80px. We want POS to fill screen without scrolling main body if possible */}
            <POSInterface initialProducts={products || []} categories={categories || []} />
        </div>
    )
}
