'use strict';

const errorHandler = (err, optionalName) => {
  const optionalMessage = `Error in ${optionalName}: ${err}`;
  const errMessage = optionalName ? optionalMessage : err;
  console.log(errMessage);
  throw new Error('Error in server operation.');
};

module.exports = errorHandler;
