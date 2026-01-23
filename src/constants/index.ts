export const EVENT_TYPE = {
  TERM: 'term',       // 节气
  HOLIDAY: 'holiday', // 假日
  USER_EVENT: 'event' // 用户自定义事件
} as const;

export const EVENT_OWNER = {
  SYSTEM: 'System',
  FAMILY: 'Family'
} as const;