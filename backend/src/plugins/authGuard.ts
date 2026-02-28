import { Elysia, status } from "elysia";
import type { Role } from "@/constants/roles";
import { pluginContext } from "./setup";

export const authGuard = new Elysia({ name: "auth-guard" })
	.use(pluginContext)
	.macro({
		isAuth: (requireAuth: boolean) => ({
			beforeHandle({ session }) {
				if (!requireAuth) return;

				if (!session) {
					return status(401, "Não autenticado");
				}
			},
		}),
		role: (requiredRoles: Role[]) => ({
			beforeHandle({ session }) {
				if (!session) {
					return status(401, "Não autenticado");
				}

				const userRole = session.user.role as Role;
				if (!requiredRoles.includes(userRole)) {
					return status(403, "Acesso negado: Permissão insuficiente");
				}
			},
		}),
	});
