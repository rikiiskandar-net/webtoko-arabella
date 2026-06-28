const RATE_LIMIT = 60;
const RATE_WINDOW = 60 * 1000;
const attempts = new Map();

setInterval(() => {
  const now = Date.now();
  for (const [key, entry] of attempts) {
    if (now - entry.start > RATE_WINDOW) attempts.delete(key);
  }
}, 60 * 1000).unref();

export function isRateLimited(ip) {
  const now = Date.now();
  const entry = attempts.get(ip);
  if (!entry || now - entry.start > RATE_WINDOW) {
    attempts.set(ip, { count: 1, start: now });
    return false;
  }
  entry.count++;
  return entry.count > RATE_LIMIT;
}
