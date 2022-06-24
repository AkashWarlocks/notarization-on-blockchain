const { CONTRACT_ERRORS } = require('../utils/constants');
const Response = require('../utils/response');

module.exports = (err, req, res, next) => {
  // Segregate logs depending on the type of error
  let errorObject = CONTRACT_ERRORS[err.code];
  res
    .status(err.statusCode || 400)
    .send(Response.Error(errorObject.message, errorObject.uploadSuccess));
};
