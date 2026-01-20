// 1. 获取命令行参数
// process.argv[0] 是 node，[1] 是脚本路径，[2] 才是第一个参数
const inputSalt = process.argv[2];

if (!inputSalt) {
  console.error("\n❌ 错误：请在命令行提供 Salt！");
  console.error("👉 用法: node generate_sql.js <YOUR_SALT_STRING>\n");
  process.exit(1); // 退出程序，返回错误码
}

const SALT = inputSalt;

// 定义用户数据
const USERS = [
  { username: 'zhanglangeba', code: 'zhanglangeba_fake_code', role: 'admin', avatar: '🐽' },
  { username: 'tiejiaxiaobao', code: 'tiejiaxiaobao_fake_code', role: 'user', avatar: '🐶' },
];

/**
 * 模拟 Worker 端的 SHA-256 + Salt 逻辑
 */
async function hashPassword(plainText, salt) {
  const text = plainText + salt;
  const myText = new TextEncoder().encode(text); // TextEncoder 是 Node 全局自带的

  // 使用 await 调用异步摘要算法
  const myDigest = await crypto.subtle.digest({ name: 'SHA-256' }, myText);

  // 转 Hex
  return Array.from(new Uint8Array(myDigest))
    .map(b => b.toString(16).padStart(2, '0'))
    .join('');
}

async function generateSQL() {
  const timestamp = Date.now();

  console.log(`-- 自动生成的种子数据`);
  console.log(`-- 生成时间: ${new Date().toISOString()}`);
  console.log(`-- 使用的 Salt: ${SALT} (请确保存储到 .dev.vars 和 Wrangler Secret)`);
  console.log('');

  // 1. 清理旧数据
  console.log(`DELETE FROM users;`);
  console.log(`DELETE FROM sqlite_sequence WHERE name='users';`);

  // 2. 生成插入语句
  for (let i = 0; i < USERS.length; i++) {
    const u = USERS[i];
    const id = i + 1;

    // 等待哈希计算完成
    const hash = await hashPassword(u.code, SALT);

    const sql = `INSERT INTO users (id, username, access_code_hash, role, avatar, gmt_create, gmt_modified, is_deleted) VALUES (${id}, '${u.username}', '${hash}', '${u.role}', '${u.avatar}', ${timestamp}, ${timestamp}, 0);`;

    console.log(sql);
  }
}

generateSQL();