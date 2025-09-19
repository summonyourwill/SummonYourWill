const { loadMongoFlag } = require('../config/mongoFlag.cjs');

async function mongoEnabled() {
  return await loadMongoFlag();
}

async function assertMongoEnabled() {
  if (!(await mongoEnabled())) {
    throw new Error('MongoDB connection disabled by mongodbconnection.json');
  }
}

module.exports = { mongoEnabled, assertMongoEnabled };


