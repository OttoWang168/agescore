import { Context, Hono } from "hono";
import { getBeijingCurrentDateStr, getBeijingDate, getCurrentDateStr, getDiffDays, getTodayStr } from "../utils/g-time";
import { drizzle } from "drizzle-orm/d1";
import { calendarSchedules, eventDefinitions, events, quotes, users } from "../db/schema";
import { and, asc, eq, gte, isNull } from "drizzle-orm";

const SOLAR_TERM_TYPE = 'term'
const HOLIDAY_TYPE = 'holiday'

const briefingRouter = new Hono<Context>()

briefingRouter.get('/', async (c) => {
  const token = c.env.REQUEST_TOKEN
  if (!token) { return c.json({ error: '🔻 崩了' }, 401) }
  const reqToken = c.req.query('token')
  if (reqToken!==token) { return c.json({ error: '🔹 崩了' }, 401) }

  const todayStr = getTodayStr()
  const db = drizzle(c.env.db_for_ages)

  const response: any = { beijingTime: getBeijingCurrentDateStr(), serverTime: getCurrentDateStr(), }

  // ==========================================
  // 1. 获取并拍平 用户事件 (User Events)
  // ==========================================
  const eventList = await db.select(
    { title: events.title, date: events.eventDate, ownerName: users.username }
  ).from(events).leftJoin(users, eq(events.ownerId, users.id)).where(
    eq(events.isDeleted, false)
  ).all()
  eventList.forEach(e => {
    const diffDays = getDiffDays(e.date)
    const key = e.ownerName ? `${e.ownerName}${e.title}` : e.title
    response[key] = Math.abs(diffDays)
  })

  // ==========================================
  // 2. 获取下一个 节气 (含百科信息)
  // ==========================================
  const nextTerm = await db.select(
    {
      name: eventDefinitions.name, date: calendarSchedules.date, order: eventDefinitions.order, icon: eventDefinitions.icon,
      enName: eventDefinitions.enName, desc: eventDefinitions.description, meteo: eventDefinitions.meteorologicalChanges,
      poem: eventDefinitions.poem, custom: eventDefinitions.custom, food: eventDefinitions.food, health: eventDefinitions.health
    }
  ).from(calendarSchedules).leftJoin(eventDefinitions, eq(eventDefinitions.name, calendarSchedules.definitionName)).where(
    and(
      eq(calendarSchedules.isDeleted, false),
      eq(eventDefinitions.type, SOLAR_TERM_TYPE),
      gte(calendarSchedules.date, todayStr),
    )
  ).orderBy(asc(calendarSchedules.date)).limit(1).get()

  if (nextTerm) {
     const diff = Math.abs(getDiffDays(nextTerm.date));
    
    // 基础信息
    response['下一个节气'] = diff; // 0 代表今天就是节气
    response['节气名'] = nextTerm.name;
    response['节气顺序'] = nextTerm.order; // 直接读表里的 '1'~'24'
    response['emoji'] = nextTerm.icon;

    // 百科信息 (Shortcuts 可以根据 diff===0 来决定是否使用这些字段)
    response['节气英文名'] = nextTerm.enName;
    response['节气含义'] = nextTerm.desc;
    response['节气气象表现'] = nextTerm.meteo;
    response['节气相关诗句'] = nextTerm.poem;
    response['节气风俗习惯'] = nextTerm.custom;
    response['节气美食'] = nextTerm.food;
    response['节气补充说明'] = nextTerm.health;
  }

  /// ==========================================
  // 3. 获取下一个 节假日
  // ==========================================
  const nextHoliday = await db.select(
    { 
      name: eventDefinitions.name, date: calendarSchedules.date, order: eventDefinitions.order, icon: eventDefinitions.icon,
    }
  ).from(calendarSchedules).leftJoin(eventDefinitions, eq(eventDefinitions.name, calendarSchedules.definitionName)).where(
    and(
      eq(calendarSchedules.isDeleted, false),
      eq(eventDefinitions.type, HOLIDAY_TYPE),
      gte(calendarSchedules.date, todayStr),
    )
  ).orderBy(asc(calendarSchedules.date)).limit(1).get()

  if (nextHoliday) {
    const diff = Math.abs(getDiffDays(nextHoliday.date));
    response['下一个节假日'] = diff;
    response['节假日名称'] = nextHoliday.name;
    response['节假日顺序'] = nextHoliday.order; // '1'~'7'
    response['节假日Emoji'] = nextHoliday.icon;
  }

  // ==========================================
  // 4. 吉言抽取 (含副作用)
  // ==========================================
  let luckeyQuote 
  luckeyQuote = await db.select().from(quotes).where(
    and(
      eq(quotes.isDeleted, false),
      eq(quotes.scheduleDate, todayStr),
    )
  ).get()
  if (!luckeyQuote) {
    const pool = await db.select().from(quotes).where(
      and(
        eq(quotes.isDeleted, false),
        eq(quotes.isUsed, false),
        isNull(quotes.scheduleDate),
      )
    ).all()
    if (pool.length > 0) {
      luckeyQuote = pool[Math.floor(Math.random() * pool.length)]
      if (luckeyQuote) {
        await db.update(quotes).set({ isUsed: true, usedAt: getBeijingDate() }).where(eq(quotes.id, luckeyQuote.id)).run()
      }
    } else {
      luckeyQuote = { content: '平平淡淡才是真 ❤️' }
    }
  }

  return c.json(response)
})

export default briefingRouter