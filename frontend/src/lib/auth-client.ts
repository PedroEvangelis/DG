import { adminClient } from "better-auth/client/plugins";
import { createAuthClient } from "better-auth/react";

export const authClient = createAuthClient({
	baseURL: window.location.origin,
	plugins: [adminClient()],
});

export const { signIn, signUp, useSession, signOut } = authClient;
