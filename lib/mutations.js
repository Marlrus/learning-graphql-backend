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

const deleteCourse = async (_, { _id }) => {
  try {
    const db = await connectDB();
    await db.collection('courses').deleteOne({ _id: ObjectID(_id) });
    return { message: 'Course successfully deleted.' };
  } catch (err) {
    console.log(`Err on deleteCourse: ${err.message}`);
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

const deleteStudent = async (_, { _id }) => {
  try {
    const db = await connectDB();
    await db.collection('students').deleteOne({ _id: ObjectID(_id) });
    return { message: 'Student successfully deleted.' };
  } catch (err) {
    console.log(`Err on deleteStudent: ${err.message}`);
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
    console.log(`Err on addPerson`);
  }
};

const mutations = {
  createCourse,
  editCourse,
  deleteCourse,
  createStudent,
  editStudent,
  deleteStudent,
  addPerson,
};

module.exports = mutations;
