var WinstonCloudWatch = require('winston-cloudwatch');
const { consoleFormat, regularFormat } = require('./format');
const winston = require('winston');
const { transports } = winston;

const { AWS_CLOUDWATCH_CONFIG, LOGGING_SERVICE } = require('../../config');

// To Log Data in AWS Cloudwatch

function cloudWatchTransport(levelName = 'severe') {
  return new WinstonCloudWatch({
    logGroupName: AWS_CLOUDWATCH_CONFIG.LOG_GROUP_NAME,
    logStreamName: AWS_CLOUDWATCH_CONFIG.LOG_GROUP_STREAM,
    awsAccessKeyId: AWS_CLOUDWATCH_CONFIG.ACCESS_KEY,
    awsSecretKey: AWS_CLOUDWATCH_CONFIG.SECRET_KEY,
    awsRegion: AWS_CLOUDWATCH_CONFIG.REGION,
    jsonMessage: true,
    level: levelName,
  });
}

// To Log Data in Console
function consoleTransport(levelName = 'debug') {
  return new transports.Console({
    level: levelName,
    format: consoleFormat(),
  });
}

// To Log Data in Sentry
// function sentryTransport(levelName) {
//   const options = {
//     sentry: {
//       dsn: SENTRY_DSN,
//     },
//     level: levelName,
//     handleExceptions: true,
//   };
//   return new Sentry(options);
// }

// // To Log Data in loggly
// function logglyTransport() {
//   const logglyTransport = new Loggly({
//     token: LOGGLY_KEY,
//     subdomain: 'SUBDOMAIN',
//     tags: ['Winston-NodeJS'],
//     json: true,
//     level: 'debug',
//   });

//   return logglyTransport;
// }

/** To Log Data in Files */
function fileTransport() {
  const fileTransport = new winston.transports.File({
    filename: './logs/backend-logs.log',
    level: 'debug',
    json: true,
    format: winston.format.json(),
  });
  return fileTransport;
}

// To Log Data in Elastic
// function elasticTransport(levelName = 'debug') {
//   const elasticTransport = new ElasticsearchTransport({
//     level: levelName,
//     clientOpts: {
//       node: ELASTIC_NODE,
//       log: levelName,
//     },
//     index: ELASTIC_INDEX,
//     useTransformer: true,
//     // To transform the Data format according to INDEX
//     transformer: (logData) => {
//       return {
//         '@timestamp': new Date().getTime(),
//         level: logData.level,
//         message: logData.message,
//         meta: logData.meta,
//       };
//     },
//   });
//   return elasticTransport;
// }

/** To get Logging Serivces to be used */
function getLoggingServices() {
  try {
    const loggingServices = LOGGING_SERVICE.split(',');
    let services = [];

    loggingServices.map(async (l) => {
      switch (l) {
        case 'cloudwatch':
          services.push(cloudWatchTransport('debug'));
          break;

        // case 'sentry':
        //   services.push(sentryTransport('error'));
        //   break;

        // case 'loggly':
        //   services.push(logglyTransport());
        //   break;

        case 'console':
          services.push(consoleTransport());
          break;

        case 'file':
          services.push(fileTransport());
          break;

        // case 'elastic':
        //   services.push(elasticTransport('debug'));
        //   break;

        default:
          break;
      }
    });

    return services;
  } catch (error) {
    throw error;
  }
}

module.exports = {
  cloudWatchTransport,
  consoleTransport,
  // sentryTransport,
  // logglyTransport,
  getLoggingServices,
  fileTransport,
  // elasticTransport,
};
