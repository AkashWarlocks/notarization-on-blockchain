const notarizationService = require('../services/notarization');

let controller = {};

controller.saveData = async (req, res, next) => {
  try {
    // Call saveHash service
    const data = await notarizationService.saveHash(
      req.body.senderId,
      req.body.userId,
      req.body.documentHash,
    );

    res.status(200).send({ payload: data });
  } catch (error) {
    console.log({ error });
    res.status(400).send({ msg: 'something went wrong' });
  }
};

controller.verifyData = async (req, res, next) => {
  try {
    const data = await notarizationService.verifyHash(
      req.body.senderId,
      req.body.userId,
      req.body.documentHash,
    );

    res.status(200).send({ payload: { data } });
  } catch (error) {
    console.log({ error });
    res.status(400).send({ msg: 'something went wrong' });
  }
};

controller.getData = async (req, res, next) => {
  try {
    console.log(req.query);
    const data = await notarizationService.getData(
      req.query.userId,
      req.query.signerId,
      req.query.timestamp,
    );
    res.status(200).send({ payload: { data } });
  } catch (error) {
    console.log({ error });
    res.status(400).send({ msg: 'something went wrong' });
  }
};

controller.createUser = async (req, res, next) => {
  try {
  } catch (error) {
    res.status(400).send({ msg: 'something went wrong' });
  }
};

module.exports = controller;
