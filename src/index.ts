import { cors } from "hono/cors"
import authRoute from "./routes/auth"
import { Hono } from "hono"

const app = new Hono<{ Bindings: Env }>()

app.use("/*", cors())

// 挂载路由
app.route('/api/auth', authRoute)

export default app
