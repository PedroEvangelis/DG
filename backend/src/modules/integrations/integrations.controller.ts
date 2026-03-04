import { Elysia, t } from "elysia";
import { ROLES } from "@/constants/roles";
import { ReceitaWsService, receitaWsResponseSchema } from "./receitaws.service";
import { ViaCepService, viaCepResponseSchema } from "./viacep.service";

export const integrationsController = new Elysia({
	prefix: "/integrations",
})
	.get(
		"/cep/:cep",
		async ({ params, set }) => {
			const result = await ViaCepService.getAddressByCep(params.cep);

			if (!result) {
				set.status = 404;
				return {
					success: false as const,
					message: "Endereço não encontrado ou CEP inválido.",
				};
			}

			return {
				success: true as const,
				data: result,
			};
		},
		{
			isAuth: true,
			detail: {
				tags: ["Integrations"],
				summary: "Consultar CEP",
				description:
					"Consulta dados de endereço via ViaCEP a partir de um CEP.",
			},
			params: t.Object({ cep: t.String() }),
			response: {
				200: t.Object({ success: t.Literal(true), data: viaCepResponseSchema }),
				404: t.Object({ success: t.Literal(false), message: t.String() }),
			},
		},
	)
	.get(
		"/cnpj/:cnpj",
		async ({ params, set }) => {
			const result = await ReceitaWsService.getCompanyByCnpj(params.cnpj);

			if (!result) {
				set.status = 404;
				return {
					success: false as const,
					message: "Empresa não encontrada ou CNPJ inválido.",
				};
			}

			return {
				success: true as const,
				data: result,
			};
		},
		{
			isAuth: true,
			detail: {
				tags: ["Integrations"],
				summary: "Consultar CNPJ",
				description:
					"Consulta dados de uma empresa via ReceitaWS a partir de um CNPJ.",
			},
			params: t.Object({ cnpj: t.String() }),
			response: {
				200: t.Object({
					success: t.Literal(true),
					data: receitaWsResponseSchema,
				}),
				404: t.Object({ success: t.Literal(false), message: t.String() }),
			},
		},
	);
