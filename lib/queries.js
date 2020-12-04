const connectDB = require('./db');
const { ObjectID } = require('mongodb');

const getCourse = async (root, args) => {
  try {
    const db = await connectDB();
    const course = db.collection('courses').findOne({ _id: ObjectID(args.id) });
    return course;
  } catch (err) {
    console.log(`Error in getCourse ${err}`);
  }
};

const getCourses = async () => {
  try {
    const db = await connectDB();
    const courses = await db.collection('courses').find().toArray();
    return courses;
  } catch (err) {
    console.log(`Error in getCourses ${err}`);
  }
};

const getStudent = async (root, args) => {
  try {
    const db = await connectDB();
    const student = db
      .collection('students')
      .findOne({ _id: ObjectID(args.id) });
    return student;
  } catch (err) {
    console.log(`Error in getStudent ${err}`);
  }
};

const getStudents = async () => {
  try {
    const db = await connectDB();
    const students = await db.collection('students').find().toArray();
    return students;
  } catch (err) {
    console.log(`Error in getStudents ${err}`);
  }
};

const queries = {
  getCourse,
  getCourses,
  getStudent,
  getStudents,
};

module.exports = queries;
