const winston = require('winston');
const { format } = winston;

function consoleFormat(labelName = 'unknown') {
  return format.combine(
    format.json(),
    format.prettyPrint(),
    //format.colorize(),
    format.label({ label: labelName }),
  );
}

function regularFormat(labelName = 'unknown') {
  return format.combine(
    format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
    format.label({ label: labelName }),
    format.metadata({
      fillExcept: ['message', 'level', 'timestamp', 'label'],
    }),
  );
}
module.exports = {
  consoleFormat,
  regularFormat,
};
