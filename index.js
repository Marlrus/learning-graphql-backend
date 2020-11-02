'use strict';

const { makeExecutableSchema } = require(`graphql-tools`);
const express = require('express');
const { graphqlHTTP } = require('express-graphql');
const { readFileSync } = require('fs');
const resolvers = require('./lib/resolvers');

const app = express();

// define schema
const typeDefs = readFileSync(`${__dirname}/lib/schema.graphql`, 'utf-8');

const schema = makeExecutableSchema({ typeDefs, resolvers });

// middleware graphql
app.use(
  '/__graphql',
  graphqlHTTP({
    schema,
    rootValue: resolvers,
    graphiql: true,
  })
);

const port = process.env.port || 3000;

app.listen(port, () =>
  console.log(`Server live at http://localhost:${port}/__graphql`)
);
