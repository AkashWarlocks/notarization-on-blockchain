const axios = require('axios');

/**
 * Using third party axios library to hit API provided by different vendors
 *
 * @param {String} baseUrl : main url of the vendor
 * @param {String} url : path which will be appended to url
 * @param {String} method : HTTP request methos like 'POST', 'GET', 'PUT', 'PATCH'
 * @param {Object} headers : Header object of the API
 * @param {Object} data : Body of api
 * @param {Object} parmas : Query parameters
 * @param {String} responseType : Response type like json, arrayBuffer, stream
 */

module.exports = async (
  baseUrl,
  url,
  method = 'get',
  headers = {},
  data = {},
  params = {},
  responseType = 'json',
) => {
  try {
    const config = {
      baseURL: baseUrl,
      url,
      method,
      headers,
      data,
      params,
      responseType,
    };
    const response = await axios(config);
    return response;
  } catch (error) {
    throw new error();
  }
};
