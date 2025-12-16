import { LoginForm } from "./login-form"

export default function LoginPage() {
    return (
        <>
            <div className="flex flex-col space-y-2 mb-8">
                <div className="flex items-center gap-2 mb-2">
                    <h1 className="text-3xl font-bold tracking-tight text-foreground">System</h1>
                    <span className="bg-emerald-500 text-white px-2 py-1 rounded-md font-bold text-2xl">POS+</span>
                </div>
                <h2 className="text-2xl font-bold tracking-tight">Login</h2>
                <p className="text-sm text-muted-foreground">
                    Manage sales, inventory and other transactions
                </p>
            </div>
            <LoginForm />
        </>
    )
}
