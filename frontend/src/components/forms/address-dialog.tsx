import { MapPinPlus } from "lucide-react";
import * as React from "react";

import { Button } from "@/components/ui/button";
import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogHeader,
	DialogTitle,
	DialogTrigger,
} from "@/components/ui/dialog";
import type { Address } from "@/types";
import { AddressForm } from "./address-form";

interface AddressDialogProps {
	userId: string;
	address?: Address;
	children?: React.ReactNode;
}

export function AddressDialog({
	userId,
	address,
	children,
}: AddressDialogProps) {
	const [isOpen, setIsOpen] = React.useState(false);
	const isEditing = !!address;

	return (
		<Dialog open={isOpen} onOpenChange={setIsOpen}>
			<DialogTrigger asChild>
				{children || (
					<Button variant="outline" size="sm">
						<MapPinPlus className="mr-2 h-4 w-4" />
						Adicionar Endereço
					</Button>
				)}
			</DialogTrigger>
			<DialogContent className="sm:max-w-[600px]">
				<DialogHeader>
					<DialogTitle>
						{isEditing ? "Editar Endereço" : "Novo Endereço"}
					</DialogTitle>
					<DialogDescription>
						{isEditing
							? "Altere os dados do endereço abaixo."
							: "Preencha os dados do endereço. O CEP preencherá os campos automaticamente."}
					</DialogDescription>
				</DialogHeader>
				<div className="py-4">
					<AddressForm
						userId={userId}
						initialData={address}
						onSuccess={() => setIsOpen(false)}
					/>
				</div>
			</DialogContent>
		</Dialog>
	);
}
