import { useForm } from "@tanstack/react-form";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Loader2, Trash2 } from "lucide-react";
import { toast } from "sonner";
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
import {
	Field,
	FieldError,
	FieldGroup,
	FieldLabel,
} from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { api } from "@/lib/api";
import { type AddressValues, addressSchema } from "@/lib/validators/address";
import type { Address } from "@/types";

interface AddressFormProps {
	userId: string;
	initialData?: Address;
	onSuccess?: () => void;
}

export function AddressForm({
	userId,
	initialData,
	onSuccess,
}: AddressFormProps) {
	const queryClient = useQueryClient();
	const isEditing = !!initialData;

	const { mutate: createAddress, isPending: isCreating } = useMutation({
		mutationFn: async (values: AddressValues) => {
			const res = await api.addresses.user({ userId }).post({
				cep: values.zipCode,
				street: values.street,
				number: values.number,
				complement: values.complement || "",
				neighborhood: values.neighborhood,
				city: values.city,
				state: values.state,
			});

			if (res.error) throw res.error;
			return res.data;
		},
		onSuccess: () => {
			toast.success("Endereço adicionado com sucesso!");
			queryClient.invalidateQueries({ queryKey: ["addresses", userId] });
			form.reset();
			onSuccess?.();
		},
		onError: (error: unknown) => {
			let message = "Erro ao adicionar endereço";
			if (error && typeof error === "object" && "value" in error) {
				const val = (error as { value: any }).value;
				if (val && typeof val === "object" && "message" in val) {
					message = String(val.message);
				} else if (typeof val === "string") {
					message = val;
				}
			}
			toast.error(message);
		},
	});

	const { mutate: updateAddress, isPending: isUpdating } = useMutation({
		mutationFn: async (values: AddressValues) => {
			if (!initialData?.id) throw new Error("ID do endereço não encontrado");
			const res = await api.addresses({ id: initialData!.id }).put({
				cep: values.zipCode,
				street: values.street,
				number: values.number,
				complement: values.complement || "",
				neighborhood: values.neighborhood,
				city: values.city,
				state: values.state,
			});

			if (res.error) throw res.error;
			return res.data;
		},
		onSuccess: () => {
			toast.success("Endereço atualizado com sucesso!");
			queryClient.invalidateQueries({ queryKey: ["addresses", userId] });
			onSuccess?.();
		},
		onError: (error: unknown) => {
			let message = "Erro ao atualizar endereço";
			if (error && typeof error === "object" && "value" in error) {
				const val = (error as { value: any }).value;
				if (val && typeof val === "object" && "message" in val) {
					message = String(val.message);
				} else if (typeof val === "string") {
					message = val;
				}
			}
			toast.error(message);
		},
	});

	const { mutate: deleteAddress, isPending: isDeleting } = useMutation({
		mutationFn: async () => {
			if (!initialData?.id) throw new Error("ID do endereço não encontrado");
			const res = await api.addresses({ id: initialData!.id }).delete();
			if (res.error) throw res.error;
			return res.data;
		},
		onSuccess: () => {
			toast.success("Endereço removido com sucesso!");
			queryClient.invalidateQueries({ queryKey: ["addresses", userId] });
			onSuccess?.();
		},
		onError: (error: unknown) => {
			let message = "Erro ao remover endereço";
			if (error && typeof error === "object" && "value" in error) {
				const val = (error as { value: any }).value;
				if (val && typeof val === "object" && "message" in val) {
					message = String(val.message);
				} else if (typeof val === "string") {
					message = val;
				}
			}
			toast.error(message);
		},
	});

	const form = useForm({
		defaultValues: {
			zipCode: initialData?.cep || "",
			street: initialData?.street || "",
			number: initialData?.number || "",
			complement: initialData?.complement || "",
			neighborhood: initialData?.neighborhood || "",
			city: initialData?.city || "",
			state: initialData?.state || "",
		} as AddressValues,
		validators: {
			onChange: addressSchema,
		},
		onSubmit: ({ value }) => {
			if (isEditing) {
				updateAddress(value);
			} else {
				createAddress(value);
			}
		},
	});

	const { mutate: handleCepLookup, isPending: isLookingUpCep } = useMutation({
		mutationFn: async (cep: string) => {
			const response = await api.integrations.cep({ cep }).get();
			if (response.error) throw new Error("CEP não encontrado");
			return response.data;
		},
		onSuccess: (data: any) => {
			// biome-ignore lint/suspicious/noExplicitAny: integration response handling
			const addressData = data?.data || data;
			if (addressData) {
				form.setFieldValue("street", addressData.logradouro);
				form.setFieldValue("neighborhood", addressData.bairro);
				form.setFieldValue("city", addressData.localidade);
				form.setFieldValue("state", addressData.uf);
				toast.success("Endereço preenchido automaticamente!");
			}
		},
		onError: () => {
			toast.error("Não foi possível localizar o CEP.");
		},
	});

	const isSubmitting = isCreating || isUpdating || isDeleting;

	const FormFieldWrapper = ({
		field,
		label,
		placeholder,
		maxLength,
		className,
		onChangeOverride,
	}: {
		// biome-ignore lint/suspicious/noExplicitAny: TanStack Form field type
		field: any;
		label: string;
		placeholder?: string;
		maxLength?: number;
		className?: string;
		onChangeOverride?: (val: string) => void;
	}) => {
		const isInvalid =
			field.state.meta.isTouched && field.state.meta.errors.length > 0;
		return (
			<Field data-invalid={isInvalid} className={className}>
				<FieldLabel htmlFor={field.name}>
					{label}{" "}
					{field.name === "zipCode" && isLookingUpCep && (
						<Loader2 className="inline ml-2 h-3 w-3 animate-spin" />
					)}
				</FieldLabel>
				<Input
					id={field.name}
					placeholder={placeholder}
					maxLength={maxLength}
					value={field.state.value}
					onBlur={field.handleBlur}
					onChange={(e) => {
						const val = e.target.value;
						if (onChangeOverride) {
							onChangeOverride(val);
						} else {
							field.handleChange(val);
						}
					}}
				/>
				<FieldError errors={field.state.meta.errors} />
			</Field>
		);
	};

	return (
		<form
			id="address-form"
			onSubmit={(e) => {
				e.preventDefault();
				e.stopPropagation();
				form.handleSubmit();
			}}
			className="space-y-4"
		>
			<FieldGroup className="grid grid-cols-1 md:grid-cols-2 gap-4">
				<form.Field
					name="zipCode"
					children={(field) => (
						<FormFieldWrapper
							field={field}
							label="CEP"
							placeholder="00000000"
							maxLength={8}
							onChangeOverride={(val) => {
								const cleanVal = val.replace(/\D/g, "");
								field.handleChange(cleanVal);
								if (cleanVal.length === 8) {
									handleCepLookup(cleanVal);
								}
							}}
						/>
					)}
				/>
				<form.Field
					name="street"
					children={(field) => (
						<FormFieldWrapper
							field={field}
							label="Rua"
							className="md:col-span-2"
						/>
					)}
				/>
				<form.Field
					name="number"
					children={(field) => (
						<FormFieldWrapper field={field} label="Número" />
					)}
				/>
				<form.Field
					name="complement"
					children={(field) => (
						<FormFieldWrapper field={field} label="Complemento" />
					)}
				/>
				<form.Field
					name="neighborhood"
					children={(field) => (
						<FormFieldWrapper field={field} label="Bairro" />
					)}
				/>
				<form.Field
					name="city"
					children={(field) => (
						<FormFieldWrapper
							field={field}
							label="Cidade"
							className="md:col-span-2"
						/>
					)}
				/>
				<form.Field
					name="state"
					children={(field) => (
						<FormFieldWrapper
							field={field}
							label="UF"
							maxLength={2}
							onChangeOverride={(val) => field.handleChange(val.toUpperCase())}
						/>
					)}
				/>
			</FieldGroup>
			<div className="flex justify-between items-center pt-4">
				{isEditing ? (
					<AlertDialog>
						<AlertDialogTrigger asChild>
							<Button
								type="button"
								variant="destructive"
								disabled={isSubmitting}
							>
								{isDeleting ? (
									<Loader2 className="mr-2 h-4 w-4 animate-spin" />
								) : (
									<Trash2 className="mr-2 h-4 w-4" />
								)}
								Excluir
							</Button>
						</AlertDialogTrigger>
						<AlertDialogContent>
							<AlertDialogHeader>
								<AlertDialogTitle>Tem certeza?</AlertDialogTitle>
								<AlertDialogDescription>
									Esta ação não pode ser desfeita. Isso excluirá permanentemente
									o endereço.
								</AlertDialogDescription>
							</AlertDialogHeader>
							<AlertDialogFooter>
								<AlertDialogCancel>Cancelar</AlertDialogCancel>
								<AlertDialogAction
									onClick={() => deleteAddress()}
									className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
								>
									Excluir
								</AlertDialogAction>
							</AlertDialogFooter>
						</AlertDialogContent>
					</AlertDialog>
				) : (
					<div />
				)}
				<div className="flex gap-2">
					{onSuccess && (
						<Button
							type="button"
							variant="outline"
							onClick={onSuccess}
							disabled={isSubmitting}
						>
							Cancelar
						</Button>
					)}
					<Button type="submit" disabled={isSubmitting}>
						{isSubmitting && !isDeleting && (
							<Loader2 className="mr-2 h-4 w-4 animate-spin" />
						)}
						{isEditing ? "Salvar Alterações" : "Salvar Endereço"}
					</Button>
				</div>
			</div>
		</form>
	);
}
