import { type Static, t } from "elysia";

export const createAddressSchema = t.Object({
	cep: t.String({
		pattern: "^\\d{8}$",
		error: "CEP deve conter 8 dígitos numéricos",
		description: "CEP do endereço, contendo 8 dígitos numéricos.",
	}),
	street: t.String({
		minLength: 2,
		error: "Rua deve ter no mínimo 2 caracteres",
		description: "Nome da rua.",
	}),
	number: t.String({
		minLength: 1,
		error: "Número é obrigatório",
		description: "Número do imóvel.",
	}),
	complement: t.Optional(t.String({ description: "Complemento do endereço." })),
	neighborhood: t.String({
		minLength: 2,
		error: "Bairro deve ter no mínimo 2 caracteres",
		description: "Bairro do endereço.",
	}),
	city: t.String({
		minLength: 2,
		error: "Cidade deve ter no mínimo 2 caracteres",
		description: "Cidade do endereço.",
	}),
	state: t.String({
		minLength: 2,
		maxLength: 2,
		error: "Estado deve conter 2 letras (UF)",
		description: "Estado do endereço (UF).",
	}),
});

export const updateAddressSchema = t.Partial(createAddressSchema);

export const AddressDTO = t.Object({
	id: t.String(),
	userId: t.String(),
	cep: t.String(),
	street: t.String(),
	number: t.String(),
	complement: t.Union([t.String(), t.Null()]),
	neighborhood: t.String(),
	city: t.String(),
	state: t.String(),
	createdAt: t.Union([t.Date(), t.String()]),
	updatedAt: t.Union([t.Date(), t.String()]),
});

export type AddressInput = Static<typeof createAddressSchema>;
