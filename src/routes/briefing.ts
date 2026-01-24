import { Context, Hono } from "hono";
import { getBeijingCurrentDateStr, getBeijingDate, getCurrentDateStr, getDiffDays, getTodayStr } from "../utils/g-time";
import { drizzle } from "drizzle-orm/d1";
import { calendarSchedules, eventDefinitions, events, quotes, users } from "../db/schema";
import { and, asc, eq, gte, isNull } from "drizzle-orm";
import { EVENT_TYPE } from "../constants";
import { eventService } from "../services/eventService";
import { calendarService } from "../services/calendar";
import { quotaService } from "../services/quotaService";


const briefing = new Hono<Context>()

briefing.get('/', async (c) => {
  const token = c.env.REQUEST_TOKEN
  if (!token) { return c.json({ error: '🔻 崩了' }, 401) }
  const reqToken = c.req.query('token')
  if (reqToken!==token) { return c.json({ error: '🔹 崩了' }, 401) }

  const response: any = { beijingTime: getBeijingCurrentDateStr(), serverTime: getCurrentDateStr(), }

  const db = drizzle(c.env.db_for_ages)
    // 1. 并行获取数据 (比以前串行 `await` 更快！)
  const [userEvents, nextSolarTerm, nextHoliday, quote] = await Promise.all([
    eventService.getAllFormatted(db),
    calendarService.getNextSepecial(db, EVENT_TYPE.TERM),
    calendarService.getNextSepecial(db, EVENT_TYPE.HOLIDAY),
    quotaService.getTodayQuota(db),
  ]);

  // 填充用户事件 (Key-Value 模式)
  userEvents.forEach(e => {
    response[e.keyName] = e.days
  })

  // 填充节气
  if (nextSolarTerm) {
    // 基础信息
    response['下一个节气'] = nextSolarTerm.days; // 0 代表今天就是节气
    response['节气顺序'] = nextSolarTerm.order; // 直接读表里的 '1'~'24'
    response['节气emoji'] = nextSolarTerm.icon;
    response['节气名'] = nextSolarTerm.title;

    // 百科信息 (Shortcuts 可以根据 diff===0 来决定是否使用这些字段)
    response['节气英文名'] = nextSolarTerm.wiki.enName;
    response['节气含义'] = nextSolarTerm.wiki.desc;
    response['节气气象表现'] = nextSolarTerm.wiki.meteo;
    response['节气相关诗句'] = nextSolarTerm.wiki.poem;
    response['节气风俗习惯'] = nextSolarTerm.wiki.custom;
    response['节气美食'] = nextSolarTerm.wiki.food;
    response['节气补充说明'] = nextSolarTerm.wiki.health;
  }

  // 填充假日
  if (nextHoliday) {
    const diff = Math.abs(getDiffDays(nextHoliday.date));
    response['下一个节假日'] = diff;
    response['节假日名称'] = nextHoliday.title;
    response['节假日顺序'] = nextHoliday.order; // '1'~'7'
    response['节假日Emoji'] = nextHoliday.icon;
  }

  // 填充每日一句
  response['每日一句'] = quote
  return c.json(response)
})

export default briefing