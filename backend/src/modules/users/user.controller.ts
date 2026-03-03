import { Elysia, t } from "elysia";
import { ROLES, type Role } from "@/constants/roles";
import { authGuard } from "@/plugins/authGuard";
import { createUserSchema, UserDTO, updateUserSchema } from "./user.schema";
import { UserService } from "./user.service";

export const userController = new Elysia({ prefix: "/users" })
	.use(authGuard)
	.get(
		"/",
		async ({ session }) => {
			const user = session!.user;

			try {
				const users = await UserService.findAll({
					id: user.id,
					role: user.role! as Role,
				});
				return { success: true as const, data: users };
			} catch (_error) {
				return { success: false as const, message: "Erro ao buscar usuários." };
			}
		},
		{
			isAuth: true,
			role: [ROLES.ADMIN, ROLES.USER],
			detail: {
				tags: ["Users"],
				summary: "Listar usuários",
				description: "Retorna a lista de todos os usuários cadastrados.",
			},
			response: {
				200: t.Object({ success: t.Literal(true), data: t.Array(UserDTO) }),
				500: t.Object({ success: t.Literal(false), message: t.String() }),
			},
		},
	)
	.get(
		"/:id",
		async ({ params, set, session }) => {
			const sessUser = session!.user;
			const user = await UserService.findById(params.id, {
				id: sessUser.id,
				role: sessUser.role! as Role,
			});
			if (!user) {
				set.status = 404;
				return { success: false as const, message: "Usuário não encontrado." };
			}

			if (session?.user.role !== ROLES.ADMIN && user.id !== session?.user.id) {
				set.status = 403;
				return { success: false as const, message: "Acesso negado." };
			}

			return { success: true as const, data: user };
		},
		{
			isAuth: true,
			detail: {
				tags: ["Users"],
				summary: "Detalhes do usuário",
				description: "Retorna os detalhes de um usuário específico pelo ID.",
			},
			params: t.Object({ id: t.String() }),
			response: {
				200: t.Object({ success: t.Literal(true), data: UserDTO }),
				404: t.Object({ success: t.Literal(false), message: t.String() }),
				403: t.Object({ success: t.Literal(false), message: t.String() }),
			},
		},
	)
	.post(
		"/",
		async ({ body, set }) => {
			try {
				const newUser = await UserService.create(body);
				set.status = 201;
				return { success: true as const, data: newUser };
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
			role: [ROLES.ADMIN],
			detail: {
				tags: ["Users"],
				summary: "Criar usuário",
				description: "Cadastra um novo usuário no sistema (PF ou PJ).",
			},
			body: createUserSchema,
			response: {
				201: t.Object({ success: t.Literal(true), data: UserDTO }),
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
				const sessUser = session!.user;
				const user = await UserService.findById(params.id, {
					id: sessUser.id,
					role: sessUser.role! as Role,
				});
				if (!user) {
					set.status = 404;
					return {
						success: false as const,
						message: "Usuário não encontrado.",
					};
				}

				if (
					session?.user.role !== ROLES.ADMIN &&
					user.id !== session?.user.id
				) {
					set.status = 403;
					return { success: false as const, message: "Acesso negado." };
				}

				const updatedUser = await UserService.update(params.id, body, {
					id: sessUser.id,
					role: sessUser.role! as Role,
				});
				return { success: true as const, data: updatedUser };
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
				tags: ["Users"],
				summary: "Atualizar usuário",
				description: "Atualiza os dados de um usuário existente pelo ID.",
			},
			params: t.Object({ id: t.String() }),
			body: updateUserSchema,
			response: {
				200: t.Object({ success: t.Literal(true), data: UserDTO }),
				400: t.Object({
					success: t.Literal(false),
					message: t.String(),
				}),
				404: t.Object({ success: t.Literal(false), message: t.String() }),
				403: t.Object({ success: t.Literal(false), message: t.String() }),
			},
		},
	)
	.delete(
		"/:id",
		async ({ params, set, session }) => {
			try {
				const sessUser = session!.user;
				const user = await UserService.findById(params.id, {
					id: sessUser.id,
					role: sessUser.role! as Role,
				});
				if (!user) {
					set.status = 404;
					return {
						success: false as const,
						message: "Usuário não encontrado.",
					};
				}

				await UserService.delete(params.id);
				return {
					success: true as const,
					message: "Usuário deletado com sucesso.",
					data: user,
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
			role: [ROLES.ADMIN],
			detail: {
				tags: ["Users"],
				summary: "Deletar usuário",
				description: "Realiza a exclusão lógica (soft delete) de um usuário.",
			},
			params: t.Object({ id: t.String() }),
			response: {
				200: t.Object({ success: t.Literal(true), message: t.String() }),
				400: t.Object({ success: t.Literal(false), message: t.String() }),
				404: t.Object({ success: t.Literal(false), message: t.String() }),
				403: t.Object({ success: t.Literal(false), message: t.String() }),
			},
		},
	)
	.post(
		"/:id/reset-password",
		async ({ params, set }) => {
			try {
				const result = await UserService.resetPassword(params.id);
				return { success: true as const, data: result };
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
			role: [ROLES.ADMIN],
			detail: {
				tags: ["Users"],
				summary: "Resetar senha",
				description: "Gera uma nova senha aleatória para o usuário.",
			},
			params: t.Object({ id: t.String() }),
			response: {
				200: t.Object({
					success: t.Literal(true),
					data: t.Object({ temporaryPassword: t.String() }),
				}),
				400: t.Object({ success: t.Literal(false), message: t.String() }),
				403: t.Object({ success: t.Literal(false), message: t.String() }),
			},
		},
	)
	.post(
		"/:id/toggle-status",
		async ({ params, set }) => {
			try {
				const result = await UserService.toggleStatus(params.id);
				return { success: true as const, data: result };
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
			role: [ROLES.ADMIN],
			detail: {
				tags: ["Users"],
				summary: "Inativar/Ativar usuário",
				description: "Alterna o status de banimento do usuário.",
			},
			params: t.Object({ id: t.String() }),
			response: {
				200: t.Object({
					success: t.Literal(true),
					data: t.Object({ banned: t.Boolean() }),
				}),
				400: t.Object({ success: t.Literal(false), message: t.String() }),
				403: t.Object({ success: t.Literal(false), message: t.String() }),
			},
		},
	);
