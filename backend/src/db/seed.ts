import { ROLES } from "@/constants/roles";
import { USER_TYPES } from "@/constants/userType";
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

		console.log("Generating password hash...");
		const hashedPassword = await Bun.password.hash(password, {
			algorithm: "bcrypt",
		});

		console.log("Inserting user...");
		const [newUser] = await db
			.insert(user)
			.values({
				name: "Admin User",
				email: adminEmail,
				emailVerified: true,
				role: ROLES.ADMIN,
				type: USER_TYPES.PF,
				cpf: "00000000000",
			})
			.returning();

		console.log("Inserting credentials account...");
		await db.insert(account).values({
			accountId: newUser.id, // Better Auth typically uses the userId as the accountId for credential providers, or sometimes an email hash.
			providerId: "credential",
			userId: newUser.id,
			password: hashedPassword,
		});

		console.log(
			"Admin seeded successfully. Email: admin@admin.com, Password: password123",
		);
	} catch (error) {
		console.error("Error seeding:", error);
	}
	process.exit(0);
}

seed();
