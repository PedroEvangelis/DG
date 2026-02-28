export const USER_TYPES = {
	PF: "pf",
	PJ: "pj",
} as const;

export type UserType = (typeof USER_TYPES)[keyof typeof USER_TYPES];
