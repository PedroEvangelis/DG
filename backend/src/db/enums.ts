import { pgEnum } from "drizzle-orm/pg-core";
import { ROLES } from "@/constants/roles";
import { USER_GENDERS } from "@/constants/userGender";
import { USER_TYPES } from "@/constants/userType";

export const userRole = pgEnum("userRole", [ROLES.ADMIN, ROLES.USER]);
export const userType = pgEnum("userType", [USER_TYPES.PF, USER_TYPES.PJ]);
export const userGender = pgEnum("userGender", [
	USER_GENDERS.MALE,
	USER_GENDERS.FEMALE,
	USER_GENDERS.OTHER,
	USER_GENDERS.NOT_DECLARED,
]);
