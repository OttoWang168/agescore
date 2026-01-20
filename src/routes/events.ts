import { Context, Hono } from "hono";
import { authMiddleware } from "../middleware/auth";
import { drizzle } from "drizzle-orm/d1";
import { events, users } from "../db/schema";
import { desc, eq } from "drizzle-orm";

const eventsRouter = new Hono<Context>()

eventsRouter.use('*', authMiddleware)

eventsRouter.get('/', async (c) => {
  const user = c.var.user
  const db = drizzle(c.env.db_for_ages)

  const eventList = await db.select(
    { id: events.id, title: events.title, date: events.eventDate, icon: events.icon, ownerName: users.username, ownerAvatar: users.avatar }
  ).from(events).leftJoin(users, eq(users.id, events.ownerId)).where(
    eq(events.isDeleted, false)
  ).orderBy(desc(events.eventDate)).all()
  const result = eventList.map(x => {
    return {
      id: x.id, title: x.title, date: x.date, icon: x.icon,
      ownerName: x.ownerName || 'Home', ownerAvatar: x.ownerAvatar || '❤️'
    }
  })
  return c.json(eventList)
})

export default eventsRouter