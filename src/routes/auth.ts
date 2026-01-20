import { zValidator } from "@hono/zod-validator"
import { Hono } from "hono"
import { loginSchema } from "../validators/auth"
import { hashPassword } from "../utils/crypto"
import { drizzle } from "drizzle-orm/d1"
import { users } from "../db/schema"
import { eq, and } from "drizzle-orm"
import { sign, verify } from "hono/jwt"

const auth = new Hono<{ Bindings: Env }>()

// ==========================================
// 🚀 接口 A: 登录 (Login)
// ==========================================
auth.post('/login', zValidator('json', loginSchema, (result, c) => {
  if (!result.success) { return c.json({ error: result.error.issues[0].message }) }
}) ,async (c) => {
  const { code } = c.req.valid('json')
  const salt = c.env.PASSWD_SALT
  const hash = await hashPassword(code, salt);
  const db = drizzle(c.env.db_for_ages)
  const user = await db.select().from(users)
  .where(
    and(
      eq(users.accessCodeHash, hash),
      eq(users.isDeleted, false),
    )
  ).get()
  if (!user) { return c.json({ error: '☂️ 对不起，无法访问！' }, 401) }

  const jwtSecret = c.env.JWT_SECRET
  const token = await sign({ id: user.id, username: user.username, role: user.role, avatar: user.avatar, /** 设置过期时间 */ exp: Math.floor(Date.now() / 1000) + 60 * 60 * 24 * 7,  }, jwtSecret, 'HS256')
  return c.json({ token, user: { id: user.id, username: user.username, role: user.role, avatar: user.avatar } })
})

// ==========================================
// 🚀 接口 B: 获取当前用户信息 (Me)
// ==========================================
auth.get('/me', async (c) => {
  const authHeader = c.req.header('Authorization')
  if (!authHeader) { return c.json({ error: '☔️ 对不起，无法访问！' }, 401) }

  const token = authHeader.replace('Bearer ', '')
  try {
    const payload = await verify(token, c.env.JWT_SECRET, 'HS256')
    return c.json({ id: payload.id, username: payload.username, role: payload.role, avatar: payload.avatar })
  } catch (e) {
    console.log(e)
    return c.json({ error: 'Token 无效！' }, 401)
  }
})

// ==========================================
// 🚀 接口 C: 登出 (Logout)
// ==========================================
// 其实 JWT 登出主要靠前端清除 Token，后端做个样子返回 OK 即可
auth.post('/logout', (c) => {
  return c.json({ message: '已登出' })
})

export default auth
