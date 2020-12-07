'use strict';

const connectDB = require('./db');
const { ObjectID } = require('mongodb');
const errorHandler = require('./errorHandler');

const createCourse = async (_, { input }) => {
  try {
    const db = await connectDB();
    const defaults = { teacher: '', topic: '' };
    const newCourse = { ...defaults, ...input };
    const course = await db.collection('courses').insertOne(newCourse);
    const createdCourse = { ...newCourse, _id: course.insertedId };
    return createdCourse;
  } catch (err) {
    errorHandler(err, 'createCourse');
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
    errorHandler(err, 'editCourse');
  }
};

const deleteCourse = async (_, { _id }) => {
  try {
    const db = await connectDB();
    await db.collection('courses').deleteOne({ _id: ObjectID(_id) });
    return { message: 'Course successfully deleted.' };
  } catch (err) {
    errorHandler(err, 'deleteCourse');
  }
};

const createPerson = async (_, { input }) => {
  try {
    const db = await connectDB();
    const student = await db.collection('students').insertOne(input);
    const createdStudent = { ...input, _id: student.insertedId };
    return createdStudent;
  } catch (err) {
    errorHandler(err, 'createPerson');
  }
};

const editPerson = async (_, { _id, input }) => {
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
    errorHandler(err, 'editPerson');
  }
};

const deletePerson = async (_, { _id }) => {
  try {
    const db = await connectDB();
    await db.collection('students').deleteOne({ _id: ObjectID(_id) });
    return { message: 'Student successfully deleted.' };
  } catch (err) {
    errorHandler(err, 'deletePerson');
  }
};

const addPerson = async (_, { courseID, personID }) => {
  try {
    const db = await connectDB();
    const findCourse = db
      .collection('courses')
      .findOne({ _id: ObjectID(courseID) });
    const findStudent = db
      .collection('students')
      .findOne({ _id: ObjectID(personID) });
    const [course, student] = await Promise.all([findCourse, findStudent]);
    if (!course || !student) throw new Error('No course or student found.');
    await db
      .collection('courses')
      .updateOne(
        { _id: ObjectID(courseID) },
        { $addToSet: { people: ObjectID(personID) } }
      );
    return course;
  } catch (err) {
    errorHandler(err, 'addPerson');
  }
};

const mutations = {
  createCourse,
  editCourse,
  deleteCourse,
  createPerson,
  editPerson,
  deletePerson,
  addPerson,
};

module.exports = mutations;
