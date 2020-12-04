const queries = require('./queries');
const mutations = require('./mutations');
const types = require('./types');

const Resolver = {
  Query: queries,
  Mutation: mutations,
  ...types,
};

module.exports = Resolver;
