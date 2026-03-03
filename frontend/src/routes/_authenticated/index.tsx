import { createFileRoute, redirect } from "@tanstack/react-router";

export const Route = createFileRoute("/_authenticated/")({
	beforeLoad: ({ context }) => {
		
		if (!context.auth?.session) {
			throw redirect({
				to: "/login",
			});
		}
	},
	component: App,
});

function App() {
	return (
		<div className="min-h-screen">
			<h1>Dashboard</h1>
		</div>
	);
}
