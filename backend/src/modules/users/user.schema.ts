import { type Static, t } from "elysia";
import { ROLES } from "@/constants/roles";
import { USER_GENDERS } from "@/constants/userGender";
import { USER_TYPES } from "@/constants/userType";

const baseUserProps = {
	email: t.String({
		format: "email",
		error: "E-mail inválido",
		description: "E-mail do usuário.",
	}),
	password: t.String({
		minLength: 8,
		error: "Senha deve ter no mínimo 8 caracteres",
		description: "Senha do usuário.",
	}),
	name: t.String({
		minLength: 2,
		error: "Nome deve ter no mínimo 2 caracteres",
		description: "Nome ou Nome Social do usuário.",
	}),
	role: t.Optional(
		t.Union([t.Literal(ROLES.ADMIN), t.Literal(ROLES.USER)], {
			default: ROLES.USER,
			description: "Role do usuário: admin ou user.",
		}),
	),
};

const pfSchema = t.Object({
	...baseUserProps,
	type: t.Literal(USER_TYPES.PF, { description: "Tipo de pessoa: pf." }),
	cpf: t.String({
		pattern: "^\\d{11}$",
		error: "CPF deve conter 11 dígitos numéricos",
		description: "CPF do usuário (Pessoa Física).",
	}),
	dob: t.Union(
		[t.Date(), t.String({ format: "date-time" }), t.String({ format: "date" })],
		{ description: "Data de nascimento do usuário (Pessoa Física)." },
	),
	gender: t.Union(
		[
			t.Literal(USER_GENDERS.MALE),
			t.Literal(USER_GENDERS.FEMALE),
			t.Literal(USER_GENDERS.OTHER),
			t.Literal(USER_GENDERS.NOT_DECLARED),
		],
		{ description: "Gênero do usuário (Pessoa Física)." },
	),
	corporateName: t.Optional(t.String()),
	tradeName: t.Optional(t.String()),
	cnpj: t.Optional(t.String()),
});

const pjSchema = t.Object({
	...baseUserProps,
	type: t.Literal(USER_TYPES.PJ, { description: "Tipo de pessoa: pj." }),
	cnpj: t.String({
		pattern: "^\\d{14}$",
		error: "CNPJ deve conter 14 dígitos numéricos",
		description: "CNPJ do usuário (Pessoa Jurídica).",
	}),
	corporateName: t.String({
		minLength: 1,
		error: "Razão Social é obrigatória",
		description: "Razão Social (Pessoa Jurídica).",
	}),
	tradeName: t.String({
		minLength: 1,
		error: "Nome Fantasia é obrigatório",
		description: "Nome Fantasia (Pessoa Jurídica).",
	}),
	cpf: t.Optional(t.String()),
	dob: t.Optional(
		t.Union([
			t.Date(),
			t.String({ format: "date-time" }),
			t.String({ format: "date" }),
		]),
	),
	gender: t.Optional(
		t.Union([
			t.Literal(USER_GENDERS.MALE),
			t.Literal(USER_GENDERS.FEMALE),
			t.Literal(USER_GENDERS.OTHER),
			t.Literal(USER_GENDERS.NOT_DECLARED),
		]),
	),
});

export const createUserSchema = t.Union([pfSchema, pjSchema]);

export const updateUserSchema = t.Partial(
	t.Object({
		name: t.String({
			minLength: 2,
			error: "Nome deve ter no mínimo 2 caracteres",
			description: "Nome ou Nome Social do usuário.",
		}),
		type: t.Union([t.Literal(USER_TYPES.PF), t.Literal(USER_TYPES.PJ)], {
			description: "Tipo de pessoa: pf ou pj.",
		}),
		role: t.Union([t.Literal(ROLES.ADMIN), t.Literal(ROLES.USER)], {
			description: "Role do usuário: admin ou user.",
		}),
		cpf: t.String({
			pattern: "^\\d{11}$",
			error: "CPF deve conter 11 dígitos numéricos",
		}),
		dob: t.Union([
			t.Date(),
			t.String({ format: "date-time" }),
			t.String({ format: "date" }),
		]),
		gender: t.Union([
			t.Literal(USER_GENDERS.MALE),
			t.Literal(USER_GENDERS.FEMALE),
			t.Literal(USER_GENDERS.OTHER),
			t.Literal(USER_GENDERS.NOT_DECLARED),
		]),
		corporateName: t.String(),
		tradeName: t.String(),
		cnpj: t.String({
			pattern: "^\\d{14}$",
			error: "CNPJ deve conter 14 dígitos numéricos",
		}),
	}),
);

export const UserDTO = t.Object({
	id: t.String(),
	name: t.String(),
	email: t.String(),
	emailVerified: t.Boolean(),
	image: t.Union([t.String(), t.Null()]),
	role: t.String(),
	type: t.String(),
	deletedAt: t.Union([t.Date(), t.String(), t.Null()]),
	cpf: t.Union([t.String(), t.Null()]),
	dob: t.Union([t.String(), t.Date(), t.Null()]),
	gender: t.Union([t.String(), t.Null()]),
	corporateName: t.Union([t.String(), t.Null()]),
	tradeName: t.Union([t.String(), t.Null()]),
	cnpj: t.Union([t.String(), t.Null()]),
	createdAt: t.Union([t.Date(), t.String()]),
	updatedAt: t.Union([t.Date(), t.String()]),
});

export type CreateUserInput = Static<typeof createUserSchema>;
export type UpdateUserInput = Static<typeof updateUserSchema>;
