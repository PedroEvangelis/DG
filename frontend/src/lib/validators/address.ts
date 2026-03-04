import { z } from "zod";

export const addressSchema = z.object({
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

export type AddressValues = z.infer<typeof addressSchema>;
