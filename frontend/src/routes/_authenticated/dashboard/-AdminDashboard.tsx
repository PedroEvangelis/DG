import { useQuery } from "@tanstack/react-query";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
	Pagination,
	PaginationContent,
	PaginationItem,
	PaginationLink,
	PaginationNext,
	PaginationPrevious,
} from "@/components/ui/pagination";
import {
	Table,
	TableBody,
	TableCell,
	TableHead,
	TableHeader,
	TableRow,
} from "@/components/ui/table";
import { api } from "@/lib/api";

export function AdminDashboard() {
	const { data: usersResponse, isLoading } = useQuery({
		queryKey: ["users"],
		queryFn: async () => {
			const res = await api.users.get();
			if (res.error) {
				throw new Error("Failed to fetch users");
			}
			return res.data;
		},
	});
	const users = usersResponse?.data ?? [];

	if (isLoading) {
		return <div>Carregando...</div>;
	}

	return (
		<div className="p-4">
			<h1 className="text-2xl font-bold mb-4">Admin Dashboard</h1>
			<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
				<Card>
					<CardHeader>
						<CardTitle>Total de usuários</CardTitle>
					</CardHeader>
					<CardContent>
						<p className="text-3xl font-bold">{users.length}</p>
					</CardContent>
				</Card>
				<Card>
					<CardHeader>
						<CardTitle>Usuários admin</CardTitle>
					</CardHeader>
					<CardContent>
						<p className="text-3xl font-bold">
							{users.filter((user) => user.role === "admin").length}
						</p>
					</CardContent>
				</Card>
				<Card>
					<CardHeader>
						<CardTitle>Usuários normais</CardTitle>
					</CardHeader>
					<CardContent>
						<p className="text-3xl font-bold">
							{users.filter((user) => user.role === "user").length}
						</p>
					</CardContent>
				</Card>
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
							{users.map((user) => (
								<TableRow key={user.id}>
									<TableCell>{user.name}</TableCell>
									<TableCell>{user.email}</TableCell>
									<TableCell>{user.role}</TableCell>
								</TableRow>
							))}
						</TableBody>
					</Table>
				</CardContent>
			</Card>
			<Pagination className="mt-4">
				<PaginationContent>
					<PaginationItem>
						<PaginationPrevious href="#" />
					</PaginationItem>
					<PaginationItem>
						<PaginationLink href="#">1</PaginationLink>
					</PaginationItem>
					<PaginationItem>
						<PaginationLink href="#">2</PaginationLink>
					</PaginationItem>
					<PaginationItem>
						<PaginationLink href="#">3</PaginationLink>
					</PaginationItem>
					<PaginationItem>
						<PaginationNext href="#" />
					</PaginationItem>
				</PaginationContent>
			</Pagination>
		</div>
	);
}
