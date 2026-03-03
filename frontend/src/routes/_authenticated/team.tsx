import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { createFileRoute } from "@tanstack/react-router";
import {
	Check,
	Copy,
	KeyRound,
	Loader2,
	UserCheck,
	UserMinus,
} from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

import { UserCreateForm } from "@/components/forms/user-create-form";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogFooter,
	DialogHeader,
	DialogTitle,
} from "@/components/ui/dialog";
import { Toaster } from "@/components/ui/sonner";
import {
	Table,
	TableBody,
	TableCell,
	TableHead,
	TableHeader,
	TableRow,
} from "@/components/ui/table";
import { ROLES } from "@/constants/roles";
import { api } from "@/lib/api";
import { authClient } from "@/lib/auth-client";

export const Route = createFileRoute("/_authenticated/team")({
	component: TeamComponent,
});

function ResetPasswordButton({ userId }: { userId: string }) {
	const [isOpen, setIsOpen] = useState(false);
	const [newPassword, setNewPassword] = useState<string | null>(null);
	const [copied, setCopied] = useState(false);

	const { mutate, isPending } = useMutation({
		mutationFn: async () => {
			const res = await api.users({ id: userId })["reset-password"].post();
			if (res.error) throw res.error;
			const data = res.data as any;
			return data.data;
		},
		onSuccess: (data) => {
			setNewPassword(data.temporaryPassword);
			setIsOpen(true);
		},
		onError: (error: any) => {
			toast.error(error?.value?.message || "Erro ao resetar senha");
		},
	});

	const handleCopy = () => {
		if (newPassword) {
			navigator.clipboard.writeText(newPassword);
			setCopied(true);
			setTimeout(() => setCopied(false), 2000);
			toast.success("Senha copiada!");
		}
	};

	return (
		<>
			<Button
				variant="outline"
				size="sm"
				onClick={() => mutate()}
				disabled={isPending}
			>
				{isPending ? (
					<Loader2 className="h-4 w-4 animate-spin" />
				) : (
					<KeyRound className="h-4 w-4 mr-2" />
				)}
				Resetar Senha
			</Button>

			<Dialog open={isOpen} onOpenChange={setIsOpen}>
				<DialogContent>
					<DialogHeader>
						<DialogTitle>Senha Resetada!</DialogTitle>
						<DialogDescription>
							Uma nova senha foi gerada. Copie-a e envie ao usuário.
						</DialogDescription>
					</DialogHeader>
					<div className="flex items-center space-x-2 bg-muted p-4 rounded-md">
						<code className="flex-1 text-lg font-mono">{newPassword}</code>
						<Button size="icon" variant="ghost" onClick={handleCopy}>
							{copied ? (
								<Check className="h-4 w-4 text-green-500" />
							) : (
								<Copy className="h-4 w-4" />
							)}
						</Button>
					</div>
					<DialogFooter>
						<Button onClick={() => setIsOpen(false)}>Fechar</Button>
					</DialogFooter>
				</DialogContent>
			</Dialog>
		</>
	);
}

function ToggleStatusButton({
	userId,
	isBanned,
}: {
	userId: string;
	isBanned: boolean;
}) {
	const queryClient = useQueryClient();
	const { mutate, isPending } = useMutation({
		mutationFn: async () => {
			const res = await api.users({ id: userId })["toggle-status"].post();
			if (res.error) throw res.error;
			return res.data;
		},
		onSuccess: () => {
			toast.success(
				isBanned
					? "Usuário ativado com sucesso!"
					: "Usuário inativado com sucesso!",
			);
			queryClient.invalidateQueries({ queryKey: ["users"] });
		},
		onError: (error: any) => {
			toast.error(error?.value?.message || "Erro ao alterar status");
		},
	});

	return (
		<Button
			variant={isBanned ? "default" : "destructive"}
			size="sm"
			onClick={() => mutate()}
			disabled={isPending}
		>
			{isPending ? (
				<Loader2 className="h-4 w-4 animate-spin" />
			) : isBanned ? (
				<UserCheck className="h-4 w-4 mr-2" />
			) : (
				<UserMinus className="h-4 w-4 mr-2" />
			)}
			{isBanned ? "Ativar" : "Inativar"}
		</Button>
	);
}

function TeamComponent() {
	const { data: session } = authClient.useSession();
	const isAdmin = (session?.user as any)?.role === ROLES.ADMIN;

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
				{isAdmin && <UserCreateForm />}
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
								<TableHead>Status</TableHead>
								{isAdmin && <TableHead className="text-right">Ações</TableHead>}
							</TableRow>
						</TableHeader>
						<TableBody>
							{users.map((user: any) => (
								<TableRow key={user.id}>
									<TableCell>{user.name ?? user.corporateName}</TableCell>
									<TableCell>{user.email}</TableCell>
									<TableCell>
										<Badge variant="outline" className="capitalize">
											{user.role}
										</Badge>
									</TableCell>
									<TableCell>
										<Badge variant={user.banned ? "destructive" : "default"}>
											{user.banned ? "Inativo" : "Ativo"}
										</Badge>
									</TableCell>
									{isAdmin && (
										<TableCell className="text-right space-x-2">
											<ResetPasswordButton userId={user.id} />
											<ToggleStatusButton
												userId={user.id}
												isBanned={user.banned}
											/>
										</TableCell>
									)}
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
