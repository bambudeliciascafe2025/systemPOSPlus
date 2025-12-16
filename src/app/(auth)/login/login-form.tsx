"use client"

import * as React from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"
import { Check, Loader2, RefreshCcw } from "lucide-react"

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
import { Checkbox } from "@/components/ui/checkbox"
import { Separator } from "@/components/ui/separator"
import { createClient } from "@/lib/supabase/client"
import { useRouter } from "next/navigation"

const formSchema = z.object({
    email: z.string().email({
        message: "Valid email is required.",
    }),
    password: z.string().min(6, {
        message: "Password must be at least 6 characters.",
    }),
})

export function LoginForm() {
    const router = useRouter()
    const [isLoading, setIsLoading] = React.useState(false)
    const [showPassword, setShowPassword] = React.useState(false)

    const form = useForm<z.infer<typeof formSchema>>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            email: "",
            password: "",
        },
    })

    async function onSubmit(values: z.infer<typeof formSchema>) {
        setIsLoading(true)
        const supabase = createClient()

        // Attempt login
        const { error } = await supabase.auth.signInWithPassword({
            email: values.email,
            password: values.password,
        })

        if (error) {
            // Simple error handling for now
            form.setError("root", {
                message: error.message
            })
            setIsLoading(false)
            return
        }

        // Redirect to dashboard on success
        router.push("/dashboard")
        router.refresh()
    }

    return (
        <div className="grid gap-6">
            <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
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
                                    <div className="relative">
                                        <Input
                                            type={showPassword ? "text" : "password"}
                                            placeholder="Enter your password"
                                            {...field}
                                            className="bg-muted/30 pr-10"
                                        />
                                        <button
                                            type="button"
                                            onClick={() => setShowPassword(!showPassword)}
                                            className="absolute right-3 top-2.5 text-muted-foreground hover:text-foreground"
                                        >
                                            {showPassword ? (
                                                // Simple icon toggle or just text for now
                                                <RefreshCcw className="h-4 w-4" />
                                            ) : (
                                                <RefreshCcw className="h-4 w-4 rotate-180" />
                                            )}
                                        </button>
                                    </div>
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />

                    {/* REMEMBER & FORGOT */}
                    <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-2">
                            <Checkbox id="remember" className="data-[state=checked]:bg-emerald-500 data-[state=checked]:border-emerald-500" />
                            <label
                                htmlFor="remember"
                                className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 text-muted-foreground"
                            >
                                Remember me
                            </label>
                        </div>
                        <a href="#" className="text-sm font-medium text-emerald-500 hover:text-emerald-400">
                            Forgot password?
                        </a>
                    </div>

                    <Button type="submit" className="w-full bg-emerald-500 hover:bg-emerald-600 text-white font-bold h-11 text-base">
                        {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                        Login
                    </Button>

                    {form.formState.errors.root && (
                        <p className="text-sm text-red-500 text-center">{form.formState.errors.root.message}</p>
                    )}

                </form>
            </Form>

            {/* Social login removed per user request */}


        </div>
    )
}
