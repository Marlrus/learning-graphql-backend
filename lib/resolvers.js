const { getCourse, getCourses, getStudent, getStudents } = require('./queries');
const {
  createCourse,
  editCourse,
  deleteCourse,
  createStudent,
  editStudent,
  deleteStudent,
  addPerson,
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
  deleteCourse,
  createStudent,
  editStudent,
  deleteStudent,
  addPerson,
};

const Resolver = {
  Query,
  Mutation,
};

module.exports = Resolver;
