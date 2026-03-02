import { afterEach, describe, expect, it, mock } from "bun:test";
import { auth } from "@/lib/auth";
import { UserRepository } from "./user.repository";
import { UserService } from "./user.service";

// Mock UserRepository
mock.module("./user.repository", () => ({
	UserRepository: {
		findByEmail: mock(async (_email: string) => null),
		findByCpf: mock(async (_cpf: string) => null),
		findByCnpj: mock(async (_cnpj: string) => null),
		// biome-ignore lint/suspicious/noExplicitAny: mock
		update: mock(async (id: string, data: any) => ({ id, ...data })),
		findById: mock(async (id: string) => ({ id, name: "Test User" })),
		softDelete: mock(async (id: string) => ({ id, deletedAt: new Date() })),
	},
}));

// Mock auth.api.createUser
mock.module("@/lib/auth", () => ({
	auth: {
		api: {
			// biome-ignore lint/suspicious/noExplicitAny: mock
			createUser: mock(async (data: any) => ({
				user: { id: "123", ...data.body },
			})),
		},
	},
}));

describe("UserService", () => {
	afterEach(() => {
		// Clear mocks after each test
		// biome-ignore lint/suspicious/noExplicitAny: mock
		(UserRepository.findByEmail as any).mockClear();
		// biome-ignore lint/suspicious/noExplicitAny: mock
		(UserRepository.findByCpf as any).mockClear();
		// biome-ignore lint/suspicious/noExplicitAny: mock
		(UserRepository.findByCnpj as any).mockClear();
		// biome-ignore lint/suspicious/noExplicitAny: mock
		(UserRepository.update as any).mockClear();
		// biome-ignore lint/suspicious/noExplicitAny: mock
		(UserRepository.findById as any).mockClear();
		// biome-ignore lint/suspicious/noExplicitAny: mock
		(UserRepository.softDelete as any).mockClear();
		// biome-ignore lint/suspicious/noExplicitAny: mock
		(auth.api.createUser as any).mockClear();
	});

	describe("create", () => {
		it("should create a new user", async () => {
			const userData = {
				email: "test@example.com",
				password: "password123",
				name: "Test User",
				type: "pf" as const,
				role: "user" as const,
				cpf: "12345678901",
				dob: new Date("1990-01-01"),
				gender: "M" as const,
			};

			await UserService.create(userData);

			expect(auth.api.createUser).toHaveBeenCalledTimes(1);
			expect(UserRepository.update).toHaveBeenCalledTimes(1);
		});

		it("should throw an error if email is already in use", async () => {
			// biome-ignore lint/suspicious/noExplicitAny: mock
			(UserRepository.findByEmail as any).mockResolvedValueOnce({
				id: "1",
				email: "test@example.com",
			});

			const userData = {
				email: "test@example.com",
				password: "password123",
				name: "Test User",
				type: "pf" as const,
				role: "user" as const,
				cpf: "12345678901",
				dob: new Date("1990-01-01"),
				gender: "M" as const,
			};

			await expect(UserService.create(userData)).rejects.toThrow(
				"E-mail já está em uso.",
			);
		});
	});

	describe("update", () => {
		it("should update a user", async () => {
			const userId = "1";
			const userData = {
				name: "Updated User",
			};

			await UserService.update(userId, userData);

			expect(UserRepository.findById).toHaveBeenCalledWith(userId);
			expect(UserRepository.update).toHaveBeenCalledWith(userId, userData);
		});

		it("should throw an error if user is not found", async () => {
			// biome-ignore lint/suspicious/noExplicitAny: mock
			(UserRepository.findById as any).mockResolvedValueOnce(null);

			const userId = "1";
			const userData = {
				name: "Updated User",
			};

			await expect(UserService.update(userId, userData)).rejects.toThrow(
				"Usuário não encontrado.",
			);
		});
	});

	describe("delete", () => {
		it("should soft delete a user", async () => {
			const userId = "1";

			await UserService.delete(userId);

			expect(UserRepository.findById).toHaveBeenCalledWith(userId);
			expect(UserRepository.softDelete).toHaveBeenCalledWith(userId);
		});

		it("should throw an error if user is not found", async () => {
			// biome-ignore lint/suspicious/noExplicitAny: mock
			(UserRepository.findById as any).mockResolvedValueOnce(null);

			const userId = "1";

			await expect(UserService.delete(userId)).rejects.toThrow(
				"Usuário não encontrado.",
			);
		});
	});
});
