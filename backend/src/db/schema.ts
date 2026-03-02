import { boolean, date, pgTable, text, timestamp } from "drizzle-orm/pg-core";
import { userGender, userRole, userType } from "./enums";

export const defaultSchema = {
	id: text("id")
		.primaryKey()
		.$defaultFn(() => crypto.randomUUID()),
	createdAt: timestamp("createdAt").notNull().defaultNow(),
	updatedAt: timestamp("updatedAt")
		.notNull()
		.defaultNow()
		.$onUpdateFn(() => new Date()),
};

export const user = pgTable("user", {
	...defaultSchema,
	name: text("name").notNull(),
	email: text("email").notNull().unique(),
	emailVerified: boolean("emailVerified").notNull(),
	image: text("image"),

	role: userRole("role").notNull().default("user"),
	banned: boolean("banned"),
	banReason: text("banReason"),
	banExpires: timestamp("banExpires"),
	type: userType("type").notNull(),
	deletedAt: timestamp("deletedAt"),

	// PF fields
	cpf: text("cpf").unique(),
	dob: date("dob", { mode: "date" }),
	gender: userGender("gender"),

	// PJ fields
	corporateName: text("corporateName"),
	tradeName: text("tradeName"),
	cnpj: text("cnpj").unique(),
});

export const account = pgTable("account", {
	...defaultSchema,
	accountId: text("accountId").notNull(),
	providerId: text("providerId").notNull(),
	userId: text("userId")
		.notNull()
		.references(() => user.id, { onDelete: "cascade" }),
	accessToken: text("accessToken"),
	refreshToken: text("refreshToken"),
	idToken: text("idToken"),
	accessTokenExpiresAt: timestamp("accessTokenExpiresAt"),
	refreshTokenExpiresAt: timestamp("refreshTokenExpiresAt"),
	scope: text("scope"),
	password: text("password"),
});

export const verification = pgTable("verification", {
	...defaultSchema,
	identifier: text("identifier").notNull(),
	value: text("value").notNull(),
	expiresAt: timestamp("expiresAt").notNull(),
});

export const address = pgTable("address", {
	...defaultSchema,
	userId: text("userId")
		.notNull()
		.references(() => user.id, { onDelete: "cascade" }),
	cep: text("cep").notNull(),
	street: text("street").notNull(),
	number: text("number").notNull(),
	complement: text("complement"),
	neighborhood: text("neighborhood").notNull(),
	city: text("city").notNull(),
	state: text("state").notNull(),
});
