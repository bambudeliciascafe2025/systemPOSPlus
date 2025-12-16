import { getProducts, getCategories } from "@/app/actions/inventory"
import { ProductsClient } from "./products-client"

export default async function ProductsPage() {
    const products = await getProducts()
    const categories = await getCategories()

    return (
        <div className="flex flex-col gap-4">
            <div className="flex items-center justify-between">
                <h1 className="text-lg font-semibold md:text-2xl">Product Catalog</h1>
            </div>
            <ProductsClient initialProducts={products || []} categories={categories || []} />
        </div>
    )
}
