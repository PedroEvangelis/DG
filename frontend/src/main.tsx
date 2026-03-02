import { createRouter, RouterProvider } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import ReactDOM from "react-dom/client";
import { authClient } from "./lib/auth-client";
import { routeTree } from "./routeTree.gen";

const router = createRouter({
	routeTree,
	defaultPreload: "intent",
	scrollRestoration: true,
	context: {
		auth: null,
	},
});

declare module "@tanstack/react-router" {
	interface Register {
		router: typeof router;
	}
}

function App() {
	const { data, isPending } = authClient.useSession();
	const [isInitialLoad, setIsInitialLoad] = useState(true);

	useEffect(() => {
		if (!isPending) {
			setIsInitialLoad(false);
		}
	}, [isPending]);

	const context = useMemo(() => ({ auth: data }), [data]);

	if (isInitialLoad) {
		return null; // Or a loading spinner
	}

	return <RouterProvider router={router} context={context} />;
}

const rootElement = document.getElementById("app");

if (rootElement && !rootElement.innerHTML) {
	const root = ReactDOM.createRoot(rootElement);
	root.render(<App />);
}
