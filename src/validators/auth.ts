import z from "zod";

export const loginSchema = z.object({
  code: z.string()
  .min(4, { error: '🤡 口令不对' })
  .min(1, { error: '🥲 口令不能是空哦' }) // 💡 G老师注：Zod新版推荐用 min(1) 代替 nonempty()
  .max(200, { error: '👽 口令不对' })
})

export type LoginForm = z.infer<typeof loginSchema>