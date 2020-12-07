const connectDB = require('./db');
const { ObjectID } = require('mongodb');
const errorHandler = require('./errorHandler');

const getCourse = async (root, args) => {
  try {
    const db = await connectDB();
    const course = db.collection('courses').findOne({ _id: ObjectID(args.id) });
    return course;
  } catch (err) {
    errorHandler(err, 'getCourse');
  }
};

const getCourses = async () => {
  try {
    const db = await connectDB();
    const courses = await db.collection('courses').find().toArray();
    return courses;
  } catch (err) {
    errorHandler(err, 'getCourses');
  }
};

const getPerson = async (root, args) => {
  try {
    const db = await connectDB();
    const student = db
      .collection('students')
      .findOne({ _id: ObjectID(args.id) });
    return student;
  } catch (err) {
    errorHandler(err, 'getPerson');
  }
};

const getPeople = async () => {
  try {
    const db = await connectDB();
    const students = await db.collection('students').find().toArray();
    return students;
  } catch (err) {
    errorHandler(err, 'getPeople');
  }
};

const queries = {
  getCourse,
  getCourses,
  getPerson,
  getPeople,
};

module.exports = queries;
