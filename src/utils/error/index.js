class AppError extends Error {
  /**
   * @param {String} name
   * @param {String} message - Message that will be returned to the user
   * @param {Number} statusCode - HTTP status code
   * @param {Object} meta - Object related to error
   * @param {Boolean} isOperational
   */
  constructor(
    name = 'App',
    message,
    statusCode,
    isOperational = false,
    code = 'E',
  ) {
    super(message);
    this.statusCode = statusCode;
    this.name = name;
    this.stack = Error.stack;
    this.isOperational = isOperational;
    this.code = code;

    Error.captureStackTrace(this, this.constructor);
  }
}

class BlockchainError extends AppError {
  constructor(message, statusCode, code) {
    super('Blockchain', message, statusCode, true, code);
  }
}

class UserError extends AppError {
  constructor(message, statusCode, code) {
    super('User', message, statusCode, true, code);
  }
}
class RedisError extends AppError {
  constructor(message, statusCode, code) {
    super('Redis', message, statusCode, true, code);
  }
}

function isOperationalError(error) {
  if (error instanceof AppError) {
    return error.isOperational;
  }
  return false;
}

// If the Promise is rejected this will catch it
// process.on('unhandledRejection', (error) => {
//   logger.logApp.severe('Unhandled Rejection', {
//     error,
//     tags: ['unhandled-rejection'],
//   });

//   // Restart Gracefully
//   // eslint-disable-next-line no-process-exit
//   process.exit(1);
// });

// process.on('uncaughtException', (error) => {
//   logger.logApp.severe(error.name, {
//     error,
//     tags: ['uncaught-exception'],
//   });

//   // Restart Gracefully
//   if (!isOperationalError(error)) {
//     // eslint-disable-next-line no-process-exit
//     process.exit(1);
//   }
// });

module.exports = {
  AppError,
  BlockchainError,
  UserError,
  RedisError,
  isOperationalError,
};
