import app from "./app.js";
import config from "./config/config.js";
import prisma from "./config/prisma.js";

const port = config.port;

try {
  await prisma.$connect();

  app.listen(port, () => {
    console.log(`Server running on port ${port}`);
  });
} catch (error: unknown) {
  console.error("Server startup failed:", error);
  process.exit(1);
}