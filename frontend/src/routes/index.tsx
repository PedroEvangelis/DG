import { createFileRoute, redirect } from "@tanstack/react-router";

export const Route = createFileRoute("/")({
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
		<div className="min-h-screen bg-linear-to-b from-slate-900 via-slate-800 to-slate-900">
			<h1>Dashboard</h1>
		</div>
	);
}
