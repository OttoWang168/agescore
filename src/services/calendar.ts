import { drizzle } from "drizzle-orm/d1";
import { calendarSchedules, eventDefinitions } from "../db/schema";
import { and, asc, eq, gte } from "drizzle-orm";
import { EVENT_OWNER, EVENT_TYPE } from "../constants";
import { getDiffDays, getTodayStr } from "../utils/g-time";
import { AnyForeignKeyBuilder } from "drizzle-orm/mysql-core";

export const calendarService = {
   /**
   * 获取下一个最近的特殊日子（节气或假日）
   */
  async getNextSepecial(db: ReturnType<typeof drizzle>, type: 'term' | 'holiday') { 
    const todayStr = getTodayStr()
    const nextTerm = await db.select(
      {
        name: eventDefinitions.name, date: calendarSchedules.date, order: eventDefinitions.order, icon: eventDefinitions.icon,
        enName: eventDefinitions.enName, desc: eventDefinitions.description, meteo: eventDefinitions.meteorologicalChanges,
        poem: eventDefinitions.poem, custom: eventDefinitions.custom, food: eventDefinitions.food, health: eventDefinitions.health
      }
    ).from(calendarSchedules).leftJoin(eventDefinitions, eq(eventDefinitions.name, calendarSchedules.definitionName))
    .where(
      and(
        eq(calendarSchedules.isDeleted, false),
        eq(eventDefinitions.type, type),
        gte(calendarSchedules.date, todayStr),
      )
    ).orderBy(asc(calendarSchedules.date)).limit(1).get()
    if (!nextTerm) { return null }

    const diff = getDiffDays(nextTerm.date)
    const specialItem =  {
      id: `term_${nextTerm.name}`, type: type, title: nextTerm.name, subTitle: `第${nextTerm?.order}个节气`,
      date: nextTerm.date, diff, days: Math.abs(diff), icon: nextTerm.icon, order: nextTerm.order, owner: EVENT_OWNER.SYSTEM,
      wiki: { enName: nextTerm.enName, desc: nextTerm.desc, meteo: nextTerm.meteo, poem: nextTerm.poem, custom: nextTerm.custom, food: nextTerm.food, health: nextTerm.health }
    }
    return specialItem;
  }
}