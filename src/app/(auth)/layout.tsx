export default function AuthLayout({
    children,
}: {
    children: React.ReactNode
}) {
    return (
        <div className="w-full h-screen grid grid-cols-1 lg:grid-cols-2">
            {/* Left Side: Form */}
            <div className="flex items-center justify-center p-8 bg-background">
                <div className="w-full max-w-md space-y-8">
                    {children}
                </div>
            </div>

            {/* Right Side: Image / Decorative */}
            <div className="hidden lg:block relative bg-muted">
                <img
                    src="https://images.unsplash.com/photo-1552566626-52f8b828add9?q=80&w=2070&auto=format&fit=crop"
                    alt="Login visual"
                    className="absolute inset-0 w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-emerald-500/40 mix-blend-multiply transition-all" />
                <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                    {/* Optional overlay text could go here */}
                </div>
            </div>
        </div>
    )
}
