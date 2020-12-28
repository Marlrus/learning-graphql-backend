'use strict';

const connectDB = require('./db');
const { ObjectID } = require('mongodb');
const errorHandler = require('./errorHandler');

const peopleResolver = async ({ people }) => {
  try {
    if (!people || people.length === 0) return [];
    const db = await connectDB();
    const ids = people.map(id => ObjectID(id));
    const peopleData = await db
      .collection('students')
      .find({ _id: { $in: ids } })
      .toArray();
    return peopleData;
  } catch (err) {
    errorHandler(err, 'peopleResolver');
  }
};

const personResolver = (person, context, info) =>
  person.phone ? 'Monitor' : 'Student';

const globalSearchResolver = (item, context, info) => {
  if (item.title) return 'Course';
  if (item.phone) return 'Monitor';
  return 'Student';
};

const CourseTypes = {
  people: peopleResolver,
};

const PersonTypes = {
  __resolveType: personResolver,
};

const GlobalSearchTypes = {
  __resolveType: globalSearchResolver,
};

const types = {
  Course: CourseTypes,
  Person: PersonTypes,
  GlobalSearch: GlobalSearchTypes,
};

module.exports = types;
