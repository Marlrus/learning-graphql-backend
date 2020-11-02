# GraphQL Platzi

Curso de GraphQL en Platzi dirigido por Adrian Estrada.

## Montaje Inicial

Para iniciar el proyecto, utilizamos un script que nos provee Adrian: `npx license mit > LICENSE && npx gitignore node && git init && npm init -y`. Con esto, generamos automaticamente la parte inicial de nuestro proyecto. La dependencia principal que vamos a manejar es `yarn add graphql` y luego creamos nuestro archivo en el root: index.js.

### Schema y nuestro primer query

Importamos dos funciones de graphql:

```javascript
'use strict';

const { graphql, buildSchema } = require(`graphql`);
```

La primera que vamos a utilizar es **buildSchema**:

```javascript
const schema = buildSchema(`
  type Query {
    hello: String
  }
`);
```

En esta funcion estamos creando un Query, que tiene un objeto por dentro que se llama **hello** que es del tipo String. Para ejecutar ese query, usamos la funcion **graphql**:

```javascript
graphql(
  schema,
  `
    {
      hello
    }
  `
).then(data => console.log(data));
```

Esta funcion toma como primer argumento un schema para validar que el query que estamos haciendo es valido o no, y luego toma lo que seria el query. Esto devuelve una promesa que despues logeamos y recibimos la respuesta: `{ hello: null }`.
