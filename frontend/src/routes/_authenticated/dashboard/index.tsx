import { QueryClientProvider, useQuery } from "@tanstack/react-query";
import { createFileRoute, redirect } from "@tanstack/react-router";

import { ROLES } from "@/constants/roles";
import { api } from "@/lib/api";
import { authClient } from "@/lib/auth-client";
import { AdminDashboard } from "./-AdminDashboard";
import { UserDashboard } from "./-UserDashboard";

export const Route = createFileRoute("/_authenticated/dashboard/")({
	beforeLoad: ({ context, location }) => {
		if (!context.auth) {
			throw redirect({
				to: "/login",
				search: {
					redirect: location.href,
				},
			});
		}
	},
	component: Dashboard,
	handle: {
		crumb: () => "Dashboard",
	},
});

function Dashboard() {
	const { data: session } = authClient.useSession();
	const userId = session?.user?.id ?? 0;

	const { data: userResponse, isLoading: isUserLoading } = useQuery({
		queryKey: ["user", userId],
		queryFn: () => api.users({ id: userId }).get(),
		enabled: !!userId,
	});

	if (isUserLoading) {
		return <div className="flex flex-col items-center">Loading...</div>;
	}

	const user = userResponse?.data?.data;

	if (user?.role === ROLES.ADMIN) {
		return <AdminDashboard />;
	}

	return <UserDashboard />;
}
