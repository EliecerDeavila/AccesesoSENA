const cors = require('cors');

const ACCEPTED_ORIGINS = [
  "http://localhost:3000",
  "http://localhost:5173",
  "http://localhost:8080",
];

const corsMiddleware = (acceptedOrigins = ACCEPTED_ORIGINS) =>
  cors({
    origin: (origin, callback) => {
      if (acceptedOrigins.includes(origin) || !origin) {
        callback(null, true);
      } else {
        callback(new Error("Not allowed by CORS"));
      }
    },
  });

module.exports = corsMiddleware;