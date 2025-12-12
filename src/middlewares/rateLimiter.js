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
        maxRequests = 500,
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

// Strict limiter for login/auth endpoints (only counts FAILED attempts)
// Successful logins bypass the limit
export const loginRateLimiter = (req, res, next) => {
    const clientIp = req.ip || req.connection.remoteAddress || req.socket.remoteAddress;
    const key = `failed-login-${clientIp}`;
    const windowMs = 15 * 60 * 1000; // 15 minutes
    const maxFailedAttempts = 5;
    const now = Date.now();

    // Get or initialize failed attempts data
    let failedData = requestStore.get(key);

    if (!failedData) {
        // First attempt from this IP
        requestStore.set(key, {
            count: 0,
            firstRequest: now
        });
        return next();
    }

    // Check if window has expired
    if (now - failedData.firstRequest > windowMs) {
        // Reset the window
        requestStore.set(key, {
            count: 0,
            firstRequest: now
        });
        return next();
    }

    // Check if limit exceeded (only for failed attempts)
    if (failedData.count >= maxFailedAttempts) {
        const timeLeft = Math.ceil((windowMs - (now - failedData.firstRequest)) / 1000 / 60);
        return res.status(429).json({
            error: "Too many failed login attempts. Please try again after 15 minutes.",
            retryAfter: `${timeLeft} minutes`,
            limit: maxFailedAttempts,
            windowMs: windowMs / 1000 / 60
        });
    }

    // Allow the request to proceed
    // The login controller will call resetFailedLoginAttempts() on success
    next();
};

// Helper function to reset failed login attempts on successful login
export const resetFailedLoginAttempts = (req) => {
    const clientIp = req.ip || req.connection.remoteAddress || req.socket.remoteAddress;
    const key = `failed-login-${clientIp}`;
    requestStore.delete(key); // Clear failed attempts on successful login
};

// Helper function to increment failed login attempts
export const incrementFailedLoginAttempts = (req) => {
    const clientIp = req.ip || req.connection.remoteAddress || req.socket.remoteAddress;
    const key = `failed-login-${clientIp}`;
    const now = Date.now();
    const windowMs = 15 * 60 * 1000;

    let failedData = requestStore.get(key);

    if (!failedData) {
        requestStore.set(key, {
            count: 1,
            firstRequest: now
        });
    } else {
        // Check if window has expired
        if (now - failedData.firstRequest > windowMs) {
            // Reset the window
            requestStore.set(key, {
                count: 1,
                firstRequest: now
            });
        } else {
            // Increment failed attempts
            failedData.count++;
            requestStore.set(key, failedData);
        }
    }
};

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

