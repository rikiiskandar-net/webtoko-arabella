const rateLimitMap = new Map();

export default function rateLimit(request, options = {}) {
  const { limit = 5, windowMs = 15 * 60 * 1000 } = options; // Default: 5 requests per 15 minutes
  
  // Extract IP. Note: In a real Next.js deployment (Vercel), we'd use request.headers.get('x-forwarded-for')
  const ip = request.headers.get('x-forwarded-for') || 
             request.headers.get('x-real-ip') || 
             'anonymous-ip';
             
  const now = Date.now();
  
  if (!rateLimitMap.has(ip)) {
    rateLimitMap.set(ip, {
      count: 1,
      startTime: now
    });
    return { success: true };
  }

  const record = rateLimitMap.get(ip);
  
  // If window has expired, reset the counter
  if (now - record.startTime > windowMs) {
    rateLimitMap.set(ip, {
      count: 1,
      startTime: now
    });
    return { success: true };
  }
  
  // Increment the counter
  record.count += 1;
  rateLimitMap.set(ip, record);
  
  if (record.count > limit) {
    return { success: false, retryAfter: Math.ceil((windowMs - (now - record.startTime)) / 1000) };
  }
  
  return { success: true };
}
