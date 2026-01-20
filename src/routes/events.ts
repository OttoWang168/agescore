import { Context, Hono } from "hono";
import { authMiddleware } from "../middleware/auth";

const eventsRouter = new Hono<Context>()

eventsRouter.use('*', authMiddleware)

eventsRouter.get('/', async (c) => {
  return c.json({ ...c.Variables.user })
})

export default eventsRouter