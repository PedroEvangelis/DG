import { redis } from "@/db/redis";
import { auth } from "@/lib/auth";
import { validateCpf } from "@/lib/validators/cpf.validator";
import { ReceitaWsService } from "@/modules/integrations/receitaws.service";
import { CacheKeys } from "@/types/cache";
import { UserRepository } from "./user.repository";
import type { CreateUserInput, UpdateUserInput } from "./user.schema";

export const UserService = {
	async create(data: CreateUserInput) {
		const existingEmail = await UserRepository.findByEmail(data.email);
		if (existingEmail) {
			throw new Error("E-mail já está em uso.");
		}

		if (data.type === "pf") {
			if (!data.cpf) {
				throw new Error("CPF é obrigatório para Pessoa Física.");
			}
			if (!validateCpf(data.cpf)) {
				throw new Error("CPF inválido.");
			}
			const existingCpf = await UserRepository.findByCpf(data.cpf);
			if (existingCpf) {
				throw new Error("CPF já cadastrado.");
			}
		}

		if (data.type === "pj") {
			if (!data.cnpj) {
				throw new Error("CNPJ é obrigatório para Pessoa Jurídica.");
			}
			const existingCnpj = await UserRepository.findByCnpj(data.cnpj);
			if (existingCnpj) {
				throw new Error("CNPJ já cadastrado.");
			}

			const companyData = await ReceitaWsService.getCompanyByCnpj(data.cnpj);
			if (!companyData || companyData.status === "ERROR") {
				throw new Error("CNPJ inválido ou não encontrado na Receita Federal.");
			}

			const normalize = (str: string) =>
				str
					.trim()
					.toLowerCase()
					.normalize("NFD")
					.replace(/[\u0300-\u036f]/g, "");

			if (normalize(companyData.nome) !== normalize(data.corporateName)) {
				throw new Error(
					`A Razão Social informada não corresponde à registrada para este CNPJ. Esperado: ${companyData.nome}`,
				);
			}

			if (
				companyData.fantasia &&
				normalize(companyData.fantasia) !== normalize(data.tradeName)
			) {
				throw new Error(
					`O Nome Fantasia informado não corresponde ao registrado para este CNPJ. Esperado: ${companyData.fantasia}`,
				);
			}
		}

		try {
			// Using betterAuth admin plugin to create user to handle password hashing easily
			const result = await auth.api.createUser({
				body: {
					email: data.email,
					password: data.password,
					name: data.name,
					role: data.role,
				},
			});

			if (!result || !result.user) {
				throw new Error("Erro ao criar usuário na autenticação.");
			}

			// Update the rest of the custom fields in our database directly
			const updatedUser = await UserRepository.update(result.user.id, {
				type: data.type,
				cpf: data.type === "pf" ? data.cpf : undefined,
				dob: data.type === "pf" ? new Date(data.dob!) : undefined,
				gender: data.type === "pf" ? data.gender : undefined,
				corporateName: data.type === "pj" ? data.corporateName : undefined,
				tradeName: data.type === "pj" ? data.tradeName : undefined,
				cnpj: data.type === "pj" ? data.cnpj : undefined,
			});

			await redis.del(CacheKeys.usersAll());

			return updatedUser;
		} catch (error: unknown) {
			console.error("Error creating user:", error);
			if (error instanceof Error) {
				throw new Error(error.message || "Falha na criação do usuário.");
			}
			throw new Error("Falha na criação do usuário.");
		}
	},

	async findAll() {
		const cacheKey = CacheKeys.usersAll();
		const cached = await redis.get(cacheKey);
		if (cached) {
			return JSON.parse(cached);
		}

		const users = await UserRepository.findAll();
		await redis.set(cacheKey, JSON.stringify(users), "EX", 300); // Cache for 5 minutes
		return users;
	},

	async findById(id: string) {
		const cacheKey = CacheKeys.user(id);
		const cached = await redis.get(cacheKey);
		if (cached) {
			return JSON.parse(cached);
		}

		const user = await UserRepository.findById(id);
		if (user) {
			await redis.set(cacheKey, JSON.stringify(user), "EX", 900); // Cache for 15 minutes
		}
		return user;
	},

	async update(id: string, data: UpdateUserInput) {
		const user = await UserRepository.findById(id);
		if (!user) {
			throw new Error("Usuário não encontrado.");
		}

		const updateData = {
			...data,
			dob: data.dob ? new Date(data.dob) : undefined,
		};

		const updatedUser = await UserRepository.update(id, updateData);

		await redis.del(CacheKeys.usersAll());
		await redis.del(CacheKeys.user(id));

		return updatedUser;
	},

	async delete(id: string) {
		const user = await UserRepository.findById(id);
		if (!user) {
			throw new Error("Usuário não encontrado.");
		}

		const deletedUser = await UserRepository.softDelete(id);

		await redis.del(CacheKeys.usersAll());
		await redis.del(CacheKeys.user(id));

		return deletedUser;
	},
};
