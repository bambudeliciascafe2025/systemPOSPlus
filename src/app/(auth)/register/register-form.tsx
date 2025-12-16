"use client"

import * as React from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"
import { Loader2 } from "lucide-react"

import { Button } from "@/components/ui/button"
import {
    Form,
    FormControl,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { createClient } from "@/lib/supabase/client"
import { useRouter } from "next/navigation"

const formSchema = z.object({
    fullName: z.string().min(2, { message: "Name required" }),
    email: z.string().email({ message: "Valid email is required." }),
    password: z.string().min(6, { message: "Password must be at least 6 characters." }),
})

export function RegisterForm() {
    const router = useRouter()
    const [isLoading, setIsLoading] = React.useState(false)

    const form = useForm<z.infer<typeof formSchema>>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            fullName: "",
            email: "",
            password: "",
        },
    })

    async function onSubmit(values: z.infer<typeof formSchema>) {
        setIsLoading(true)
        const supabase = createClient()

        // Attempt sign up
        const { error } = await supabase.auth.signUp({
            email: values.email,
            password: values.password,
            options: {
                data: {
                    full_name: values.fullName,
                    // Note: 'role' in metadata isn't secure for actual role assignment normally, 
                    // but we will use the default 'cashier' from DB and let user promote via SQL.
                }
            }
        })

        if (error) {
            form.setError("root", {
                message: error.message
            })
            setIsLoading(false)
            return
        }

        // Redirect to dashboard (or login to be safe)
        // Since email confirmation might be off or auto, let's try login directly or just redirect
        router.push("/dashboard")
        router.refresh()
    }

    return (
        <div className="grid gap-6">
            <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                    {/* NAME */}
                    <FormField
                        control={form.control}
                        name="fullName"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>Full Name</FormLabel>
                                <FormControl>
                                    <Input placeholder="John Doe" {...field} className="bg-muted/30" />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />

                    {/* EMAIL */}
                    <FormField
                        control={form.control}
                        name="email"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>Email</FormLabel>
                                <FormControl>
                                    <Input placeholder="name@example.com" {...field} className="bg-muted/30" />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />

                    {/* PASSWORD */}
                    <FormField
                        control={form.control}
                        name="password"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>Password</FormLabel>
                                <FormControl>
                                    <Input type="password" placeholder="Create a password" {...field} className="bg-muted/30" />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />

                    <Button type="submit" className="w-full bg-emerald-500 hover:bg-emerald-600 text-white font-bold h-11 text-base">
                        {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                        Create Account
                    </Button>

                    {form.formState.errors.root && (
                        <p className="text-sm text-red-500 text-center">{form.formState.errors.root.message}</p>
                    )}

                </form>
            </Form>
            <div className="mt-4 text-center text-sm">
                Already have an account?{" "}
                <a href="/login" className="underline hover:text-emerald-500">
                    Login
                </a>
            </div>
        </div>
    )
}
