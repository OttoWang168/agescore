import { cors } from "hono/cors"
import authRouter from "./routes/auth"
import eventsRouter from "./routes/events"
import briefingRouter from "./routes/briefing"
import { Hono } from "hono"

const app = new Hono<{ Bindings: Env }>()

app.use("/*", cors())

// 挂载路由
app.route('/api/auth', authRouter)
app.route('/api/events', eventsRouter)
app.route('/api/briefing', briefingRouter)

export default app
