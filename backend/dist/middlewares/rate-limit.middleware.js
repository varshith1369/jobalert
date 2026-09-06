const store = {};
export function rateLimit(options) {
    return (req, res, next) => {
        const ip = req.ip || req.socket.remoteAddress || 'unknown';
        const now = Date.now();
        if (!store[ip] || store[ip].resetTime < now) {
            store[ip] = {
                count: 1,
                resetTime: now + options.windowMs,
            };
            return next();
        }
        store[ip].count++;
        if (store[ip].count > options.maxRequests) {
            res.status(429).json({
                error: 'Too Many Requests',
                message: 'Rate limit exceeded. Please wait a moment before retrying.',
            });
            return;
        }
        next();
    };
}
