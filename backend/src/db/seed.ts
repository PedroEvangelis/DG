import { and, eq, isNull } from "drizzle-orm";
import { ROLES } from "@/constants/roles";
import { USER_TYPES } from "@/constants/userType";
import { auth } from "@/lib/auth";
import { db } from "./postgres";
import { account, user } from "./schema";

async function seed() {
	console.log("Seeding admin user...");

	try {
		const adminEmail = "admin@admin.com";
		const password = "password123";

		console.log("Checking if admin already exists...");
		const existingAdmin = await db.query.user.findFirst({
			where: (users, { eq }) => eq(users.email, adminEmail),
		});

		if (existingAdmin) {
			console.log("Admin already exists. Skipping.");
			process.exit(0);
		}

		const { user: newUser } = await auth.api.createUser({
			body: {
				email: adminEmail,
				password,
				role: ROLES.ADMIN,
				name: "Admin User",
			},
		});

		console.log("Inserting user...");
		const [updatedUser] = await db
			.update(user)
			.set({
				type: USER_TYPES.PF,
				cpf: "00000000000",
			})
			.where(and(eq(user.id, newUser.id), isNull(user.deletedAt)))
			.returning();

		console.log(
			"Admin seeded successfully. Email: admin@admin.com, Password: password123",
		);
	} catch (error) {
		console.error("Error seeding:", error);
	}
	process.exit(0);
}

seed();
