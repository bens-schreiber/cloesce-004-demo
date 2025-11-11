import { D1Database } from "@cloudflare/workers-types/experimental";
import { CloesceApp, WranglerEnv } from "cloesce/backend";

@WranglerEnv
export class Env {
  db: D1Database;
}

const app = new CloesceApp();

// allow all origins
app.onResponse(async (request, env: Env, di, response: Response) => {
  response.headers.set("Access-Control-Allow-Origin", "*");
  response.headers.set(
    "Access-Control-Allow-Methods",
    "GET, POST, PUT, DELETE, OPTIONS"
  );
  response.headers.set(
    "Access-Control-Allow-Headers",
    "Content-Type, Authorization"
  );
});

export default app;
