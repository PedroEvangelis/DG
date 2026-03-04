import { QueryClientProvider } from "@tanstack/react-query";
import { createFileRoute, Outlet, redirect } from "@tanstack/react-router";
import { AppSidebar } from "@/components/nav-sidebar";
import { SiteHeader } from "@/components/site-header";
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar";

export const Route = createFileRoute("/_authenticated")({
	beforeLoad: ({ context }) => {
		if (!context.auth?.session) {
			throw redirect({
				to: "/login",
			});
		}
	},
	component: AuthenticatedLayout,
});

function AuthenticatedLayout() {
	const { queryClient } = Route.useRouteContext();
	return (
		<SidebarProvider
			style={
				{
					"--sidebar-width": "calc(var(--spacing) * 72)",
					"--header-height": "calc(var(--spacing) * 12)",
				} as React.CSSProperties
			}
		>
			<AppSidebar />
			<SidebarInset>
				<SiteHeader />
				<QueryClientProvider client={queryClient}>
					<Outlet />
				</QueryClientProvider>
			</SidebarInset>
		</SidebarProvider>
	);
}
