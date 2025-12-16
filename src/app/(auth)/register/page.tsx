import { RegisterForm } from "./register-form"

export default function RegisterPage() {
    return (
        <div className="space-y-6">
            <div className="space-y-2 text-center">
                <h1 className="text-3xl font-bold">Create Account</h1>
                <p className="text-muted-foreground">
                    Enter your details below to create your admin account
                </p>
            </div>
            <RegisterForm />
        </div>
    )
}
