import { Context, Hono } from "hono";
import { authMiddleware } from "../middleware/auth";
import { drizzle } from "drizzle-orm/d1";
import { getBeijingCurrentDateStr, getCurrentDateStr, getDiffDays, getTodayStr } from "../utils/g-time";
import { calendarSchedules, eventDefinitions, events, users } from "../db/schema";
import { and, asc, desc, eq, gte } from "drizzle-orm";
import { EVENT_OWNER, EVENT_TYPE } from "../constants";
import { eventService } from "../services/eventService";
import { calendarService } from "../services/calendar";

const home = new Hono<Context>()

home.use("*", authMiddleware)

home.get("/", async (c) => {
  const db = drizzle(c.env.db_for_ages)
  // 1. 并行获取数据 (比以前串行 `await` 更快！)
  const [userEvents, nextSolarTerm, nextHoliday] = await Promise.all([
    eventService.getAllFormatted(db),
    calendarService.getNextSepecial(db, EVENT_TYPE.TERM),
    calendarService.getNextSepecial(db, EVENT_TYPE.HOLIDAY),
  ]);

  // 2. 内存组装逻辑 (Controller只负责组装)
  const pastList: any[] = []
  const upcomingList: any[] = []

  // A. 分类用户事件
  userEvents.forEach(e => {
    if (e.diff < 0) { pastList.push(e) }
    else { upcomingList.push(e) }
  })

  // B. 注入节气和假日到 Future 流
  if (nextSolarTerm) { upcomingList.push(nextSolarTerm) };
  if (nextHoliday) { upcomingList.push(nextHoliday) };

  // 过去列表排序：离今天越远越靠前 (绝对值越大越靠前)
  // diff 是负数，比如 -2 (2天前) 和 -100 (100天前)，我们希望 -100 排前面
  pastList.sort((a, b) => b.days - a.days)

  // 即将到来列表排序：离今天越近越靠前
  upcomingList.sort((a, b) => a.days - b.days)

  // B. 决定 Highlight (高亮展示最最最近的那个重要日子)
  // 规则：优先展示最近的节日/节气，如果没有，再展示用户最近的大事
  let highlightItem = null
  if (nextSolarTerm && nextHoliday) {
    highlightItem = nextSolarTerm.days <= nextHoliday.days ? nextSolarTerm : nextHoliday
  } else {
    highlightItem = nextSolarTerm || nextHoliday
  }
  // (可选) 如果都没有，就拿用户最近的未来事件顶上
  if (!highlightItem && upcomingList.length > 0) {
    highlightItem = upcomingList[0];
  }

  return c.json({ beijingTime: getBeijingCurrentDateStr(), serverTime: getCurrentDateStr(), highlight: highlightItem, upcoming: upcomingList, past: pastList })
})

export default home
