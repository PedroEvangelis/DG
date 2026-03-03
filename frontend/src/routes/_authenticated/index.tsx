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
		<div className="flex flex-col items-center justify-center">
			<div className="flex items-center justify-center">Bem vindo!</div>
		</div>
	);
}
