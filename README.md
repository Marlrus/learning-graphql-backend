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

## Argumentos y graphql-tools

Instalamos un paquete que se llama **graphql-tools** con el cual vamos a reemplazar **buildSchema** en nuestro index:

```javascript
const { makeExecutableSchema } = require(`graphql-tools`);

// define schema
const typeDefs = readFileSync(`${__dirname}/lib/schema.graphql`, 'utf-8');

const schema = makeExecutableSchema({ typeDefs, resolvers });
```

Con esta configuracion nos conectamos con la nueva herramienta. Para usar esta herramienta tambien tenemos que cambiar como estamos escribiendo nuestros **resolvers**:

```javascript
module.exports = {
  Query: {
    getCourses: () => courses,
  },
};
```

Ahora necesitamos meter nuestro resolver dentro de la propiedad Query de nuestro codigo de resolvers.

**Note:** La verdad el instructor no fue muy claro sobre el uso de este paquete ni para que funciona y hasta el momento solo parece mas pasos para lograr lo mismo. Entre a los docs del paquete y no hay nada claro, pero parece que es bueno para poder separar esquemas y resolvers para combinar despues.

### Query por id

Creamos un nuevo query en nuestro Schema que se va a llamar **getCourse** para obtener un curso nada mas usando el id para detectarlo:

```graphql
type Course {
  _id: ID!
  title: String!
  teacher: String
  description: String!
  topic: String
}

type Query {
  "Returns all Courses"
  getCourses: [Course]
  "Return specific course"
  getCourse(_id: ID!): Course
}
```

Aca nombramos el argumento **\_id** para que este en linea con lo que estamos usando de ID que va a ser igual usando mongo. Tambien agregamos el **!** para decir que los campos son obligatorios en nuestro API y en el caso del schema, que esos valores son obligatorios.

### Resolver

En nuestro resolver creamos la logica para manejar estos nuevos queries:

```javascript
module.exports = {
  Query: {
    getCourses: () => courses,
    getCourse: (root, args) =>
      courses.filter(course => course._id === args._id)[0],
  },
};
```

Como para este query estamos usando un argumento, tenemos que usar los parametros de la funcion de nuestro resolver, que son estandar. Root no lo vamos a usar, pero args si para sacar el **\_id** que vamos a usar en nuestro query. Con este valor usamos filter y devolvemos el valor. _Esto se puede hacer con find tambien, pero la costumbre lo hace dificil._

## Mongo DB

En el curso se usa mlab que ya no existe. Cree un proyecto nuevo en mongo atlas que voy a utilizar en el proyecto. El proceso va a ser un poco distinto a lo que estoy acostumbrado porque no vamos a usar mongoose, sino que vamos a estar manipulando los datos directamente. Usan una herramienta que se llama robot3t, pero atlas permite trabajar directamente sobre la base de datos.

Instalamos dotenv para tener nuestra coneccion y clave segura. Despues creamos un archivo para manejar la conexion y exportamos la funcion. Esta funcion es un poco chistosa por lo antigua que se siente. Estaba tentado a hacer el resto del curso usando mongoose, pero me sirve hacer las cosas de una manera distinta de vez en cuando.

```javascript
'use strict';

const { MongoClient } = require('mongodb');

let connection;

const connectDB = async () => {
  if (connection) return connection;

  try {
    const client = await MongoClient.connect(process.env.MONGODB_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    connection = client.db(process.env.DB_NAME);
    return connection;
  } catch (err) {
    console.log(`Could not connect to db: ${err}`);
    process.exit(1);
  }
};

module.exports = connectDB;
```

## Integrando la Base de Datos

Como no tenemos una base de datos ni un API para insertar informacion, vamos a hacerlo manualmente. En el curso lo hacen con un cliente que se llama Robo3T, pero lo voy a manejar directamente en mongoDB Atlas. Insertamos los datos que estabamos usando en **Resolvers** en nuestra DB y los borramos de nuestro servidor. Como los vamos a insertar, borramos el \_id porque mongo lo genera automaticamente.

```javascript
// resolvers.js
const connectDB = require('./db');

...
getCourses: async () => {
  try {
    db = await connectDB();
    const courses = await db.collection('courses').find().toArray();
    return courses;
  } catch (err) {
    console.log(`Error in getCourses ${err}`);
  }
},
```

En este resolver nos estamos conectando a la base de datos con la funcion que escribimos en la otra parte y estamos retornando el valer de los cursos en nuestra funcion asincrona. Al hacer esto, cuando corremos el query en nuestro playground, obtenemos los resultados como esperamos conseguirlos.

Ahora vamos a seguir con el siguiente query, **getCourse**:

```javascript
const connectDB = require('./db');
const { ObjectID } = require('mongodb');

getCourse: async (root, { id }) => {
  try {
    const db = await connectDB();
    const course = db.collection('courses').findOne({ _id: ObjectID(id) });
    return course;
  } catch (err) {
    console.log(`Error in getCourse ${err}`);
  }
},
```

En este query estamos buscando un curso por el id. Lo importante para tener en cuenta es que el nombre del argumento que **GraphiQL** espera depende del nombre que le dimos en nuestro **schema.graphql** por lo cual hay que estar pendientes. Asi mismo, estamos _destructurando_ id de el segundo arg, pero este se llama **args** y contiene todos los argumentos que toma nuestro query segun el schema que estamos usando. Tambien estamos usando la funcion **ObjectID** que convierte un string en un id de mongo para que se pueda usar para hacer un match en la busqueda.

## Mutations e Inputs

Es la forma de transformar info usando un API de GraphQL. Para esto creamos en nuestro **schema** una mutacion usando _type Mutation_ que va a tener un nombre, toma un input con un tipo, y retorna un Course:

```graphql
input CourseInput {
  title: String!
  teacher: String
  description: String!
  topic: String
}

type Mutation {
  "Crea un Curso"
  createCourse(input: CourseInput!): Course
}
```

### Mutation en el Resolver

Para no tener todo en el mismo archivo, vamos a crear un archivo nuevo **mutations.js**. En este archivo necesitamos tambien la coneccion a la base de datos, por lo cual vamos a importar **connectDB**. Decidi hacer un poquito separada mi logica a diferencia de lo que estaba en el curso. Tambien cambie la logica para no usar _object.assign_. Como una nota interesante, en el cliente de mongo que estamos usando, al terminar un insert, vamos a recibir el nuevo \_id que crea mongo en la prop **insertedId**, lo que vamos a usar para retornar el nuevo curso como esta en la base de datos cuando terminemos la mutacion:

```javascript
const connectDB = require('./db');

const createCourse = async (_, { input }) => {
  try {
    const db = await connectDB();
    const defaults = { teacher: '', topic: '' };
    const newCourse = { ...defaults, ...input };
    const course = await db.collection('courses').insertOne(newCourse);
    const createdCourse = { ...newCourse, _id: course.insertedId };
    return createdCourse;
  } catch (err) {
    console.log(`Err on createCourse: ${err.message}`);
  }
};

module.exports = {
  createCourse,
};
```

Aca nos conectamos a la base de datos, creamos unos defaults para los valores opcionales, despues agregamos el del input que sobre escribe los defaults si existen, y luego insertamos eso en la base de datos. Cuando terminamos retornamos el curso que enviamos al input con el \_id creado por mongo.

```graphql
mutation {
  createCourse(
    input: {
      title: "Walrus Music"
      description: "Music for and by Walruses"
      topic: "Music"
      teacher: "SM Oerse"
    }
  ) {
    _id
    title
    teacher
    description
    topic
  }
}
```

En graphiql corremos esta mutacion, vamos a insertar ese curso y como lo retornamos, vamos a ver que nos retorne el curso completo. En este punto nos fallo la mutacion **porque no incluimos la mutacion en el resolver!** Aprovechando este cambio, vamos a refactor separando los archivos para tener mas claridad. Yo tome un camino un poco distinto al curso para lograr esto.

Movi los queries a su propio archivo, e hice el mismo proceso de definir los queries como funciones independientes y luego exportarlas. De la misma forma, las importo en los resolvers por aparte y las agrego a su objeto respectivo para ser mas declarativo y poder saber que queries y mutaciones podemos acceder:

```javascript
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
```

Ahora al correr la mutacion tengo el resultado esperado y puedo retornar el curso. Como nota, al instructor se le olvido colocar un _await_ y le fallo es query porque estaba haciendo cambios en una promesa.

## Proceso general para crear Queries y Mutations

- Crear Schema de Query/Mutacion en **schema.graphql**.
  - Crear types o inputs con sistema de tipo de graphQl.
- Declarar Query/Mutacion en su archivo js respectivo.
  - Conectar a db
  - Query/Mutar usando el cliente de tu db
  - Retornar el resultado respectivo
  - Exportar los queries/mutaciones
- Agregar al Resolver
  - importar queries/mutaciones
  - Agregarlas a su objeto respectivo de acuerda a tu schema: Query/Mutation
  - Exportar el resolver
