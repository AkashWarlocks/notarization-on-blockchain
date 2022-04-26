class Responses {
  static Normal(payload, message = 'OK') {
    return {
      message,
      payload,
      time: Number(new Date()),
    };
  }

  static Error(message, payload = {}) {
    return {
      message,
      payload,
      time: Number(new Date()),
    };
  }

  static UnknownError(err) {
    return {
      message: 'Looks like there was an unknown error, error log in payload',
      payload: err,
      time: Number(new Date()),
    };
  }
}

module.exports = Responses;
