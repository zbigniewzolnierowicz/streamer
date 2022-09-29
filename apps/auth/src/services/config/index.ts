import dotenv from "dotenv";

dotenv.config();

const config = {
  database: {
    host: process.env.POSTGRES_HOST || "localhost",
    port: parseInt(process.env.POSTGRES_PORT || "5432"),
    user: process.env.POSTGRES_USER || "user",
    password: process.env.POSTGRES_PASSWORD || "password",
    database: process.env.POSTGRES_DB || "streamer",
  },
  jwt: {
    secret: process.env.JWT_SECRET || "secret",
    expiresIn: "1h"
  }
};

export default config;