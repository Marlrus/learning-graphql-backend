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

## Repaso

Vamos a agrerag Student a nuestros queries y mutaciones. Creamos los queries, la mutacion, y el input para estudiantes. Lo que vamos a hacer de nuevo, es crear la mutacion para **edit**, que toma un tipo de input distinto porque no tiene campos obligatorios:

```graphql
input CourseEditInput {
  title: String
  teacher: String
  description: String
  topic: String
}

input StudentEditInput {
  name: String
  email: String
}

type Mutation {
  "Create a Course"
  createCourse(input: CourseInput!): Course
  "Edit a Course"
  editCourse(_id: ID!, input: CourseEditInput!): Course
  "Create a Student"
  createStudent(input: StudentInput!): Student
  "Edit a Student"
  editStudent(_id: ID!, input: StudentEditInput!): Student
}
```

### Queries y Mutaciones Student

Cuando terminamos esto nos vamos a los resolvers, iniciando por los queries. Esta parte me adelante copiando y modificando los queries. En la mutacion de **createStudent** lo unico que cambia es que no hay que tener _defaults_ porque todos los campos de el dato son obligatorios para Student.

### Query de edit

Como vamos a estar haciendo ediciones tenemos que cambiar lo que estamos usando de mongo. Vamos a pedir el id como el argumento para buscar el item en la base de datos, y usar el input para modificar el item. Esto lo hacemos con el metodo **updateOne**:

```javascript
const editCourse = async (_, { _id, input }) => {
  try {
    const db = await connectDB();
    await db
      .collection('courses')
      .updateOne({ _id: ObjectID(_id) }, { $set: input });
    const course = await db
      .collection('courses')
      .findOne({ _id: ObjectID(_id) });
    return course;
  } catch (err) {
    console.log(`Err on editCourse: ${err.message}`);
  }
};
```

En este caso, no tenemos todos los datos del item, por lo cual tenemos que hacer un query usando **findOne** para retornar el curso editado. Para estudiante la mutacion es igual, solo tenemos que cambiar course por student en la funcion. Como un punto a favor de la forma en la que se esta haciendo en el curso, _cuando el instructor crea un query o una mutacion, no tiene que cambiar nada en el resolver_ lo cual puedo considerar hacer en el futuro.

Probe la mutacion **createStudent** y funciono de entrada y retorno lo que esperabamos. Probando **getStudents** y **getStudent** obtuve los resultados esperados tambien. Probando las mutaciones, habia accidentalmente usado **editOne** en lugar de **updateOne** lo que estaba haciendo que fallara la mutacion porque no existia dentro de mongo.

### Reto, mutaciones de delete

Como reto hay que crear las mutaciones para delete. Como no sabia que debia retornar, cree un tipo **DeletionMessage** para retornar que se borro exitosamente. Para los type Mutation, solo toman es \_id para usar el metodo **deleteOne** de mongo que toma el \_id para borrar. Las mutaciones son mucho mas cortas para borrar:

```javascript
const deleteStudent = async (_, { _id }) => {
  try {
    const db = await connectDB();
    await db.collection('students').deleteOne({ _id: ObjectID(_id) });
    return { message: 'Student successfully deleted.' };
  } catch (err) {
    console.log(`Err on deleteStudent: ${err.message}`);
  }
};
```

Con esto probe las mutaciones **deleteCourse** y **deleteStudent** y funcionaron adecuadamente.

## Nested Types

Vamos a crear relaciones entre nuestros tipos, creando un campo en nuestra coleccion de Course que tenga un array de Student. Para esto creamos una nueva **Mutation**:

```graphql
"Add Person to Course"
addPerson(courseID: ID!, personID: ID!): Course
```

Hacemos nuestro procedimiento estandar, pero hay algo flojo y es que estamos guardando el id pero no podemos retornar los valores de estudiante porque solo tenemos el id. Para eso tocaria hacer una agregacion. Hice una mejora en el codigo del curso que fue crear dos promesas y resolverlas con _await Promise.all()_ lo que hace que se busque el curso y la persona en paralelo. Para insertar el id usamos **\$addToSet** que inserta un ID si no existe, y lo deja asi si ya esta:

```javascript
const addPerson = async (_, { courseID, personID }) => {
  try {
    const db = await connectDB();
    const findCourse = db
      .collection('courses')
      .findOne({ _id: ObjectID(courseID) });
    const findStudent = db
      .collection('students')
      .findOne({ _id: ObjectID(personID) });
    const [course, student] = await Promise.all([findCourse, findStudent]);
    if (!course || !student) throw new Error('No course or student found.');
    await db
      .collection('courses')
      .updateOne(
        { _id: ObjectID(courseID) },
        { $addToSet: { people: ObjectID(personID) } }
      );
    return course;
  } catch (err) {
    console.log(`Err on addPerson`);
  }
};
```

## Resolver de Tipos

Estamos guardando el ID en un Array dentro del curso, pero no hemos cuadrado para recibir la info de el estudiante agregando con el id. La verdad no entiendo mucho que es lo que esta haciendo el profesor, sobre todo porque no tienen sentido los nombres de las cosas. Creamos un archivo **types.js** donde a Course vamos a agregar un mini resolver para _people_. Este resolver va a recibir el array de ids que tenemos dentro de people. Cambie un poco la condiciones, si no hay people, o recibimos un arr de largo 0 voy a retornar un array vacio de una vez. Prefiero hacerlo asi, porque no hay punto en conectarse en la base de datos si no hay datos para buscar.

Si hay datos nos conectamos a la db, convertimos los ids en _ObjectID_ y usamos eso para encontrar las personas y las volvemos a un array. Cuando tenemos eso, retornamos esa respuesta:

```javascript
const peopleResolver = async ({ people }) => {
  try {
    if (!people || people.length === 0) return [];
    const db = await connectDB();
    const ids = people.map(id => ObjectID(id));
    const peopleData = await db
      .collection('people')
      .find({ _id: { $in: ids } })
      .toArray();
    return peopleData;
  } catch (err) {
    console.log(`Err in people types: ${err.message}`);
  }
};

const Course = {
  people: peopleResolver,
};

const types = {
  Course: CourseTypes,
};

module.exports = types;
```

### Agregar types a Resolver

Teniendo los types exportados, lo que tenemos que hacer es meterlos en el resolver, lo cual hacemos importando **types** y haciendo un spread dentro de nuestro Resolver:

```javascript
const types = require('./types');

const Resolver = {
  Query: queries,
  Mutation: mutations,
  ...types,
};
```

## Errores

Cuando hay un error en una de nuestras APIs de GraphQL, recebimos un objeto de **errors** en la respuesta. Hay detalles del error, y nos sale el **path** del error tambien. En el caso de que tengamos un valor obligatorio en el Resolver que no concuerda con lo que hay en nuestro **schema**, el codigo va a fallar sin ejecutar codigo del resolver. Si hay un error dentro de el resolver, este error se va a enviar a nuestro API dentro del mismo prop de **errors**.

### Errores Personalizados

Uno no quiere siempre darle acceso a los errores a nuestro usuario final, por lo cual vamos a enviar un error generalizado creado por nosotros. Creamos un nuevo archivo **lib/errorHandler.js**. Cree un errorHandler un poco distinto al del curso para tener mas claridad en nuestros logs de la ubicacion del error:

```javascript
const errorHandler = (err, optionalName) => {
  const optionalMessage = `Error in ${optionalName}: ${err}`;
  const errMessage = optionalName ? optionalMessage : err;
  console.log(errMessage);
  throw new Error('Error in server operation.');
};

module.exports = errorHandler;
```

Para usarlo en nuestros queries y mutation lo agregamos a nuestro **catch**:

```javascript
  try {
    ...
  } catch (err) {
    errorHandler(err, 'getCourses');
  }
```

## Alias y Fragments

Esta parte se enfoca en hacer multiples consultas al tiempo usando **Aliases**. Esta parte no requiere que hagamos nada en el backend, lo unico que tenemos que hacer es darle un nombre a cada query que hacemos:

```graphql
{
  allCourses: getCourses {
    title
    description
    topic
    _id
  }

  course1: getCourse(id: "5fb3d1a05dc3290c92a159ef") {
    title
    description
    topic
  }
}
```

Esto nos va a traer una consulta con ambos datos dentro de **data** como **data.allCourses** y **data.course1**.

### Fragments

Fragments nos permiten reemplazar campos que vamos a pedir iguales en varias consultas, en el caso de nuestra consulta serian title, description, y topic. Para definir el fragmento, hay que declarar en que tipo es:

```graphql
fragment CourseFields on Course {
  title
  description
  topic
}
```

Que podemos usar en nuestra consulta:

```graphql
{
  allCourses: getCourses {
    ...CourseFields
    _id
  }

  course1: getCourse(id: "5fb3d1a05dc3290c92a159ef") {
    ...CourseFields
  }
}

fragment CourseFields on Course {
  title
  description
  topic
}
```

De esta forma recivimos los fields de nuestro fragment en las consultas. A este, podemos agregar **type** tambien, como traer people:

```graphql
{
  allCourses: getCourses {
    ...CourseFields
    _id
  }

  course1: getCourse(id: "5fb3d1a05dc3290c92a159ef") {
    ...CourseFields
  }
}

fragment CourseFields on Course {
  title
  description
  topic
  people {
    name
  }
}
```

Trate de hacer los fragments en el schema pero no me lo permitio, parece que estos deben hacerse en el query.

## Variables

Cuando hay que hacer mutations, uno debe enviar variables. Este proceso es un poco mas molesto y lo vamos a hacer dentro de GraphiQL. Primero tenemos que definir una mutacion nueva con los nombres de las variables que estamos pensando pasar:

```graphql
mutation AddPersonToCourse ($course:ID!, $person: ID!){ ... }
```

Las variables llevan el simbolo **\$** antes. Luego abrimos braquets y usamos la mutacion que ya tenemos, en el caso de nosotros va a ser **addPerson**. Adentro vamos a usar esas variables:

```graphql
addPerson(courseID: $course, personID: $person){ ... }
```

Recibimos las variables arriba, y las pasamos a nuestra mutacion por dentro. Para pasar las variables, tenemos que abrir el tab **Query Variables** en nuestro GraphiQL y pasarlas como un objeto JSON:

```json
{
  "course": "5fb3d2035dc3290c92a159f0",
  "person": "5fc64815099f9c1415acbc32"
}
```

Al correr nuestra mutacion, va a tomar los valores de esas variables y va a crear la persona dentro de nuestra coleccion:

```graphql
mutation AddPersonToCourse($course: ID!, $person: ID!) {
  addPerson(courseID: $course, personID: $person) {
    _id
    title
    people {
      name
      email
      _id
    }
  }
}
```

El uso de variables funciona para ambas _mutaciones_ y _queries_ usando el mismo proceso.
