require("dotenv").config();
const http = require("http");
const app = require("./app");
const { initSocket } = require("./services/socketService");
const { startWorkers } = require("./services/workerService");
const logger = require("./utils/logger");

const PORT = process.env.PORT || 4000;
const server = http.createServer(app);

initSocket(server);
startWorkers();

server.listen(PORT, () => {
  logger.info(
    `Atech LMS backend running on port ${PORT} [${process.env.NODE_ENV}]`,
  );
});

process.on("unhandledRejection", (err) => {
  logger.error("Unhandled rejection:", err);
  process.exit(1);
});
