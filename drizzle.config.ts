import type { Config } from 'drizzle-kit'

export default {
  // 1. 告诉它 schema 在哪
  schema: './src/db/schema.ts',
  // 2. 告诉它生成的 sql 文件放哪
  out: './drizzle',
  // 3. 核心改动：使用 dialect (方言) 而不是 driver
  // D1 本质上就是 SQLite，所以这里选 sqlite
  dialect: 'sqlite',
} satisfies Config;