"use client"
import { Button } from "@/components/ui/button"
import {
    Field,
    FieldDescription,
    FieldGroup,
    FieldLabel,
    FieldLegend,
    FieldSet,
} from "@/components/ui/field"
import { Input } from "@/components/ui/input"

import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form";
import { loginService } from "@/lib/auth";
import { useDispatch } from "react-redux";
import { useRouter } from "next/navigation";
import { setUser } from "@/store/authSlice";

const loginFormSchema = z.object({
    email: z.string().email("Invalid email address").nonempty("Email is required"),
    password: z.string().min(6, "Password must be at least 6 characters").nonempty("Password is required")
})

type LoginFormValues = z.infer<typeof loginFormSchema>;

export default function LoginPage() {
    const dispatch = useDispatch();
    const router = useRouter();

    const loginForm = useForm<LoginFormValues>({
        resolver: zodResolver(loginFormSchema),
        defaultValues: {
            email: "",
            password: "",
        },
        mode: "onBlur",
    })

    const { register, handleSubmit, formState: { errors } } = loginForm;

    async function login(values: LoginFormValues) {
        const response = await loginService(values)
        console.log("Login successful:", response);
        dispatch(
            setUser({
                name: response.name,
                email: response.email,
            })
        );
        router.push("/dashboard");
    }

    return (
        <div className="min-h-screen flex items-center justify-center">
            <div className="w-full max-w-md">
                <form onSubmit={handleSubmit(login)}>
                    <FieldGroup>
                        <FieldSet>
                            <FieldLegend>Login Page</FieldLegend>
                            <FieldDescription>
                                Please login to our system
                            </FieldDescription>
                            <FieldGroup>

                                <Field>
                                    <FieldLabel htmlFor="login-email">
                                        Email
                                    </FieldLabel>
                                    <Input
                                        id="login-email"
                                        placeholder="abc@Example.com"
                                        type="email"
                                        {...register("email")}
                                    />
                                    {errors.email && (
                                        <FieldDescription className="text-red-500">
                                            {errors.email.message}
                                        </FieldDescription>
                                    )}
                                </Field>

                                <Field>
                                    <FieldLabel htmlFor="login-password">
                                        Password
                                    </FieldLabel>
                                    <Input
                                        id="login-password"
                                        type="password"
                                        {...register("password")}
                                    />
                                    <FieldDescription>
                                        Please Enter your password
                                    </FieldDescription>
                                    {errors.password && (
                                        <FieldDescription className="text-red-500">
                                            {errors.password.message}
                                        </FieldDescription>
                                    )}
                                </Field>

                            </FieldGroup>
                        </FieldSet>

                        <Field orientation="horizontal">
                            {/* The submit button triggers the form submission */}
                            <Button type="submit">Login</Button>
                            <Button variant="outline" type="button">
                                Cancel
                            </Button>
                        </Field>
                    </FieldGroup>
                </form>
            </div>
        </div>
    )
}