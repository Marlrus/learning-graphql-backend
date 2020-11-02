const courses = [
  {
    _id: 'SMO1',
    title: 'Spleen eater',
    teacher: 'SM Oerse',
    description: 'How to Walrus',
    topic: 'Walrus 101',
  },
  {
    _id: 'SMO2',
    title: 'Spleen Cooker',
    teacher: 'SM Oerse',
    description: 'How to Walrus',
    topic: 'Walrus 101',
  },
  {
    _id: 'SMO3',
    title: 'Spleen mender',
    teacher: 'SM Oerse',
    description: 'How to Walrus',
    topic: 'Walrus 101',
  },
];

module.exports = {
  Query: {
    getCourses: () => courses,
    getCourse: (root, args) =>
      courses.filter(course => course._id === args._id)[0],
  },
};
