import { useQuery } from "@tanstack/react-query";
import { createFileRoute } from "@tanstack/react-router";

import { UserCreateForm } from "@/components/forms/user-create-form";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
	Table,
	TableBody,
	TableCell,
	TableHead,
	TableHeader,
	TableRow,
} from "@/components/ui/table";
import { Toaster } from "@/components/ui/sonner";
import { api } from "@/lib/api";

export const Route = createFileRoute("/_authenticated/team")({
	component: TeamComponent,
});

function TeamComponent() {
	const { data: usersResponse, isLoading } = useQuery({
		queryKey: ["users"],
		queryFn: async () => {
			const res = await api.users.get();
			if (res.error) throw new Error("Failed to fetch users");
			return res.data;
		},
	});
	const users = usersResponse?.data ?? [];

	if (isLoading) {
		return <div>Loading...</div>;
	}

	return (
		<div className="p-4">
			<div className="flex justify-between items-center mb-4">
				<h1 className="text-2xl font-bold">Gerenciamento do time</h1>
				<UserCreateForm />
			</div>
			<Card>
				<CardHeader>
					<CardTitle>Usuários</CardTitle>
				</CardHeader>
				<CardContent>
					<Table>
						<TableHeader>
							<TableRow>
								<TableHead>Nome</TableHead>
								<TableHead>Email</TableHead>
								<TableHead>Cargo</TableHead>
							</TableRow>
						</TableHeader>
						<TableBody>
							{users.map((user: any) => (
								<TableRow key={user.id}>
									<TableCell>{user.name ?? user.corporateName}</TableCell>
									<TableCell>{user.email}</TableCell>
									<TableCell>{user.role}</TableCell>
								</TableRow>
							))}
						</TableBody>
					</Table>
				</CardContent>
			</Card>
			<Toaster />
		</div>
	);
}
