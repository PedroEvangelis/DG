import { authClient } from "./src/lib/auth-client.ts";
async function test() {
  const session = await authClient.getSession();
  console.log(session);
}
test();
