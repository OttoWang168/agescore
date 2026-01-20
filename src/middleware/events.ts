import { Context, Hono } from "hono";
import { authMiddleware } from "./auth";

const eventRouter = new Hono<Context>()

eventRouter.use('*', authMiddleware)

eventRouter.get('/', async (c) => {
  return c.json({ ...c.Variables.user })
})