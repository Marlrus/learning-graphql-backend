'use strict';

const connectDB = require('./db');
const { ObjectID } = require('mongodb');

const peopleResolver = async ({ people }) => {
  try {
    if (!people || people.length === 0) return [];
    const db = await connectDB();
    const ids = people.map(id => ObjectID(id));
    const peopleData = await db
      .collection('students')
      .find({ _id: { $in: ids } })
      .toArray();
    return peopleData;
  } catch (err) {
    console.log(`Err in people types: ${err.message}`);
  }
};

const CourseTypes = {
  people: peopleResolver,
};

const types = {
  Course: CourseTypes,
};

module.exports = types;
