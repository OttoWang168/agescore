/**
 * Commit Skill - 自动生成符合 Conventional Commits 规范的 commit message
 * 格式参考: https://www.conventionalcommits.org/en/v1.0.0/#summary
 *
 * 使用方法:
 * - 直接说 "帮我commit" 或运行 "/commit"
 * - AI 会自动根据改动生成格式正确的 commit message
 */

export const skill = {
  name: "commit",
  description: "生成符合 Conventional Commits 规范的 commit message，带 emoji 前缀",

  execute: async (context) => {
    return {
      instructions: `
请帮用户创建 git commit，严格遵循以下规则：

## 1. 格式要求
- 遵循 Conventional Commits 规范: https://www.conventionalcommits.org/en/v1.0.0/#summary
- 基本格式：<type>: <description>
- description 前面必须加对应的 emoji

## 2. Type 类型及对应 Emoji

| Type | Emoji | 说明 | 示例 |
|------|-------|------|------|
| feat | ✨ | 新功能 | ✨ feat: add user authentication |
| fix | 🐛 | 修复 bug | 🐛 fix: resolve login timeout issue |
| docs | 📝 | 文档更新 | 📝 docs: update API documentation |
| style | 💄 | 代码格式调整（不影响功能） | 💄 style: format code with prettier |
| refactor | ♻️ | 重构代码 | ♻️ refactor: simplify user service |
| perf | ⚡️ | 性能优化 | ⚡️ perf: optimize database queries |
| test | ✅ | 测试相关 | ✅ test: add unit tests for auth |
| build | 📦 | 构建系统/依赖更新 | 📦 build: upgrade to node 20 |
| ci | 🔧 | CI 配置 | 🔧 ci: add github actions workflow |
| chore | 🔨 | 其他杂事 | 🔨 chore: update .gitignore |

## 3. 使用步骤

当用户要求 commit 时，请按以下步骤执行：

1. 并行运行这些命令查看当前状态：
   - \`git status\` - 查看未跟踪的文件
   - \`git diff\` - 查看暂存和未暂存的改动
   - \`git log -5 --oneline\` - 查看最近的 commit 记录

2. 分析所有改动，选择最合适的 type 和 emoji

3. 生成 commit message，格式为：
   \`
   <emoji> <type>: <description>

   [可选的详细说明]

   Co-Authored-By: Claude Sonnet 4.5 <noreply@anthropic.com>
   \`

4. 运行命令创建 commit：
   - \`git add <相关文件>\`
   - \`git commit -m "commit message"\`
   - \`git status\` - 验证成功

5. 重要注意事项：
   - 永远只创建 NEW commits，不要用 --amend
   - 不要 push 到远程仓库，除非用户明确要求
   - 如果没有改动，不要创建空 commit
   - 不要提交敏感文件（.env, credentials.json 等）

## 4. Commit Message 示例

好的例子：
- ✨ feat: add user authentication system
- 🐛 fix: resolve memory leak in worker
- 📝 docs: add deployment guide
- 💄 style: format with prettier
- ♻️ refactor: extract common utilities
- ⚡️ perf: cache database results
- ✅ test: add integration tests
- 📦 build: upgrade to Wrangler 4.0
- 🔧 ci: add lint check to github actions
- 🔨 chore: clean up unused imports
      `
    };
  }
};
