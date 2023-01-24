const notarizationService = require('../services/notarization');
const userService = require('../services/user');
const Responses = require('../utils/response');

let controller = {};

controller.saveData = async (req, res, next) => {
  try {
    // Call saveHash service
    const data = await notarizationService.saveHash(
      req.body.userId,
      req.body.documentHash,
      req.body.documentName,
      req.body.provider,
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
      req.body.provider,
    );

    res.status(200).send(Responses.Normal(data));
  } catch (error) {
    console.log({ error });
    next(error);
  }
};

controller.getData = async (req, res, next) => {
  try {
    const data = await notarizationService.getData(req.query.userId);
    //const data = await userService.getAllData();
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

controller.getCommonData = async (req, res, next) => {
  try {
    const data = await userService.getAllData();
    res.status(200).send(Responses.Normal(data));
  } catch (error) {
    res.status(400).send({ msg: 'something went wrong' });
  }
};

module.exports = controller;
