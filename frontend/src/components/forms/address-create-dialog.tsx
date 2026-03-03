import { useForm } from "@tanstack/react-form";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Loader2, MapPinPlus } from "lucide-react";
import * as React from "react";
import { toast } from "sonner";
import { z } from "zod";

import { Button } from "@/components/ui/button";
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
	Field,
	FieldError,
	FieldGroup,
	FieldLabel,
} from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { api } from "@/lib/api";

const addressSchema = z.object({
	zipCode: z
		.string()
		.min(1, "CEP é obrigatório")
		.regex(/^\d{8}$/, "CEP deve ter 8 dígitos"),
	street: z.string().min(1, "Rua é obrigatória"),
	number: z.string().min(1, "Número é obrigatório"),
	complement: z.string().optional(),
	neighborhood: z.string().min(1, "Bairro é obrigatório"),
	city: z.string().min(1, "Cidade é obrigatória"),
	state: z.string().length(2, "UF deve ter 2 caracteres"),
});

type AddressFormValues = z.infer<typeof addressSchema>;

export function AddressCreateDialog({ userId }: { userId: string }) {
	const [isOpen, setIsOpen] = React.useState(false);
	const queryClient = useQueryClient();

	const { mutate, isPending } = useMutation({
		mutationFn: async (values: AddressFormValues) => {
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
			setIsOpen(false);
			form.reset();
		},
		onError: (error: any) => {
			toast.error(error?.value?.message || "Erro ao adicionar endereço");
		},
	});

	const form = useForm({
		defaultValues: {
			zipCode: "",
			street: "",
			number: "",
			complement: "",
			neighborhood: "",
			city: "",
			state: "",
		} as AddressFormValues,
		validators: {
			onChange: addressSchema,
		},
		onSubmit: ({ value }) => mutate(value),
	});

	const { mutate: handleCepLookup, isPending: isLookingUpCep } = useMutation({
		mutationFn: async (cep: string) => {
			const res = await api.integrations.cep({ cep }).get();
			if (res.error) throw new Error("CEP não encontrado");
			return res.data;
		},
		onSuccess: (data: any) => {
			if (data?.data) {
				const addressData = data.data;
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

	return (
		<Dialog open={isOpen} onOpenChange={setIsOpen}>
			<DialogTrigger asChild>
				<Button variant="outline" size="sm">
					<MapPinPlus className="mr-2 h-4 w-4" />
					Adicionar Endereço
				</Button>
			</DialogTrigger>
			<DialogContent className="sm:max-w-[500px]">
				<DialogHeader>
					<DialogTitle>Novo Endereço</DialogTitle>
					<DialogDescription>
						Preencha os dados do endereço. O CEP preencherá os campos
						automaticamente.
					</DialogDescription>
				</DialogHeader>
				<form
					onSubmit={(e) => {
						e.preventDefault();
						e.stopPropagation();
						form.handleSubmit();
					}}
				>
					<FieldGroup className="py-4">
						<form.Field
							name="zipCode"
							children={(field) => (
								<Field
									data-invalid={
										field.state.meta.isTouched &&
										field.state.meta.errors.length > 0
									}
								>
									<FieldLabel htmlFor={field.name}>
										CEP{" "}
										{isLookingUpCep && (
											<Loader2 className="inline ml-2 h-3 w-3 animate-spin" />
										)}
									</FieldLabel>
									<Input
										id={field.name}
										placeholder="00000000"
										maxLength={8}
										value={field.state.value}
										onBlur={field.handleBlur}
										onChange={(e) => {
											const val = e.target.value.replace(/\D/g, "");
											field.handleChange(val);
											if (val.length === 8) {
												handleCepLookup(val);
											}
										}}
									/>
									<FieldError errors={field.state.meta.errors} />
								</Field>
							)}
						/>

						<form.Field
							name="street"
							children={(field) => (
								<Field
									data-invalid={
										field.state.meta.isTouched &&
										field.state.meta.errors.length > 0
									}
								>
									<FieldLabel htmlFor={field.name}>Rua</FieldLabel>
									<Input
										id={field.name}
										value={field.state.value}
										onBlur={field.handleBlur}
										onChange={(e) => field.handleChange(e.target.value)}
									/>
									<FieldError errors={field.state.meta.errors} />
								</Field>
							)}
						/>

						<div className="grid grid-cols-2 gap-4">
							<form.Field
								name="number"
								children={(field) => (
									<Field
										data-invalid={
											field.state.meta.isTouched &&
											field.state.meta.errors.length > 0
										}
									>
										<FieldLabel htmlFor={field.name}>Número</FieldLabel>
										<Input
											id={field.name}
											value={field.state.value}
											onBlur={field.handleBlur}
											onChange={(e) => field.handleChange(e.target.value)}
										/>
										<FieldError errors={field.state.meta.errors} />
									</Field>
								)}
							/>
							<form.Field
								name="complement"
								children={(field) => (
									<Field
										data-invalid={
											field.state.meta.isTouched &&
											field.state.meta.errors.length > 0
										}
									>
										<FieldLabel htmlFor={field.name}>Complemento</FieldLabel>
										<Input
											id={field.name}
											value={field.state.value}
											onBlur={field.handleBlur}
											onChange={(e) => field.handleChange(e.target.value)}
										/>
										<FieldError errors={field.state.meta.errors} />
									</Field>
								)}
							/>
						</div>

						<form.Field
							name="neighborhood"
							children={(field) => (
								<Field
									data-invalid={
										field.state.meta.isTouched &&
										field.state.meta.errors.length > 0
									}
								>
									<FieldLabel htmlFor={field.name}>Bairro</FieldLabel>
									<Input
										id={field.name}
										value={field.state.value}
										onBlur={field.handleBlur}
										onChange={(e) => field.handleChange(e.target.value)}
									/>
									<FieldError errors={field.state.meta.errors} />
								</Field>
							)}
						/>

						<div className="grid grid-cols-3 gap-4">
							<div className="col-span-2">
								<form.Field
									name="city"
									children={(field) => (
										<Field
											data-invalid={
												field.state.meta.isTouched &&
												field.state.meta.errors.length > 0
											}
										>
											<FieldLabel htmlFor={field.name}>Cidade</FieldLabel>
											<Input
												id={field.name}
												value={field.state.value}
												onBlur={field.handleBlur}
												onChange={(e) => field.handleChange(e.target.value)}
											/>
											<FieldError errors={field.state.meta.errors} />
										</Field>
									)}
								/>
							</div>
							<form.Field
								name="state"
								children={(field) => (
									<Field
										data-invalid={
											field.state.meta.isTouched &&
											field.state.meta.errors.length > 0
										}
									>
										<FieldLabel htmlFor={field.name}>UF</FieldLabel>
										<Input
											id={field.name}
											maxLength={2}
											className="uppercase"
											value={field.state.value}
											onBlur={field.handleBlur}
											onChange={(e) =>
												field.handleChange(e.target.value.toUpperCase())
											}
										/>
										<FieldError errors={field.state.meta.errors} />
									</Field>
								)}
							/>
						</div>
					</FieldGroup>
					<DialogFooter>
						<Button type="submit" disabled={isPending}>
							{isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
							Salvar Endereço
						</Button>
					</DialogFooter>
				</form>
			</DialogContent>
		</Dialog>
	);
}
