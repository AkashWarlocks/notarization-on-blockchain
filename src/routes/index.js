const express = require('express');
const { append } = require('express/lib/response');
const controller = require('../controllers/notarization');
const router = express.Router();

router.post('/save-document', controller.saveData);
router.post('/verify-document', controller.verifyData);
router.get('/user-hash', controller.getData);
router.post('/create-user', controller.createUser);
router.get('/user', controller.getUserData);

module.exports = router;
