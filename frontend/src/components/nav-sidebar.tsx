import { ChartColumn, Users } from "lucide-react";
import type * as React from "react";

import { NavUser } from "@/components/nav-user";
import {
	Sidebar,
	SidebarContent,
	SidebarFooter,
	SidebarHeader,
	SidebarMenu,
	SidebarMenuButton,
	SidebarMenuItem,
} from "@/components/ui/sidebar";
import { authClient } from "@/lib/auth-client";
import { NavMain } from "./nav-main";

const navMainData = [
	{
		title: "Dashboard",
		url: "/dashboard",
		icon: ChartColumn,
	},
	{
		title: "Team",
		url: "/team",
		icon: Users,
	},
];

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
	const { data } = authClient.useSession();
	const user = data?.user;

	return (
		<Sidebar variant="floating" collapsible="offcanvas" {...props}>
			<SidebarHeader>
				<SidebarMenu>
					<SidebarMenuItem>
						<SidebarMenuButton>
							<a href="/" className="flex flex-row items-center gap-4">
								<img src="/favicon.ico" alt="logo" className="size-5" />
								<span className="text-base font-semibold">Digital One </span>
							</a>
						</SidebarMenuButton>
					</SidebarMenuItem>
				</SidebarMenu>
			</SidebarHeader>
			<SidebarContent>
				<NavMain items={navMainData} />
			</SidebarContent>
			<SidebarFooter>
				{user ? (
					<NavUser
						user={{
							name: user.name,
							email: user.email,
							avatar: user.image ?? "",
						}}
					/>
				) : null}
			</SidebarFooter>
		</Sidebar>
	);
}
