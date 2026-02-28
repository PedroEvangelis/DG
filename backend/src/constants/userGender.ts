export const USER_GENDERS = {
	MALE: "M",
	FEMALE: "F",
	OTHER: "O",
	NOT_DECLARED: "N",
} as const;

export type UserGender = (typeof USER_GENDERS)[keyof typeof USER_GENDERS];
