import { Context, Hono } from "hono";
import { getBeijingCurrentDateStr, getCurrentDateStr } from "../utils/g-time";

const briefingRouter = new Hono<Context>()

briefingRouter.get('/', async (c) => {
  const token = c.env.REQUEST_TOKEN
  if (!token) { return c.json({ error: '🔻 崩了' }, 401) }
  const reqToken = c.req.query('token')
  if (reqToken!==token) { return c.json({ error: '🔹 崩了' }, 401) }
  return c.json({
    beijing: getBeijingCurrentDateStr(),
    default: getCurrentDateStr(),
  })
})

export default briefingRouter