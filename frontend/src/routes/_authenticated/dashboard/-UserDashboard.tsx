import { useQuery } from "@tanstack/react-query";
import { MapPin } from "lucide-react";
import { AddressDialog } from "@/components/forms/address-dialog";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableRow } from "@/components/ui/table";
import { api } from "@/lib/api";
import { authClient } from "@/lib/auth-client";

import type { Address } from "@/types";

export function UserDashboard() {
	const { data: session } = authClient.useSession();
	const userId = session?.user?.id ?? "";

	const { data: userResponse, isLoading: isUserLoading } = useQuery({
		queryKey: ["user", userId],
		queryFn: () => api.users({ id: userId }).get(),
		enabled: !!userId,
	});
	const user = userResponse?.data?.data;

	const { data: addressesResponse, isLoading: areAddressesLoading } = useQuery({
		queryKey: ["addresses", userId],
		queryFn: () => api.addresses.user({ userId }).get(),
		enabled: !!userId,
	});
	const addresses = addressesResponse?.data?.data ?? [];

	if (isUserLoading || areAddressesLoading) {
		return <div>Loading...</div>;
	}

	return (
		<div className="p-4">
			<h1 className="text-2xl font-bold mb-4">User Dashboard</h1>
			<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
				<Card>
					<CardHeader>
						<CardTitle>Bem vindo, {user?.name}!</CardTitle>
					</CardHeader>
					<CardContent>
						<Table>
							<TableBody>
								<TableRow>
									<TableCell className="font-bold">Email</TableCell>
									<TableCell>{user?.email}</TableCell>
								</TableRow>
								<TableRow>
									<TableCell className="font-bold">Cargo</TableCell>
									<TableCell className="capitalize">{user?.role}</TableCell>
								</TableRow>
								{user?.cpf && (
									<TableRow>
										<TableCell className="font-bold">CPF</TableCell>
										<TableCell>{user?.cpf}</TableCell>
									</TableRow>
								)}
								{user?.cnpj && (
									<TableRow>
										<TableCell className="font-bold">CNPJ</TableCell>
										<TableCell>{user?.cnpj}</TableCell>
									</TableRow>
								)}
								{user?.corporateName && (
									<TableRow>
										<TableCell className="font-bold">Razão social</TableCell>
										<TableCell>{user?.corporateName}</TableCell>
									</TableRow>
								)}
								{user?.tradeName && (
									<TableRow>
										<TableCell className="font-bold">Nome Fantasia</TableCell>
										<TableCell>{user?.tradeName}</TableCell>
									</TableRow>
								)}
							</TableBody>
						</Table>
					</CardContent>
				</Card>
				<Card>
					<CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
						<CardTitle>Endereços</CardTitle>
						<AddressDialog userId={userId} />
					</CardHeader>
					<CardContent>
						{addresses.length === 0 ? (
							<div className="flex flex-col items-center justify-center py-8 text-muted-foreground">
								<MapPin className="h-8 w-8 mb-2 opacity-20" />
								<p>Nenhum endereço cadastrado.</p>
							</div>
						) : (
							<div className="grid grid-cols-1 gap-4">
								{addresses.map((address: Address) => (
									<AddressDialog
										key={address.id}
										userId={userId}
										address={address}
									>
										<div className="p-3 border rounded-lg shadow-sm cursor-pointer hover:bg-muted/50 transition-colors">
											<div className="flex justify-between items-start">
												<div>
													<p className="font-medium">
														{address.street}, {address.number}
													</p>
													{address.complement && (
														<p className="text-sm text-muted-foreground">
															{address.complement}
														</p>
													)}
													<p className="text-sm">
														{address.neighborhood}, {address.city} -{" "}
														{address.state}
													</p>
													<p className="text-sm font-mono text-muted-foreground">
														CEP: {address.cep}
													</p>
												</div>
												<MapPin className="h-4 w-4 text-muted-foreground" />
											</div>
										</div>
									</AddressDialog>
								))}
							</div>
						)}
					</CardContent>
				</Card>
			</div>
		</div>
	);
}
