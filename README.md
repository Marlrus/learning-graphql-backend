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

## Queries y Resolvers

Un query es lo que me permite enviarle algo al API para obtener una respuesta con datos. El query refleja la forma en la que queremos recibir los datos, y tiene una estructura uniforme de respuesta:

```json
{
  "data": {
    "hero": {
      "name": "R2-D2"
    }
  }
}
```

Siempre vamos a reciber un objeto con la propiedad _data_ y adentro de el, lo que pedimos del query.

### Resolvers

Los resolvers son lo que van a decirle a nuestro query que es lo que tiene que retornar. Para hacer esto, creamos una constante resolvers en la que vamos a usar una funcion para determinar que se devuelve para los valores de nuestro query:

```javascript
const resolvers = {
  hello: () => 'Hello World',
  saludo: () => 'Poop',
};
```

Aca le estamos diciendo a graphql que resuelva un query a hello o a saludo con los strings que queremos (_vale la pena notar que estos deben ser compatibles con los tipos determinados en nuestro schema_). Para que estos valores sean tomados, debemos pasarlos como es tercer parametro en nuetra funcion de graphql:

```javascript
graphql(
  schema,
  `
    {
      hello
      saludo
    }
  `,
  resolvers
).then(data => console.log(data));
```

Esto hace que graphql retorte los valores que estamos determinando en nuestros resolvers: `{ hello: 'Hello World', saludo: 'Poop' }`

## Sirviendo el API en la web

Para crear nuestro api vamos a utilizar express y el paquete **express-graphql** y comenzamos nuetro servidor nuevo:

```javascript
const express = require('express');
const { graphqlHTTP } = require('express-graphql');

const app = express();

// middleware graphql
app.use(
  '/__graphql',
  graphqlHTTP({
    schema,
    rootValue: resolvers,
    graphiql: true,
  })
);

// serving
const port = process.env.port || 3000;

app.listen(port, () =>
  console.log(`Server live at http://localhost:${port}/__graphql`)
);
```

En esta parte lo que hacemos es comenzar nuestra app de express y activar el middleware.

### Middleware

El primer argumento que recibe nuestro middleware es un endpoint para el API, y el segundo es un objeto de configuracion. Para este objeto tenemos que usar la funcion **graphqlHTTP** de nuestra importacion a la cual le vamos a pasar 3 opciones: El **scuema** que vamos a usar,los **resolvers** , y si vvamos a usar el playground para los queries en la forma de **graphiql**. **Note**: en esta parte cambie el url para usar el estandar de el api que es usar \_\_graphql. Esto nos da acceso a el playground en el url que especificamos.

### GraphiQL

El playground lo queremos habilitado para desarrollo. Este toma nuestra configuracion y nos permite hacer queries y verlas en tiempo real. Tambien en docs, podemos acceder a la **autodocumentacion** que se crea por nuestro servidor. Teniendo esta configuracion, los cambios que hagamos en nuestra api, se van a ver reflejados automaticamente en el playground.

## Custom Types

Antes de seguir, el instructor usa un linter llamado **standard** que instalamos como dev dep y creamos los scripts para ejecutarla:

```json
"lint": "standard",
"lint:fix": "standard --fix"
```

El problema con este linter es que es opinionado y no le gustan los punto y comas que yo estoy agregando usando prettier.

### archivos \*.graphql

Creamos **lib/schema.graphql** a donde vamos a mover nuestro schema y vamos a tener syntax highlighting de nuestro codigo de graphql. Me toco de igual forma instalar una extension de VSCode para tener el estilo.

Para poder usar ese schema tenemos que leer el archivo y usarlo en **buildSchema** lo que logramos usando **readFileSync** de fs. (En esta parte no use join porque se puede concatenar usando \`\` y sobra importar el paquete):

```javascript
const { readFileSync } = require('fs');

const schema = buildSchema(
  readFileSync(`${__dirname}/lib/schema.graphql`, 'utf-8')
);
```

Esto lee el schema que metimos en el otro archivo y lo aplica en nuestra funcion.

Para mover la logica a otra parte, vamos a crear el archivo **resolvers.js** en lib/ donde vamos a exportar nuestros resolvers e importarlos en nuestro index de express:

```javascript
// resolvers.js
module.exports = {
  hello: () => 'Hello World',
};

// index.js
const resolvers = require('./lib/resolvers');
```

Esto ahora va a reemplazar lo que tenemos en nuestro servidor si borramos el codigo de resolvers que teniamos antes.

### Tipos personalizados

En nuestro schema, creamos un tipo nuevo **Courses** que va a contener una estructura. Luego vamos a crear es query para retornar los cursos que vamos a crear:

```graphql
type Course {
  _id: ID
  title: String
  teacher: String
  description: String
  topic: String
}

type Query {
  "Returns all Courses"
  getCourses: [Course]
}
```

Al tener esto, tenemos que adaptar nuestros resolvers para manejar estos datos nuevos:

```javascript
const courses = [
  {
    _id: 'Poop Commander',
    title: 'Spleen eater',
    teacher: 'SM Oerse',
    description: 'How to Walrus',
    topic: 'Walrus 101',
  },
];

module.exports = {
  getCourses: () => courses,
};
```

Aca vamos a pasar los datos que creamos que siguen la estructura que pusimos en el schema, y los vamos a retornar con el nuevo query que creamos. Al salvar, nuestro api esta actualizado con la documentacion adecuada.
