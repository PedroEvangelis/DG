import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Pencil, Trash } from "lucide-react";
import { useState } from "react";
import {
	AlertDialog,
	AlertDialogAction,
	AlertDialogCancel,
	AlertDialogContent,
	AlertDialogDescription,
	AlertDialogFooter,
	AlertDialogHeader,
	AlertDialogTitle,
	AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogFooter,
	DialogHeader,
	DialogTitle,
	DialogTrigger,
} from "@/components/ui/dialog";
import {
	Pagination,
	PaginationContent,
	PaginationItem,
	PaginationLink,
	PaginationNext,
	PaginationPrevious,
} from "@/components/ui/pagination";
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@/components/ui/select";
import {
	Table,
	TableBody,
	TableCell,
	TableHead,
	TableHeader,
	TableRow,
} from "@/components/ui/table";
import { api } from "@/lib/api";
import { ROLES, type Role } from "@backend/constants/roles";

import type { User } from "@/types";

export function AdminDashboard() {
	const queryClient = useQueryClient();
	const [selectedUser, setSelectedUser] = useState<User | null>(null);

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

	const { mutate: updateUser } = useMutation({
		mutationFn: (data: { id: string; body: { role: Role } }) =>
			api.users({ id: data.id }).put(data.body),
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: ["users"] });
		},
	});

	const { mutate: deleteUser } = useMutation({
		mutationFn: (id: string) => api.users({ id }).delete(),
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: ["users"] });
		},
	});

	if (isLoading) {
		return <div>Loading...</div>;
	}

	return (
		<div className="p-4">
			<h1 className="text-2xl font-bold mb-4">Admin Dashboard</h1>
			<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
				<Card>
					<CardHeader>
						<CardTitle>Total Users</CardTitle>
					</CardHeader>
					<CardContent>
						<p className="text-3xl font-bold">{users.length}</p>
					</CardContent>
				</Card>
				<Card>
					<CardHeader>
						<CardTitle>Admin Users</CardTitle>
					</CardHeader>
					<CardContent>
						<p className="text-3xl font-bold">
							{users.filter((user) => user.role === "admin").length}
						</p>
					</CardContent>
				</Card>
				<Card>
					<CardHeader>
						<CardTitle>Regular Users</CardTitle>
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
					<CardTitle>Users</CardTitle>
				</CardHeader>
				<CardContent>
					<Table>
						<TableHeader>
							<TableRow>
								<TableHead>Name</TableHead>
								<TableHead>Email</TableHead>
								<TableHead>Role</TableHead>
								<TableHead>Actions</TableHead>
							</TableRow>
						</TableHeader>
						<TableBody>
							{users.map((user) => (
								<TableRow key={user.id}>
									<TableCell>{user.name}</TableCell>
									<TableCell>{user.email}</TableCell>
									<TableCell>{user.role}</TableCell>
									<TableCell>
										<Dialog
											onOpenChange={(open) => !open && setSelectedUser(null)}
										>
											<DialogTrigger asChild>
												<Button
													variant="outline"
													size="sm"
													onClick={() => setSelectedUser(user)}
												>
													<Pencil className="h-4 w-4" />
												</Button>
											</DialogTrigger>
											<DialogContent>
												<DialogHeader>
													<DialogTitle>Edit User</DialogTitle>
													<DialogDescription>
														Edit the user's role.
													</DialogDescription>
												</DialogHeader>
												<Select
													defaultValue={user.role}
													onValueChange={(value) =>
														setSelectedUser({ ...user, role: value as Role })
													}
												>
													<SelectTrigger>
														<SelectValue placeholder="Select a role" />
													</SelectTrigger>
													<SelectContent>
														<SelectItem value={ROLES.ADMIN}>Admin</SelectItem>
														<SelectItem value={ROLES.USER}>User</SelectItem>
													</SelectContent>
												</Select>
												<DialogFooter>
													<Button
														onClick={() => {
															if (selectedUser) {
																updateUser({
																	id: selectedUser.id,
																	body: { role: selectedUser.role as Role },
																});
															}
														}}
													>
														Save
													</Button>
												</DialogFooter>
											</DialogContent>
										</Dialog>
										<AlertDialog>
											<AlertDialogTrigger asChild>
												<Button
													variant="destructive"
													size="sm"
													className="ml-2"
													onClick={() => setSelectedUser(user)}
												>
													<Trash className="h-4 w-4" />
												</Button>
											</AlertDialogTrigger>
											<AlertDialogContent>
												<AlertDialogHeader>
													<AlertDialogTitle>Are you sure?</AlertDialogTitle>
													<AlertDialogDescription>
														This action cannot be undone.
													</AlertDialogDescription>
												</AlertDialogHeader>
												<AlertDialogFooter>
													<AlertDialogCancel>Cancel</AlertDialogCancel>
													<AlertDialogAction
														onClick={() => {
															if (selectedUser) {
																deleteUser(selectedUser.id);
															}
														}}
													>
														Delete
													</AlertDialogAction>
												</AlertDialogFooter>
											</AlertDialogContent>
										</AlertDialog>
									</TableCell>
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
