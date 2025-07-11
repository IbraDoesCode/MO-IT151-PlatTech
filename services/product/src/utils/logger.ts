import winston from "winston";

const logger = winston.createLogger({
  level: "http",
  format: winston.format.combine(
    winston.format.colorize(),
    winston.format.timestamp(),
    winston.format.printf(({ level, message, timestamp }) => {
      return `[${timestamp}] ${level}: ${message}`;
    })
  ),
  transports: [new winston.transports.Console()],
  defaultMeta: { service: "product-service" },
});

export default logger;
