const mongoose = require('mongoose');
const { MONGODB_URL } = require('../config');
// console.log('in mongodb ', MONGODB_URL);
mongoose
  .connect(MONGODB_URL, {
    useNewUrlParser: true,
    //useCreateIndex: true,
    //useFindAndModify: false,
    useUnifiedTopology: true,
  })
  .then((body) => {
    console.log('connected');
  })
  .catch((e) => {});
