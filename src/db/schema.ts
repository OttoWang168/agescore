import { sqliteTable, index, uniqueIndex, text, integer } from 'drizzle-orm/sqlite-core'

// --- 🏗️ 架构师封装：基础字段生成器 ---
// 强制所有实体表必须遵守的规范
const commonColumns = {
  id: integer('id').primaryKey({ autoIncrement: true }),
  gmtCreate: integer('gmt_create', { mode: 'timestamp' })
    .notNull()
    .$defaultFn(() => new Date()),
  gmtModified: integer('gmt_modified', { mode: 'timestamp' })
    .notNull()
    .$defaultFn(() => new Date())
    .$onUpdate(() => new Date()),
  isDeleted: integer('is_deleted', { mode: 'boolean' })
    .notNull()
    .default(false),
}

// --- 1. 用户表 (User) ---
export const users = sqliteTable('users', {
  ...commonColumns,
  username: text('username').notNull(),
  accessCodeHash: text('access_code_hash').notNull(),
  role: text('role').default('user'),
  avatar: text('avatar').default('😄'),
}, (t) => [
  uniqueIndex('uk_username').on(t.username),
  index('idx_user_is_deleted').on(t.isDeleted),
])

// --- 2. 核心事件表 (Event) ---
export const events = sqliteTable('events', {
  ...commonColumns,
  title: text('title').notNull(),
  eventDate: text('event_date').notNull(), // YYYY-MM-DD
  // 🔥 核心改动：叫 user_id (单数)，且允许为空
  // NOT NULL 被去掉了 -> NULL 代表 "Family"
  ownerId: integer('owner_id').references(() => users.id),  // 如果一个事件既有“创建者”又有“指派者”，都叫 user_id 就乱了。这时候我们会用 creator_id 和 assignee_id。
  icon: text('icon').default('📅'),
}, (t) => [
  index('idx_events_event_date').on(t.eventDate),
  index('idx_events_user_id').on(t.ownerId),
]);

// --- 3. 历史记录表 (EventLog) ---
export const eventLogs = sqliteTable('event_logs', {
  ...commonColumns,
  eventId: integer('event_id').notNull(), // 逻辑上关联 event.id
  logDate: text('log_date').notNull(), // YYYY-MM-DD
}, (t) => [
  index('idx_event_log_event_id').on(t.eventId),
  index('idx_event_log_log_date').on(t.logDate),
]);

// --- 4. 节日/节气定义表 (EventDefinitions - 静) ---
// 存：春节、立春、国庆节 这种“概念”
export const eventDefinitions = sqliteTable('event_definitions', {
  ...commonColumns,
  // 唯一标识码，如 'spring_festival', 'solar_term_1'
  name: text('name').notNull(), // 显示名：春节
  type: text('type').notNull(), // 'term' | 'holiday'
  
  // 扩展字段 (你想要的都在这)
  icon: text('icon').default('📅'), // Emoji
  order: text('order').notNull(), // 顺序
  description: text('description'), // 历史渊源 / 简介
  
  // 节气专属字段 (Holidays 可以留空)
  enName: text('en_name'), // 英文名
  meteorologicalChanges: text('meteorological_changes'), // 气象变化
  poem: text('poem'),   // 诗句
  custom: text('custom'), // 风俗
  food: text('food'),   // 美食
  health: text('health'), // 养生
}, (t) => [
  uniqueIndex('uk_event_definitions_name').on(t.name),
  index('idx_event_definitions_type').on(t.type),
]);

// --- 5. 日历排期表 (CalendarSchedules - 动) ---
// 存：哪一天发生了什么
export const calendarSchedules = sqliteTable('calendar_schedules', {
  ...commonColumns,
  date: text('date').notNull(), // 2026-02-17
  
  // 🔥 关联到定义表的 code
  definitionName: text('definition_name').notNull().references(() => eventDefinitions.name),
  
  isHighlight: integer('is_highlight', { mode: 'boolean' }).default(false),
}, (t) => [
  // 查某个月的日历非常快
  index('idx_calendar_schedules_date').on(t.date),
  // 查"春节"未来几年的日期也很快
  index('idx_calendar_schedules_def_name').on(t.definitionName),
]);

// 6. 吉言表
export const quotes = sqliteTable('quotes', {
  ...commonColumns,
  content: text('content').notNull(),
  creator: text('creator').default('77'),
  scheduleDate: text('schedule_date'), // 指定日期 YYYY-MM-DD
  isUsed: integer('is_used', { mode: 'boolean' }).default(false),
  usedAt: integer('used_at', { mode: 'timestamp' }),
}, (t) => [
  index('idx_quote_schedule_date').on(t.scheduleDate),
  index('idx_quote_pool').on(t.isDeleted, t.isUsed, t.scheduleDate),
]);