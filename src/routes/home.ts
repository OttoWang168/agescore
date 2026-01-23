import { Context, Hono } from "hono";
import { authMiddleware } from "../middleware/auth";
import { drizzle } from "drizzle-orm/d1";
import { getBeijingCurrentDateStr, getCurrentDateStr, getDiffDays, getTodayStr } from "../utils/g-time";
import { calendarSchedules, eventDefinitions, events, users } from "../db/schema";
import { and, asc, desc, eq, gte } from "drizzle-orm";
import { EVENT_OWNER, EVENT_TYPE } from "../constants";

const home = new Hono<Context>()

home.use("*", authMiddleware)

home.get("/", async (c) => {
  const db = drizzle(c.env.db_for_ages)
  const todayStr = getTodayStr()
  // ====================================================
  // 1. 获取用户事件 (User Events) - 全量查出，内存分类
  // ====================================================
  const eventList = await db.select(
    { id: events.id, title: events.title, date: events.eventDate, icon: events.icon, ownerName: users.username, ownerAvatar: users.avatar }
  ).from(events)
  .leftJoin(users, eq(events.ownerId, users.id))
  .where(eq(events.isDeleted, false)).all()

  const pastList: any[] = []
  const futureUserList: any[] = []

  eventList.forEach(e => {
    const diff = getDiffDays(e.date)
    const item = {
      id: `evt_${e.id}`, type: 'event', title: e.title, date: e.date, days: Math.abs(diff), icon: e.icon,
      /**  如果 ownerName 为空，说明 userId 是 null，代表家庭公共事件 */ owner: e.ownerName || EVENT_OWNER.FAMILY, avatar: e.ownerAvatar || '🏠'
    }
    // 过去 (diff >= 0 代表 target <= today，即“已累计”)
    // 按照 G老师之前的纠正，getDiffDays(过去) 返回的是负数，getDiffDays(未来) 是正数
    // 等等，让我再确认一下 getDiffDays 的逻辑： target - today
    // 过去事件：target < today -> 负数。
    // 未来事件：target > today -> 正数。
    // 所以：
    if (diff < 0) {
      pastList.push(item)
    } else {
      futureUserList.push(item)
    }
  })
  // 过去列表排序：离今天越远越靠前 (绝对值越大越靠前)
  // diff 是负数，比如 -2 (2天前) 和 -100 (100天前)，我们希望 -100 排前面
  pastList.sort((a, b) => b.days - a.days) 

  // ====================================================
  // 2. 获取下一个最近的“节气” (Next Term) - 仅 1 条
  // ====================================================
  const nextTerm = await db.select(
    {
      name: eventDefinitions.name, date: calendarSchedules.date, order: eventDefinitions.order, icon: eventDefinitions.icon,
      enName: eventDefinitions.enName, desc: eventDefinitions.description, meteo: eventDefinitions.meteorologicalChanges,
      poem: eventDefinitions.poem, custom: eventDefinitions.custom, food: eventDefinitions.food, health: eventDefinitions.health
    }
  ).from(calendarSchedules).leftJoin(eventDefinitions, eq(eventDefinitions.name, calendarSchedules.definitionName)).where(
    and(
      eq(calendarSchedules.isDeleted, false),
      eq(eventDefinitions.type, EVENT_TYPE.TERM),
      gte(calendarSchedules.date, todayStr),
    )
  ).orderBy(asc(calendarSchedules.date)).limit(1).get()

  const nextSolarTerm = nextTerm ? {
    id: `term_${nextTerm.name}`, type: EVENT_TYPE.TERM, title: nextTerm.name, subTitle: `第${nextTerm?.order}个节气`,
    date: nextTerm.date, days: Math.abs(getDiffDays(nextTerm.date)), icon: nextTerm.icon, desc: nextTerm.desc, owner: EVENT_OWNER.SYSTEM, avatar: '🎋'
  } : null


  // ====================================================
  // 3. 获取下一个最近的“节假日” (Next Holiday) - 仅 1 条
  // ====================================================
  const nextHoliday = await db.select(
    { 
      name: eventDefinitions.name, date: calendarSchedules.date, order: eventDefinitions.order, icon: eventDefinitions.icon, desc: eventDefinitions.description,
    }
  ).from(calendarSchedules).leftJoin(eventDefinitions, eq(eventDefinitions.name, calendarSchedules.definitionName)).where(
    and(
      eq(calendarSchedules.isDeleted, false),
      eq(eventDefinitions.type, EVENT_TYPE.HOLIDAY),
      gte(calendarSchedules.date, todayStr),
    )
  ).orderBy(asc(calendarSchedules.date)).limit(1).get()

  const nextHolidayItem = nextHoliday ? {
    id: `holiday_${nextHoliday.name}`, type: EVENT_TYPE.HOLIDAY, title: nextHoliday.name, date: nextHoliday.date,
    days: Math.abs(getDiffDays(nextHoliday.date)), icon: nextHoliday.icon, desc: nextHoliday.desc, owner: EVENT_OWNER.SYSTEM, avatar: '🧧'
  } : null

  // ====================================================
  // 4. 组装数据 (Mix & Sort)
  // ====================================================
  const upcomingList = [...futureUserList]
  if (nextSolarTerm) { upcomingList.push(nextSolarTerm) }
  if (nextHolidayItem) { upcomingList.push(nextHolidayItem) }
  // 即将到来列表排序：离今天越近越靠前
  upcomingList.sort((a, b) => a.days - b.days)

  // B. 决定 Highlight (高亮展示最最最近的那个重要日子)
  // 规则：优先展示最近的节日/节气，如果没有，再展示用户最近的大事
  let highlightItem = null
  if (nextSolarTerm && nextHolidayItem) {
    highlightItem = nextSolarTerm.days <= nextHolidayItem.days ? nextSolarTerm : nextHolidayItem
  } else {
    highlightItem = nextSolarTerm || nextHolidayItem
  }
  // (可选) 如果都没有，就拿用户最近的未来事件顶上
  if (!highlightItem && futureUserList.length > 0) {
    highlightItem = futureUserList[0];
  }

  return c.json({ beijingTime: getBeijingCurrentDateStr(), serverTime: getCurrentDateStr(), highlight: highlightItem, upcoming: upcomingList, past: pastList })
})

export default home
