class Responses {
  static Normal(payload, message = 'OK') {
    return {
      message,
      uploadSuccess: true,
      payload,
      time: Number(new Date()),
    };
  }

  static Error(message, payload = {}) {
    return {
      message,
      uploadSuccess: payload,
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
