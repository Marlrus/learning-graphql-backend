const { getCourse, getCourses } = require('./queries');
const { createCourse } = require('./mutations');

const Query = {
  getCourse,
  getCourses,
};

const Mutation = {
  createCourse,
};

const Resolver = {
  Query,
  Mutation,
};

module.exports = Resolver;
