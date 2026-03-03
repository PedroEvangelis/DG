export function validateCpf(cpf: string | null | undefined): boolean {
	if (!cpf) return false;
	const cpfClean = cpf.replace(/[^\d]/g, "");
	if (cpfClean.length !== 11 || /^(\d)\1{10}$/.test(cpfClean)) {
		return false;
	}
	let sum = 0;
	let remainder;
	for (let i = 1; i <= 9; i++) {
		sum += Number.parseInt(cpfClean.substring(i - 1, i), 10) * (11 - i);
	}
	remainder = (sum * 10) % 11;
	if (remainder === 10 || remainder === 11) {
		remainder = 0;
	}
	if (remainder !== Number.parseInt(cpfClean.substring(9, 10), 10)) {
		return false;
	}
	sum = 0;
	for (let i = 1; i <= 10; i++) {
		sum += Number.parseInt(cpfClean.substring(i - 1, i), 10) * (12 - i);
	}
	remainder = (sum * 10) % 11;
	if (remainder === 10 || remainder === 11) {
		remainder = 0;
	}
	return remainder === Number.parseInt(cpfClean.substring(10, 11), 10);
}
