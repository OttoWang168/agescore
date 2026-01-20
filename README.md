# db
`npx wrangler d1 create db_for_ages`

`npx drizzle-kit generate`

`npx wrangler d1 execute db_for_ages --local --file=./drizzle/0000_lumpy_bill_hollister.sql`

`npx wrangler d1 execute db_for_ages --local --file=./src/db/seeds/users.sql`

`npx wrangler d1 execute db_for_ages --remote --file=./drizzle/0000_lumpy_bill_hollister.sql`

`npx wrangler d1 execute db_for_ages --remote --file=./src/db/seeds/users.sql`

`node bash_scripts/generate_users.js "$your_salt"`

file: `.wrangler/state/v3/d1`

```txt
npm install
npm run dev
```

```txt
npm run deploy
```

[For generating/synchronizing types based on your Worker configuration run](https://developers.cloudflare.com/workers/wrangler/commands/#types):

```txt
npm run cf-typegen
npx wrangler types
```

Pass the `CloudflareBindings` as generics when instantiation `Hono`:

```ts
// src/index.ts
const app = new Hono<{ Bindings: CloudflareBindings }>()
```
