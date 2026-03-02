import { useForm } from "@tanstack/react-form";
import { useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from "@/components/ui/card";
import { Field, FieldGroup, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { signIn } from "@/lib/auth-client";
import { cn } from "@/lib/utils";

export function LoginForm({
	className,
	...props
}: React.ComponentProps<"div">) {
	const [error, setError] = useState<string | null>(null);
	const navigate = useNavigate();

	const form = useForm({
		defaultValues: {
			email: "",
			password: "",
		},
		onSubmit: async ({ value }) => {
			setError(null);
			const { error: signInError } = await signIn.email({
				email: value.email,
				password: value.password,
			});

			if (signInError) {
				setError(signInError.message || "Failed to login");
				return;
			}

			navigate({ to: "/" });
		},
	});

	return (
		<div className={cn("flex flex-col gap-6", className)} {...props}>
			<Card>
				<CardHeader className="text-center">
					<CardTitle className="text-xl">Bem-vindo de volta</CardTitle>
					<CardDescription>Login com seu email e senha</CardDescription>
				</CardHeader>
				<CardContent>
					<form
						onSubmit={(e) => {
							e.preventDefault();
							e.stopPropagation();
							form.handleSubmit();
						}}
					>
						<FieldGroup>
							{error && (
								<div className="text-sm font-medium text-destructive text-center">
									{error}
								</div>
							)}
							<form.Field
								name="email"
								validators={{
									onChange: z.string().email("Invalid email address"),
								}}
							>
								{(field) => (
									<Field>
										<FieldLabel htmlFor={field.name}>Email</FieldLabel>
										<Input
											id={field.name}
											type="email"
											placeholder="email@exemplo.com"
											value={field.state.value}
											onChange={(e) => field.handleChange(e.target.value)}
											onBlur={field.handleBlur}
										/>
										{field.state.meta.errors ? (
											<p className="text-sm font-medium text-destructive">
												{field.state.meta.errors.join(", ")}
											</p>
										) : null}
									</Field>
								)}
							</form.Field>
							<form.Field
								name="password"
								validators={{
									onChange: z.string().min(1, "A senha é obrigatória"),
								}}
							>
								{(field) => (
									<Field>
										<div className="flex items-center">
											<FieldLabel htmlFor={field.name}>Senha</FieldLabel>
											<a
												href="/forgot-password"
												className="ml-auto text-sm underline-offset-4 hover:underline"
											>
												Esqueceu sua senha?
											</a>
										</div>
										<Input
											id={field.name}
											type="password"
											value={field.state.value}
											onChange={(e) => field.handleChange(e.target.value)}
											onBlur={field.handleBlur}
										/>
										{field.state.meta.errors ? (
											<p className="text-sm font-medium text-destructive">
												{field.state.meta.errors.join(", ")}
											</p>
										) : null}
									</Field>
								)}
							</form.Field>
							<form.Subscribe
								selector={(state) => [state.canSubmit, state.isSubmitting]}
							>
								{([canSubmit, isSubmitting]) => (
									<Field>
										<Button type="submit" disabled={!canSubmit || isSubmitting}>
											{isSubmitting ? "Entrando..." : "Login"}
										</Button>
									</Field>
								)}
							</form.Subscribe>
						</FieldGroup>
					</form>
				</CardContent>
			</Card>
		</div>
	);
}
