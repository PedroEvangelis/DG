import { useForm } from "@tanstack/react-form";
import * as React from "react";
import { z } from "zod";
import { Field, FieldError, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { api } from "@/lib/api";

interface ViaCepResponse {
	logradouro: string;
	bairro: string;
	localidade: string;
	uf: string;
}

const addressSchema = z.object({
	zipCode: z
		.string()
		.min(1, "CEP é obrigatório")
		.regex(/^\d{5}-?\d{3}$/, "CEP inválido"),
	street: z
		.string()
		.min(1, "Rua é obrigatória")
		.min(2, "Rua deve ter pelo menos 2 caracteres"),
	number: z.string().min(1, "Número é obrigatório"),
	complement: z.string(),
	neighborhood: z.string().min(1, "Bairro é obrigatório"),
	city: z.string().min(1, "Cidade é obrigatória"),
	state: z
		.string()
		.min(1, "Estado é obrigatório")
		.length(2, "UF deve ter 2 caracteres"),
});

export type AddressFormValues = z.infer<typeof addressSchema>;

export function AddressForm() {
	const [cepError, setCepError] = React.useState<string | null>(null);

	const form = useForm({
		defaultValues: {
			street: "",
			number: "",
			complement: "",
			neighborhood: "",
			city: "",
			state: "",
			zipCode: "",
		},
		validators: {
			onSubmit: addressSchema,
		},
	});

	const handleCepBlur = async (cep: string) => {
		setCepError(null);
		const cleanCep = cep.replace(/\D/g, "");
		if (cleanCep.length !== 8) return;

		try {
			const res = await api.integrations.cep({ cep: cleanCep }).get();
			if (res.data && "logradouro" in res.data) {
				const addressData = res.data as unknown as ViaCepResponse;
				form.setFieldValue("street", addressData.logradouro);
				form.setFieldValue("neighborhood", addressData.bairro);
				form.setFieldValue("city", addressData.localidade);
				form.setFieldValue("state", addressData.uf);
			} else {
				setCepError("CEP not found.");
			}
		} catch (error) {
			console.error("Failed to fetch address from ViaCEP", error);
			setCepError("Failed to fetch address.");
		}
	};

	return (
		<div className="space-y-4 border-t pt-4 mt-4">
			<h3 className="text-lg font-medium">Address</h3>
			<form.Field
				name="zipCode"
				validators={{
					onChange: ({ value }) =>
						!value
							? { message: "CEP é obrigatório" }
							: !/^\d{5}-?\d{3}$/.test(value)
								? { message: "CEP inválido" }
								: undefined,
				}}
			>
				{(field) => {
					const isInvalid =
						field.state.meta.isTouched && !field.state.meta.isValid;
					return (
						<Field data-invalid={isInvalid || !!cepError}>
							<FieldLabel htmlFor={field.name}>CEP / Zip Code</FieldLabel>
							<Input
								id={field.name}
								name={field.name}
								value={field.state.value}
								onBlur={(e) => {
									field.handleBlur();
									handleCepBlur(e.target.value);
								}}
								onChange={(e) => {
									field.handleChange(e.target.value);
									if (cepError) setCepError(null);
								}}
								aria-invalid={isInvalid || !!cepError}
							/>
							{isInvalid && <FieldError errors={field.state.meta.errors} />}
							{cepError && <p className="text-sm text-red-500">{cepError}</p>}
						</Field>
					);
				}}
			</form.Field>
			<form.Field
				name="street"
				validators={{
					onChange: ({ value }) =>
						!value
							? { message: "Rua é obrigatória" }
							: value.length < 2
								? { message: "Rua deve ter pelo menos 2 caracteres" }
								: undefined,
				}}
			>
				{(field) => {
					const isInvalid =
						field.state.meta.isTouched && !field.state.meta.isValid;
					return (
						<Field data-invalid={isInvalid}>
							<FieldLabel htmlFor={field.name}>Street</FieldLabel>
							<Input
								id={field.name}
								name={field.name}
								value={field.state.value}
								onBlur={field.handleBlur}
								onChange={(e) => field.handleChange(e.target.value)}
								aria-invalid={isInvalid}
							/>
							{isInvalid && <FieldError errors={field.state.meta.errors} />}
						</Field>
					);
				}}
			</form.Field>
			<form.Field
				name="number"
				validators={{
					onChange: ({ value }) =>
						!value ? { message: "Número é obrigatório" } : undefined,
				}}
			>
				{(field) => {
					const isInvalid =
						field.state.meta.isTouched && !field.state.meta.isValid;
					return (
						<Field data-invalid={isInvalid}>
							<FieldLabel htmlFor={field.name}>Number</FieldLabel>
							<Input
								id={field.name}
								name={field.name}
								value={field.state.value}
								onBlur={field.handleBlur}
								onChange={(e) => field.handleChange(e.target.value)}
								aria-invalid={isInvalid}
							/>
							{isInvalid && <FieldError errors={field.state.meta.errors} />}
						</Field>
					);
				}}
			</form.Field>
			<form.Field name="complement">
				{(field) => {
					const isInvalid =
						field.state.meta.isTouched && !field.state.meta.isValid;
					return (
						<Field data-invalid={isInvalid}>
							<FieldLabel htmlFor={field.name}>Complement</FieldLabel>
							<Input
								id={field.name}
								name={field.name}
								value={field.state.value}
								onBlur={field.handleBlur}
								onChange={(e) => field.handleChange(e.target.value)}
								aria-invalid={isInvalid}
							/>
							{isInvalid && <FieldError errors={field.state.meta.errors} />}
						</Field>
					);
				}}
			</form.Field>
			<form.Field
				name="neighborhood"
				validators={{
					onChange: ({ value }) =>
						!value ? { message: "Bairro é obrigatório" } : undefined,
				}}
			>
				{(field) => {
					const isInvalid =
						field.state.meta.isTouched && !field.state.meta.isValid;
					return (
						<Field data-invalid={isInvalid}>
							<FieldLabel htmlFor={field.name}>Neighborhood</FieldLabel>
							<Input
								id={field.name}
								name={field.name}
								value={field.state.value}
								onBlur={field.handleBlur}
								onChange={(e) => field.handleChange(e.target.value)}
								aria-invalid={isInvalid}
							/>
							{isInvalid && <FieldError errors={field.state.meta.errors} />}
						</Field>
					);
				}}
			</form.Field>
			<form.Field
				name="city"
				validators={{
					onChange: ({ value }) =>
						!value ? { message: "Cidade é obrigatória" } : undefined,
				}}
			>
				{(field) => {
					const isInvalid =
						field.state.meta.isTouched && !field.state.meta.isValid;
					return (
						<Field data-invalid={isInvalid}>
							<FieldLabel htmlFor={field.name}>City</FieldLabel>
							<Input
								id={field.name}
								name={field.name}
								value={field.state.value}
								onBlur={field.handleBlur}
								onChange={(e) => field.handleChange(e.target.value)}
								aria-invalid={isInvalid}
							/>
							{isInvalid && <FieldError errors={field.state.meta.errors} />}
						</Field>
					);
				}}
			</form.Field>
			<form.Field
				name="state"
				validators={{
					onChange: ({ value }) =>
						!value
							? { message: "Estado é obrigatório" }
							: value.length !== 2
								? { message: "UF deve ter 2 caracteres" }
								: undefined,
				}}
			>
				{(field) => {
					const isInvalid =
						field.state.meta.isTouched && !field.state.meta.isValid;
					return (
						<Field data-invalid={isInvalid}>
							<FieldLabel htmlFor={field.name}>State (UF)</FieldLabel>
							<Input
								id={field.name}
								name={field.name}
								value={field.state.value}
								onBlur={field.handleBlur}
								onChange={(e) => field.handleChange(e.target.value)}
								aria-invalid={isInvalid}
								maxLength={2}
							/>
							{isInvalid && <FieldError errors={field.state.meta.errors} />}
						</Field>
					);
				}}
			</form.Field>
		</div>
	);
}
