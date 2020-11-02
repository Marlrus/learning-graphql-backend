'use strict';

const { buildSchema } = require(`graphql`);
const express = require('express');
const { graphqlHTTP } = require('express-graphql');
const { readFileSync } = require('fs');
const resolvers = require('./lib/resolvers');

const app = express();

// define schema
const schema = buildSchema(
  readFileSync(`${__dirname}/lib/schema.graphql`, 'utf-8')
);

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
