import "dotenv/config";
import app from "./app.js";
import logger from "./utils/logger.js";
import prisma from "./config/db.js";

const PORT = process.env.PORT || 5000;

const start = async () => {
  try {
    await prisma.$connect();
    logger.info("PostgreSQL connected via Prisma");

    app.listen(PORT, () => {
      logger.info(`Server running on port ${PORT}`);
      logger.info(`Swagger docs at http://localhost:${PORT}/api-docs`);
    });
  } catch (err) {
    logger.error("Failed to start server", err);
    process.exit(1);
  }
};

start();