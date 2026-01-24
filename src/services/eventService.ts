import { drizzle } from "drizzle-orm/d1";
import { events, users } from "../db/schema";
import { eq } from "drizzle-orm";
import { getDiffDays } from "../utils/g-time";
import { EVENT_OWNER, EVENT_TYPE } from "../constants";

export const eventService = {

  async getAllFormatted(db: ReturnType<typeof drizzle>) {
    const eventList = await db.select(
      { id: events.id, title: events.title, date: events.eventDate, icon: events.icon, ownerName: users.username, ownerAvatar: users.avatar }
    ).from(events).leftJoin(users, eq(events.ownerId, users.id)).where(eq(events.isDeleted, false)).all()

    return eventList.map(e => {
      const diff = getDiffDays(e.date)
      const item = {
        id: e.id, keyName: e.ownerName ? `${e.ownerName}${e.title}` : e.title, title: e.title, date: e.date, diff, days: Math.abs(diff), icon: e.icon, type: EVENT_TYPE.USER_EVENT,
      /**  如果 ownerName 为空，说明 userId 是 null，代表家庭公共事件 */ owner: e.ownerName || EVENT_OWNER.FAMILY, avatar: e.ownerAvatar || '🏠'
      }
      return item
    })
  }
}
