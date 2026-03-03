import "@tanstack/react-router";

declare module "@tanstack/react-router" {
	interface Register {
		router: typeof router;
	}
	interface RouteHandle {
		crumb?: (data: unknown) => string;
	}
}
