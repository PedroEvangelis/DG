import { and, eq, isNull } from "drizzle-orm";
import { db } from "@/db/postgres";
import { user } from "@/db/schema";

export type CreateUserDTO = typeof user.$inferInsert;
export type UpdateUserDTO = Partial<
	Omit<CreateUserDTO, "id" | "createdAt" | "updatedAt">
>;

export const UserRepository = {
	async create(data: CreateUserDTO) {
		const [newUser] = await db.insert(user).values(data).returning();
		return newUser;
	},

	async findById(id: string) {
		return db.query.user.findFirst({
			where: and(eq(user.id, id), isNull(user.deletedAt)),
		});
	},

	async findByEmail(email: string) {
		return db.query.user.findFirst({
			where: and(eq(user.email, email), isNull(user.deletedAt)),
		});
	},

	async findByCpf(cpf: string) {
		return db.query.user.findFirst({
			where: and(eq(user.cpf, cpf), isNull(user.deletedAt)),
		});
	},

	async findByCnpj(cnpj: string) {
		return db.query.user.findFirst({
			where: and(eq(user.cnpj, cnpj), isNull(user.deletedAt)),
		});
	},

	async findAll() {
		return db.query.user.findMany({
			where: isNull(user.deletedAt),
			orderBy: (user, { desc }) => [desc(user.createdAt)],
		});
	},

	async update(id: string, data: UpdateUserDTO) {
		const [updatedUser] = await db
			.update(user)
			.set({ ...data })
			.where(and(eq(user.id, id), isNull(user.deletedAt)))
			.returning();

		return updatedUser;
	},

	async softDelete(id: string) {
		const [deletedUser] = await db
			.update(user)
			.set({ deletedAt: new Date() })
			.where(and(eq(user.id, id), isNull(user.deletedAt)))
			.returning();

		return deletedUser;
	},
};
