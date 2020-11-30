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

module.exports = {
  getCourse,
  getCourses,
};
