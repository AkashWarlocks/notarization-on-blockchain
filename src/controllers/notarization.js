const notarizationService = require('../services/notarization');
const Responses = require('../utils/response');

let controller = {};

controller.saveData = async (req, res, next) => {
  try {
    // Call saveHash service
    const data = await notarizationService.saveHash(
      req.body.userId,
      req.body.documentHash,
    );

    res.status(200).send(Responses.Normal(data));
  } catch (error) {
    console.log({ error });
    next(error);
  }
};

controller.verifyData = async (req, res, next) => {
  try {
    const data = await notarizationService.verifyHash(
      req.body.userId,
      req.body.documentHash,
    );

    res.status(200).send(Responses.Normal(data));
  } catch (error) {
    console.log({ error });
    next(error);
  }
};

controller.getData = async (req, res, next) => {
  try {
    const data = await notarizationService.getData(
      req.query.userId,
      req.query.signerId,
      req.query.timestamp,
    );
    res.status(200).send(Responses.Normal(data));
  } catch (error) {
    console.log({ error });
    res.status(400).send({ msg: 'something went wrong' });
  }
};

controller.createUser = async (req, res, next) => {
  try {
    const data = await notarizationService.createUser(
      req.body.email,
      req.body.name,
    );

    res.status(200).send({ data });
  } catch (error) {
    console.log({ error });
    res.status(400).send({ msg: 'something went wrong' });
  }
};

controller.getUserData = async (req, res, next) => {
  try {
    const data = await notarizationService.getUserData(req.query.email);

    res.status(200).send({ payload: data });
  } catch (error) {
    console.log({ error });
    res.status(400).send({ msg: 'something went wrong' });
  }
};

module.exports = controller;
