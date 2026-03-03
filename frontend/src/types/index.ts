export type User = {
	id: string;
	name: string;
	email: string;
	role: string;
	cpf?: string | null;
	cnpj?: string | null;
	corporateName?: string | null;
	tradeName?: string | null;
};

export type Address = {
	id: string;
	street: string;
	number: string;
	complement?: string | null;
	neighborhood: string;
	city: string;
	state: string;
	cep: string;
};
