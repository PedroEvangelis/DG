import { redis } from "@/db/redis";
import { CacheKeys } from "@/types/cache";
import { AddressRepository } from "./address.repository";
import type { AddressInput } from "./address.schema";

export const AddressService = {
	async create(data: AddressInput, userId: string) {
		const newAddress = await AddressRepository.create({
			...data,
			userId,
		});

		await redis.del(CacheKeys.addressesByUser(userId));

		return newAddress;
	},

	async findById(id: string) {
		const cacheKey = CacheKeys.address(id);
		const cached = await redis.get(cacheKey);
		if (cached) {
			return JSON.parse(cached);
		}

		const address = await AddressRepository.findById(id);
		if (address) {
			await redis.set(cacheKey, JSON.stringify(address), "EX", 900); // Cache for 15 minutes
		}
		return address;
	},

	async findByUserId(userId: string) {
		const cacheKey = CacheKeys.addressesByUser(userId);
		const cached = await redis.get(cacheKey);
		if (cached) {
			return JSON.parse(cached);
		}

		const addresses = await AddressRepository.findByUserId(userId);
		await redis.set(cacheKey, JSON.stringify(addresses), "EX", 900); // Cache for 15 minutes
		return addresses;
	},

	async update(id: string, data: Partial<AddressInput>) {
		const address = await AddressRepository.findById(id);
		if (!address) {
			throw new Error("Endereço não encontrado.");
		}

		const updatedAddress = await AddressRepository.update(id, data);

		await redis.del(CacheKeys.address(id));
		await redis.del(CacheKeys.addressesByUser(address.userId));

		return updatedAddress;
	},

	async delete(id: string) {
		const address = await AddressRepository.findById(id);
		if (!address) {
			throw new Error("Endereço não encontrado.");
		}

		const deletedAddress = await AddressRepository.delete(id);

		await redis.del(CacheKeys.address(id));
		await redis.del(CacheKeys.addressesByUser(address.userId));

		return deletedAddress;
	},
};
