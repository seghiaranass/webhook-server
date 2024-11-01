const winston = require('winston');
const path = require('path');

// Define log format
const logFormat = winston.format.combine(
  winston.format.colorize(),
  winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
  winston.format.printf(({ timestamp, level, message, stack }) => {
    return `${timestamp} ${level}: ${stack || message}`;
  })
);

// Create logger instance
const logger = winston.createLogger({
  level: 'info', // Default log level
  format: logFormat,
  transports: [
    // Console output for all environments
    new winston.transports.Console({
      format: winston.format.combine(
        winston.format.colorize(),
        winston.format.simple()
      ),
    }),

    // File output for production
    new winston.transports.File({
      filename: path.join(__dirname, './logs/error.log'),
      level: 'error',
      format: winston.format.combine(
        winston.format.uncolorize(), // Removes color codes from log files
        winston.format.simple()
      ),
    }),
    new winston.transports.File({
      filename: path.join(__dirname, './logs/combined.log'),
      format: winston.format.combine(
        winston.format.uncolorize(),
        winston.format.simple()
      ),
    }),
  ],
  exceptionHandlers: [
    new winston.transports.File({ filename: path.join(__dirname, './logs/exceptions.log') })
  ]
});

// Only log to files in production
if (process.env.NODE_ENV === 'production') {
  logger.add(new winston.transports.File({ filename: 'logs/combined.log' }));
}

module.exports = logger;
