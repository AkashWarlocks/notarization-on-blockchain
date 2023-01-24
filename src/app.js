const express = require('express');
require('dotenv').config();
const cors = require('cors');
const { connectBlockchains, getWeb3Instance } = require('./utils/blockchain');
const app = express();
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

  await connectBlockchains();
  //const web3 = await getWeb3Instance('binance');
  //console.log(web3);
  //
  // await saveHash(
  //   '622092ccf71b7423142c3ecc',
  //   '622092ccf71b7423142c3ecc',
  //   'sample',
  // );
  // await verifyHash({ hi: 'hu' });
});
