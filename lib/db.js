'use strict';

const { MongoClient } = require('mongodb');

let connection;

const connectDB = async () => {
  if (connection) return connection;

  try {
    const client = await MongoClient.connect(process.env.MONGODB_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    connection = client.db(process.env.DB_NAME);
    return connection;
  } catch (err) {
    console.log(`Could not connect to db: ${err}`);
    process.exit(1);
  }
};

module.exports = connectDB;
