const connectDB = require('./db');
const { ObjectID } = require('mongodb');

module.exports = {
  Query: {
    getCourses: async () => {
      try {
        const db = await connectDB();
        const courses = await db.collection('courses').find().toArray();
        return courses;
      } catch (err) {
        console.log(`Error in getCourses ${err}`);
      }
    },
    getCourse: async (root, { id }) => {
      try {
        const db = await connectDB();
        const course = db.collection('courses').findOne({ _id: ObjectID(id) });
        return course;
      } catch (err) {
        console.log(`Error in getCourse ${err}`);
      }
    },
  },
};
