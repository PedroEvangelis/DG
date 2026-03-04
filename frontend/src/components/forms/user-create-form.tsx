import { useForm } from "@tanstack/react-form";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Check, Copy, Loader2, Plus } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import z from "zod";
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
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@/components/ui/select";
import { USER_GENDERS, type UserGender } from "@/constants/userGender";
import { USER_TYPES, type UserType } from "@/constants/userType";
import { api } from "@/lib/api";

const userFormSchema = z.discriminatedUnion("type", [
	z.object({
		type: z.literal(USER_TYPES.PF),
		name: z.string().min(1, "Nome é obrigatório"),
		email: z.string().email("E-mail inválido"),
		cpf: z.string().min(11, "CPF inválido"),
		dob: z.string().min(1, "Data é obrigatória"),
		gender: z.enum([
			USER_GENDERS.MALE,
			USER_GENDERS.FEMALE,
			USER_GENDERS.OTHER,
			USER_GENDERS.NOT_DECLARED,
		]),
	}),
	z.object({
		type: z.literal(USER_TYPES.PJ),
		name: z.string().min(1, "Nome é obrigatório"),
		email: z.string().email("E-mail inválido"),
		cnpj: z.string().min(14, "CNPJ inválido"),
		corporateName: z.string().min(1, "Razão Social é obrigatória"),
		tradeName: z.string().min(1, "Nome Fantasia é obrigatório"),
	}),
]);

type UserFormValues = z.infer<typeof userFormSchema>;

interface FormInputProps {
	field: any;
	label: string;
	type?: string;
	placeholder?: string;
}

const FormFieldWrapper = ({
	field,
	label,
	type = "text",
	placeholder,
}: FormInputProps) => {
	const isInvalid =
		field.state.meta.isTouched && field.state.meta.errors.length > 0;
	return (
		<Field data-invalid={isInvalid}>
			<FieldLabel htmlFor={field.name}>{label}</FieldLabel>
			<Input
				id={field.name}
				type={type}
				placeholder={placeholder}
				value={field.state.value}
				onBlur={field.handleBlur}
				onChange={(e) => field.handleChange(e.target.value)}
			/>
			<FieldError errors={field.state.meta.errors} />
		</Field>
	);
};

export function UserCreateForm() {
	const [isOpen, setIsOpen] = useState(false);
	const [generatedPassword, setGeneratedPassword] = useState<string | null>(
		null,
	);
	const [copied, setCopied] = useState(false);
	const queryClient = useQueryClient();

	const { mutate, isPending } = useMutation({
		mutationFn: async (values: UserFormValues) => {
			// Filtra apenas os campos relevantes para o tipo selecionado para evitar erro de validação no backend
			// (Campos irrelevantes com string vazia "" causam falha no t.Union do TypeBox)
			const userData =
				values.type === USER_TYPES.PF
					? {
							type: values.type,
							name: values.name,
							email: values.email,
							cpf: values.cpf.replace(/\D/g, ""),
							dob: values.dob,
							gender: values.gender,
						}
					: {
							type: values.type,
							name: values.name,
							email: values.email,
							cnpj: values.cnpj.replace(/\D/g, ""),
							corporateName: values.corporateName,
							tradeName: values.tradeName,
						};

			const response = await api.users.post(userData as any);

			if (response.error) throw response.error;

			return response.data.data as any;
		},
		onSuccess: (data) => {
			toast.success("Usuário criado com sucesso!");
			queryClient.invalidateQueries({ queryKey: ["users"] });
			setGeneratedPassword(data.temporaryPassword || null);
			if (!data.temporaryPassword) {
				setIsOpen(false);
				form.reset();
			}
		},
		onError: (error: { value: { message: string } | string }) => {
			const message =
				typeof error?.value == "string"
					? error?.value
					: error?.value?.message || "Erro ao criar usuário";
			toast.error(message);
		},
	});

	const form = useForm({
		defaultValues: {
			type: USER_TYPES.PF,
			name: "",
			email: "",
			cpf: "",
			dob: "",
			gender: USER_GENDERS.NOT_DECLARED,
			cnpj: "",
			corporateName: "",
			tradeName: "",
		} as UserFormValues,
		validators: { onChange: userFormSchema },
		onSubmit: ({ value }) => mutate(value),
	});

	const { mutate: handleCnpjLookup, isPending: isLookingUpCnpj } = useMutation({
		mutationFn: async (cnpj: string) => {
			const response = await api.integrations.cnpj({ cnpj }).get();
			if (response.error) throw new Error("CNPJ não encontrado");
			return response.data;
		},
		onSuccess: ({ data }) => {
			if (data) {
				form.setFieldValue("corporateName", data.nome);
				form.setFieldValue("name", data.nome);
				form.setFieldValue("tradeName", data.fantasia || data.nome);
				toast.success("Dados da empresa preenchidos automaticamente!");
			}
		},
		onError: () => {
			toast.error("Não foi possível localizar o CNPJ.");
		},
	});

	const handleCopy = () => {
		if (generatedPassword) {
			navigator.clipboard.writeText(generatedPassword);
			setCopied(true);
			setTimeout(() => setCopied(false), 2000);
			toast.success("Senha copiada para a área de transferência!");
		}
	};

	const handleClose = () => {
		setIsOpen(false);
		setGeneratedPassword(null);
		form.reset();
	};

	return (
		<Dialog
			open={isOpen}
			onOpenChange={(val) => {
				if (!val && generatedPassword) return; // Prevent closing if password shown and not acknowledged
				setIsOpen(val);
			}}
		>
			<DialogTrigger asChild>
				<Button>
					Novo usuário <Plus className="ml-2 h-4 w-4" />
				</Button>
			</DialogTrigger>
			<DialogContent className="max-w-2xl">
				{generatedPassword ? (
					<div className="space-y-6">
						<DialogHeader>
							<DialogTitle>Usuário Criado com Sucesso!</DialogTitle>
							<DialogDescription>
								Esta é a senha temporária do usuário. Copie-a e envie
								manualmente, pois ela não será exibida novamente neste formato.
							</DialogDescription>
						</DialogHeader>
						<div className="flex items-center space-x-2 bg-muted p-4 rounded-md">
							<code className="flex-1 text-lg font-mono">
								{generatedPassword}
							</code>
							<Button size="icon" variant="ghost" onClick={handleCopy}>
								{copied ? (
									<Check className="h-4 w-4 text-green-500" />
								) : (
									<Copy className="h-4 w-4" />
								)}
							</Button>
						</div>
						<DialogFooter>
							<Button onClick={handleClose}>Concluir e Fechar</Button>
						</DialogFooter>
					</div>
				) : (
					<>
						<DialogHeader>
							<DialogTitle>Criar novo usuário</DialogTitle>
							<DialogDescription>
								Preencha os dados abaixo para cadastrar. A senha será gerada
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
							<FieldGroup className="space-y-6">
								{/* Seletor de Tipo */}
								<form.Field
									name="type"
									children={(field) => (
										<Field>
											<FieldLabel>Tipo de Cadastro</FieldLabel>
											<Select
												value={field.state.value}
												onValueChange={(e) => field.handleChange(e as UserType)}
											>
												<SelectTrigger>
													<SelectValue />
												</SelectTrigger>
												<SelectContent>
													<SelectItem value={USER_TYPES.PF}>
														Pessoa Física
													</SelectItem>
													<SelectItem value={USER_TYPES.PJ}>
														Pessoa Jurídica
													</SelectItem>
												</SelectContent>
											</Select>
										</Field>
									)}
								/>

								<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
									<form.Field
										name="name"
										children={(field) => (
											<FormFieldWrapper field={field} label="Nome Completo" />
										)}
									/>
									<form.Field
										name="email"
										children={(field) => (
											<FormFieldWrapper
												field={field}
												label="E-mail"
												type="email"
											/>
										)}
									/>

									<form.Subscribe selector={(state) => state.values.type}>
										{(type) =>
											type === "pf" ? (
												<>
													<form.Field
														name="cpf"
														children={(field) => (
															<Field
																data-invalid={
																	field.state.meta.isTouched &&
																	field.state.meta.errors.length > 0
																}
															>
																<FieldLabel htmlFor={field.name}>
																	CPF
																</FieldLabel>
																<Input
																	id={field.name}
																	placeholder="000.000.000-00"
																	value={field.state.value}
																	onBlur={field.handleBlur}
																	onChange={(e) => {
																		const value = e.target.value.replace(
																			/\D/g,
																			"",
																		);
																		field.handleChange(value);
																	}}
																/>
																<FieldError errors={field.state.meta.errors} />
															</Field>
														)}
													/>
													<form.Field
														name="dob"
														children={(field) => (
															<FormFieldWrapper
																field={field}
																label="Data de Nascimento"
																type="date"
															/>
														)}
													/>
													<form.Field
														name="gender"
														children={(field) => (
															<Field>
																<FieldLabel>Gênero</FieldLabel>
																<Select
																	value={field.state.value}
																	onValueChange={(e) =>
																		field.handleChange(e as UserGender)
																	}
																>
																	<SelectTrigger>
																		<SelectValue />
																	</SelectTrigger>
																	<SelectContent>
																		<SelectItem value={USER_GENDERS.MALE}>
																			Masculino
																		</SelectItem>
																		<SelectItem value={USER_GENDERS.FEMALE}>
																			Feminino
																		</SelectItem>
																		<SelectItem value={USER_GENDERS.OTHER}>
																			Outro
																		</SelectItem>
																		<SelectItem
																			value={USER_GENDERS.NOT_DECLARED}
																		>
																			Não declarado
																		</SelectItem>
																	</SelectContent>
																</Select>
															</Field>
														)}
													/>
												</>
											) : (
												<>
													<form.Field
														name="cnpj"
														children={(field) => (
															<Field
																data-invalid={
																	field.state.meta.isTouched &&
																	field.state.meta.errors.length > 0
																}
															>
																<FieldLabel htmlFor={field.name}>
																	CNPJ{" "}
																	{isLookingUpCnpj && (
																		<Loader2 className="inline ml-2 h-3 w-3 animate-spin" />
																	)}
																</FieldLabel>
																<Input
																	id={field.name}
																	placeholder="00.000.000/0000-00"
																	value={field.state.value}
																	onBlur={field.handleBlur}
																	onChange={(e) => {
																		const value = e.target.value.replace(
																			/\D/g,
																			"",
																		);
																		field.handleChange(value);

																		if (value.length === 14) {
																			handleCnpjLookup(value);
																		}
																	}}
																/>
																<FieldError errors={field.state.meta.errors} />
															</Field>
														)}
													/>
													<form.Field
														name="corporateName"
														children={(field) => (
															<FormFieldWrapper
																field={field}
																label="Razão Social"
															/>
														)}
													/>
													<form.Field
														name="tradeName"
														children={(field) => (
															<FormFieldWrapper
																field={field}
																label="Nome Fantasia"
															/>
														)}
													/>
												</>
											)
										}
									</form.Subscribe>
								</div>
							</FieldGroup>

							<DialogFooter className="mt-8">
								<form.Subscribe
									selector={(state) => [state.canSubmit, state.isSubmitting]}
									children={([canSubmit]) => (
										<Button
											type="submit"
											disabled={!canSubmit || isPending}
											className="w-full md:w-auto"
										>
											{isPending && (
												<Loader2 className="mr-2 h-4 w-4 animate-spin" />
											)}
											{isPending ? "Cadastrando..." : "Finalizar Cadastro"}
										</Button>
									)}
								/>
							</DialogFooter>
						</form>
					</>
				)}
			</DialogContent>
		</Dialog>
	);
}
