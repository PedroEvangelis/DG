import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableRow } from "@/components/ui/table";
import { api } from "@/lib/api";
import { authClient } from "@/lib/auth-client";

import type { Address } from "@/types";

export function UserDashboard() {
	const { data: session } = authClient.useSession();
	const userId = session?.user?.id ?? 0;

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
									<TableCell>{user?.role}</TableCell>
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
					<CardHeader>
						<CardTitle>Endereços</CardTitle>
					</CardHeader>
					<CardContent>
						{addresses.map((address: Address) => (
							<div key={address.id} className="mb-4">
								<p>
									{address.street}, {address.number}
								</p>
								<p>
									{address.neighborhood}, {address.city} - {address.state}
								</p>
								<p>{address.cep}</p>
							</div>
						))}
					</CardContent>
				</Card>
			</div>
		</div>
	);
}
