'use strict';

const connectDB = require('./db');

const createCourse = async (_, { input }) => {
  try {
    const db = await connectDB();
    const defaults = { teacher: '', topic: '' };
    const newCourse = { ...defaults, ...input };
    const course = await db.collection('courses').insertOne(newCourse);
    const createdCourse = { ...newCourse, _id: course.insertedId };
    return createdCourse;
  } catch (err) {
    console.log(`Err on createCourse: ${err.message}`);
  }
};

module.exports = {
  createCourse,
};
