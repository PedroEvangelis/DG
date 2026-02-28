import { pgEnum } from "drizzle-orm/pg-core";
import { ROLES } from "@/constants/roles";
import { USER_GENDERS } from "@/constants/userGender";
import { USER_TYPES } from "@/constants/userType";

export const userRole = pgEnum("userRole", ROLES);
export const userType = pgEnum("userType", USER_TYPES);
export const userGender = pgEnum("userGender", USER_GENDERS);
