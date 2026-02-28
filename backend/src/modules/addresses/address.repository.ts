import { eq } from "drizzle-orm";
import { db } from "@/db/postgres";
import { address } from "@/db/schema";

export type CreateAddressDTO = typeof address.$inferInsert;
export type UpdateAddressDTO = Partial<
	Omit<CreateAddressDTO, "id" | "userId" | "createdAt" | "updatedAt">
>;

export const AddressRepository = {
	async create(data: CreateAddressDTO) {
		const [newAddress] = await db.insert(address).values(data).returning();
		return newAddress;
	},

	async findById(id: string) {
		return db.query.address.findFirst({
			where: eq(address.id, id),
		});
	},

	async findByUserId(userId: string) {
		return db.query.address.findMany({
			where: eq(address.userId, userId),
			orderBy: (address, { desc }) => [desc(address.createdAt)],
		});
	},

	async update(id: string, data: UpdateAddressDTO) {
		const [updatedAddress] = await db
			.update(address)
			.set({ ...data })
			.where(eq(address.id, id))
			.returning();

		return updatedAddress;
	},

	async delete(id: string) {
		const [deletedAddress] = await db
			.delete(address)
			.where(eq(address.id, id))
			.returning();

		return deletedAddress;
	},
};
