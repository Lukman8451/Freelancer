import jwt from 'jsonwebtoken';
import { env } from '../config/config.js';

const isAuthenticated = async (req, res, next) => {
    const authHeader = req.headers.authorization;

    if (!authHeader) {
        return res.status(401).json({ error: "Please Login" });
    }

    const [bearer, token] = authHeader.split(" ");

    if (!bearer || !token || bearer !== "Bearer") {
        return res.status(401).json({ error: "Unauthorized Access. Please Login" });
    }

    try {
        const user = jwt.verify(token, env.JWT_SECRET);

        if (!user) {
            return res.status(401).json({ error: "Invalid Credentials" });
        }

        req.user = user;
        next();
    } catch (error) {
        console.error("JWT verification error:", error.message);
        return res.status(401).json({ error: "Invalid or expired token" });
    }
}


export default isAuthenticated;