'use strict';

require('dotenv').config();
const { makeExecutableSchema } = require(`graphql-tools`);
const express = require('express');
const cors = require('cors');
const { graphqlHTTP } = require('express-graphql');
const { readFileSync } = require('fs');
const resolvers = require('./lib/resolvers');

const app = express();

// define schema
const typeDefs = readFileSync(`${__dirname}/lib/schema.graphql`, 'utf-8');

const schema = makeExecutableSchema({ typeDefs, resolvers });

const devEnv = process.env.NODE_ENV !== 'production';

app.use(cors());

// middleware graphql
app.use(
  '/graphql',
  graphqlHTTP({
    schema,
    rootValue: resolvers,
    graphiql: devEnv,
  })
);

const port = process.env.port || 3000;

app.listen(port, () =>
  console.log(`Server live at http://localhost:${port}/graphql`)
);
