import { D1Database } from "@cloudflare/workers-types/experimental";
import { CloesceApp, WranglerEnv } from "cloesce/backend";

@WranglerEnv
export class Env {
  db: D1Database;
}

const app = new CloesceApp();
export default app;
