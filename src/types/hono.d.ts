import type { Context } from "hono";

declare module 'hono' {
  interface Context { 
    Variables: { 
      user: { id: number, username: string, role: string } 
    }
    Bindings: Env,
  }
}