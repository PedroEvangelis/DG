import { ROLES, type Role } from "@/constants/roles";
import { USER_TYPES, UserType } from "@/constants/userType";
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
			if (!data.dob) {
				throw new Error("Data de nascimento é obrigatória para Pessoa Física.");
			}
			if (!data.gender) {
				throw new Error("Gênero é obrigatório para Pessoa Física.");
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

			const isPf = data.type === USER_TYPES.PF;

			const updatedUser = await UserRepository.update(result.user.id, {
				type: data.type,
				cpf: isPf ? data.cpf : undefined,
				dob: isPf ? new Date(data.dob) : undefined,
				gender: isPf ? data.gender : undefined,
				corporateName: isPf ? data.corporateName : undefined,
				tradeName: isPf ? data.tradeName : undefined,
				cnpj: isPf ? data.cnpj : undefined,
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

	async findAll({ id, role }: { id: string; role: Role }) {
		const cacheKey = CacheKeys.usersAll();
		const cached = await redis.get(cacheKey);

		let users: any[];
		if (cached) {
			users = JSON.parse(cached);
		} else {
			users = await UserRepository.findAll();
			await redis.set(cacheKey, JSON.stringify(users), "EX", 300); // Cache for 5 minutes
		}

		if (role !== "admin") {
			return users.map((user) => {
				if (user.id === id) return user;

				return {
					...user,
					cpf: null,
					cnpj: null,
					dob: null,
					gender: null,
					corporateName: null,
					tradeName: null,
				};
			});
		}

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

	async update(
		id: string,
		data: UpdateUserInput,
		currentUser: { id: string; role: string },
	) {
		const user = await UserRepository.findById(id);
		if (!user) {
			throw new Error("Usuário não encontrado.");
		}

		if (data.type && data.type !== user.type) {
			throw new Error(
				"O tipo de usuário não pode ser alterado após a criação.",
			);
		}

		if (
			data.role &&
			data.role !== user.role &&
			currentUser.role !== ROLES.ADMIN
		) {
			throw new Error("Apenas administradores podem alterar permissões.");
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
