
export const hashPassword = async (plainText: string, salt: string): Promise<string> => {
  if (!salt) { throw new Error("少盐！") }
  const text = plainText + salt;
  const myText = new TextEncoder().encode(text); // TextEncoder 是 Node 全局自带的
  // 使用 await 调用异步摘要算法
  const myDigest = await crypto.subtle.digest({ name: 'SHA-256' }, myText);
  // 转 Hex
  return Array.from(new Uint8Array(myDigest)).map(b => b.toString(16).padStart(2, '0')).join('');
}
