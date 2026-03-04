import { Elysia, t } from "elysia";
import { ROLES } from "@/constants/roles";
import { authGuard } from "@/plugins/authGuard";
import {
	AddressDTO,
	createAddressSchema,
	updateAddressSchema,
} from "./address.schema";
import { AddressService } from "./address.service";

export const addressController = new Elysia({ prefix: "/addresses" })
	.use(authGuard)
	.get(
		"/user/:userId",
		async ({ params, set, session }) => {
			if (
				params.userId !== session?.user.id &&
				session?.user.role !== ROLES.ADMIN
			) {
				set.status = 403;
				return { success: false as const, message: "Acesso negado." };
			}

			const addresses = await AddressService.findByUserId(params.userId);

			return { success: true as const, data: addresses };
		},
		{
			isAuth: true,
			detail: {
				tags: ["Addresses"],
				summary: "Endereços do usuário",
				description:
					"Retorna todos os endereços pertencentes a um determinado usuário.",
			},
			params: t.Object({ userId: t.String() }),
			response: {
				200: t.Object({
					success: t.Literal(true),
					data: t.Array(AddressDTO),
				}),
				403: t.Object({ success: t.Literal(false), message: t.String() }),
			},
		},
	)
	.get(
		"/:id",
		async ({ params, set, session }) => {
			const address = await AddressService.findById(params.id);
			if (!address) {
				set.status = 404;
				return { success: false as const, message: "Endereço não encontrado." };
			}

			if (
				session?.user.role !== ROLES.ADMIN &&
				address.userId !== session?.user.id
			) {
				set.status = 403;
				return { success: false as const, message: "Acesso negado." };
			}

			return { success: true as const, data: address };
		},
		{
			isAuth: true,
			detail: {
				tags: ["Addresses"],
				summary: "Detalhes do endereço",
				description: "Retorna os detalhes de um endereço específico pelo ID.",
			},
			params: t.Object({ id: t.String() }),
			response: {
				200: t.Object({ success: t.Literal(true), data: AddressDTO }),
				404: t.Object({ success: t.Literal(false), message: t.String() }),
				403: t.Object({ success: t.Literal(false), message: t.String() }),
			},
		},
	)
	.post(
		"/",
		async ({ body, set, session }) => {
			try {
				const newAddress = await AddressService.create(
					body,
					session?.user.id ?? "",
				);
				set.status = 201;
				return { success: true as const, data: newAddress };
			} catch (error) {
				set.status = 400;
				if (error instanceof Error) {
					return { success: false as const, message: error.message };
				}
				return {
					success: false as const,
					message: "An unexpected error occurred.",
				};
			}
		},
		{
			isAuth: true,
			detail: {
				tags: ["Addresses"],
				summary: "Criar endereço",
				description: "Cria um novo endereço para o usuário autenticado.",
			},
			body: createAddressSchema,
			response: {
				201: t.Object({ success: t.Literal(true), data: AddressDTO }),
				400: t.Object({
					success: t.Literal(false),
					message: t.String(),
				}),
			},
		},
	)
	.post(
		"/user/:userId",
		async ({ body, params, set, session }) => {
			if (
				params.userId !== session?.user.id &&
				session?.user.role !== ROLES.ADMIN
			) {
				set.status = 403;
				return { success: false as const, message: "Acesso negado." };
			}

			try {
				const newAddress = await AddressService.create(body, params.userId);
				set.status = 201;
				return { success: true as const, data: newAddress };
			} catch (error) {
				set.status = 400;
				if (error instanceof Error) {
					return { success: false as const, message: error.message };
				}
				return {
					success: false as const,
					message: "An unexpected error occurred.",
				};
			}
		},
		{
			isAuth: true,
			detail: {
				tags: ["Addresses"],
				summary: "Criar endereço para um usuário",
				description:
					"Cria um novo endereço para um usuário específico (Admin).",
			},
			params: t.Object({ userId: t.String() }),
			body: createAddressSchema,
			response: {
				201: t.Object({ success: t.Literal(true), data: AddressDTO }),
				400: t.Object({
					success: t.Literal(false),
					message: t.String(),
				}),
			},
		},
	)
	.put(
		"/:id",
		async ({ params, body, set, session }) => {
			try {
				const address = await AddressService.findById(params.id);
				if (!address) {
					set.status = 404;
					return {
						success: false as const,
						message: "Endereço não encontrado.",
					};
				}

				if (
					session?.user.role !== ROLES.ADMIN &&
					address.userId !== session?.user.id
				) {
					set.status = 403;
					return { success: false as const, message: "Acesso negado." };
				}

				const updatedAddress = await AddressService.update(params.id, body);
				return { success: true as const, data: updatedAddress };
			} catch (error: unknown) {
				set.status = 400;
				if (error instanceof Error) {
					return { success: false as const, message: error.message };
				}
				return {
					success: false as const,
					message: "An unexpected error occurred.",
				};
			}
		},
		{
			isAuth: true,
			detail: {
				tags: ["Addresses"],
				summary: "Atualizar endereço",
				description: "Atualiza os dados de um endereço.",
			},
			params: t.Object({ id: t.String() }),
			body: updateAddressSchema,
			response: {
				200: t.Object({ success: t.Literal(true), data: AddressDTO }),
				404: t.Object({ success: t.Literal(false), message: t.String() }),
				403: t.Object({ success: t.Literal(false), message: t.String() }),
				400: t.Object({
					success: t.Literal(false),
					message: t.String(),
				}),
			},
		},
	)
	.delete(
		"/:id",
		async ({ params, set, session }) => {
			try {
				const address = await AddressService.findById(params.id);
				if (!address) {
					set.status = 404;
					return {
						success: false as const,
						message: "Endereço não encontrado.",
					};
				}

				if (
					session?.user.role !== ROLES.ADMIN &&
					address.userId !== session?.user.id
				) {
					set.status = 403;
					return { success: false as const, message: "Acesso negado." };
				}

				await AddressService.delete(params.id);
				return {
					success: true as const,
					message: "Endereço deletado com sucesso.",
				};
			} catch (error: unknown) {
				set.status = 400;
				if (error instanceof Error) {
					return { success: false as const, message: error.message };
				}
				return {
					success: false as const,
					message: "An unexpected error occurred.",
				};
			}
		},
		{
			isAuth: true,
			detail: {
				tags: ["Addresses"],
				summary: "Deletar endereço",
				description: "Deleta permanentemente um endereço pelo ID.",
			},
			params: t.Object({ id: t.String() }),
			response: {
				200: t.Object({ success: t.Literal(true), message: t.String() }),
				404: t.Object({ success: t.Literal(false), message: t.String() }),
				403: t.Object({ success: t.Literal(false), message: t.String() }),
				400: t.Object({ success: t.Literal(false), message: t.String() }),
			},
		},
	);
