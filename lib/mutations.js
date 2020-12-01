'use strict';

const connectDB = require('./db');
const { ObjectID } = require('mongodb');

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

const editCourse = async (_, { _id, input }) => {
  try {
    const db = await connectDB();
    await db
      .collection('courses')
      .updateOne({ _id: ObjectID(_id) }, { $set: input });
    const course = await db
      .collection('courses')
      .findOne({ _id: ObjectID(_id) });
    return course;
  } catch (err) {
    console.log(`Err on editCourse: ${err.message}`);
  }
};

const createStudent = async (_, { input }) => {
  try {
    const db = await connectDB();
    const student = await db.collection('students').insertOne(input);
    const createdStudent = { ...input, _id: student.insertedId };
    return createdStudent;
  } catch (err) {
    console.log(`Err on createStudent: ${err.message}`);
  }
};

const editStudent = async (_, { _id, input }) => {
  try {
    const db = await connectDB();
    await db
      .collection('students')
      .updateOne({ _id: ObjectID(_id) }, { $set: input });
    const student = await db
      .collection('students')
      .findOne({ _id: ObjectID(_id) });
    return student;
  } catch (err) {
    console.log(`Err on editStudent: ${err.message}`);
  }
};

module.exports = {
  createCourse,
  editCourse,
  createStudent,
  editStudent,
};
