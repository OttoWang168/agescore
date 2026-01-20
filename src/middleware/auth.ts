import { Context } from "hono";
import { createMiddleware } from "hono/factory";
import { verify } from "hono/jwt";

export const authMiddleware = createMiddleware<Context>(async (c, next) => {
  const authHeader = c.req.header('Authorization')
  if (!authHeader) { return c.json({ error: '☔️ 对不起，无法访问！' }, 401) }

  const token = authHeader.replace('Bearer ', '')
  try {
    const payload = await verify(token, c.env.JWT_SECRET, 'HS256')
    c.set('user', { id: payload.id as number, username: payload.username as string, role: payload.role as string })
    await next()
  } catch (e) {
    console.log(e)
    return c.json({ error: 'Token 无效！' }, 401)
  }
})