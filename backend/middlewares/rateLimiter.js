const rateLimitStore = new Map();

const createRateLimiter = (options = {}) => {
    const {
        windowMs = 15 * 60 * 1000, // 15 minutes
        max = 100, // limit each IP to 100 requests per windowMs
        message = "Too many requests from this IP, please try again later."
    } = options;

    return (req, res, next) => {
        const key = req.ip || req.connection.remoteAddress;
        const now = Date.now();
        
        // Clean up expired entries
        for (const [ip, data] of rateLimitStore.entries()) {
            if (now > data.resetTime) {
                rateLimitStore.delete(ip);
            }
        }
        
        const currentData = rateLimitStore.get(key) || {
            count: 0,
            resetTime: now + windowMs
        };
        
        if (now > currentData.resetTime) {
            currentData.count = 1;
            currentData.resetTime = now + windowMs;
        } else {
            currentData.count++;
        }
        
        rateLimitStore.set(key, currentData);
        
        // Add rate limit headers
        res.setHeader('X-RateLimit-Limit', max);
        res.setHeader('X-RateLimit-Remaining', Math.max(0, max - currentData.count));
        res.setHeader('X-RateLimit-Reset', new Date(currentData.resetTime));
        
        if (currentData.count > max) {
            return res.status(429).json({
                error: 'Too Many Requests',
                details: message,
                retryAfter: Math.ceil((currentData.resetTime - now) / 1000)
            });
        }
        
        next();
    };
};

// Predefined rate limiters
const authLimiter = createRateLimiter({
    windowMs: 1 * 60 * 1000, // 1 minute
    max: 5, // 5 attempts per 1 minute for auth endpoints
    message: "Too many authentication attempts, please try again later."
});

const generalLimiter = createRateLimiter({
    windowMs: 1 * 60 * 1000, // 1 minutes
    max: 100, // 100 requests per 1 minutes for general endpoints
    message: "Too many requests, please try again later."
});

const messageLimiter = createRateLimiter({
    windowMs: 1 * 60 * 1000, // 1 minute
    max: 100, // 100 messages per minute
    message: "Too many messages sent, please slow down."
});

module.exports = {
    createRateLimiter,
    authLimiter,
    generalLimiter,
    messageLimiter
};