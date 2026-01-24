import { drizzle } from "drizzle-orm/d1";
import { quotes } from "../db/schema";
import { and, eq, isNull } from "drizzle-orm";
import { getBeijingDate, getTodayStr } from "../utils/g-time";

export const quotaService = {
  /**
  * 获取下一个最近的特殊日子（节气或假日）
  */
  async getTodayQuota(db: ReturnType<typeof drizzle>) {
    const todayStr = getTodayStr()
    // 1. 查定时
     let luckeyQuote = await db.select().from(quotes).where(
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
      }
    }

    return luckeyQuote?.content || '平平淡淡才是真 ❤️';
  }
}