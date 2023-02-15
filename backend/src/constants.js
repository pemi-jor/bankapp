export const PORT = process.env.PORT || 5000;
export const DB_URL = process.env.DB_URL || "mongodb://localhost:27017/solobank";
export const SALT_ROUNDS = 13;
export const secretOrKey = process.env.SECRET_KEY || "SECRET_KEY";
export const AT_EXPIRATION_TIME = "15min"; // 15 minutes;
export const REFRESH_SECRET = process.env.REFRESH_SECRET || "REFRESH_SECRET";
export const RT_EXPIRATION_TIME = "1h"; // 60 minutes;
