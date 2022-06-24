const winston = require('winston');
require('winston-daily-rotate-file');
const { ENVIRONMENT } = require('../../config');

const { regularFormat } = require('./format');
const { getLoggingServices } = require('./transport');

/** Logger Fucntion To log error */

// Transport logs details
let infoTransportConfig = getLoggingServices();
let levels = {
  severe: 0,
  error: 1,
  warn: 2,
  info: 3,
  http: 4,
  verbose: 5,
  debug: 6,
};

const logger = {
  logApp: winston.createLogger({
    levels,
    format: regularFormat('App'),
    transports: [...infoTransportConfig],
  }),

  logUser: winston.createLogger({
    levels,
    format: regularFormat('Error'),
    transports: infoTransportConfig,
  }),

  logAuthorisation: winston.createLogger({
    levels,
    format: regularFormat('Authorisation'),
    transports: [...infoTransportConfig],
  }),

  logHttp: winston.createLogger({
    levels,
    format: regularFormat('Http'),
    transports: [...infoTransportConfig],
  }),

  logRide: winston.createLogger({
    levels,
    format: regularFormat('Ride'),
    transports: [...infoTransportConfig],
  }),

  logBlockchain: winston.createLogger({
    levels,
    format: regularFormat('Blockchain'),
    transports: [...infoTransportConfig],
  }),

  logDatabase: winston.createLogger({
    levels,
    format: regularFormat('Database'),
    transports: [...infoTransportConfig],
  }),

  logValidation: winston.createLogger({
    levels,
    format: regularFormat('Validation'),
    transports: [...infoTransportConfig],
  }),
  logNotification: winston.createLogger({
    levels,
    format: regularFormat('Notification'),
    transports: [...infoTransportConfig],
  }),

  // LogStream: winston.createLogger({
  //   Transports: [
  //     New winston.transports.File({
  //       Level: 'info',
  //       Filename: './logs/all-logs.log',
  //       HandleExceptions: true,
  //       Json: true,
  //       Maxsize: 5242880, //5MB
  //       MaxFiles: 5,
  //       Colorize: false,
  //     }),
  //     New winston.transports.Console({
  //       Level: 'debug',
  //       HandleExceptions: true,
  //       Json: false,
  //       Colorize: true,
  //     }),
  //   ],
  //   ExitOnError: false,
  // }),
};

module.exports = logger;
module.exports.stream = {
  write(message, encoding) {
    logger.logStream.info(message);
  },
};
