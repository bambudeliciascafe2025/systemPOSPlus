import { getProducts } from "@/app/actions/inventory"
import { StockClient } from "./stock-client"

export default async function StockPage() {
    const products = await getProducts()

    return (
        <div className="flex flex-col gap-4">
            <div className="flex items-center justify-between">
                <h1 className="text-lg font-semibold md:text-2xl">Inventory Management</h1>
            </div>
            <StockClient initialProducts={products || []} />
        </div>
    )
}
