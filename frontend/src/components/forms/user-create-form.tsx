import { useForm } from "@tanstack/react-form";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useRef, useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { DatePicker } from "@/components/ui/date-picker";
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
import { api } from "@/lib/api";
import { Plus } from "lucide-react";

const USER_TYPES = {
	PF: "pf",
	PJ: "pj",
} as const;

const USER_GENDERS = {
	MALE: "M",
	FEMALE: "F",
	OTHER: "O",
	NOT_DECLARED: "N",
} as const;

type UserType = (typeof USER_TYPES)[keyof typeof USER_TYPES];
type Gender = (typeof USER_GENDERS)[keyof typeof USER_GENDERS];

interface AddressInput {
	cep: string;
	street: string;
	number: string;
	complement?: string;
	neighborhood: string;
	city: string;
	state: string;
}

export function UserCreateForm() {
	const queryClient = useQueryClient();
	const [isOpen, setIsOpen] = useState(false);
	const formRef = useRef<any>(null);

	const { mutate: createAddress } = useMutation({
		mutationFn: async (data: { userId: string; addressData: AddressInput }) => {
			const res = await api.addresses
				.user({ userId: data.userId })
				.post(data.addressData);
			return res;
		},
		onSuccess: () => {
			toast.success("Endereço criado com sucesso.");
			queryClient.invalidateQueries({ queryKey: ["users"] });
			queryClient.invalidateQueries({ queryKey: ["addresses"] });
		},
		onError: (error: Error) => {
			toast.error(`Falha ao criar endereço: ${error.message}`);
		},
	});

	type UserCreateData = Parameters<typeof api.users.post>[0];

	const formValuesRef = useRef<{
		type: UserType;
		zipCode?: string;
		street?: string;
		number?: string;
		complement?: string;
		neighborhood?: string;
		city?: string;
		state?: string;
	} | null>(null);

	const { mutate } = useMutation({
		mutationFn: async (values: UserCreateData) => {
			const res = await api.users.post(values);
			return res;
		},
		onSuccess: (response) => {
			toast.success("Usuário criado com sucesso.");
			const res = response.data;
			const formValues = formValuesRef.current;
			if (res?.data?.id && formValues) {
				const addressData: AddressInput = {
					cep: formValues.zipCode ?? "",
					street: formValues.street ?? "",
					number: formValues.number ?? "",
					complement: formValues.complement,
					neighborhood: formValues.neighborhood ?? "",
					city: formValues.city ?? "",
					state: formValues.state ?? "",
				};
				createAddress({ userId: res.data.id, addressData });
			}
			setIsOpen(false);
			formRef.current?.reset();
		},
		onError: (error: Error) => {
			toast.error(error.message ?? "Erro ao criar usuário.");
		},
	});

	const form = useForm({
		defaultValues: {
			type: USER_TYPES.PF,
			name: "",
			email: "",
			password: "",
			cpf: "",
			dob: undefined as Date | undefined,
			gender: USER_GENDERS.NOT_DECLARED as Gender,
			cnpj: "",
			corporateName: "",
			tradeName: "",
			zipCode: "",
			street: "",
			number: "",
			complement: "",
			neighborhood: "",
			city: "",
			state: "",
		},
		onSubmit: async ({ value }) => {
			formValuesRef.current = {
				type: value.type,
				zipCode: value.zipCode,
				street: value.street,
				number: value.number,
				complement: value.complement,
				neighborhood: value.neighborhood,
				city: value.city,
				state: value.state,
			};
			const userData =
				value.type === USER_TYPES.PF
					? {
							type: value.type,
							email: value.email,
							password: value.password,
							name: value.name,
							cpf: value.cpf,
							dob: value.dob,
							gender: value.gender,
						}
					: {
							type: value.type,
							email: value.email,
							password: value.password,
							name: value.name,
							cnpj: value.cnpj,
							corporateName: value.corporateName,
							tradeName: value.tradeName,
						};
			mutate(userData as unknown as Parameters<typeof mutate>[0]);
		},
	});

	formRef.current = form;

	return (
		<Dialog open={isOpen} onOpenChange={setIsOpen}>
			<DialogTrigger asChild>
				<Button>Novo usuário <Plus /> </Button>
			</DialogTrigger>
			<DialogContent className="max-h-[90svh] overflow-y-auto">
				<DialogHeader>
					<DialogTitle>Criar novo usuário</DialogTitle>
					<DialogDescription>
						Preencha o formulário para adicionar um novo.
					</DialogDescription>
				</DialogHeader>
				<form
					onSubmit={(e) => {
						e.preventDefault();
						form.handleSubmit();
					}}
				>
					<FieldGroup className="gap-4">
						<form.Field
							name="type"
							children={(field) => (
								<Field>
									<FieldLabel>Tipo</FieldLabel>
									<Select
										value={field.state.value}
										onValueChange={(value: any) =>
											field.handleChange(value as any)
										}
									>
										<SelectTrigger>
											<SelectValue placeholder="Selecione o tipo de usuário" />
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
						<form.Field
							name="name"
							children={(field) => {
								const isInvalid =
									field.state.meta.isTouched && !field.state.meta.isValid;
								return (
									<Field data-invalid={isInvalid}>
										<FieldLabel htmlFor={field.name}>
											Nome / Nome social
										</FieldLabel>
										<Input
											id={field.name}
											name={field.name}
											value={field.state.value}
											onBlur={field.handleBlur}
											onChange={(e) => field.handleChange(e.target.value)}
											aria-invalid={isInvalid}
										/>
										{isInvalid && (
											<FieldError errors={field.state.meta.errors} />
										)}
									</Field>
								);
							}}
						/>
						<form.Subscribe
							selector={(state) => [state.values.type]}
							children={([type]) => {
								if (type === USER_TYPES.PF)
									return (
										<>
											<form.Field
												name="cpf"
												children={(field) => {
													const isInvalid =
														field.state.meta.isTouched &&
														!field.state.meta.isValid;
													return (
														<Field data-invalid={isInvalid}>
															<FieldLabel htmlFor={field.name}>CPF</FieldLabel>
															<Input
																id={field.name}
																name={field.name}
																value={field.state.value}
																onBlur={field.handleBlur}
																onChange={(e) =>
																	field.handleChange(e.target.value)
																}
																aria-invalid={isInvalid}
															/>
															{isInvalid && (
																<FieldError errors={field.state.meta.errors} />
															)}
														</Field>
													);
												}}
											/>
											<form.Field
												name="dob"
												children={(field) => {
													const isInvalid =
														field.state.meta.isTouched &&
														!field.state.meta.isValid;
													return (
														<Field data-invalid={isInvalid}>
															<FieldLabel htmlFor={field.name}>
																Data de nascimento
															</FieldLabel>
															<DatePicker
																value={field.state.value}
																onChange={field.handleChange}
															/>
															{isInvalid && (
																<FieldError errors={field.state.meta.errors} />
															)}
														</Field>
													);
												}}
											/>
											<form.Field
												name="gender"
												children={(field) => (
													<Field>
														<FieldLabel>Gênero</FieldLabel>
														<Select
															value={field.state.value}
															onValueChange={(value: any) =>
																field.handleChange(value as Gender)
															}
														>
															<SelectTrigger>
																<SelectValue placeholder="Selecione o gênero" />
															</SelectTrigger>
															<SelectContent>
																<SelectItem value={USER_GENDERS.MALE}>
																	Male
																</SelectItem>
																<SelectItem value={USER_GENDERS.FEMALE}>
																	Female
																</SelectItem>
																<SelectItem value={USER_GENDERS.OTHER}>
																	Other
																</SelectItem>
																<SelectItem value={USER_GENDERS.NOT_DECLARED}>
																	Not Declared
																</SelectItem>
															</SelectContent>
														</Select>
													</Field>
												)}
											/>
										</>
									);
								if (type === USER_TYPES.PJ)
									return (
										<>
											<form.Field
												name="cnpj"
												children={(field) => {
													const isInvalid =
														field.state.meta.isTouched &&
														!field.state.meta.isValid;
													return (
														<Field data-invalid={isInvalid}>
															<FieldLabel htmlFor={field.name}>CNPJ</FieldLabel>
															<Input
																id={field.name}
																name={field.name}
																value={field.state.value}
																onBlur={field.handleBlur}
																onChange={(e) =>
																	field.handleChange(e.target.value)
																}
																aria-invalid={isInvalid}
															/>
															{isInvalid && (
																<FieldError errors={field.state.meta.errors} />
															)}
														</Field>
													);
												}}
											/>
											<form.Field
												name="corporateName"
												children={(field) => {
													const isInvalid =
														field.state.meta.isTouched &&
														!field.state.meta.isValid;
													return (
														<Field data-invalid={isInvalid}>
															<FieldLabel htmlFor={field.name}>
																Razão social
															</FieldLabel>
															<Input
																id={field.name}
																name={field.name}
																value={field.state.value}
																onBlur={field.handleBlur}
																onChange={(e) =>
																	field.handleChange(e.target.value)
																}
																aria-invalid={isInvalid}
															/>
															{isInvalid && (
																<FieldError errors={field.state.meta.errors} />
															)}
														</Field>
													);
												}}
											/>
											<form.Field
												name="tradeName"
												children={(field) => {
													const isInvalid =
														field.state.meta.isTouched &&
														!field.state.meta.isValid;
													return (
														<Field data-invalid={isInvalid}>
															<FieldLabel htmlFor={field.name}>
																Nome fantasia
															</FieldLabel>
															<Input
																id={field.name}
																name={field.name}
																value={field.state.value}
																onBlur={field.handleBlur}
																onChange={(e) =>
																	field.handleChange(e.target.value)
																}
																aria-invalid={isInvalid}
															/>
															{isInvalid && (
																<FieldError errors={field.state.meta.errors} />
															)}
														</Field>
													);
												}}
											/>
										</>
									);
								return null;
							}}
						/>
						<form.Field
							name="email"
							children={(field) => {
								const isInvalid =
									field.state.meta.isTouched && !field.state.meta.isValid;
								return (
									<Field data-invalid={isInvalid}>
										<FieldLabel htmlFor={field.name}>Email</FieldLabel>
										<Input
											id={field.name}
											name={field.name}
											value={field.state.value}
											onBlur={field.handleBlur}
											onChange={(e) => field.handleChange(e.target.value)}
											type="email"
											aria-invalid={isInvalid}
										/>
										{isInvalid && (
											<FieldError errors={field.state.meta.errors} />
										)}
									</Field>
								);
							}}
						/>
						<form.Field
							name="password"
							children={(field) => {
								const isInvalid =
									field.state.meta.isTouched && !field.state.meta.isValid;
								return (
									<Field data-invalid={isInvalid}>
										<FieldLabel htmlFor={field.name}>Senha</FieldLabel>
										<Input
											id={field.name}
											name={field.name}
											value={field.state.value}
											onBlur={field.handleBlur}
											onChange={(e) => field.handleChange(e.target.value)}
											type="password"
											aria-invalid={isInvalid}
										/>
										{isInvalid && (
											<FieldError errors={field.state.meta.errors} />
										)}
									</Field>
								);
							}}
						/>
						<div className="border-t pt-4 mt-4">
							<h3 className="text-lg font-medium mb-4">Endereço</h3>
							<form.Field
								name="zipCode"
								children={(field) => {
									const isInvalid =
										field.state.meta.isTouched && !field.state.meta.isValid;
									return (
										<Field data-invalid={isInvalid}>
											<FieldLabel htmlFor={field.name}>
												CEP
											</FieldLabel>
											<Input
												id={field.name}
												name={field.name}
												value={field.state.value}
												onBlur={field.handleBlur}
												onChange={(e) => field.handleChange(e.target.value)}
												aria-invalid={isInvalid}
											/>
											{isInvalid && (
												<FieldError errors={field.state.meta.errors} />
											)}
										</Field>
									);
								}}
							/>
							<form.Field
								name="street"
								children={(field) => {
									const isInvalid =
										field.state.meta.isTouched && !field.state.meta.isValid;
									return (
										<Field data-invalid={isInvalid}>
											<FieldLabel htmlFor={field.name}>Rua</FieldLabel>
											<Input
												id={field.name}
												name={field.name}
												value={field.state.value}
												onBlur={field.handleBlur}
												onChange={(e) => field.handleChange(e.target.value)}
												aria-invalid={isInvalid}
											/>
											{isInvalid && (
												<FieldError errors={field.state.meta.errors} />
											)}
										</Field>
									);
								}}
							/>
							<form.Field
								name="number"
								children={(field) => {
									const isInvalid =
										field.state.meta.isTouched && !field.state.meta.isValid;
									return (
										<Field data-invalid={isInvalid}>
											<FieldLabel htmlFor={field.name}>Número</FieldLabel>
											<Input
												id={field.name}
												name={field.name}
												value={field.state.value}
												onBlur={field.handleBlur}
												onChange={(e) => field.handleChange(e.target.value)}
												aria-invalid={isInvalid}
											/>
											{isInvalid && (
												<FieldError errors={field.state.meta.errors} />
											)}
										</Field>
									);
								}}
							/>
							<form.Field
								name="complement"
								children={(field) => {
									const isInvalid =
										field.state.meta.isTouched && !field.state.meta.isValid;
									return (
										<Field data-invalid={isInvalid}>
											<FieldLabel htmlFor={field.name}>Complemento</FieldLabel>
											<Input
												id={field.name}
												name={field.name}
												value={field.state.value}
												onBlur={field.handleBlur}
												onChange={(e) => field.handleChange(e.target.value)}
												aria-invalid={isInvalid}
											/>
											{isInvalid && (
												<FieldError errors={field.state.meta.errors} />
											)}
										</Field>
									);
								}}
							/>
							<form.Field
								name="neighborhood"
								children={(field) => {
									const isInvalid =
										field.state.meta.isTouched && !field.state.meta.isValid;
									return (
										<Field data-invalid={isInvalid}>
											<FieldLabel htmlFor={field.name}>Bairro</FieldLabel>
											<Input
												id={field.name}
												name={field.name}
												value={field.state.value}
												onBlur={field.handleBlur}
												onChange={(e) => field.handleChange(e.target.value)}
												aria-invalid={isInvalid}
											/>
											{isInvalid && (
												<FieldError errors={field.state.meta.errors} />
											)}
										</Field>
									);
								}}
							/>
							<form.Field
								name="city"
								children={(field) => {
									const isInvalid =
										field.state.meta.isTouched && !field.state.meta.isValid;
									return (
										<Field data-invalid={isInvalid}>
											<FieldLabel htmlFor={field.name}>Cidade</FieldLabel>
											<Input
												id={field.name}
												name={field.name}
												value={field.state.value}
												onBlur={field.handleBlur}
												onChange={(e) => field.handleChange(e.target.value)}
												aria-invalid={isInvalid}
											/>
											{isInvalid && (
												<FieldError errors={field.state.meta.errors} />
											)}
										</Field>
									);
								}}
							/>
							<form.Field
								name="state"
								children={(field) => {
									const isInvalid =
										field.state.meta.isTouched && !field.state.meta.isValid;
									return (
										<Field data-invalid={isInvalid}>
											<FieldLabel htmlFor={field.name}>Estado (UF)</FieldLabel>
											<Input
												id={field.name}
												name={field.name}
												value={field.state.value}
												onBlur={field.handleBlur}
												onChange={(e) => field.handleChange(e.target.value)}
												aria-invalid={isInvalid}
												maxLength={2}
											/>
											{isInvalid && (
												<FieldError errors={field.state.meta.errors} />
											)}
										</Field>
									);
								}}
							/>
						</div>
					</FieldGroup>
					<DialogFooter className="mt-6">
						<form.Subscribe
							selector={(state) => [state.canSubmit, state.isSubmitting]}
							children={([canSubmit, isSubmitting]) => (
								<Button type="submit" disabled={!canSubmit || isSubmitting}>
									{isSubmitting ? "Saving..." : "Save"}
								</Button>
							)}
						/>
					</DialogFooter>
				</form>
			</DialogContent>
		</Dialog>
	);
}
