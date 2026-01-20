import { cors } from "hono/cors"
import authRoute from "./routes/auth"
import eventsRoute from "./routes/events"
import briefingRoute from "./routes/briefing"
import { Hono } from "hono"

const app = new Hono<{ Bindings: Env }>()

app.use("/*", cors())

// 挂载路由
app.route('/api/auth', authRoute)
app.route('/api/events', eventsRoute)
app.route('/api/briefing', briefingRoute)

export default app
