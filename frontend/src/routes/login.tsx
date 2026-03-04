import { createFileRoute, Link, redirect } from "@tanstack/react-router";
import { LoginForm } from "@/components/forms/login-form";

export const Route = createFileRoute("/login")({
	beforeLoad: ({ context }) => {
		if (context.auth?.session) {
			throw redirect({
				to: "/",
			});
		}
	},
	component: RouteComponent,
});

function RouteComponent() {
	return (
		<div className="flex min-h-svh flex-col items-center justify-center gap-6 bg-muted p-6 md:p-10 overflow-y-auto">
			<div className="flex w-full max-w-sm flex-col gap-6 my-auto">
				<Link
					to="/"
					className="flex items-center gap-2 self-center font-medium"
				>
					<img src="/logo.png" alt="DG Logo" />
				</Link>
				<LoginForm />
			</div>
		</div>
	);
}
