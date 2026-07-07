import winston from "winston";

winston.addColors({
  error: "red",
  warn: "yellow",
  info: "blue",
  http: "magenta",
  debug: "green",
});

const cleanIncomingAnsi = winston.format.uncolorize();

const baseFormat = [
  winston.format.timestamp({ format: "YYYY-MM-DD HH:mm:ss" }),
  winston.format.printf(({ level, message, timestamp }) => {
    return `${timestamp} - [${level}] ${message}`;
  }),
];

const logger = winston.createLogger({
  level: "debug",
  format: winston.format.combine(cleanIncomingAnsi, ...baseFormat),
  transports: [
    new winston.transports.Console({
      format: winston.format.combine(
        cleanIncomingAnsi,
        winston.format.colorize({ all: true }),
        ...baseFormat,
      ),
    }),
    new winston.transports.File({
      filename: "app.log",
      level: "debug",
    }),
  ],
});

export default logger;
