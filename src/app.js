const express = require('express');
require('dotenv').config();
const morgan = require('morgan');
const cors = require('cors');
const { initializeWeb3 } = require('./utils/blockchain');
const app = express();
const mongoose = require('mongoose');
const { MONGODB_URL } = require('./config');
const globalErrorHandler = require('./middleware/error');

require('./model/index');

// Parse requests of content-type - application/json
app.use(express.json());

// Parse requests of content-type - application/x-www-form-urlencoded
app.use(express.urlencoded({ extended: true }));

app.use(cors());

var index = require('./routes/index');
const { saveHash } = require('./services/notarization');
app.use(index);

app.use(globalErrorHandler);

app.listen(3000, async () => {
  console.log('server running on port 3000');
  await initializeWeb3();
  // await saveHash(
  //   '622092ccf71b7423142c3ecc',
  //   '622092ccf71b7423142c3ecc',
  //   'sample',
  // );
  // await verifyHash({ hi: 'hu' });
});
