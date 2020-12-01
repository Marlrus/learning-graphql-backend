const { getCourse, getCourses, getStudent, getStudents } = require('./queries');
const {
  createCourse,
  editCourse,
  createStudent,
  editStudent,
} = require('./mutations');

const Query = {
  getCourse,
  getCourses,
  getStudent,
  getStudents,
};

const Mutation = {
  createCourse,
  editCourse,
  createStudent,
  editStudent,
};

const Resolver = {
  Query,
  Mutation,
};

module.exports = Resolver;
