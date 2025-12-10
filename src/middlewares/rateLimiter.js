/**
 * Rate Limiter Middleware
 * Prevents brute force attacks by limiting requests per IP address
 */

// In-memory store for tracking requests
const requestStore = new Map();

/**
 * Create a rate limiter middleware
 * @param {Object} options - Configuration options
 * @param {number} options.windowMs - Time window in milliseconds (default: 15 minutes)
 * @param {number} options.maxRequests - Maximum number of requests per window (default: 5)
 * @param {string} options.message - Error message to send when limit is exceeded
 */
function createRateLimiter(options = {}) {
    const {
        windowMs = 15 * 60 * 1000, // 15 minutes
        maxRequests = 5,
        message = "Too many requests. Please try again later."
    } = options;

    // Clean up old entries every minute
    setInterval(() => {
        const now = Date.now();
        for (const [key, data] of requestStore.entries()) {
            if (now - data.firstRequest > windowMs) {
                requestStore.delete(key);
            }
        }
    }, 60000);

    return (req, res, next) => {
        // Get client IP address
        const clientIp = req.ip || req.connection.remoteAddress || req.socket.remoteAddress;
        const key = `${clientIp}-${req.path}`;
        const now = Date.now();

        // Get or initialize request data for this IP
        let requestData = requestStore.get(key);

        if (!requestData) {
            // First request from this IP
            requestStore.set(key, {
                count: 1,
                firstRequest: now
            });
            return next();
        }

        // Check if window has expired
        if (now - requestData.firstRequest > windowMs) {
            // Reset the window
            requestStore.set(key, {
                count: 1,
                firstRequest: now
            });
            return next();
        }

        // Increment request count
        requestData.count++;

        // Check if limit exceeded
        if (requestData.count > maxRequests) {
            const timeLeft = Math.ceil((windowMs - (now - requestData.firstRequest)) / 1000 / 60);
            return res.status(429).json({
                error: message,
                retryAfter: `${timeLeft} minutes`,
                limit: maxRequests,
                windowMs: windowMs / 1000 / 60
            });
        }

        // Update store
        requestStore.set(key, requestData);
        next();
    };
}

// Pre-configured rate limiters for different use cases

// Strict limiter for login/auth endpoints (5 requests per 15 minutes)
export const loginRateLimiter = createRateLimiter({
    windowMs: 15 * 60 * 1000,
    maxRequests: 5,
    message: "Too many login attempts. Please try again after 15 minutes."
});

// Moderate limiter for registration (3 requests per hour)
export const registerRateLimiter = createRateLimiter({
    windowMs: 60 * 60 * 1000,
    maxRequests: 3,
    message: "Too many registration attempts. Please try again later."
});

// General API limiter (100 requests per 15 minutes)
export const apiRateLimiter = createRateLimiter({
    windowMs: 15 * 60 * 1000,
    maxRequests: 100,
    message: "Too many requests. Please slow down."
});

// Password reset limiter (3 requests per hour)
export const passwordResetRateLimiter = createRateLimiter({
    windowMs: 60 * 60 * 1000,
    maxRequests: 3,
    message: "Too many password reset attempts. Please try again later."
});

export default createRateLimiter;

