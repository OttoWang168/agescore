const TZ_SHANGHAI = 'Asia/Shanghai'

/**
 * 现在没用！
 * 核心魔法：获取北京时间当前的 Date 对象
 * （原理：把 UTC 时间强行错位，变成北京时间的数值）
 */
function getBeijingDate(): Date {
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