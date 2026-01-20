const TZ_SHANGHAI = 'Asia/Shanghai'

/**
 * 现在没用！
 * 核心魔法：获取北京时间当前的 Date 对象
 * （原理：把 UTC 时间强行错位，变成北京时间的数值）
 */
export function getBeijingDate(): Date {
  const now = new Date()

  const formatter = new Intl.DateTimeFormat('en-US', {
    timeZone: TZ_SHANGHAI,
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hour12: false,
  })
  const parts = formatter.formatToParts(now)
  const mapping: Record<string, string> = {}
  parts.forEach(p => mapping[p.type] = p.value)
  const dateStr = `${mapping.year}-${mapping.month}-${mapping.day}T${mapping.hour}:${mapping.minute}:${mapping.second}`
  return new Date(dateStr)
}

export function getBeijingCurrentDateStr(): string {
  return new Intl.DateTimeFormat('sv-SE', {
    timeZone: TZ_SHANGHAI,
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hour12: false,
  }).format(new Date())
}

export function getCurrentDateStr(): string {
  return new Intl.DateTimeFormat('sv-SE', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hour12: false,
  }).format(new Date())
}

/**
 * 1. 获取当前北京日期的字符串 (YYYY-MM-DD)
 * 用途：存数据库、比较
 */
export function getTodayStr(): string {
  // 方法：利用 en-CA 格式化出来直接是 YYYY-MM-DD，非常方便
  return new Intl.DateTimeFormat('en-CA', {
    timeZone: TZ_SHANGHAI,
    year: 'numeric',
    month: '2-digit',
    day: '2-digit'
  }).format(new Date());
}

/**
 * 2. 计算天数差 (Target - Today)
 * @param targetDateStr 目标日期 (YYYY-MM-DD)
 */
export function getDiffDays(targetDateStr: string): number {
  const todayStr = getTodayStr();
  
  // 技巧：为了避免时分秒干扰，我们统一把字符串当作 UTC 时间来解析
  // 这样 2026-01-20 就变成了 UTC 的 0点，单纯比较日期，绝对准确
  const todayTs = Date.parse(todayStr + 'T00:00:00Z');
  const targetTs = Date.parse(targetDateStr + 'T00:00:00Z');
  
  const diffMs = targetTs - todayTs;
  // 向上取整 (虽然理论上整除，但防一手浮点数误差)
  return Math.ceil(diffMs / (1000 * 60 * 60 * 24));
}

/**
 * 3. 格式化展示 (例如: 1月16日 周五)
 * 用途：每日简报的标题
 */
export function getDisplayDate(): string {
  const now = new Date(); // 这里用 UTC 的 now 没问题，Intl 会自己转时区
  
  const formatter = new Intl.DateTimeFormat('zh-CN', {
    timeZone: TZ_SHANGHAI,
    month: 'long',  // x月
    day: 'numeric', // x日
    weekday: 'long' // 星期x
  });
  
  // 输出：1月20日星期二
  const res = formatter.format(now);
  // 微调格式加个空格：1月20日 星期二
  return res.replace('日', '日 ');
}