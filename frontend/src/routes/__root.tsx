import { TanStackDevtools } from "@tanstack/react-devtools";
import { FormDevtoolsPanel } from "@tanstack/react-form-devtools";
import { createRootRouteWithContext, Outlet } from "@tanstack/react-router";
import { TanStackRouterDevtoolsPanel } from "@tanstack/react-router-devtools";
import type { User, Session } from "better-auth";

import "@/index.css";

export type AuthData = {
	user: User;
	session: Session;
} | null;

export interface RouterContext {
	auth: AuthData;
}

export const Route = createRootRouteWithContext<RouterContext>()({
	component: RootComponent,
});

function RootComponent() {
	return (
		<>
			<Outlet />
			<TanStackDevtools
				config={{
					position: "bottom-right",
				}}
				plugins={[
					{
						name: "TanStack Router",
						render: <TanStackRouterDevtoolsPanel />,
						defaultOpen: true,
					},
					{
						name: "TanStack React Form",
						render: <FormDevtoolsPanel />,
					},
				]}
			/>
		</>
	);
}
