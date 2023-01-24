const redis = require('redis');
const redisURL = require('../../config').REDIS_URL;
let redisClient;
const { RedisError } = require('../error/index');

// redisClient.on('connect', function () {
//   console.log('Redis Connected!');
// });
(async () => {
  redisClient = redis.createClient(redisURL);

  redisClient.on('error', (error) => console.error(`Error : ${error}`));

  await redisClient.connect(redisURL);
  redisClient.on('connect', () => console.log('Redis connected'));
  const _ = require('util');
  //   redisClient.set = _.promisify(redisClient.set);
  //   redisClient.get = _.promisify(redisClient.get);
  //   redisClient.expire = _.promisify(redisClient.expire);
  //   redisClient.del = _.promisify(redisClient.del);
})();

// Promisify functions

/**
 * To Set data in redis
 *
 * @param {String} key - Key of object.
 * @param {String} value - Value to assign to key.
 * @param {Integer} time - Expire time in seconds.
 */
const set = async (key, value, time) => {
  try {
    // redisClient.connect();
    await redisClient.set(key, value, 'EX', time);
  } catch (error) {
    throw new RedisError('Cannot set Data', 400, { error });
  }
};

/**
 * Function to get data stored in redis.
 *
 * @param {string} key
 */
const get = async (key) => {
  try {
    // await redisClient.connect();

    const data = await redisClient.get(key);

    return data;
  } catch (error) {
    console.log(error);
    throw new RedisError('Cannot get Object', 400, { error });
  }
};

const deleteKey = async (key) => {
  try {
    await redisClient.del(key);
  } catch (error) {
    throw new RedisError('Cannot delete key', 400, { error });
  }
};

module.exports = {
  redisClient,
  deleteKey,
  set,
  get,
};
